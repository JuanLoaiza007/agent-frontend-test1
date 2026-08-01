"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings } from "lucide-react";
import { ENDPOINTS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "@/components/SettingsDialog";

/**
 * Header component - Fixed at the top with transparent background and blur
 */
export function Header() {
  const [systemStatus, setSystemStatus] = useState({ status: "checking" });
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const FALLBACK_POLL_INTERVAL = 60_000;
    const POLL_TIMEOUT = 15_000;
    const HEARTBEAT_TIMEOUT = 45_000;
    const SSE_CONNECT_TIMEOUT = 60_000;
    const SSE_RECONNECT_INTERVAL = 60_000;
    const WATCHDOG_INTERVAL = 5_000;

    let eventSource = null;
    let fallbackPollId = null;
    let reconnectTimeoutId = null;
    let sseConnectTimeoutId = null;
    let watchdogId = null;
    let activePollController = null;
    let pollInFlight = false;
    let lastHeartbeatAt = 0;
    let isMounted = true;

    const setOnline = () => {
      if (!isMounted) return;
      setSystemStatus({
        status: "ok",
        agent: "prompt_agent",
        checkedAt: new Date(),
      });
    };

    const setOffline = (reason) => {
      if (!isMounted) return;
      setSystemStatus({
        status: "error",
        agent: "unknown",
        reason,
        checkedAt: new Date(),
      });
    };

    const checkModelsFallback = async () => {
      if (pollInFlight) return false;
      pollInFlight = true;
      const controller = new AbortController();
      activePollController = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), POLL_TIMEOUT);

      try {
        const response = await fetch(
          `${ENDPOINTS.connectivity}?_connectivity=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok || !Array.isArray(data?.models)) {
          throw new Error(`Backend status ${response.status}`);
        }

        if (isMounted && !controller.signal.aborted) setOnline();
        return true;
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          setOffline(error.name === "AbortError" ? "timeout" : error.message);
        }
        return false;
      } finally {
        window.clearTimeout(timeoutId);
        if (activePollController === controller) activePollController = null;
        pollInFlight = false;
      }
    };

    const stopFallbackPolling = () => {
      if (fallbackPollId) {
        window.clearInterval(fallbackPollId);
        fallbackPollId = null;
      }
    };

    const scheduleSseReconnect = () => {
      if (reconnectTimeoutId || eventSource || !isMounted) return;
      reconnectTimeoutId = window.setTimeout(() => {
        reconnectTimeoutId = null;
        connectSse();
      }, SSE_RECONNECT_INTERVAL);
    };

    const startFallbackPolling = () => {
      if (!fallbackPollId) {
        checkModelsFallback();
        fallbackPollId = window.setInterval(
          checkModelsFallback,
          FALLBACK_POLL_INTERVAL,
        );
      }
      scheduleSseReconnect();
    };

    const handleSseFailure = (source, reason) => {
      if (eventSource !== source) return;
      if (sseConnectTimeoutId) {
        window.clearTimeout(sseConnectTimeoutId);
        sseConnectTimeoutId = null;
      }
      source.close();
      eventSource = null;
      setOffline(reason);
      startFallbackPolling();
    };

    const handleSseEvent = (source, event) => {
      if (eventSource !== source) return;

      try {
        const data = JSON.parse(event.data);
        if (data.status !== "ok") throw new Error("Backend status no válido");
        lastHeartbeatAt = Date.now();
        setOnline();
      } catch (error) {
        handleSseFailure(source, error.message);
      }
    };

    const connectSse = () => {
      if (eventSource || !isMounted) return;
      setConnectionAttempts((attempts) => attempts + 1);
      if (typeof EventSource === "undefined") {
        startFallbackPolling();
        return;
      }

      setSystemStatus((current) =>
        current.status === "ok" ? current : { status: "checking" },
      );

      const source = new EventSource(ENDPOINTS.statusStream);
      eventSource = source;
      sseConnectTimeoutId = window.setTimeout(() => {
        handleSseFailure(source, "SSE connection timeout");
      }, SSE_CONNECT_TIMEOUT);

      source.onopen = () => {
        if (eventSource !== source) return;
        if (sseConnectTimeoutId) {
          window.clearTimeout(sseConnectTimeoutId);
          sseConnectTimeoutId = null;
        }
        lastHeartbeatAt = Date.now();
        stopFallbackPolling();
        setOnline();
      };
      source.addEventListener("backend_status", (event) =>
        handleSseEvent(source, event),
      );
      source.addEventListener("heartbeat", (event) =>
        handleSseEvent(source, event),
      );
      source.onerror = () => {
        handleSseFailure(source, "SSE connection error");
      };
    };

    const checkWhenVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (eventSource) {
        if (Date.now() - lastHeartbeatAt > HEARTBEAT_TIMEOUT) {
          handleSseFailure(eventSource, "heartbeat timeout");
        }
      } else {
        checkModelsFallback();
        scheduleSseReconnect();
      }
    };

    connectSse();
    watchdogId = window.setInterval(() => {
      if (
        eventSource &&
        lastHeartbeatAt &&
        Date.now() - lastHeartbeatAt > HEARTBEAT_TIMEOUT
      ) {
        handleSseFailure(eventSource, "heartbeat timeout");
      }
    }, WATCHDOG_INTERVAL);
    window.addEventListener("focus", checkWhenVisible);
    window.addEventListener("online", checkWhenVisible);
    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      isMounted = false;
      stopFallbackPolling();
      if (watchdogId) window.clearInterval(watchdogId);
      if (reconnectTimeoutId) window.clearTimeout(reconnectTimeoutId);
      if (sseConnectTimeoutId) window.clearTimeout(sseConnectTimeoutId);
      window.removeEventListener("focus", checkWhenVisible);
      window.removeEventListener("online", checkWhenVisible);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      eventSource?.close();
      activePollController?.abort();
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/40 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 select-none hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#C8102E] flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">
                UV
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-sm sm:text-base">
                Sistema de Consulta
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Tesis Juan & Julián
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xs text-center text-muted-foreground">
              {systemStatus.status === "checking" ? (
                <span className="flex items-center gap-1.5" role="status">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>
                    {connectionAttempts <= 1
                      ? "Iniciando..."
                      : "Despertando backend..."}
                  </span>
                </span>
              ) : (
                <Badge
                  title={systemStatus.reason || "Conectividad con la API"}
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-5 border-none shadow-none ${
                    systemStatus.status === "ok"
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${systemStatus.status === "ok" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                  {systemStatus.status === "ok" ? "Online" : "Offline"}
                </Badge>
              )}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9 md:h-10 md:w-10"
              onClick={() => setSettingsOpen(true)}
              aria-label="Abrir configuración"
            >
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Abrir configuración</span>
            </Button>
          </div>
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
