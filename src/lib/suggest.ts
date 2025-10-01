import type { DictionaryApi } from '../types.js';
import { loadUncommonWords } from '../io/uncommonWords.js';

function computeMaxEditDistance(targetLowercase: string): number {
  return Math.max(1, Math.ceil(targetLowercase.length / 3));
}

export function suggestSimilarWords(dictionary: DictionaryApi, rawWord: string, maxSuggestions: number = 5): string[] {
  const targetLowercase = rawWord.toLowerCase();
  if (!targetLowercase) return [];

  const maxDistance = computeMaxEditDistance(targetLowercase);
  const candidateResults = dictionary.suggest(targetLowercase, maxDistance);

  candidateResults.sort((a: { candidate: string; score: number }, b: { candidate: string; score: number }) => {
    if (a.score !== b.score) return a.score - b.score;
    const pa = classifyEditPriority(targetLowercase, a.candidate);
    const pb = classifyEditPriority(targetLowercase, b.candidate);
    if (pa !== pb) return pa - pb;
    if (a.candidate.length !== b.candidate.length) return a.candidate.length - b.candidate.length;
    if (pa === 0 && pb === 0) {
      const uncommonWords = loadUncommonWords();
      const aUncommon = uncommonWords.has(a.candidate);
      const bUncommon = uncommonWords.has(b.candidate);
      if (aUncommon !== bUncommon) return aUncommon ? 1 : -1;
    }
    return a.candidate.localeCompare(b.candidate);
  });

  const unique = new Set<string>();
  const suggestions: string[] = [];
  for (const { candidate } of candidateResults) {
    if (candidate === targetLowercase) continue;
    if (unique.has(candidate)) continue;
    unique.add(candidate);
    suggestions.push(candidate);
    if (suggestions.length === maxSuggestions) break;
  }
  return suggestions;
}

function classifyEditPriority(target: string, candidate: string): number {
  if (target === candidate) return 4;
  const lt = target.length;
  const lc = candidate.length;

  if (lt === lc && lt >= 2) {
    let swapIndex = -1;
    for (let i = 0; i < lt - 1; i++) {
      if (target[i] !== candidate[i]) {
        if (target[i] === candidate[i + 1] && target[i + 1] === candidate[i]) {
          swapIndex = i;
          break;
        }
        return 4;
      }
    }
    if (swapIndex !== -1) {
      const restMatches = target.slice(swapIndex + 2) === candidate.slice(swapIndex + 2);
      if (restMatches) return 0;
    }
  }

  if (Math.abs(lt - lc) === 1) {
    if (isOneEditInsertOrDelete(target, candidate)) return 1;
  }

  if (lt === lc) {
    const diffIndex = firstDiffIndex(target, candidate);
    if (diffIndex !== -1 && target.slice(diffIndex + 1) === candidate.slice(diffIndex + 1)) {
      const from = target[diffIndex];
      const to = candidate[diffIndex];
      return areKeyboardAdjacent(from, to) ? 2 : 3;
    }
  }

  return 4;
}

function firstDiffIndex(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

function isOneEditInsertOrDelete(a: string, b: string): boolean {
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    edits++;
    if (edits > 1) return false;
    if (a.length > b.length) { i++; } else { j++; }
  }
  return true;
}

// Normally I would put this in a separate file, but for the sake of brevity, I'm keeping it here
const KEY_ADJACENTS = new Map<string, string[]>(Object.entries({
  q: ['w', 'a'],
  w: ['q', 'e', 'a', 's'],
  e: ['w', 'r', 's', 'd'],
  r: ['e', 't', 'd', 'f'],
  t: ['r', 'y', 'f', 'g'],
  y: ['t', 'u', 'g', 'h'],
  u: ['y', 'i', 'h', 'j'],
  i: ['u', 'o', 'j', 'k'],
  o: ['i', 'p', 'k', 'l'],
  p: ['o', 'l', '['],
  a: ['q', 'w', 's', 'z'],
  s: ['w', 'e', 'a', 'd', 'z', 'x'],
  d: ['e', 'r', 's', 'f', 'x', 'c'],
  f: ['r', 't', 'd', 'g', 'c', 'v'],
  g: ['t', 'y', 'f', 'h', 'v', 'b'],
  h: ['y', 'u', 'g', 'j', 'b', 'n'],
  j: ['u', 'i', 'h', 'k', 'n', 'm'],
  k: ['i', 'o', 'j', 'l', 'm'],
  l: ['o', 'k', ';'],
  z: ['a', 's', 'x'],
  x: ['s', 'd', 'z', 'c'],
  c: ['d', 'f', 'x', 'v'],
  v: ['f', 'g', 'c', 'b'],
  b: ['g', 'h', 'v', 'n'],
  n: ['h', 'j', 'b', 'm'],
  m: ['j', 'k', 'n'],
}));

function areKeyboardAdjacent(a: string, b: string): boolean {
  const key = a.toLowerCase();
  const adj = KEY_ADJACENTS.get(key);
  return Array.isArray(adj) && adj.includes(b.toLowerCase());
}



