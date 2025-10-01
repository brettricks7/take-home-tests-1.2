# Spell Checker – High-level Architecture

This diagram explains how the CLI flows from inputs to outputs, and how modules interact.

```mermaid
flowchart TD
  A["CLI: bin/my-cool-spellchecker.js"] --> B["Load dictionary.txt"]
  B --> C["Create Dictionary src/lib/dictionary.ts"]
  C --> C1["Build BK-Tree"]
  A --> D["Read file-to-check.txt"]
  D --> E["Tokenize with locations"]
  E --> F{"Filter tokens"}
  F -->|"Accepted words"| G["Skip"]
  F -->|"Proper nouns / Hyphenated valid parts"| G
  F -->|"In dictionary"| G
  F -->|"Else"| H["Suggest similar words"]
  H --> H1["Search BK-Tree Damerau–Levenshtein"]
  H1 --> I["Rank candidates"]
  I -->|"Typo priors: transposition > insertion/deletion > adjacent substitution"| J["Select top N"]
  J --> K["Collect misspelling result"]
  K --> L["Aggregate results"]
  L --> M["Print summary + detailed output"]

  subgraph Core
    C1
    H1
  end

  subgraph Lib
    C
    E
    I
    J
    K
  end

  subgraph IO
    F
    B
  end
```

Key points

- Inputs: `dictionary.txt`, `file-to-check.txt`
- Word lists: `words/uncommon-words.txt` (deprioritize ties), `words/accepted-words.txt` (always accept)
- Algorithms: BK-tree + Damerau–Levenshtein; heuristic ranking for common typing errors
- Output: summary list of misspelled words, then per-word context and suggestions

Modules

- CLI: `bin/my-cool-spellchecker.js`
- Core structures: `src/core/bktree.ts`
- Spellcheck pipeline: `src/lib/{dictionary.ts, spellcheck.ts, suggest.ts}`
- IO helpers: `src/io/{uncommonWords.ts, whitelist.ts}`
