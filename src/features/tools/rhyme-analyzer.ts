/**
 * Analizador de Rimas - Motor Real
 * FASE 05.1 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const RhymeAnalysisInputSchema = z.object({
  text: z.string().min(1).describe('Texto a analizar'),
  language: z.enum(['es', 'en']).default('es').describe('Idioma del texto'),
  rhymeType: z.enum(['consonant', 'assonant']).default('consonant').describe('Tipo de rima'),
});

export const WordRhymeSchema = z.object({
  word: z.string(),
  rhyme: z.string(),
  stressedVowel: z.string().nullable(),
});

export const VerseRhymeSchema = z.object({
  text: z.string(),
  lastWord: z.string(),
  rhyme: z.string(),
  rhymeGroup: z.string(),
});

export const RhymeAnalysisOutputSchema = z.object({
  verses: z.array(VerseRhymeSchema),
  rhymeScheme: z.string(),
  rhymeGroups: z.record(z.string(), z.number()),
  consonantRhymes: z.number(),
  assonantRhymes: z.number(),
  uniqueRhymes: z.number(),
  language: z.string(),
  rhymeType: z.string(),
});

// Tipos exportados
export type WordRhyme = z.infer<typeof WordRhymeSchema>;
export type VerseRhyme = z.infer<typeof VerseRhymeSchema>;
export type RhymeAnalysisOutput = z.infer<typeof RhymeAnalysisOutputSchema>;

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

const VOWELS = 'aeiouáéíóúü';
const STRONG_VOWELS = 'aeoáéíóú';
const WEAK_VOWELS = 'iuü';

// ═══════════════════════════════════════════
// MOTOR DE ANÁLISIS
// ═══════════════════════════════════════════

/**
 * Obtiene la rima consonante de una palabra
 * (todos los sonidos desde la última vocal acentuada)
 */
export function getConsonantRhyme(word: string): string {
  const normalized = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  
  if (normalized.length === 0) return '';
  
  // Encontrar la última vocal acentuada
  let lastStressedVowelIndex = -1;
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (/[áéíóú]/.test(normalized[i])) {
      lastStressedVowelIndex = i;
      break;
    }
  }
  
  // Si no hay vocal acentuada, usar reglas de acentuación
  if (lastStressedVowelIndex === -1) {
    const lastChar = normalized[normalized.length - 1];
    
    // Palabras terminadas en vocal, n o s: graves (acento en penúltima sílaba)
    if (VOWELS.includes(lastChar) || lastChar === 'n' || lastChar === 's') {
      // Buscar la penúltima vocal
      for (let i = normalized.length - 2; i >= 0; i--) {
        if (VOWELS.includes(normalized[i])) {
          lastStressedVowelIndex = i;
          break;
        }
      }
    } else {
      // Palabras terminadas en otra consonante: agudas (acento en última sílaba)
      for (let i = normalized.length - 1; i >= 0; i--) {
        if (VOWELS.includes(normalized[i])) {
          lastStressedVowelIndex = i;
          break;
        }
      }
    }
  }
  
  // Si aún no se encuentra, usar la última vocal
  if (lastStressedVowelIndex === -1) {
    for (let i = normalized.length - 1; i >= 0; i--) {
      if (VOWELS.includes(normalized[i])) {
        lastStressedVowelIndex = i;
        break;
      }
    }
  }
  
  // Extraer la rima desde la última vocal acentuada
  if (lastStressedVowelIndex === -1) {
    return normalized;
  }
  
  return normalized.slice(lastStressedVowelIndex);
}

/**
 * Obtiene la rima asonante de una palabra
 * (solo las vocales desde la última vocal acentuada)
 */
export function getAssonantRhyme(word: string): string {
  const consonantRhyme = getConsonantRhyme(word);
  
  // Extraer solo las vocales
  const vowels = consonantRhyme.replace(/[^aeiouáéíóúü]/g, '');
  
  // Normalizar vocales acentuadas
  return vowels
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u');
}

/**
 * Obtiene la última palabra de un verso
 */
export function getLastWord(text: string): string {
  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  
  // Limpiar puntuación
  return lastWord.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '');
}

/**
 * Analiza la rima de un verso
 */
export function analyzeVerseRhyme(
  text: string,
  rhymeType: 'consonant' | 'assonant' = 'consonant'
): VerseRhyme {
  const lastWord = getLastWord(text);
  const rhyme = rhymeType === 'consonant' 
    ? getConsonantRhyme(lastWord)
    : getAssonantRhyme(lastWord);
  
  return {
    text,
    lastWord,
    rhyme,
    rhymeGroup: '', // Se asignará después
  };
}

