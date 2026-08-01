"use client";

import { useState, useCallback } from "react";
import { ENDPOINTS } from "@/lib/config";
import {
  mapBackendEventToTimeline,
  extractFinalResponse,
} from "@/lib/utils/eventMapper";
import { getErrorType } from "@/lib/errors";
import { useModel } from "@/components/ModelProvider";

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
  const { selectedModel, defaultModel, setSelectedModel, isReady: isModelReady } = useModel();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeDomain, setActiveDomain] = useState(null);
  const [domainConfidence, setDomainConfidence] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const query = useCallback(async (question) => {
    debugLog("=== INICIANDO CONSULTA ===", { question });

    if (!isModelReady || !selectedModel) {
      const modelError = new Error("No hay un modelo válido disponible.");
      setError(modelError.message);
      setResponse({
        answer: modelError.message,
        detected_domain: "error",
        error_type: "DEFAULT",
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setTimelineEvents([]);
    setActiveDomain(null);
    setDomainConfidence(null);
    setError(null);
    setLatency(null);

    const resetAttemptState = () => {
      setResponse(null);
      setTimelineEvents([]);
      setActiveDomain(null);
      setDomainConfidence(null);
      setError(null);
    };

    const parseHttpError = async (res) => {
      const data = await res.json().catch(() => null);
      const detail = data?.detail;
      const error = new Error(
        detail?.message || `Error: ${res.status}`,
      );
      error.code = detail?.code;
      error.defaultModel = detail?.default_model;
      return error;
    };

    let backendLatency = null;

    const executeQuery = async (model, canRetryModel) => {
      try {
        debugLog("→ Haciendo fetch a:", ENDPOINTS.stream, { model });
        const res = await fetch(ENDPOINTS.stream, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history: [], model }),
        });

        if (!res.ok) throw await parseHttpError(res);
        if (!res.body) throw new Error("El servidor no devolvió un stream válido.");

        debugLog("← Respuesta recibida, iniciando lectura de stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalData = null;
        let streamError = null;
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
                const timelineEvent = mapBackendEventToTimeline(currentEventType, data);

                if (timelineEvent) setTimelineEvents((prev) => [...prev, timelineEvent]);

                if (currentEventType === "domain_detected") {
                  setActiveDomain(data.domain);
                  setDomainConfidence(data.confidence);
                }

                if (currentEventType === "error") {
                  streamError = new Error(data.message || "Falló la ejecución del modelo.");
                  streamError.code = data.code;
                }

                if (currentEventType === "done") {
                  finalData = data;
                  if (typeof data.total_duration_ms === "number") {
                    backendLatency = data.total_duration_ms;
                  }
                }

                if (currentEventType === "answer_chunk") {
                  accumulatedAnswer += data.content;
                  if (data.is_last) {
                    finalData = {
                      question,
                      answer: accumulatedAnswer,
                      detected_domain: data.detected_domain || null,
                      domain_confidence: data.domain_confidence || null,
                      sources: [],
                      action_links: [],
                    };
                  }
                }
              } catch (parseError) {
                debugError("Error parsing event data:", parseError);
              }
            }
          }
        }

        if (streamError || finalData?.error_code) {
          throw streamError || new Error("Falló la ejecución del modelo.");
        }

        if (!finalData) {
          throw new Error("No se recibió respuesta completa del servidor");
        }

        const extracted = extractFinalResponse(finalData);
        setResponse(extracted);
      } catch (err) {
        if (err.code === "MODEL_NOT_ALLOWED" && canRetryModel) {
          const fallbackModel = err.defaultModel || defaultModel;
          if (fallbackModel && fallbackModel !== model && setSelectedModel(fallbackModel)) {
            debugLog("Modelo rechazado; reintentando con default:", fallbackModel);
            resetAttemptState();
            return executeQuery(fallbackModel, false);
          }
        }
        throw err;
      }
    };

    try {
      await executeQuery(selectedModel, true);
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
      setLatency(backendLatency);
      setIsLoading(false);
      debugLog("=== CONSULTA FINALIZADA ===");
    }

  }, [defaultModel, isModelReady, selectedModel, setSelectedModel]);

  return {
    query,
    response,
    timelineEvents,
    isLoading,
    activeDomain,
    domainConfidence,
    error,
    latency,
    hasResults: isLoading || response || timelineEvents.length > 0,
  };
}
