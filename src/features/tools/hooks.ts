/* ═══════════════════════════════════════════
   HOOKS DE BÚSQUEDA Y FILTRADO
   Andalus Studio — FASE 01
   ═══════════════════════════════════════════ */

import { useState, useMemo, useCallback } from 'react';
import type { ToolDefinition, ToolFamily, ToolStatus, AccessLevel } from './types';
import { TOOL_REGISTRY } from './registry';

// ─── NORMALIZACIÓN DE TEXTO ───────────────
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .trim();
}

// ─── TIPOS DE FILTRO ──────────────────────
export interface ToolFilters {
  search: string;
  family: ToolFamily | 'all';
  status: ToolStatus | 'all';
  accessLevel: AccessLevel | 'all';
  executionMode: string | 'all';
  sortBy: 'name' | 'credits' | 'status' | 'family';
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: ToolFilters = {
  search: '',
  family: 'all',
  status: 'all',
  accessLevel: 'all',
  executionMode: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

// ─── HOOK PRINCIPAL ───────────────────────
export function useToolCatalog() {
  const [filters, setFilters] = useState<ToolFilters>(DEFAULT_FILTERS);

  const filteredTools = useMemo(() => {
    let result = [...TOOL_REGISTRY];

    // Búsqueda por nombre y descripción
    if (filters.search.trim()) {
      const normalizedSearch = normalizeText(filters.search);
      result = result.filter(tool => {
        const normalizedName = normalizeText(tool.name);
        const normalizedDesc = normalizeText(tool.description);
        const normalizedShort = normalizeText(tool.shortDescription);
        const normalizedTags = tool.tags.map(normalizeText).join(' ');
        
        return (
          normalizedName.includes(normalizedSearch) ||
          normalizedDesc.includes(normalizedSearch) ||
          normalizedShort.includes(normalizedSearch) ||
          normalizedTags.includes(normalizedSearch)
        );
      });
    }

    // Filtro por familia
    if (filters.family !== 'all') {
      result = result.filter(tool => tool.family === filters.family);
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      result = result.filter(tool => tool.status === filters.status);
    }

    // Filtro por nivel de acceso
    if (filters.accessLevel !== 'all') {
      result = result.filter(tool => tool.accessLevel === filters.accessLevel);
    }

    // Filtro por modo de ejecución
    if (filters.executionMode !== 'all') {
      result = result.filter(tool => tool.executionMode === filters.executionMode);
    }

    // Ordenación
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'es');
          break;
        case 'credits':
          comparison = (a.estimatedCredits || 0) - (b.estimatedCredits || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'family':
          comparison = a.family.localeCompare(b.family);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof ToolFilters>(
    key: K,
    value: ToolFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const stats = useMemo(() => ({
    total: TOOL_REGISTRY.length,
    filtered: filteredTools.length,
    byFamily: TOOL_REGISTRY.reduce((acc, tool) => {
      acc[tool.family] = (acc[tool.family] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: TOOL_REGISTRY.reduce((acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [filteredTools]);

  return {
    tools: filteredTools,
    filters,
    updateFilter,
    resetFilters,
    stats,
  };
}

// ─── HOOK DE RECOMENDACIÓN ────────────────
export function useToolRecommender() {
  const recommend = useCallback((query: string): ToolDefinition[] => {
    const normalizedQuery = normalizeText(query);
    
    // Mapeo de intenciones a herramientas
    const intentionMap: Record<string, string[]> = {
      'analizar midi': ['analizador-midi'],
      'analizar archivo midi': ['analizador-midi'],
      'tempo': ['calculadora-bpm'],
      'bpm': ['calculadora-bpm'],
      'velocidad': ['calculadora-bpm'],
      'afinar': ['afinador'],
      'afinacion': ['afinador'],
      'cancion': ['asistente-letras', 'generador-melodico'],
      'letra': ['asistente-letras', 'analizador-rimas'],
      'escribir cancion': ['asistente-letras', 'generador-melodico', 'armonizador-automatico'],
      'componer': ['generador-melodico', 'armonizador-automatico'],
      'melodia': ['generador-melodico'],
      'armonia': ['armonizador-automatico', 'analizador-tonal'],
      'acordes': ['armonizador-automatico', 'analizador-tonal'],
      'separar voz': ['separador-fuentes'],
      'quitar voz': ['separador-fuentes'],
      'karaoke': ['separador-fuentes'],
      'masterizar': ['masterizacion'],
      'masterizacion': ['masterizacion'],
      'portada': ['generador-portadas'],
      'imagen': ['generador-portadas'],
      'video': ['visualizador-audio'],
      'visualizacion': ['visualizador-audio', 'analizador-espectral'],
      'datos musica': ['sonificacion-datos'],
      'sonificar': ['sonificacion-datos'],
      'ejercicio': ['ear-training'],
      'oido': ['ear-training'],
      'aprender': ['teoria-interactiva', 'ear-training'],
      'teoria': ['teoria-interactiva', 'analizador-tonal'],
      'intervalo': ['calculadora-intervalos'],
      'metronomo': ['metronomo'],
      'ritmo': ['metronomo', 'laboratorio-ritmico'],
      'proyecto': ['gestion-proyectos'],
      'organizar': ['gestion-proyectos'],
    };

    // Buscar coincidencias
    const matchedSlugs = new Set<string>();
    
    for (const [keyword, slugs] of Object.entries(intentionMap)) {
      if (normalizedQuery.includes(normalizeText(keyword))) {
        slugs.forEach(slug => matchedSlugs.add(slug));
      }
    }

    // Si no hay coincidencias, buscar en nombres y descripciones
    if (matchedSlugs.size === 0) {
      const searchResults = TOOL_REGISTRY.filter(tool => {
        const normalizedName = normalizeText(tool.name);
        const normalizedDesc = normalizeText(tool.description);
        const normalizedTags = tool.tags.map(normalizeText).join(' ');
        
        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedDesc.includes(normalizedQuery) ||
          normalizedTags.includes(normalizedQuery)
        );
      });

      searchResults.forEach(tool => matchedSlugs.add(tool.slug));
    }

    // Convertir slugs a herramientas
    const recommended = Array.from(matchedSlugs)
      .map(slug => TOOL_REGISTRY.find(t => t.slug === slug))
      .filter((t): t is ToolDefinition => t !== undefined)
      .slice(0, 5); // Máximo 5 recomendaciones

    return recommended;
  }, []);

  return { recommend };
}
