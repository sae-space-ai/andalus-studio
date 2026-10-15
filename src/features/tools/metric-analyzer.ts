/**
 * Analizador de Métrica - Motor Real
 * FASE 05.1 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const MetricAnalysisInputSchema = z.object({
  text: z.string().min(1).describe('Texto a analizar'),
  language: z.enum(['es', 'en']).default('es').describe('Idioma del texto'),
});

export const SyllableInfoSchema = z.object({
  syllable: z.string(),
  stressed: z.boolean(),
  position: z.number(),
});

export const VerseAnalysisSchema = z.object({
  text: z.string(),
  syllables: z.array(SyllableInfoSchema),
  syllableCount: z.number(),
  stressPattern: z.string(),
  metricType: z.string(),
});

export const MetricAnalysisOutputSchema = z.object({
  verses: z.array(VerseAnalysisSchema),
  totalSyllables: z.number(),
  averageSyllablesPerVerse: z.number(),
  metricPattern: z.string(),
  rhymeScheme: z.string(),
  language: z.string(),
});

// Tipos exportados
export type SyllableInfo = z.infer<typeof SyllableInfoSchema>;
export type VerseAnalysis = z.infer<typeof VerseAnalysisSchema>;
export type MetricAnalysisOutput = z.infer<typeof MetricAnalysisOutputSchema>;

// ═══════════════════════════════════════════
// REGLAS DE SILABEO (ESPAÑOL)
// ═══════════════════════════════════════════

const VOWELS = 'aeiouáéíóúü';
const STRONG_VOWELS = 'aeoáéíóú';
const WEAK_VOWELS = 'iuü';

/**
 * Divide una palabra en sílabas (español)
 */
export function splitIntoSyllables(word: string): string[] {
  const syllables: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    const nextChar = i < word.length - 1 ? word[i + 1].toLowerCase() : '';
    
    current += char;
    
    // Si es vocal
    if (VOWELS.includes(char)) {
      // Diptongo: vocal débil + vocal débil, o fuerte + débil, o débil + fuerte
      if (WEAK_VOWELS.includes(char) && WEAK_VOWELS.includes(nextChar)) {
        // Diptongo de dos vocales débiles
        continue;
      }
      
      if (STRONG_VOWELS.includes(char) && WEAK_VOWELS.includes(nextChar)) {
        // Diptongo fuerte + débil
        continue;
      }
      
      if (WEAK_VOWELS.includes(char) && STRONG_VOWELS.includes(nextChar)) {
        // Diptongo débil + fuerte
        continue;
      }
      
      // Hiato: dos vocales fuertes o vocal débil acentuada + fuerte
      if (STRONG_VOWELS.includes(char) && STRONG_VOWELS.includes(nextChar)) {
        syllables.push(current);
        current = '';
      }
    }
    
    // Si es consonante
    if (!VOWELS.includes(char)) {
      // Grupos consonánticos que no se separan
      const consonantClusters = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr'];
      const nextTwoChars = word.substr(i, 2).toLowerCase();
      
      if (consonantClusters.includes(nextTwoChars)) {
        // No separar el grupo
        continue;
      }
      
      // Si hay una consonante entre vocales, se une a la siguiente sílaba
      if (VOWELS.includes(word[i - 1]?.toLowerCase() || '') && VOWELS.includes(nextChar)) {
        syllables.push(current);
        current = '';
      }
    }
  }
  
  if (current) {
    syllables.push(current);
  }
  
  return syllables;
}

/**
 * Cuenta sílabas en un verso (español)
 * Regla: Si la última palabra es aguda, se suma una sílaba
 *        Si la última palabra es esdrújula, se resta una sílaba
 */
export function countSyllables(text: string): number {
  const words = text.trim().split(/\s+/);
  let totalSyllables = 0;
  
  for (const word of words) {
    const syllables = splitIntoSyllables(word);
    totalSyllables += syllables.length;
  }
  
  // Ajuste por acentuación de la última palabra
  const lastWord = words[words.length - 1];
  const lastSyllable = splitIntoSyllables(lastWord).pop() || '';
  
  if (isOxytone(lastWord)) {
    // Palabra aguda: +1 sílaba
    totalSyllables += 1;
  } else if (isProparoxytone(lastWord)) {
    // Palabra esdrújula: -1 sílaba
    totalSyllables -= 1;
  }
  
  return totalSyllables;
}

/**
 * Determina si una palabra es aguda (oxítona)
 */
function isOxytone(word: string): boolean {
  const lastChar = word[word.length - 1].toLowerCase();
  
  // Si termina en vocal, n o s
  if (VOWELS.includes(lastChar) || lastChar === 'n' || lastChar === 's') {
    // Debe tener tilde en la última sílaba para ser aguda
    const lastSyllable = splitIntoSyllables(word).pop() || '';
    return hasTilde(lastSyllable);
  }
  
  // Si termina en otra consonante, es aguda si no tiene tilde
  return !hasTilde(word);
}

/**
 * Determina si una palabra es esdrújula (proparoxítona)
 */
