"use client";

import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/lib/constants";

/**
 * DomainTags - Barra de Estado de Dominios
 *
 * Cinco etiquetas (tags) con los nombres de los dominios.
 * Según filosofia-interfaz.md:
 * - Por defecto: etiquetas en gris tenue
 * - Cuando el Planner detecta el área: el dominio se ilumina en Rojo Univalle
 */
export function DomainTags({
  activeDomain = null,
  confidence = null,
  className = "",
}) {
  const domainList = Object.values(DOMAINS);

  return (
    <div
      className={`flex flex-wrap justify-center gap-1.5 sm:gap-2 ${className}`}
    >
      {domainList.map((domain) => {
        const isActive = activeDomain === domain.id;

        return (
          <Badge
            key={domain.id}
            variant={isActive ? "default" : "outline"}
            className={`
              px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm transition-all duration-300 cursor-default select-none pointer-events-none
              ${
                isActive
                  ? "bg-[#C8102E] text-white shadow-md scale-105"
                  : "text-muted-foreground/60 border-transparent sm:border-border"
              }
            `}
          >
            {domain.label}
            {isActive && confidence && (
              <span className="ml-1 sm:ml-2 text-xs opacity-80">
                ({Math.round(confidence * 100)}%)
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
