import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadUncommonWords(cwd: string = process.cwd()): Set<string> {
  try {
    const filePath = resolve(cwd, 'words/uncommon-words.txt');
    const content = readFileSync(filePath, 'utf8');
    const words = new Set<string>();
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed) words.add(trimmed.toLowerCase());
    }
    return words;
  } catch {
    return new Set<string>();
  }
}