/**
 * Analiza el esquema de rima de un texto completo
 */
export function analyzeRhyme(
  text: string,
  language: 'es' | 'en' = 'es',
  rhymeType: 'consonant' | 'assonant' = 'consonant'
): RhymeAnalysisOutput {
  const lines = text.split('\n').filter(line => line.trim());
  const verses = lines.map(line => analyzeVerseRhyme(line, rhymeType));
  
  // Asignar grupos de rima
  const rhymeGroups: Map<string, string> = new Map();
  let currentGroup = 'A';
  const groupCounts: Record<string, number> = {};
  
  for (const verse of verses) {
    if (!rhymeGroups.has(verse.rhyme)) {
      rhymeGroups.set(verse.rhyme, currentGroup);
      groupCounts[currentGroup] = 0;
      currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
    }
    
    const group = rhymeGroups.get(verse.rhyme) || '?';
    verse.rhymeGroup = group;
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  }
  
  // Esquema de rima
  const rhymeScheme = verses.map(v => v.rhymeGroup).join('');
  
  // Contar rimas consonantes vs asonantes
  const consonantRhymes = rhymeType === 'consonant' 
    ? Object.keys(rhymeGroups).length 
    : 0;
  const assonantRhymes = rhymeType === 'assonant'
    ? Object.keys(rhymeGroups).length
    : 0;
  
  return {
    verses,
    rhymeScheme,
    rhymeGroups: groupCounts,
    consonantRhymes,
    assonantRhymes,
    uniqueRhymes: Object.keys(rhymeGroups).length,
    language,
    rhymeType,
  };
}

/**
 * Compara la rima entre dos palabras
 */
export function compareRhyme(
  word1: string,
  word2: string,
  rhymeType: 'consonant' | 'assonant' = 'consonant'
): {
  match: boolean;
  rhyme1: string;
  rhyme2: string;
  type: 'consonant' | 'assonant' | 'none';
} {
  const rhyme1 = rhymeType === 'consonant'
    ? getConsonantRhyme(word1)
    : getAssonantRhyme(word1);
  
  const rhyme2 = rhymeType === 'consonant'
    ? getConsonantRhyme(word2)
    : getAssonantRhyme(word2);
  
  const match = rhyme1 === rhyme2;
  
  return {
    match,
    rhyme1,
    rhyme2,
    type: match ? rhymeType : 'none',
  };
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testRhymeAnalyzer() {
  const tests = [
    {
      name: 'Rima consonante: canción - corazón',
      word1: 'canción',
      word2: 'corazón',
      expected: { match: true, rhyme: 'ón' },
    },
    {
      name: 'Rima consonante: casa - masa',
      word1: 'casa',
      word2: 'masa',
      expected: { match: true, rhyme: 'asa' },
    },
    {
      name: 'No rima: casa - perro',
      word1: 'casa',
      word2: 'perro',
      expected: { match: false },
    },
    {
      name: 'Rima asonante: canción - razón',
      word1: 'canción',
      word2: 'razón',
      rhymeType: 'assonant',
      expected: { match: true, rhyme: 'o' },
    },
    {
      name: 'Análisis de esquema ABAB',
      text: 'La vida es un momento\nque pasa rápidamente\nel amor es un tormento\nque duele intensamente',
      expected: { rhymeScheme: 'ABAB' },
    },
  ];

  const results = tests.map((test) => {
    try {
      if (test.text) {
        const analysis = analyzeRhyme(test.text, 'es', (test.rhymeType as any) || 'consonant');
        const passed = analysis.rhymeScheme === test.expected.rhymeScheme;
        return { name: test.name, passed, expected: test.expected.rhymeScheme, actual: analysis.rhymeScheme };
      } else if (test.word1 && test.word2) {
        const comparison = compareRhyme(test.word1, test.word2, (test.rhymeType as any) || 'consonant');
        const passed = comparison.match === test.expected.match;
        return { name: test.name, passed, expected: test.expected.match, actual: comparison.match };
      } else {
        return { name: test.name, passed: false, expected: test.expected, actual: 'Missing word1 or word2' };
      }
    } catch (error) {
      return {
        name: test.name,
        passed: false,
        expected: test.expected,
        actual: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
