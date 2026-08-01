/**
 * Configuración centralizada del frontend
 */

export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  apiEndpoint: "/agent/v1/stream",
  modelsEndpoint: "/agent/v1/models",
  healthEndpoint: "/health",
  connectivityEndpoint: "/agent/v1/models",
  statusStreamEndpoint: "/agent/v1/status-stream",
};

export const ENDPOINTS = {
  stream: `${config.backendUrl}${config.apiEndpoint}`,
  models: `${config.backendUrl}${config.modelsEndpoint}`,
  health: `${config.backendUrl}${config.healthEndpoint}`,
  connectivity: `${config.backendUrl}${config.connectivityEndpoint}`,
  statusStream: `${config.backendUrl}${config.statusStreamEndpoint}`,
};
