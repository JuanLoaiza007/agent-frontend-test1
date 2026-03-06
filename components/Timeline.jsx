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
} from "lucide-react";

/**
 * Timeline - Timeline de Razonamiento
 *
 * Muestra el flujo de los agentes de forma visual.
 */

const STEP_ICONS = {
  planning: Search,
  domain_detected: CheckCircle2,
  // Búsqueda en base de conocimiento
  vector_search: Database,
  // Búsqueda en web
  web_search: Globe,
  search_web_pages: Globe,
  // Inspección de páginas
  inspect_web_page: ExternalLink,
  page_inspection: ExternalLink,
  // Inspección de PDFs
  inspect_pdf_document: FileText,
  pdf_inspection: FileText,
  read_pdf_section: BookOpen,
  // Planificación y evaluación
  planner: Bot,
  replanner: Bot,
  // Respuesta final
  synthesizing: Sparkles,
  final_response: Sparkles,
  // Otros
  searching: Database,
  external_search: Globe,
};

const STEP_LABELS = {
  planning: "Analizando consulta",
  domain_detected: "Dominio detectado",
  vector_search: "Buscando en documentos",
  web_search: "Buscando en internet",
  search_web_pages: "Buscando en internet",
  inspect_web_page: "Inspeccionando página",
  page_inspection: "Inspeccionando página",
  inspect_pdf_document: "Leyendo documento PDF",
  pdf_inspection: "Leyendo documento PDF",
  read_pdf_section: "Leyendo sección de PDF",
  planner: "Generando plan",
  replanner: "Evaluando progreso",
  synthesizing: "Generando respuesta",
  final_response: "Generando respuesta",
  searching: "Consultando fuentes",
  external_search: "Búsqueda externa",
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {event.step === "domain_detected" && (
            <Badge variant="secondary" className="text-xs">
              {event.message}
            </Badge>
          )}
        </div>
        {event.step !== "domain_detected" && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {event.message}
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

export function Timeline({ events = [], isLoading = false }) {
  if (isLoading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="py-0 px-4 mb-0">
          <CardTitle className="text-sm">Proceso de búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto py-0 px-4">
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="py-0 px-4 mb-0">
        <CardTitle className="text-sm">Proceso de búsqueda</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto py-0 px-4">
        <div className="relative">
          {events.map((event, index) => (
            <TimelineItem
              key={index}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TimelineAccordion - Versión en acordeón del timeline
 * Para usar cuando se quiere colapsar el timeline
 */
export function TimelineAccordion({ events = [], isLoading = false }) {
  if (isLoading) {
    return (
      <Accordion type="single" collapsible defaultValue="timeline">
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-sm">
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

  return (
    <Accordion type="single" collapsible defaultValue="timeline">
      <AccordionItem value="timeline">
        <AccordionTrigger className="text-sm">
          Proceso de búsqueda ({events.length} pasos)
        </AccordionTrigger>
        <AccordionContent>
          <div className="relative">
            {events.map((event, index) => (
              <TimelineItem
                key={index}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
