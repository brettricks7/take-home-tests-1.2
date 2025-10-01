import { BKTree } from '../core/bktree.js';
import type { DictionaryApi } from '../types.js';

function normalizeWord(raw: string): string {
  return raw.trim().toLowerCase();
}

export function createDictionary(dictionaryContent: string): DictionaryApi {
  const words = new Set<string>();
  const properNouns = new Set<string>();
  const bk = new BKTree();
  
  // Pre-allocate arrays for better performance
  const lines = dictionaryContent.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const w = lines[i].trim();
    if (!w) continue;
    const normalized = normalizeWord(w);
    words.add(normalized);
    if (/^[A-Z][a-zA-Z'-]*$/.test(w)) {
      properNouns.add(w);
    }
    bk.add(normalized);
  }
  const dictionary: DictionaryApi = {
    has(word: string): boolean {
      return words.has(normalizeWord(word));
    },
    isProper(word: string): boolean {
      return properNouns.has(word);
    },
    words,
    suggest(word: string, maxDistance: number) {
      return bk.search(normalizeWord(word), maxDistance);
    }
  };
  return dictionary;
}

export function tokenizeWithLocations(text: string): Array<{ word: string; line: number; column: number }> {
  const tokens: Array<{ word: string; line: number; column: number }> = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    //TODO: needed to look this regex up
    const regex = /[\p{L}'][\p{L}'-]*/gu;
    while ((match = regex.exec(line)) !== null) {
      tokens.push({
        word: match[0],
        line: i + 1,
        column: match.index + 1,
      });
    }
  }
  return tokens;
}


