"use client";

import { useState, useCallback } from "react";
import { ENDPOINTS } from "@/lib/config";
import {
  mapBackendEventToTimeline,
  extractFinalResponse,
} from "@/lib/utils/eventMapper";

/**
 * Hook personalizado para manejar consultas al agente
 * Encapsula toda la lógica de comunicación con el backend via SSE
 */
export function useAgentQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeDomain, setActiveDomain] = useState(null);
  const [domainConfidence, setDomainConfidence] = useState(null);
  const [error, setError] = useState(null);

  const query = useCallback(async (question) => {
    setIsLoading(true);
    setResponse(null);
    setTimelineEvents([]);
    setActiveDomain(null);
    setDomainConfidence(null);
    setError(null);

    try {
      const res = await fetch(ENDPOINTS.stream, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: [] }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const reader = res.body.getReader();
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
              const timelineEvent = mapBackendEventToTimeline(
                currentEventType,
                data,
              );

              if (timelineEvent) {
                setTimelineEvents((prev) => [...prev, timelineEvent]);
              }

              if (currentEventType === "domain_detected") {
                setActiveDomain(data.domain);
                setDomainConfidence(data.confidence);
              }

              if (currentEventType === "done") {
                finalData = data;
              }
            } catch (e) {
              console.error("Error parsing event data:", e);
            }
          }
        }
      }

      if (finalData) {
        setResponse(extractFinalResponse(finalData));
      }
    } catch (err) {
      setError(err.message);
      setResponse({
        answer: `Error al conectar con el servidor: ${err.message}`,
        detected_domain: "error",
      });
    } finally {
      setIsLoading(false);
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
