"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  FileText,
  Globe,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { DOMAINS } from "@/lib/constants";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * ResponseCard - Ficha de Trámite
 *
 * Según filosofia-interfaz.md, la respuesta final debe ser una "Ficha de Trámite":
 * - Encabezado: Indica el área oficial (ej. Trámite Administrativo).
 * - Respuesta: Concisa (máximo 6 líneas).
 * - Metadatos de la Fuente: Un pequeño recuadro con el nombre de la resolución.
 * - Botón de Acción: Enlace directo al SIRA o al portal de pagos.
 */

const SOURCE_TYPE_ICONS = {
  normativa: FileText,
  web: Globe,
  sistema: Building2,
  documento: FileText,
  externo: Globe,
};

const SOURCE_STATUS_ICONS = {
  vigente: CheckCircle,
  actualizado: CheckCircle,
  disponible: CheckCircle,
  desactualizado: Clock,
  no_disponible: AlertCircle,
};

const SOURCE_STATUS_COLORS = {
  vigente: "text-green-600",
  actualizado: "text-green-600",
  disponible: "text-green-600",
  desactualizado: "text-amber-600",
  no_disponible: "text-red-600",
};

function SourceItem({ source }) {
  const TypeIcon = SOURCE_TYPE_ICONS[source.type] || FileText;
  const StatusIcon = SOURCE_STATUS_ICONS[source.status] || Clock;
  const statusColor = SOURCE_STATUS_COLORS[source.status] || "text-gray-500";

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">
          {source.name}
        </span>
      </div>
      <div className={`flex items-center gap-1 flex-shrink-0 ${statusColor}`}>
        <StatusIcon className="h-3 w-3" />
        <span className="text-xs capitalize whitespace-nowrap">
          {source.status}
        </span>
      </div>
    </div>
  );
}

function ResponseSkeleton() {
  return (
    <Card className="w-full h-auto sm:h-full flex flex-col">
      <CardHeader className="px-4 mb-0">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-4 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Separator />
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter className="px-4">
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}

export function ResponseCard({ response, isLoading = false, className }) {
  if (isLoading) {
    return (
      <Card className={`w-full h-full flex flex-col ${className || ""}`}>
        <CardHeader className="px-4 mb-0">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-4 min-h-0">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Separator />
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="px-4">
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (!response) {
    return null;
  }

  const domain = DOMAINS[response.detected_domain];
  const domainLabel = domain?.label || response.detected_domain;

  return (
    <Card
      className={`w-full h-full flex flex-col overflow-clip ${className || ""}`}
    >
      {/* Encabezado con área oficial */}
      <CardHeader className="px-3 sm:px-4 mb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardDescription className="text-xs uppercase tracking-wide mb-0">
              Área de consulta
            </CardDescription>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#C8102E] flex-shrink-0" />
              <span className="truncate">{domainLabel}</span>
            </CardTitle>
          </div>
          {response.domain_confidence && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {Math.round(response.domain_confidence * 100)}% confianza
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Respuesta concisa */}
      <CardContent className="flex flex-col flex-1 overflow-y-auto px-4 gap-2 py-2">
        <h4 className="text-sm font-medium text-muted-foreground">Respuesta</h4>
        <Markdown remarkPlugins={[remarkGfm]}>{response.answer}</Markdown>
        {/* Metadatos de fuentes */}
        {response.sources && response.sources.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground mt-2">
              Fuentes consultadas
            </h4>
            <div className="space-y-2">
              {response.sources.map((source, index) => (
                <SourceItem key={index} source={source} />
              ))}
            </div>
          </>
        )}
      </CardContent>
      <Separator />
      {/* Footer con pregunta original */}
      <CardFooter className="flex flex-col px-4 pt-1 text-xs text-muted-foreground w-full items-end">
        <span className="truncate">Consulta: "{response.question}"</span>

        {/* Botones de acción */}
        {response.action_links && response.action_links.length > 0 && (
          <div className="flex flex-col gap-2 w-full items-end">
            <h4 className="text-sm font-medium">Acciones disponibles</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {response.action_links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.type === "primary" ? "default" : "outline"}
                  size="sm"
                  asChild
                  className="max-w-[200px] sm:max-w-[240px] truncate"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span className="truncate">{link.label}</span>
                    <ExternalLink className="ml-2 h-3 w-3 flex-shrink-0" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
