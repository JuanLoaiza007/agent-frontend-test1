"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ENDPOINTS } from "@/lib/config";

const MODEL_STORAGE_KEY = "uv-agent:selected-model";
const EXPERIMENTAL_STORAGE_KEY = "uv-agent:show-experimental-models";

const ModelContext = createContext(null);

function validateCatalog(data) {
  const models = data?.models;
  if (!Array.isArray(models) || models.length === 0) {
    throw new Error("El backend no devolvió modelos disponibles.");
  }

  const names = models.map((model) => model?.name);
  const defaults = models.filter((model) => model?.default === true);

  if (
    names.some((name) => typeof name !== "string" || !name) ||
    new Set(names).size !== names.length ||
    defaults.length !== 1 ||
    models.some(
      (model) =>
        "experimental" in model && typeof model.experimental !== "boolean",
    )
  ) {
    throw new Error("El catálogo de modelos del backend no es válido.");
  }

  return models;
}

function sortModels(models) {
  return [...models].sort((first, second) => {
    const firstExperimental = first.experimental === true;
    const secondExperimental = second.experimental === true;

    if (firstExperimental !== secondExperimental) {
      return firstExperimental ? 1 : -1;
    }

    return (first.label || first.name).localeCompare(
      second.label || second.name,
      "es",
      { sensitivity: "base" },
    );
  });
}

function getSelectableModels(models, showExperimental) {
  return sortModels(
    models.filter(
      (model) => showExperimental || model.experimental !== true,
    ),
  );
}

function getFallbackModel(models, showExperimental) {
  const selectableModels = getSelectableModels(models, showExperimental);
  return (
    selectableModels.find((model) => model.default === true)?.name ||
    selectableModels[0]?.name ||
    null
  );
}

export function ModelProvider({ children }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModelState] = useState(null);
  const [showExperimental, setShowExperimentalState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadModels = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(ENDPOINTS.models, { signal });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail?.message || "No se pudo cargar el catálogo de modelos.");
      }

      const catalog = validateCatalog(data);
      let savedShowExperimental = false;
      let savedModel = null;

      try {
        savedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
        savedShowExperimental =
          window.localStorage.getItem(EXPERIMENTAL_STORAGE_KEY) === "true";
      } catch {
        savedModel = null;
      }

      const nextModel = getSelectableModels(catalog, savedShowExperimental).some(
        (model) => model.name === savedModel,
      )
        ? savedModel
        : getFallbackModel(catalog, savedShowExperimental);

      setModels(catalog);
      setSelectedModelState(nextModel);
      setShowExperimentalState(savedShowExperimental);

      try {
        window.localStorage.setItem(MODEL_STORAGE_KEY, nextModel);
      } catch {
        // La aplicación sigue funcionando aunque el navegador bloquee storage.
      }
      try {
        window.localStorage.setItem(
          EXPERIMENTAL_STORAGE_KEY,
          String(savedShowExperimental),
        );
      } catch {
        // La aplicación sigue funcionando aunque el navegador bloquee storage.
      }
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setModels([]);
      setSelectedModelState(null);
      setError(loadError.message || "No se pudo cargar el catálogo de modelos.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadModels(controller.signal);
    return () => controller.abort();
  }, [loadModels]);

  const setSelectedModel = useCallback(
    (modelName) => {
      if (
        !getSelectableModels(models, showExperimental).some(
          (model) => model.name === modelName,
        )
      ) {
        return false;
      }

      setSelectedModelState(modelName);
      try {
        window.localStorage.setItem(MODEL_STORAGE_KEY, modelName);
      } catch {
        // La selección sigue vigente en memoria durante esta sesión.
      }
      return true;
    },
    [models, showExperimental],
  );

  const setShowExperimental = useCallback(
    (nextValue) => {
      const nextShowExperimental = Boolean(nextValue);
      setShowExperimentalState(nextShowExperimental);

      try {
        window.localStorage.setItem(
          EXPERIMENTAL_STORAGE_KEY,
          String(nextShowExperimental),
        );
      } catch {
        // La selección sigue vigente en memoria durante esta sesión.
      }

      if (
        !nextShowExperimental &&
        models.find((model) => model.name === selectedModel)?.experimental === true
      ) {
        const fallbackModel = getFallbackModel(models, false);
        if (fallbackModel) {
          setSelectedModelState(fallbackModel);
          try {
            window.localStorage.setItem(MODEL_STORAGE_KEY, fallbackModel);
          } catch {
            // La selección sigue vigente en memoria durante esta sesión.
          }
        } else {
          setSelectedModelState(null);
        }
      }
    },
    [models, selectedModel],
  );

  const visibleModels = getSelectableModels(models, showExperimental);
  const defaultModel = models.find((model) => model.default === true)?.name || null;
  const value = useMemo(
    () => ({
      models,
      visibleModels,
      selectedModel,
      defaultModel,
      showExperimental,
      isLoading,
      error,
      isReady: !isLoading && !error && Boolean(selectedModel),
      setSelectedModel,
      setShowExperimental,
      reloadModels: () => loadModels(),
    }),
    [
      models,
      visibleModels,
      selectedModel,
      defaultModel,
      showExperimental,
      isLoading,
      error,
      setSelectedModel,
      setShowExperimental,
      loadModels,
    ],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel debe utilizarse dentro de ModelProvider.");
  }
  return context;
}
