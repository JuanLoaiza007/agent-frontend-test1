"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Database,
  Globe,
  Sparkles,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  BookOpen,
  Bot,
  PanelsTopLeft,
  BookOpenText,
} from "lucide-react";

/**
 * Timeline - Componente que muestra el proceso de búsqueda del agente
 */

const REVERSE_ORDER = true;

function TimelineBoundary({ label }) {
  return (
    <div className="flex items-center gap-3 py-2 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border/60" />
      <span className="whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function TimelinePending({ isLast }) {
  return (
    <div className="flex items-start gap-3 pb-4" role="status" aria-live="polite">
      <div className="flex flex-col items-center">
        <div className="flex h-6 items-center gap-1 rounded-full p-1 text-primary">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
        </div>
        {!isLast && <div className="w-px h-full bg-border min-h-4" />}
      </div>
      <div className="flex-1 pb-2 pt-1">
        <span className="sr-only">La consulta continúa en proceso</span>
      </div>
    </div>
  );
}

function getBoundaryLabels(isTruncated, isComplete) {
  if (REVERSE_ORDER) {
    return {
      top: isComplete ? "Fin de la consulta" : null,
      bottom: isTruncated ? "Más eventos anteriores..." : "Inicio de la consulta",
    };
  }

  return {
    top: "Inicio de la consulta",
    bottom: isTruncated
      ? "Más eventos posteriores..."
      : isComplete
        ? "Fin de la consulta"
        : null,
  };
}

const STEP_ICONS = {
  planning: Search,
  domain_detected: CheckCircle2,
  vector_search: Database,
  VectorSearch: Database,
  web_search: Globe,
  search_web_pages: Globe,
  inspect_web_page: PanelsTopLeft,
  page_inspection: PanelsTopLeft,
  inspect_pdf_document: BookOpenText,
  pdf_inspection: BookOpenText,
  read_pdf_section: BookOpen,
  planner: Bot,
  replanner: Bot,
  synthesizing: Sparkles,
  final_response: Sparkles,
  searching: Database,
  external_search: Globe,
  executor: Search,
  tool_handler: Search,
};

const STEP_LABELS = {
  planning: "Análisis inicial",
  domain_detected: "Clasificación de área",
  vector_search: "Búsqueda institucional",
  VectorSearch: "Búsqueda institucional",
  web_search: "Búsqueda en internet",
  search_web_pages: "Búsqueda en internet",
  inspect_web_page: "Extracción de contenido",
  page_inspection: "Extracción de contenido",
  inspect_pdf_document: "Lectura de documento PDF",
  pdf_inspection: "Lectura de documento PDF",
  read_pdf_section: "Sección específica PDF",
  planner: "Planificación",
  replanner: "Re-evaluación",
  synthesizing: "Redacción de respuesta",
  final_response: "Respuesta final",
  searching: "Búsqueda externa",
  external_search: "Búsqueda externa",
  executor: "Ejecución de plan",
  tool_handler: "Uso de herramienta",
};

const STEP_COLORS = {
  planning: "text-blue-500",
  domain_detected: "text-green-500",
  vector_search: "text-amber-500",
  web_search: "text-purple-500",
  search_web_pages: "text-purple-500",
  inspect_web_page: "text-cyan-500",
  page_inspection: "text-cyan-500",
  inspect_pdf_document: "text-orange-500",
  pdf_inspection: "text-orange-500",
  read_pdf_section: "text-orange-600",
  planner: "text-indigo-500",
  replanner: "text-indigo-500",
  synthesizing: "text-pink-500",
  final_response: "text-pink-500",
  searching: "text-amber-500",
  external_search: "text-purple-500",
};

function TimelineItem({ event, isLast }) {
  const Icon = STEP_ICONS[event.step] || Circle;
  const colorClass = STEP_COLORS[event.step] || "text-gray-400";
  
  // Lógica de validación de mensaje dinámico
  const genericLabels = Object.values(STEP_LABELS);
  const isGeneric = genericLabels.includes(event.message);
  const displayMessage = isGeneric ? `${event.message} *` : event.message;
  
  const label = STEP_LABELS[event.step] || event.step;

  return (
    <div className="flex items-start gap-3 pb-4">
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-1 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="w-px h-full bg-border min-h-4" />}
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {event.step === "domain_detected" && (
              <Badge variant="secondary" className="text-xs">
                {event.message}
              </Badge>
            )}
          </div>
          {event.latency !== undefined && (
            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
              {(event.latency / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        {event.step !== "domain_detected" && (
          <p className="text-sm mt-0.5 text-muted-foreground">
            {displayMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({
  events = [],
  isLoading = false,
  className,
  maxEvents = Infinity,
  latency,
  isComplete = false,
  isProcessing = false,
}) {
  if (isLoading) {
    return (
      <Card className={`w-full h-full flex flex-col ${className || ""}`}>
        <CardHeader className="px-4 mb-0">
          <CardTitle className="text-sm">Proceso de búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-4">
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const orderedEvents = REVERSE_ORDER ? [...events].reverse() : [...events];
  const isTruncated = Number.isFinite(maxEvents) && orderedEvents.length > maxEvents;
  const displayEvents = orderedEvents.slice(0, maxEvents);
  const boundaryLabels = getBoundaryLabels(isTruncated, isComplete);

  return (
    <Card className={`w-full h-full flex flex-col ${className || ""}`}>
      <CardHeader className="px-3 sm:px-4 mb-0 pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center justify-between gap-2">
          <span>Proceso de búsqueda</span>
          {latency !== undefined && latency !== null && !isLoading && (
            <span className="text-xs font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md animate-in fade-in">
              Latencia: {(latency / 1000).toFixed(2)}s
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-4 min-h-0">
        <div className="relative">
          {boundaryLabels.top && <TimelineBoundary label={boundaryLabels.top} />}
          {REVERSE_ORDER && isProcessing && displayEvents.length > 0 && (
            <TimelinePending isLast={false} />
          )}
          {displayEvents.map((event, index) => (
            <TimelineItem
              key={`${event.step}-${index}`}
              event={event}
              isLast={index === displayEvents.length - 1}
            />
          ))}
          {!REVERSE_ORDER && isProcessing && displayEvents.length > 0 && (
            <TimelinePending isLast />
          )}
          {boundaryLabels.bottom && <TimelineBoundary label={boundaryLabels.bottom} />}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TimelineAccordion - Versión en acordeón del timeline
 * Para usar cuando se quiere colapsar el timeline
 */
export function TimelineAccordion({
  events = [],
  isLoading = false,
  latency,
  isComplete = false,
  isProcessing = false,
}) {
  if (isLoading) {
    return (
      <Accordion type="single" collapsible defaultValue="timeline">
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-sm sm:text-base">
            Proceso de búsqueda
          </AccordionTrigger>
          <AccordionContent>
            <TimelineSkeleton />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const orderedEvents = REVERSE_ORDER ? [...events].reverse() : [...events];
  const boundaryLabels = getBoundaryLabels(false, isComplete);

  return (
    <Accordion type="single" collapsible defaultValue="timeline">
      <AccordionItem value="timeline">
        <AccordionTrigger className="text-sm sm:text-base">
          <div className="flex items-center justify-between w-full pr-2">
            <span>Proceso de búsqueda ({events.length} pasos)</span>
            {latency !== undefined && latency !== null && !isLoading && (
              <span className="text-xs font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md animate-in fade-in">
                {(latency / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="relative">
            {boundaryLabels.top && <TimelineBoundary label={boundaryLabels.top} />}
            {REVERSE_ORDER && isProcessing && orderedEvents.length > 0 && (
              <TimelinePending isLast={false} />
            )}
            {orderedEvents.map((event, index) => (
              <TimelineItem
                key={`${event.step}-${index}`}
                event={event}
                isLast={index === orderedEvents.length - 1}
              />
            ))}
            {!REVERSE_ORDER && isProcessing && orderedEvents.length > 0 && (
              <TimelinePending isLast />
            )}
            {boundaryLabels.bottom && <TimelineBoundary label={boundaryLabels.bottom} />}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
