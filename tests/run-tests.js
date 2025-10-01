import assert from 'node:assert';
import { runSpellChecker } from '../dist/index.js';

function testBasic() {
  const dict = 'hello\nworld\nthis\nis\na\ntest\nquilt\nDroplet\n';
  const text = 'Helo world! This is a tset for Droplet.\nAnd quilts.';
  const res = runSpellChecker({ dictionaryContent: dict, inputContent: text });
  return Promise.resolve(res).then((r) => {
    const words = r.misspellings.map(m => m.word);
    assert(words.includes('Helo'));
    assert(words.includes('tset'));
    assert(words.includes('quilts'));
    // Proper noun should pass even if not lowercase in dict as long as proper exists
    assert(!words.includes('Droplet'));
  });
}

async function main() {
  try {
    await testBasic();
    console.log('Tests passed');
    process.exit(0);
  } catch (e) {
    console.error('Tests failed');
    console.error(e);
    process.exit(1);
  }
}

main();


