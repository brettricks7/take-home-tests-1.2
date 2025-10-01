import { tokenizeWithLocations } from './dictionary.js';
import { suggestSimilarWords } from './suggest.js';
import { loadAcceptedWords } from '../io/whitelist.js';
function isCapitalized(word) {
    return /^[A-Z][a-zA-Z'-]*$/.test(word);
}
function extractContext(lines, lineIdx, column, radius = 30) {
    const line = lines[lineIdx];
    const start = Math.max(0, column - 1 - radius);
    const end = Math.min(line.length, column - 1 + radius);
    return line.slice(start, end).trim();
}
function isSentenceStart(lines, lineIdx, column) {
    const line = lines[lineIdx];
    const before = line.slice(0, Math.max(0, column - 1));
    let i = before.length - 1;
    while (i >= 0 && /\s/.test(before[i]))
        i--;
    if (i < 0)
        return true;
    const ch = before[i];
    return ch === '.' || ch === '!' || ch === '?';
}
export function analyzeText(dict, text) {
    const contextChars = 30;
    const maxSuggestions = 5;
    const tokens = tokenizeWithLocations(text);
    const lines = text.split(/\r?\n/);
    const misspellings = [];
    const accepted = loadAcceptedWords();
    function isHyphenatedPartsValid(token) {
        if (!token.includes('-'))
            return false;
        const parts = token.split('-').filter(Boolean);
        if (parts.length <= 1)
            return false;
        for (const p of parts) {
            if (isCapitalized(p)) {
                if (!(dict.isProper(p) || dict.has(p)))
                    return false;
            }
            else {
                if (!dict.has(p))
                    return false;
            }
        }
        return true;
    }
    for (const t of tokens) {
        const { word, line, column } = t;
        if (isCapitalized(word)) {
            if (dict.isProper(word) || dict.has(word))
                continue;
            const sentenceStart = isSentenceStart(lines, line - 1, column);
            if (!sentenceStart)
                continue;
        }
        if (accepted.has(word.toLowerCase()) || dict.has(word))
            continue;
        if (isHyphenatedPartsValid(word))
            continue;
        const context = extractContext(lines, line - 1, column, contextChars);
        const suggestions = suggestSimilarWords(dict, word, maxSuggestions);
        misspellings.push({ word, line, column, context, suggestions });
    }
    return { misspellings };
}
