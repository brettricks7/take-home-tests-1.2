export interface Misspelling {
  word: string;
  line: number;
  column: number;
  context: string;
  suggestions: string[];
}

export interface SpellcheckResult {
  misspellings: Misspelling[];
}

export interface DictionaryApi {
  has(word: string): boolean;
  isProper(word: string): boolean;
  words: Set<string>;
  suggest(word: string, maxDistance: number): Array<{ candidate: string; score: number }>;
}


