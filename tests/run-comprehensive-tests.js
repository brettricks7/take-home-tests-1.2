#!/usr/bin/env node

import assert from 'node:assert';
import { runSpellChecker } from '../dist/index.js';
import { readFileSync } from 'node:fs';

async function testFileToCheck() {
  console.log('Testing file-to-check.txt...');
  const dict = readFileSync('dictionary.txt', 'utf8');
  const text = readFileSync('file-to-check.txt', 'utf8');
  const result = await runSpellChecker({ dictionaryContent: dict, inputContent: text });
  
  // Should find specific misspellings
  const words = result.misspellings.map(m => m.word);
  assert(words.includes('wrld'), 'Should find "wrld"');
  assert(words.includes('tset'), 'Should find "tset"');
  assert(words.includes('spel'), 'Should find "spel"');
  assert(words.includes('lik'), 'Should find "lik"');
  
  // Should handle proper nouns correctly
  assert(!words.includes('Jamison'), 'Should not flag "Jamison" (proper noun)');
  assert(!words.includes('Droplet'), 'Should not flag "Droplet" (in dictionary)');
  
  // Should handle hyphenated words
  assert(!words.includes('state-of-the-art'), 'Should not flag valid hyphenated word');
  
  // Should have suggestions for misspellings
  const wrldMiss = result.misspellings.find(m => m.word === 'wrld');
  assert(wrldMiss && wrldMiss.suggestions.length > 0, 'Should have suggestions for "wrld"');
  assert(wrldMiss.suggestions.includes('world'), 'Should suggest "world" for "wrld"');
  
  console.log('✓ file-to-check.txt passed');
}

async function testFileToCheck2() {
  console.log('Testing file-to-check2.txt...');
  const dict = readFileSync('dictionary.txt', 'utf8');
  const text = readFileSync('file-to-check2.txt', 'utf8');
  const result = await runSpellChecker({ dictionaryContent: dict, inputContent: text });
  
  // Should find the 10 intentional misspellings
  const words = result.misspellings.map(m => m.word);
  const expectedMisspellings = ['wrld', 'teh', 'recieve', 'adress', 'definately', 'seperate', 'occurence', 'tset', 'mispeling', 'lik', 'spel'];
  
  for (const expected of expectedMisspellings) {
    assert(words.includes(expected), `Should find "${expected}"`);
  }
  
  // Should have good suggestions
  const tehMiss = result.misspellings.find(m => m.word === 'teh');
  assert(tehMiss && tehMiss.suggestions.includes('the'), 'Should suggest "the" for "teh"');
  
  const tsetMiss = result.misspellings.find(m => m.word === 'tset');
  assert(tsetMiss && tsetMiss.suggestions.includes('test'), 'Should suggest "test" for "tset"');
  // "test" should rank higher than "stet" due to uncommon words list
  const testIndex = tsetMiss.suggestions.indexOf('test');
  const stetIndex = tsetMiss.suggestions.indexOf('stet');
  assert(testIndex < stetIndex, 'Should rank "test" higher than "stet"');
  
  console.log('✓ file-to-check2.txt passed');
}

async function testFileToCheck3() {
  console.log('Testing file-to-check3.txt...');
  const dict = readFileSync('dictionary.txt', 'utf8');
  const text = readFileSync('file-to-check3.txt', 'utf8');
  const result = await runSpellChecker({ dictionaryContent: dict, inputContent: text });
  
  // Should handle various edge cases
  const words = result.misspellings.map(m => m.word);
  
  // Should find misspellings
  assert(words.length > 0, 'Should find some misspellings');
  
  // Should handle Unicode properly
  const unicodeMiss = result.misspellings.find(m => m.word.includes('é') || m.word.includes('ñ'));
  if (unicodeMiss) {
    assert(unicodeMiss.suggestions.length > 0, 'Should have suggestions for Unicode misspellings');
  }
  
  console.log('✓ file-to-check3.txt passed');
}

async function testAcceptedWords() {
  console.log('Testing accepted words functionality...');
  const dict = readFileSync('dictionary.txt', 'utf8');
  const text = 'This is a test with the word a in it.';
  const result = await runSpellChecker({ dictionaryContent: dict, inputContent: text });
  
  // "a" should not be flagged because it's in accepted-words.txt
  const words = result.misspellings.map(m => m.word);
  assert(!words.includes('a'), 'Should not flag "a" (in accepted words)');
  
  console.log('✓ Accepted words functionality passed');
}

async function main() {
  try {
    await testFileToCheck();
    await testFileToCheck2();
    await testFileToCheck3();
    await testAcceptedWords();
    
    console.log('\nAll comprehensive tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\nComprehensive tests failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
