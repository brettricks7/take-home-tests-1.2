#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
let runSpellChecker;
async function loadRunner() {
  try {
    const mod = await import('../dist/index.js');
    runSpellChecker = mod.runSpellChecker;
  } catch (e) {
    console.error('Build output not found. Please run: npm run build');
    process.exit(1);
  }
}
import { performance } from 'node:perf_hooks';

function printUsageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.error('Usage: my-cool-spellchecker <dictionary.txt> <file-to-check.txt>');
  process.exit(1);
}

async function main() {
  await loadRunner();
  const args = process.argv.slice(2);
  if (args.length < 2) {
    printUsageAndExit();
  }
  const dictionaryPath = resolve(process.cwd(), args[0]);
  const inputPath = resolve(process.cwd(), args[1]);

  let dictionaryContent;
  let inputContent;
  try {
    dictionaryContent = readFileSync(dictionaryPath, 'utf8');
  } catch (e) {
    printUsageAndExit(`Could not read dictionary file: ${dictionaryPath}`);
  }
  try {
    inputContent = readFileSync(inputPath, 'utf8');
  } catch (e) {
    printUsageAndExit(`Could not read input file: ${inputPath}`);
  }

  const t0 = performance.now();
  const result = await runSpellChecker({ dictionaryContent, inputContent });
  const t1 = performance.now();

  if (result.misspellings.length === 0) {
    console.log('No spelling issues found.');
    process.exit(0);
  }

  // Print an explicit summary list of incorrectly spelled words first
  const uniqueWords = [];
  const seen = new Set();
  for (const miss of result.misspellings) {
    const lower = miss.word.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueWords.push(miss.word);
    }
  }

  if (process.argv.includes('--stats')) {
    const elapsedMs = Math.round(t1 - t0);
    console.log(`\nStats: analyzed in ${elapsedMs}ms`);
  }
  console.log('Incorrectly spelled words:');
  console.log('  ' + uniqueWords.join(', '));

  for (const miss of result.misspellings) {
    const location = `line ${miss.line}, col ${miss.column}`;
    const context = miss.context;
    const suggestions = miss.suggestions.slice(0, 5).join(', ');
    console.log(`Misspelled: "${miss.word}" (${location})`);
    if (context) {
      console.log(`  Context: ${context}`);
    }
    if (suggestions.length > 0) {
      console.log(`  Suggestions: ${suggestions}`);
    } else {
      console.log('  Suggestions: I have no idea what you\'re trying to do here');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


