import { AlertCircle, WifiOff, Timer, ServerCrash } from "lucide-react";

/**
 * Diccionario de errores amigables para el usuario
 */
export const ERROR_CATALOG = {
  CONNECTION_ERROR: {
    title: "Sin conexión",
    message: "No logramos conectar con el servidor. Verifica tu internet e inténtalo de nuevo.",
    icon: WifiOff,
    color: "text-amber-600",
  },
  TIMEOUT_ERROR: {
    title: "Tiempo excedido",
    message: "La consulta está tardando más de lo esperado. Por favor, intenta de nuevo.",
    icon: Timer,
    color: "text-amber-600",
  },
  SERVER_ERROR: {
    title: "Error del sistema",
    message: "Hubo un problema técnico en nuestros servicios. Ya estamos trabajando para solucionarlo.",
    icon: ServerCrash,
    color: "text-red-600",
  },
  DEFAULT: {
    title: "Algo salió mal",
    message: "Ocurrió un error inesperado al procesar tu pregunta. Por favor, intenta más tarde.",
    icon: AlertCircle,
    color: "text-red-600",
  },
};

/**
 * Identifica el tipo de error basado en el mensaje o status
 */
export function getErrorType(err) {
  const message = (err?.message || String(err)).toLowerCase();
  
  if (message.includes("fetch") || message.includes("network") || message.includes("failed to fetch")) {
    return "CONNECTION_ERROR";
  }
  
  if (message.includes("timeout") || message.includes("deadline")) {
    return "TIMEOUT_ERROR";
  }

  if (message.includes("500") || message.includes("internal server error")) {
    return "SERVER_ERROR";
  }

  return "DEFAULT";
}

/**
 * Formatea la información técnica para el botón de copiado
 */
export function formatErrorForClipboard(errorData) {
  const timestamp = new Date().toISOString();
  const details = {
    timestamp,
    message: errorData.raw_message || "No message",
    type: errorData.type || "UNKNOWN",
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  return `--- INFORME DE ERROR ---
Tipo: ${details.type}
Fecha: ${details.timestamp}
Mensaje: ${details.message}
URL: ${details.url}
Navegador: ${details.userAgent}
------------------------
Por favor, entrega esta información al equipo de soporte.`;
}
