"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";

/**
 * SearchBar - Componente de buscador central
 */
export function SearchBar({ onSearch, isLoading = false }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          {/* Botón buscar - izquierda */}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={isLoading || !query.trim()}
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-[#C8102E] text-white hover:bg-[#C8102E]/90 disabled:bg-transparent disabled:text-muted-foreground z-10 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>

          <Input
            type="text"
            placeholder="Pregunta sobre matrícula, becas, servicios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="pl-12 sm:pl-14 pr-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-lg border-2 border-border focus:border-primary shadow-sm transition-all bg-background"
          />

          {/* Botón limpiar - derecha */}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={isLoading}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-all z-10 flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
