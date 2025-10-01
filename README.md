# Code Challenges

We want to see code you write. Coding live in front of strangers is stressful, and doesn't mimic how you write code at work. Instead, we're sending you a small code challenge. You can pick from [`INTERSECTION.md`](./INTERSECTION.md) or [`SPELL_CHECK.md`](./SPELL_CHECK.md).

Use whatever language and tech stack you're most comfortable with.

Please try to spend between two and four hours implementing this. This is to protect you; we don't want you to spend days coding only for either one of us to decide later we aren't a good fit for each other. It isn't a hard cutoff. If you really want to spend more time we can't stop you, but don't feel pressure to spend more time.

Just like in real life, you can use the internet to help you remember some syntax or figure out a library. You _should not_ use someone else's solution for the coding challenge. Use good judgement. Googling how to read in a file is fine. Googling "how does a spell-checker work" to get a basic idea of an algorithm is fine. Pasting the problem definition in to ChatGPT or Cursor or some other AI coding assistant and submitting the output as your own is not fine.

The goal isn't to finish the assignment. The goal is to see how you approach a problem. Can you decide on and implement an algorithm? What data structures do you use? How do you organize your code? What parts of the problem seem most important to solve first?

## Rubric

We'll evaluate submissions on the following criteria:

1. Does it run? Working code is the best code!
1. Did you communicate clearly in the README and code?
1. Does it implement the features you decided to tackle?
1. Is it easy to understand?

## Instructions For Submission

Please email [gabby@droplet.io](mailto:gabby@droplet.io) and [jamison@droplet.io](mailto:jamison@droplet.io) a .zip or a link to a source code repository containing your code. Include a `README.md` file with notes on how to run your code, your design thoughts, etc.

Please email us if anything in the instructions is confusing. We've tried to leave space for creativity and problem-solving, but we also don't want you becoming frustrated or stuck.

Good luck!

---

Thank you! Below you will find what would be included in my README.md

### Requirements

- Node.js >= 18

### Install & Run (TypeScript)

```sh
npm install
npm run build
chmod +x bin/my-cool-spellchecker.js bin/add-accepted.js bin/add-uncommon.js
node bin/my-cool-spellchecker.js dictionary.txt path/to/file.txt

```

### Features Implemented

- Outputs misspelled words with line/column and nearby context
- Suggests similar words using BK-tree search with Damerau-Levenshtein distance
- Handles proper nouns (e.g., capitalized names) when present in dictionary
- Prioritizes realistic typing errors (transpositions -> keyboard-adjacent -> substitutions)
- Configurable uncommon words list via `words/uncommon-words.txt`
- Accept-list for words to treat as correct via `words/accepted-words.txt`

### Project Structure

- `bin/my-cool-spellchecker.js`: CLI entry
- `src/index.ts`: Facade to run the checker (compiled to `dist/`)
- `src/lib/`: Dictionary handling, tokenizer, suggestions, spellcheck logic (TypeScript)
- `src/core/`: Core algorithms (BK-tree, etc.) (TypeScript)
- `src/io/`: File IO helpers for word lists (TypeScript)
- `dist/`: Compiled JavaScript output used by the CLI
- `tests/run-tests.js`: Minimal smoke tests

### Configuration

Add words that should be deprioritized in suggestions:

```sh
# Interactive commands
npm run add-uncommon   # add to words/uncommon-words.txt
npm run add-accepted   # add to words/accepted-words.txt

# Or manually edit the files (one word per line)
```

`words/uncommon-words.txt` contains words that will be ranked lower when they tie with more common alternatives in suggestions.
`words/accepted-words.txt` contains words that should always be treated as correct (e.g., single-letter tokens like "a").

### Testing

```sh
npm test
```

### Documentation

Generate architecture diagram:

```sh
npm run docs
```

This extracts the mermaid diagram from `docs/architecture.md` and generates `docs/architecture.svg` which can be opened in your IDE.

### Notes for Reviewers

- Sample inputs are included: `file-to-check.txt`, `file-to-check2.txt`.
- Word lists live in `words/`: adjust `accepted-words.txt` and `uncommon-words.txt` as needed (or via `npm run add-accepted` / `npm run add-uncommon`).

### Explanation

This implementation addresses each requirement from `SPELL_CHECK.md`:

**1. The program outputs a list of incorrectly spelled words.**

- **Solution**: The CLI explicitly prints a summary line "Incorrectly spelled words:" followed by a comma-separated list of unique misspelled words before showing detailed results.

**2. For each misspelled word, the program outputs a list of suggested words.**

- **Solution**: Uses a BK-tree data structure with Damerau-Levenshtein distance to efficiently find similar words. Suggests up to 5 candidates per misspelling, with intelligent ranking based on edit type priority.

**3. The suggested words seem sensible given the context.**

- **Solution**: Implements a multi-tier ranking system:
  - **Priority 0**: Transpositions (e.g., "teh" → "the")
  - **Priority 1**: Single insertions/deletions (e.g., "occuring" → "occurring")
  - **Priority 2**: Keyboard-adjacent substitutions (e.g., "wirld" → "world")
  - **Priority 3**: Other single substitutions
  - **Tiebreakers**: Shorter words preferred, then uncommon words deprioritized via `words/uncommon-words.txt`
  (This was the trickiest part. I prioritized modeling fast-typing mistakes over incompetent spelling to better match real-world inputs; this weighting can be tuned.)

**4. The program prints the misspelled word along with some surrounding context.**

- **Solution**: Tokenization preserves line/column positions. For each misspelling, displays:
  - Word, line number, and column number
  - 30-character context window around the misspelled word

**5. The program handles proper nouns (person or place names, for example) correctly.**

- **Solution**: Multi-layered proper noun detection:
  - Capitalized words at the start of a sentence are checked for spelling (e.g., "Werds" → flagged)
  - Mid-sentence capitalized words are skipped (not checked) to allow names like "Jamison"
  - Explicit proper nouns from the dictionary (e.g., "Droplet") are always accepted
  - Hyphenated words are validated by checking each component

### Conclusion

I don’t know everything, but I promise to learn fast, work hard, and be a team player.
