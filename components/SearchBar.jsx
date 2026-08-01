"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";

/**
 * SearchBar - Componente de buscador central
 */
export function SearchBar({ onSearch, isLoading = false, disabled = false }) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef(null);
  const MIN_TEXTAREA_HEIGHT = 48;
  const MAX_TEXTAREA_HEIGHT = 80;

  const resizeTextarea = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";
    const contentHeight = textarea.scrollHeight;
    const nextHeight = Math.min(
      Math.max(contentHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = contentHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch && !disabled) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    resizeTextarea(event.target);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative overflow-hidden rounded-lg border-2 border-border bg-background shadow-sm transition-all focus-within:border-primary">
          <textarea
            id="agent-query"
            ref={textareaRef}
            rows={1}
            placeholder="¿Cómo solicito una beca?"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            aria-label="Pregunta para el agente"
            className="block min-h-12 max-h-20 w-full resize-none overflow-y-hidden border-0 bg-transparent px-3 py-2 text-sm leading-6 outline-none sm:text-base disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          {query.trim() && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isLoading || disabled}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || disabled || !query.trim()}
            className="gap-2 bg-[#C8102E] text-white hover:bg-[#C8102E]/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
}
