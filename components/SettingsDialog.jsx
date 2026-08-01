"use client";

import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useModel } from "@/components/ModelProvider";

export function SettingsDialog({ open, onOpenChange }) {
  const {
    models,
    visibleModels,
    selectedModel,
    setSelectedModel,
    showExperimental,
    setShowExperimental,
    isLoading,
    error,
    reloadModels,
  } = useModel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Los cambios se aplican inmediatamente y se guardan automáticamente en este dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <h3 className="text-sm font-medium">Tema</h3>
              <p className="text-xs text-muted-foreground">Apariencia de la aplicación</p>
            </div>
            <ThemeSwitcher />
          </section>

          <section className="space-y-2">
            <label htmlFor="model-select" className="text-sm font-medium">
              Modelo de inteligencia artificial
            </label>
            <select
              id="model-select"
              value={selectedModel || ""}
              onChange={(event) => setSelectedModel(event.target.value)}
              disabled={isLoading || Boolean(error) || visibleModels.length === 0}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <option value="">Cargando modelos...</option>}
              {!isLoading && visibleModels.length === 0 && <option value="">Sin modelos disponibles</option>}
              {visibleModels.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name === selectedModel ? "★ " : ""}
                  {model.label || model.name}
                  {model.experimental === true ? " (experimental)" : ""}
                </option>
              ))}
            </select>

            <p className="text-xs text-muted-foreground">
              ★ Modelo seleccionado
            </p>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showExperimental}
                onChange={(event) => setShowExperimental(event.target.checked)}
                disabled={isLoading || Boolean(error) || models.length === 0}
                className="h-4 w-4 accent-primary"
              />
              <span>Mostrar modelos experimentales</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Los modelos experimentales aparecen al final del listado y pueden ser inestables.
            </p>

            {isLoading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Consultando modelos disponibles...
              </p>
            )}
            {error && (
              <div className="flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <p className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </p>
                <Button type="button" variant="outline" size="sm" onClick={reloadModels}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reintentar
                </Button>
              </div>
            )}
            {!isLoading && !error && selectedModel && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-green-600" /> Preferencia guardada automáticamente
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