function isProparoxytone(word: string): boolean {
  const syllables = splitIntoSyllables(word);
  if (syllables.length < 3) return false;
  
  const antepenultimate = syllables[syllables.length - 3];
  return hasTilde(antepenultimate);
}

/**
 * Verifica si una sílaba tiene tilde
 */
function hasTilde(syllable: string): boolean {
  return /[áéíóú]/.test(syllable);
}

/**
 * Analiza un verso completo
 */
export function analyzeVerse(text: string, language: 'es' | 'en' = 'es'): VerseAnalysis {
  const words = text.trim().split(/\s+/);
  const allSyllables: SyllableInfo[] = [];
  let position = 0;
  
  for (const word of words) {
    const syllables = splitIntoSyllables(word);
    
    for (const syllable of syllables) {
      allSyllables.push({
        syllable,
        stressed: hasTilde(syllable),
        position: position++,
      });
    }
  }
  
  const syllableCount = language === 'es' ? countSyllables(text) : allSyllables.length;
  
  // Patrón de acentos
  const stressPattern = allSyllables.map(s => s.stressed ? 'S' : 's').join('');
  
  // Tipo métrico basado en número de sílabas
  const metricType = getMetricType(syllableCount);
  
  return {
    text,
    syllables: allSyllables,
    syllableCount,
    stressPattern,
    metricType,
  };
}

/**
 * Obtiene el tipo métrico según el número de sílabas
 */
function getMetricType(syllableCount: number): string {
  const types: Record<number, string> = {
    2: 'Bisílabo',
    3: 'Trisílabo',
    4: 'Tetrasílabo',
    5: 'Pentasílabo',
    6: 'Hexasílabo',
    7: 'Heptasílabo',
    8: 'Octosílabo',
    9: 'Eneasílabo',
    10: 'Decasílabo',
    11: 'Endecasílabo',
    12: 'Dodecasílabo',
    13: 'Tridecasílabo',
    14: 'Alejandrino',
  };
  
  return types[syllableCount] || `${syllableCount} sílabas`;
}

/**
 * Analiza un texto completo (múltiples versos)
 */
export function analyzeMetric(
  text: string,
  language: 'es' | 'en' = 'es'
): MetricAnalysisOutput {
  const lines = text.split('\n').filter(line => line.trim());
  const verses = lines.map(line => analyzeVerse(line, language));
  
  const totalSyllables = verses.reduce((sum, v) => sum + v.syllableCount, 0);
  const averageSyllablesPerVerse = totalSyllables / verses.length;
  
  // Patrón métrico
  const metricPattern = verses.map(v => v.syllableCount).join('-');
  
  // Esquema de rima (simplificado)
  const rhymeScheme = detectRhymeScheme(verses);
  
  return {
    verses,
    totalSyllables,
    averageSyllablesPerVerse: Math.round(averageSyllablesPerVerse * 100) / 100,
    metricPattern,
    rhymeScheme,
    language,
  };
}

/**
 * Detecta el esquema de rima (simplificado)
 */
function detectRhymeScheme(verses: VerseAnalysis[]): string {
  if (verses.length === 0) return '';
  
  const rhymeGroups: Map<string, string> = new Map();
  let currentGroup = 'A';
  const scheme: string[] = [];
  
  for (const verse of verses) {
    const lastWord = verse.text.trim().split(/\s+/).pop() || '';
    const rhyme = getRhyme(lastWord);
    
    if (!rhymeGroups.has(rhyme)) {
      rhymeGroups.set(rhyme, currentGroup);
      currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
    }
    
    scheme.push(rhymeGroups.get(rhyme) || '?');
  }
  
  return scheme.join('');
}

/**
 * Obtiene la rima de una palabra (últimas letras)
 */
function getRhyme(word: string): string {
  // Rima consonante: últimas 3 letras
  if (word.length >= 3) {
    return word.slice(-3).toLowerCase();
  }
  return word.toLowerCase();
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testMetricAnalyzer() {
  const tests = [
    {
      name: 'Verso octosílabo',
      text: 'En un lugar de la Mancha',
      expected: { syllableCount: 8 },
    },
    {
      name: 'Verso endecasílabo',
      text: 'Mi barquinho de papel',
      expected: { syllableCount: 7 },
    },
    {
      name: 'División en sílabas',
      text: 'casa',
      expected: { syllables: ['ca', 'sa'] },
    },
    {
      name: 'Diptongo',
      text: 'ciudad',
      expected: { syllables: ['ciu', 'dad'] },
    },
    {
      name: 'Hiato',
      text: 'poeta',
      expected: { syllables: ['po', 'e', 'ta'] },
    },
  ];

  const results = tests.map((test) => {
    try {
      if (test.expected.syllables) {
        const syllables = splitIntoSyllables(test.text);
        const passed = JSON.stringify(syllables) === JSON.stringify(test.expected.syllables);
        return { name: test.name, passed, expected: test.expected.syllables, actual: syllables };
      } else {
        const analysis = analyzeVerse(test.text);
        const passed = analysis.syllableCount === test.expected.syllableCount;
        return { name: test.name, passed, expected: test.expected.syllableCount, actual: analysis.syllableCount };
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
