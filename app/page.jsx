"use client";

import { SearchBar } from "@/components/SearchBar";
import { DomainTags } from "@/components/DomainTags";
import { Timeline } from "@/components/Timeline";
import { ResponseCard } from "@/components/ResponseCard";
import { useAgentQuery } from "@/lib/hooks/useAgentQuery";
import { cn } from "@/lib/utils";
import { useModel } from "@/components/ModelProvider";

/**
 * Página principal del sistema de consulta agéntico
 */
export default function Home() {
  const {
    query,
    response,
    timelineEvents,
    isLoading,
    activeDomain,
    domainConfidence,
    hasResults,
    latency,
  } = useAgentQuery();
  const { isReady: isModelReady, isLoading: isModelLoading, error: modelError, reloadModels } = useModel();

  const isError = response?.detected_domain === "error";

  return (
    <main className="flex flex-col w-full h-full pt-10 pb-8 md:py-12 lg:py-16 overflow-y-auto">
      <section
        className={`container mx-auto px-4 flex flex-col ${!hasResults ? "flex-1 justify-center py-12 md:py-16" : "py-8 md:py-12 lg:py-16"}`}
      >
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            ¡Hola!, ¿Qué pregunta quieres resolver hoy?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Ingresa tu consulta para obtener información sobre trámites y servicios de la Universidad del Valle en la sede Cali, Meléndez.
          </p>
        </div>

        <SearchBar onSearch={query} isLoading={isLoading} disabled={!isModelReady} />
        {!isModelReady && (
          <div className="mx-auto mt-3 flex max-w-4xl items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            {isModelLoading ? (
              "Cargando modelos disponibles..."
            ) : (
              <>
                {modelError || "Selecciona un modelo válido desde Configuración para comenzar."}
                {modelError && (
                  <button type="button" className="text-primary underline" onClick={reloadModels}>
                    Reintentar
                  </button>
                )}
              </>
            )}
          </div>
        )}
        <DomainTags
          activeDomain={activeDomain}
          confidence={domainConfidence}
          className="mt-4 md:mt-6"
        />
      </section>

      {hasResults && (
        <section className="container mx-auto px-3 sm:px-4 pb-8 md:py-4 flex-1">
          <div
            className={cn(
              "flex flex-col gap-4 lg:gap-6 flex-1 min-h-0",
              !isError && "md:grid md:grid-cols-3",
            )}
          >
            {!isError && (
              <Timeline
                className="sm:col-span-1 max-h-45 md:max-h-50 lg:max-h-60"
                events={timelineEvents}
                isLoading={isLoading && timelineEvents.length === 0}
                isProcessing={isLoading}
                latency={latency}
                isComplete={Boolean(response) && !isLoading}
              />
            )}
            <ResponseCard
              className={cn(
                "min-h-75 md:min-h-0",
                !isError ? "sm:col-span-2" : "w-full max-w-2xl mx-auto",
              )}
              response={response}
              isLoading={isLoading && !response}
            />
          </div>
        </section>
      )}
    </main>
  );
}
