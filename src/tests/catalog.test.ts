/* ═══════════════════════════════════════════
   PRUEBAS — FASE 01
   Andalus Studio
   ═══════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import {
  TOOL_REGISTRY,
  getToolBySlug,
  getToolById,
  getToolsByFamily,
  getAvailableTools,
  getPublicTools,
  getAllSlugs,
  getAllIds,
  hasDuplicateSlugs,
  hasDuplicateIds,
} from '../features/tools/registry';
import { TOOL_FAMILIES, getStatusLabel, getStatusColor, canToolExecute, isToolPublic } from '../features/tools/types';
import type { ToolDefinition, FamilyMetadata } from '../features/tools/types';

// ─── 01. REGISTRO DE HERRAMIENTAS ─────────
describe('Registro de herramientas', () => {
  it('01. El registro contiene herramientas', () => {
    expect(TOOL_REGISTRY.length).toBeGreaterThan(0);
  });

  it('02. Todas las herramientas tienen ID único', () => {
    expect(hasDuplicateIds()).toBe(false);
  });

  it('03. Todas las herramientas tienen slug único', () => {
    expect(hasDuplicateSlugs()).toBe(false);
  });

  it('04. Todas las herramientas tienen nombre', () => {
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(tool.name).toBeTruthy();
      expect(tool.name.length).toBeGreaterThan(0);
    });
  });

  it('05. Todas las herramientas tienen familia válida', () => {
    const validFamilies = TOOL_FAMILIES.map((f: FamilyMetadata) => f.id);
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(validFamilies).toContain(tool.family);
    });
  });

  it('06. Todas las herramientas tienen estado válido', () => {
    const validStatuses = ['PLANNED', 'IN_DEVELOPMENT', 'TESTING', 'BETA', 'AVAILABLE', 'DISABLED'];
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(validStatuses).toContain(tool.status);
    });
  });

  it('07. Ninguna herramienta está en estado AVAILABLE (no hay motores implementados)', () => {
    const available = getAvailableTools();
    expect(available.length).toBe(0);
  });

  it('08. Todas las herramientas tienen quality gate definido', () => {
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(tool.qualityGate).toBeDefined();
      expect(typeof tool.qualityGate.passedQualityGate).toBe('boolean');
    });
  });

  it('09. Ninguna herramienta ha superado el quality gate', () => {
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(tool.qualityGate.passedQualityGate).toBe(false);
    });
  });

  it('10. Las herramientas tienen lastVerifiedAt null (nunca verificadas)', () => {
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(tool.lastVerifiedAt).toBeNull();
    });
  });
});

// ─── 02. FUNCIONES DE ACCESO ──────────────
describe('Funciones de acceso al registro', () => {
  it('11. getToolBySlug devuelve la herramienta correcta', () => {
    const tool = getToolBySlug('calculadora-bpm');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Calculadora de BPM');
  });

  it('12. getToolBySlug devuelve undefined para slug inexistente', () => {
    const tool = getToolBySlug('herramienta-inexistente');
    expect(tool).toBeUndefined();
  });

  it('13. getToolById devuelve la herramienta correcta', () => {
    const tool = getToolById('tool-util-bpm');
    expect(tool).toBeDefined();
    expect(tool?.slug).toBe('calculadora-bpm');
  });

  it('14. getToolsByFamily devuelve herramientas de una familia', () => {
    const tools = getToolsByFamily('utilities');
    expect(tools.length).toBeGreaterThan(0);
    tools.forEach(tool => {
      expect(tool.family).toBe('utilities');
    });
  });

  it('15. getPublicTools devuelve solo herramientas públicas', () => {
    const publicTools = getPublicTools();
    publicTools.forEach((tool: ToolDefinition) => {
      expect(tool.visibility).toBe('PUBLIC');
      expect(tool.status).not.toBe('DISABLED');
    });
  });

  it('16. getAllSlugs devuelve todos los slugs', () => {
    const slugs = getAllSlugs();
    expect(slugs.length).toBe(TOOL_REGISTRY.length);
  });

  it('17. getAllIds devuelve todos los IDs', () => {
    const ids = getAllIds();
    expect(ids.length).toBe(TOOL_REGISTRY.length);
  });
});

// ─── 03. FAMILIAS ─────────────────────────
describe('Familias de herramientas', () => {
  it('18. Existen 10 familias definidas', () => {
    expect(TOOL_FAMILIES.length).toBe(10);
  });

  it('19. Cada familia tiene nombre, icono y descripción', () => {
    TOOL_FAMILIES.forEach((family: FamilyMetadata) => {
      expect(family.name).toBeTruthy();
      expect(family.icon).toBeTruthy();
      expect(family.description).toBeTruthy();
    });
  });

  it('20. Cada familia tiene al menos una herramienta', () => {
    TOOL_FAMILIES.forEach((family: FamilyMetadata) => {
      const tools = getToolsByFamily(family.id);
      expect(tools.length).toBeGreaterThan(0);
    });
  });
});

// ─── 04. FUNCIONES DE UTILIDAD ────────────
describe('Funciones de utilidad', () => {
  it('21. getStatusLabel devuelve etiquetas correctas', () => {
    expect(getStatusLabel('PLANNED')).toBe('Planificada');
    expect(getStatusLabel('AVAILABLE')).toBe('Disponible');
    expect(getStatusLabel('DISABLED')).toBe('Desactivada');
  });

  it('22. getStatusColor devuelve clases CSS', () => {
    const color = getStatusColor('AVAILABLE');
    expect(color).toContain('bg-');
    expect(color).toContain('text-');
  });

  it('23. canToolExecute devuelve false para PLANNED', () => {
    const tool = TOOL_REGISTRY.find((t: ToolDefinition) => t.status === 'PLANNED');
    if (tool) {
      expect(canToolExecute(tool)).toBe(false);
    }
  });

  it('24. isToolPublic devuelve true para herramientas públicas', () => {
    const tool = TOOL_REGISTRY.find((t: ToolDefinition) => t.visibility === 'PUBLIC' && t.status !== 'DISABLED');
    if (tool) {
      expect(isToolPublic(tool)).toBe(true);
    }
  });
});

// ─── 05. INTEGRIDAD DE DATOS ──────────────
describe('Integridad de datos', () => {
  it('25. No hay secretos en el registro', () => {
    const registryString = JSON.stringify(TOOL_REGISTRY);
    expect(registryString).not.toContain('sk_');
    expect(registryString).not.toContain('pk_');
    expect(registryString).not.toContain('password');
    expect(registryString).not.toContain('secret');
  });

  it('26. No hay URLs de pago ficticias', () => {
    const registryString = JSON.stringify(TOOL_REGISTRY);
    expect(registryString).not.toContain('stripe.com');
    expect(registryString).not.toContain('checkout');
  });

  it('27. Todas las herramientas tienen estimatedCredits como número o null', () => {
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      expect(
        tool.estimatedCredits === null || typeof tool.estimatedCredits === 'number'
      ).toBe(true);
    });
  });

  it('28. Las herramientas gratuitas tienen estimatedCredits 0', () => {
    const freeTools = TOOL_REGISTRY.filter((t: ToolDefinition) => t.costPolicy === 'FREE_NO_LIMIT');
    freeTools.forEach((tool: ToolDefinition) => {
      expect(tool.estimatedCredits).toBe(0);
    });
  });
});

// ─── 06. CONSISTENCIA ─────────────────────
describe('Consistencia del catálogo', () => {
  it('29. Las herramientas relacionadas existen', () => {
    const allSlugs = getAllSlugs();
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      tool.relatedTools.forEach((relatedSlug: string) => {
        expect(allSlugs).toContain(relatedSlug);
      });
    });
  });

  it('30. Los formatos de entrada y salida son válidos', () => {
    const validFormats = [
      'audio/wav', 'audio/mp3', 'audio/flac', 'audio/ogg', 'audio/aac',
      'midi', 'musicxml', 'text/plain', 'text/markdown',
      'image/png', 'image/jpeg', 'image/svg+xml',
      'video/mp4', 'video/webm', 'application/json', 'application/pdf'
    ];
    
    TOOL_REGISTRY.forEach((tool: ToolDefinition) => {
      tool.inputFormats.forEach((format: string) => {
        expect(validFormats).toContain(format);
      });
      tool.outputFormats.forEach((format: string) => {
        expect(validFormats).toContain(format);
      });
    });
  });
});
