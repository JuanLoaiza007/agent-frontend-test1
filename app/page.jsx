"use client";

import { SearchBar } from "@/components/SearchBar";
import { DomainTags } from "@/components/DomainTags";
import { Timeline } from "@/components/Timeline";
import { ResponseCard } from "@/components/ResponseCard";
import { useAgentQuery } from "@/lib/hooks/useAgentQuery";

/**
 * Página principal del sistema de consulta agéntico
 * Según filosofia-interfaz.md:
 * - Buscador único estilo Perplexity
 * - Clasificación pasiva de dominios
 * - Timeline de razonamiento visible
 * - Ficha de trámite como respuesta
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
  } = useAgentQuery();

  return (
    <main className="flex flex-col w-full h-full sm:py-12 md:py-24 overflow-y-auto">
      <section
        className={`container mx-auto px-4 flex flex-col ${!hasResults ? "flex-1 justify-center" : "py-6 lg:py-8"}`}
      >
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1 sm:mb-2">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-muted-foreground text-xs sm:text-xs lg:text-base">
            Consulta información sobre trámites y servicios de la Universidad
            del Valle
          </p>
        </div>

        <SearchBar onSearch={query} isLoading={isLoading} />
        <DomainTags
          activeDomain={activeDomain}
          confidence={domainConfidence}
          className="mt-2 sm:mt-4"
        />
      </section>

      {hasResults && (
        <section className="container mx-auto px-2 sm:px-4 pb-16 sm:py-4 flex-1 my-2">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:h-[35vh] lg:h-[45vh]">
            <Timeline
              className="sm:col-span-1 h-50 md:h-60"
              events={timelineEvents}
              isLoading={isLoading && timelineEvents.length === 0}
            />
            <ResponseCard
              className="sm:col-span-2 h-full md:max-h-120"
              response={response}
              isLoading={isLoading && !response}
            />
          </div>
        </section>
      )}
    </main>
  );
}
