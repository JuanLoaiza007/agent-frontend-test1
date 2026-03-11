"use client";

import { useState, useCallback } from "react";
import { ENDPOINTS } from "@/lib/config";
import {
  mapBackendEventToTimeline,
  extractFinalResponse,
} from "@/lib/utils/eventMapper";
import { getErrorType } from "@/lib/errors";

const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";

const debugLog = (...args) => {
  if (isDev) console.log("[DEBUG]", ...args);
};

const debugError = (...args) => {
  if (isDev) console.error("[DEBUG ERROR]", ...args);
};

/**
 * Hook personalizado para manejar consultas al agente
 */
export function useAgentQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeDomain, setActiveDomain] = useState(null);
  const [domainConfidence, setDomainConfidence] = useState(null);
  const [error, setError] = useState(null);

  const query = useCallback(async (question) => {
    debugLog("=== INICIANDO CONSULTA ===", { question });
    setIsLoading(true);
    setResponse(null);
    setTimelineEvents([]);
    setActiveDomain(null);
    setDomainConfidence(null);
    setError(null);

    try {
      debugLog("→ Haciendo fetch a:", ENDPOINTS.stream);
      const res = await fetch(ENDPOINTS.stream, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: [] }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      debugLog("← Respuesta recibida, iniciando lectura de stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData = null;
      let eventCount = 0;
      let accumulatedAnswer = "";

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
              eventCount++;
              const data = JSON.parse(line.slice(6));
              debugLog(`→ Evento #${eventCount}:`, currentEventType, data);
              const timelineEvent = mapBackendEventToTimeline(
                currentEventType,
                data,
              );

              if (timelineEvent) {
                setTimelineEvents((prev) => [...prev, timelineEvent]);
              }

              if (currentEventType === "domain_detected") {
                debugLog("→ Dominio detectado:", data.domain, data.confidence);
                setActiveDomain(data.domain);
                setDomainConfidence(data.confidence);
              }

              if (currentEventType === "done") {
                debugLog(
                  "→ Evento DONE recibido, guardando datos finales:",
                  data,
                );
                finalData = data;
              }

              if (currentEventType === "answer_chunk") {
                accumulatedAnswer += data.content;
                if (data.is_last) {
                  debugLog(
                    "→ Último chunk recibido, creando respuesta:",
                    accumulatedAnswer,
                  );
                  finalData = {
                    question,
                    answer: accumulatedAnswer,
                    detected_domain: activeDomain,
                    domain_confidence: domainConfidence,
                    sources: [],
                    action_links: [],
                  };
                }
              }
            } catch (e) {
              debugError("Error parsing event data:", e);
            }
          }
        }
      }

      debugLog("=== STREAM FINALIZADO ===");
      debugLog("finalData:", finalData);

      if (finalData) {
        const extracted = extractFinalResponse(finalData);
        debugLog("→ Respuesta extraída:", extracted);
        setResponse(extracted);
      } else {
        debugError("⚠️ NO se recibió evento 'done' - finalData es null");
        throw new Error("No se recibió respuesta completa del servidor");
      }
    } catch (err) {
      debugError("Error en consulta:", err);
      const errorType = getErrorType(err);
      setError(err.message);
      setResponse({
        answer: err.message,
        detected_domain: "error",
        error_type: errorType,
      });
    } finally {
      setIsLoading(false);
      debugLog("=== CONSULTA FINALIZADA ===");
    }

  }, []);

  return {
    query,
    response,
    timelineEvents,
    isLoading,
    activeDomain,
    domainConfidence,
    error,
    hasResults: isLoading || response || timelineEvents.length > 0,
  };
}
