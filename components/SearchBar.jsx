"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pregunta sobre matrícula, becas, servicios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="pl-10 pr-20 h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-lg border-2 border-border focus:border-primary shadow-sm transition-all"
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            size="sm"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 sm:h-9 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xs sm:text-sm">Buscar</span>
            )}
          </Button>
        </div>
      </form>
      <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-2">
        Sistema de consulta agéntico - Universidad del Valle
      </p>
    </div>
  );
}
