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
  const [systemStatus, setSystemStatus] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(ENDPOINTS.health);
        const data = await res.json();
        setSystemStatus(data);
      } catch (e) {
        setSystemStatus({ status: "error", agent: "unknown" });
      }
    };
    fetchHealth();
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
              {systemStatus ? (
                <Badge
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
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
