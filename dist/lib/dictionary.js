import { BKTree } from '../core/bktree.js';
function normalizeWord(raw) {
    return raw.trim().toLowerCase();
}
export function createDictionary(dictionaryContent) {
    const words = new Set();
    const properNouns = new Set();
    const bk = new BKTree();
    // Pre-allocate arrays for better performance
    const lines = dictionaryContent.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const w = lines[i].trim();
        if (!w)
            continue;
        const normalized = normalizeWord(w);
        words.add(normalized);
        if (/^[A-Z][a-zA-Z'-]*$/.test(w)) {
            properNouns.add(w);
        }
        bk.add(normalized);
    }
    const dictionary = {
        has(word) {
            return words.has(normalizeWord(word));
        },
        isProper(word) {
            return properNouns.has(word);
        },
        words,
        suggest(word, maxDistance) {
            return bk.search(normalizeWord(word), maxDistance);
        }
    };
    return dictionary;
}
export function tokenizeWithLocations(text) {
    const tokens = [];
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match;
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
