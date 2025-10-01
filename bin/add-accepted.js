#!/usr/bin/env node

import { createInterface } from 'node:readline';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

function ensureFile(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(filePath)) {
    writeFileSync(filePath, '');
  }
}

function loadExisting(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const set = new Set();
    for (const line of content.split(/\r?\n/)) {
      const t = line.trim().toLowerCase();
      if (t) set.add(t);
    }
    return set;
  } catch {
    return new Set();
  }
}

async function main() {
  const filePath = resolve(process.cwd(), 'words/accepted-words.txt');
  ensureFile(filePath);
  const existing = loadExisting(filePath);

  console.log('Add words to always accept (blank line to finish).');
  console.log(`Target file: ${filePath}`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));

  while (true) {
    const input = (await ask('Word: ')).trim();
    if (!input) break;
    const key = input.toLowerCase();
    if (existing.has(key)) {
      console.log(`- Skipped: '${input}' already present.`);
      continue;
    }
    appendFileSync(filePath, (existing.size ? '\n' : '') + input + '\n');
    existing.add(key);
    console.log(`+ Added: ${input}`);
  }

  rl.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


