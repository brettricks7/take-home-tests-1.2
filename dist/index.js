import { createDictionary } from './lib/dictionary.js';
import { analyzeText } from './lib/spellcheck.js';
export async function runSpellChecker({ dictionaryContent, inputContent }) {
    const dict = createDictionary(dictionaryContent);
    return analyzeText(dict, inputContent);
}
