import { createDictionary } from './lib/dictionary.js';
import { analyzeText } from './lib/spellcheck.js';
import type { SpellcheckResult } from './types.js';

export async function runSpellChecker({ dictionaryContent, inputContent }: { dictionaryContent: string; inputContent: string; }): Promise<SpellcheckResult> {
  const dict = createDictionary(dictionaryContent);
  return analyzeText(dict, inputContent);
}


