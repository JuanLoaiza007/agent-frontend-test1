"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DomainTags } from "@/components/DomainTags";
import { Timeline } from "@/components/Timeline";
import { ResponseCard } from "@/components/ResponseCard";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// URL del backend desde variables de entorno
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Página principal del sistema de consulta agéntico
 *
 * Según filosofia-interfaz.md:
 * - Buscador único estilo Perplexity
 * - Clasificación pasiva de dominios
 * - Timeline de razonamiento visible
 * - Ficha de trámite como respuesta
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeDomain, setActiveDomain] = useState(null);
  const [domainConfidence, setDomainConfidence] = useState(null);

  // Mapeo de eventos del backend al formato del Timeline
  // Mapea action_type del backend a los steps del Timeline
  const mapBackendEventToTimeline = (eventType, data) => {
    const actionType = data.action_type;

    switch (eventType) {
      case "action_start":
        // Mapear según el tipo de acción del agente
        if (actionType === "domain_detector") {
          return { step: "planning", message: data.message };
        }
        if (actionType === "vector_search") {
          return { step: "vector_search", message: data.message };
        }
        if (actionType === "web_search" || actionType === "search_web_pages") {
          return { step: "web_search", message: data.message };
        }
        if (
          actionType === "inspect_web_page" ||
          actionType === "page_inspection"
        ) {
          return { step: "inspect_web_page", message: data.message };
        }
        if (
          actionType === "inspect_pdf_document" ||
          actionType === "pdf_inspection"
        ) {
          return { step: "inspect_pdf_document", message: data.message };
        }
        if (actionType === "read_pdf_section") {
          return { step: "read_pdf_section", message: data.message };
        }
        if (actionType === "planner") {
          return { step: "planner", message: data.message };
        }
        if (actionType === "replanner") {
          return { step: "replanner", message: data.message };
        }
        if (actionType === "final_response") {
          return { step: "final_response", message: data.message };
        }
        // Por defecto, mostrar el message del agente sin step específico
        return { step: "planning", message: data.message };
      case "domain_detected":
        return {
          step: "domain_detected",
          message: data.domain_label || data.domain,
        };
      default:
        return null;
    }
  };

  const handleSearch = async (query) => {
    setIsLoading(true);
    setResponse(null);
    setTimelineEvents([]);
    setActiveDomain(null);
    setDomainConfidence(null);

    try {
      const response = await fetch(`${BACKEND_URL}/agent/v1/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query, history: [] }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        let currentEventType = null;

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEventType = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEventType) {
            try {
              const data = JSON.parse(line.slice(6));

              // Mapear evento a formato Timeline
              const timelineEvent = mapBackendEventToTimeline(
                currentEventType,
                data,
              );

              if (timelineEvent) {
                setTimelineEvents((prev) => [...prev, timelineEvent]);
              }

              // Actualizar dominio cuando se detecta
              if (currentEventType === "domain_detected") {
                setActiveDomain(data.domain);
                setDomainConfidence(data.confidence);
              }

              // Guardar datos finales cuando llegue el evento done
              if (currentEventType === "done") {
                finalData = data;
              }
            } catch (e) {
              console.error("Error parsing event data:", e);
            }
          }
        }
      }

      // Configurar respuesta final
      if (finalData) {
        setResponse({
          question: finalData.question,
          answer: finalData.answer,
          detected_domain: finalData.detected_domain,
          domain_confidence: finalData.domain_confidence,
          sources: finalData.sources || [],
          action_links: finalData.action_links || [],
        });
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
      setResponse({
        answer: `Error al conectar con el servidor: ${error.message}`,
        detected_domain: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full py-4">
      {/* Hero Section - Buscador Central */}
      <section
        className={`flex flex-col container mx-auto px-4 ${
          !isLoading && !response && timelineEvents.length === 0
            ? "flex-1 justify-center"
            : "py-6 lg:py-8"
        }`}
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

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Barra de Estado de Dominios */}
        <div className="mt-2 sm:mt-4">
          <DomainTags
            activeDomain={activeDomain}
            confidence={domainConfidence}
          />
        </div>
      </section>

      {/* Results Section */}
      {(isLoading || response || timelineEvents.length > 0) && (
        <section className="container mx-auto px-2 sm:px-4 pb-16 sm:py-4 flex-1 my-2">
          {/* Contenedor: móvil - stacked sin altura fija, escritorio - grid con altura */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:h-[35vh] lg:h-[45vh]">
            {/* Timeline - Columna izquierda */}
            <div className="sm:col-span-1">
              <Timeline
                className="h-50 md:h-60"
                events={timelineEvents}
                isLoading={isLoading && timelineEvents.length === 0}
              />
            </div>
            {/* Response Card - Columna derecha */}
            <div className="sm:col-span-2">
              <ResponseCard
                className="h-full md:max-h-96"
                response={response}
                isLoading={isLoading && !response}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
