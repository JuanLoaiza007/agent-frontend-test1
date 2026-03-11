"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Info,
} from "lucide-react";
import { DOMAINS } from "@/lib/constants";
import { cn, isValidLink } from "@/lib/utils";
import { AnimatedMarkdown } from "./AnimatedMarkdown";
import { ERROR_CATALOG, formatErrorForClipboard } from "@/lib/errors";

const SOURCE_TYPE_ICONS = {
  normativa: FileText,
  web: Globe,
  sistema: Building2,
  documento: FileText,
  externo: Globe,
};

function ChunkItem({ chunk }) {
  const getScoreColor = (score) => {
    if (score > 0.4) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if (score > 0.2) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-[10px] font-mono", getScoreColor(chunk.score))}>
          Relevancia: {chunk.score.toFixed(4)}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
        {chunk.content}
      </p>
    </div>
  );
}

function SourceItem({ source }) {
  const isVectorDB = !source.url;
  const TypeIcon = isVectorDB ? Database : (SOURCE_TYPE_ICONS[source.type] || FileText);
  const sortedChunks = [...(source.chunks || [])].sort((a, b) => b.score - a.score);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-auto py-2 px-3 text-left font-normal border-muted-foreground/10 hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TypeIcon className={cn("h-4 w-4 flex-shrink-0 transition-colors", isVectorDB ? "text-[#C8102E]" : "text-muted-foreground group-hover:text-primary")} />
            <span className="text-sm font-medium truncate flex-1">
              {source.name}
            </span>
          </div>
          <Info className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={cn("h-5 w-5", isVectorDB ? "text-[#C8102E]" : "text-muted-foreground")} />
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              {isVectorDB ? "Vector Database" : source.type}
            </Badge>
          </div>
          <DialogTitle className="text-xl line-clamp-2">{source.name}</DialogTitle>
          <DialogDescription>
            Fragmentos de información recuperados de esta fuente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedChunks.length > 0 ? (
            sortedChunks.map((chunk, idx) => (
              <ChunkItem key={idx} chunk={chunk} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-20" />
              <p>No se encontraron fragmentos específicos para esta consulta.</p>
            </div>
          )}
        </div>

        {(source.url && isValidLink(source.url)) && (
          <div className="p-4 border-t bg-muted/30 flex justify-end">
            <Button asChild size="sm" className="gap-2">
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                <span>Ver fuente completa</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ErrorState({ response }) {
  const [copied, setCopied] = useState(false);
  const errorInfo = ERROR_CATALOG[response.error_type] || ERROR_CATALOG.DEFAULT;
  const ErrorIcon = errorInfo.icon;

  const handleCopy = () => {
    const text = formatErrorForClipboard({
      type: response.error_type,
      raw_message: response.answer,
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn("p-4 rounded-full bg-muted mb-4", errorInfo.color)}>
        <ErrorIcon className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-bold mb-2">{errorInfo.title}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {errorInfo.message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button 
          variant="outline" 
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ExternalLink className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar Error para Soporte"}
        </Button>
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
          <div className="flex gap-3">
            <Search className="h-6 w-6 text-[#C8102E] animate-pulse" />
            <Database className="h-6 w-6 text-[#C8102E]/70 animate-pulse delay-75" />
            <Sparkles className="h-6 w-6 text-[#C8102E]/50 animate-pulse delay-150" />
          </div>
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

  const isError = response.detected_domain === "error";

  if (isError) {
    return (
      <Card className={cn("w-full h-full flex flex-col justify-center overflow-clip border-destructive/20 bg-destructive/5", className)}>
        <ErrorState response={response} />
      </Card>
    );
  }

  const domain = DOMAINS[response.detected_domain];
  const domainLabel = domain?.label || response.detected_domain;
  const validSources = response.sources || [];
  const validActions = (response.action_links || []).filter((link) =>
    isValidLink(link.url)
  );

  return (
    <Card
      className={`w-full h-full flex flex-col overflow-clip ${className || ""}`}
    >
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

      <CardContent className="flex flex-col flex-1 overflow-y-auto px-4 gap-2 py-2">
        <h4 className="text-sm font-medium text-muted-foreground">Respuesta</h4>
        <AnimatedMarkdown content={response.answer} />
        {validSources.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground mt-2">
              Fuentes consultadas
            </h4>
            <div className="space-y-2">
              {validSources.map((source, index) => (
                <SourceItem key={index} source={source} />
              ))}
            </div>
          </>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col px-4 pt-1 text-xs text-muted-foreground w-full items-end">
        <span className="truncate">Consulta: "{response.question}"</span>

        {validActions.length > 0 && (
          <div className="flex flex-col gap-2 w-full items-end mt-2">
            <h4 className="text-sm font-medium">Acciones disponibles</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {validActions.map((link, index) => (
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
