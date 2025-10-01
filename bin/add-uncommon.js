#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function loadUncommonWords() {
  try {
    const filePath = resolve(process.cwd(), 'words/uncommon-words.txt');
    const content = readFileSync(filePath, 'utf8');
    const words = new Set();
    
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed) {
        words.add(trimmed.toLowerCase());
      }
    }
    
    return words;
  } catch (error) {
    return new Set();
  }
}

function saveUncommonWords(words) {
  const filePath = resolve(process.cwd(), 'words/uncommon-words.txt');
  const sortedWords = Array.from(words).sort();
  writeFileSync(filePath, sortedWords.join('\n') + '\n', 'utf8');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('Add words to the uncommon words list');
  console.log('These words will be deprioritized in spell checker suggestions.\n');
  
  const uncommonWords = loadUncommonWords();
  
  if (uncommonWords.size > 0) {
    console.log('Current uncommon words:');
    Array.from(uncommonWords).sort().forEach(word => console.log(`  ${word}`));
    console.log('');
  }
  
  while (true) {
    const word = await askQuestion('Enter a word to add (or press Enter to finish): ');
    
    if (!word) {
      break;
    }
    
    const normalized = word.toLowerCase().trim();
    if (!normalized) {
      console.log('Please enter a valid word.\n');
      continue;
    }
    
    if (uncommonWords.has(normalized)) {
      console.log(`"${normalized}" is already in the uncommon words list.\n`);
      continue;
    }
    
    uncommonWords.add(normalized);
    console.log(`Added "${normalized}" to uncommon words list.\n`);
  }
  
  if (uncommonWords.size > 0) {
    saveUncommonWords(uncommonWords);
    console.log('Uncommon words saved to uncommon-words.txt');
  } else {
    console.log('No words added.');
  }
  
  rl.close();
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
