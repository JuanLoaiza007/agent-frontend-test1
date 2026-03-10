/**
 * Utilitario para mapear eventos del backend al formato del Timeline
 */

// Mapeo de action_type del backend a steps del Timeline
const ACTION_TYPE_TO_STEP = {
  domain_detector: "planning",
  vector_search: "vector_search",
  web_search: "web_search",
  search_web_pages: "web_search",
  inspect_web_page: "inspect_web_page",
  page_inspection: "inspect_web_page",
  inspect_pdf_document: "inspect_pdf_document",
  pdf_inspection: "inspect_pdf_document",
  read_pdf_section: "read_pdf_section",
  planner: "planner",
  replanner: "replanner",
  final_response: "final_response",
};

/**
 * Mapea un evento del backend al formato del Timeline
 * @param {string} eventType - Tipo de evento (action_start, domain_detected, done)
 * @param {object} data - Datos del evento
 * @returns {object|null} - Evento mapeado para el Timeline o null si no aplica
 */
export function mapBackendEventToTimeline(eventType, data) {
  if (eventType === "action_start") {
    const step = ACTION_TYPE_TO_STEP[data.action_type] || "planning";
    return { step, message: data.message };
  }

  if (eventType === "domain_detected") {
    return {
      step: "domain_detected",
      message: data.domain_label || data.domain,
    };
  }

  return null;
}

/**
 * Extrae la respuesta final del evento 'done'
 * @param {object} data - Datos del evento done
 * @returns {object} - Respuesta formateada
 */
export function extractFinalResponse(data) {
  return {
    question: data.question,
    answer: data.answer,
    detected_domain: data.detected_domain,
    domain_confidence: data.domain_confidence,
    sources: data.sources || [],
    action_links: data.action_links || [],
  };
}
