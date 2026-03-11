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
  Bot,
  Search,
  Database,
  Sparkles,
} from "lucide-react";
import { DOMAINS } from "@/lib/constants";
import { AnimatedMarkdown } from "./AnimatedMarkdown";

/**
 * ResponseCard - Tarjeta de respuesta con fuentes y acciones
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

  const isLink = !!source.url;

  return (
    <Button
      variant="outline"
      size="sm"
      asChild={isLink}
      className="w-full justify-between h-auto py-2 px-3 text-left font-normal border-muted-foreground/10 hover:bg-muted/50"
    >
      {isLink ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate flex-1">
              {source.name}
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
          </div>
          <div className={`flex items-center gap-1 flex-shrink-0 ${statusColor}`}>
            <StatusIcon className="h-3 w-3" />
            <span className="text-[10px] sm:text-xs capitalize whitespace-nowrap">
              {source.status}
            </span>
          </div>
        </a>
      ) : (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate flex-1">
              {source.name}
            </span>
          </div>
          <div className={`flex items-center gap-1 flex-shrink-0 ${statusColor}`}>
            <StatusIcon className="h-3 w-3" />
            <span className="text-[10px] sm:text-xs capitalize whitespace-nowrap">
              {source.status}
            </span>
          </div>
        </div>
      )}
    </Button>
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

/** Componente de carga animado */
function LoadingAgent({ className }) {
  return (
    <Card className={`w-full h-full flex flex-col ${className || ""}`}>
      <CardHeader className="px-4 mb-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C8102E] animate-ping" />
          <CardDescription className="text-xs uppercase tracking-wide">
            Procesando
          </CardDescription>
        </div>
        <CardTitle className="text-lg flex items-center gap-2 mt-1">
          <Bot className="h-5 w-5 text-[#C8102E] animate-bounce" />
          <span>Buscando respuesta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-4">
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
          {/* Animated agent icons */}
          <div className="flex gap-3">
            <Search className="h-6 w-6 text-[#C8102E] animate-pulse" />
            <Database className="h-6 w-6 text-[#C8102E]/70 animate-pulse delay-75" />
            <Sparkles className="h-6 w-6 text-[#C8102E]/50 animate-pulse delay-150" />
          </div>
          {/* Animated dots */}
          <div className="flex items-center gap-1 h-6">
            <span className="text-[#C8102E] text-lg font-medium">Buscando</span>
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-bounce delay-200" />
          </div>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            El agente está analizando tu consulta y buscando en las fuentes
            disponibles
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResponseCard({ response, isLoading = false, className }) {
  if (isLoading) {
    return <LoadingAgent className={className} />;
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
        <AnimatedMarkdown content={response.answer} />
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
