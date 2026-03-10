"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ENDPOINTS } from "@/lib/config";

/**
 * Header component - Fixed at the top with transparent background and blur
 */
export function Header() {
  const [systemStatus, setSystemStatus] = useState(null);

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#C8102E] flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">
                UV
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-sm sm:text-base">
                Sistema de Consulta
              </h1>
              <p className="text-xs text-muted-foreground">
                Tesis Juan & Julián
              </p>
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground hidden sm:block">
            {systemStatus ? (
              <Badge
                className={`text-xs ${
                  systemStatus.status === "ok"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {systemStatus.status === "ok" ? "Online" : "Offline"}
              </Badge>
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
