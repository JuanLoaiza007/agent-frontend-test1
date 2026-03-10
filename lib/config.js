/**
 * Configuración centralizada del frontend
 */

export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  apiEndpoint: "/agent/v1/stream",
  healthEndpoint: "/health",
};

export const ENDPOINTS = {
  stream: `${config.backendUrl}${config.apiEndpoint}`,
  health: `${config.backendUrl}${config.healthEndpoint}`,
};
