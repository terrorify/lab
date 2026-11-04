# Python Study Café

An original, preparation-only Python refresher for a programmer coming from Rust, Java, or Kotlin. React, Anime.js, CodeMirror, and real Python execution through Pyodide. This is not an assessment replica and does not connect to an AI service.

## Open locally

Double-click `start.cmd` in this folder, then visit **http://127.0.0.1:5173/**. Keep that terminal open while studying. A portable, checksum-verified Node 22 runtime is included under `.tools/` on this machine; no global Node installation was changed.

On another machine with Node 22+ installed:

```sh
npm install
npm run dev
```

For a production build:

```sh
npm run build
npm run preview
```

The static deployment output is `dist/`. Keep `python-worker.js` at the root of the deployed site. Serve over HTTP(S), not `file://`. Changing host or port changes the browser storage origin and therefore the saved notebook.

## Study workflow

1. Read a chapter. The right-hand reference desk provides Rust, Java, or Kotlin comparisons, language differences, incremental hints, and relevant glossary definitions.
2. Open **Workbench**. Read the specification and unit tests. Run the intentionally broken starter before editing. **Run code** shows stdout; **Check tests** executes the real `unittest` suite and awards practice credit.
3. Complete the **Checkpoint**: a concept question and four term/snippet matches. Matching supports mouse, touch, and keyboard; choose either side first.
4. Completing all three parts masters the chapter and unlocks the next scoring gate. Reading ahead is always allowed through the course map, contents rail, or previous/next controls. Locked chapters allow code execution for exploration but not scored submissions.
5. For independent practice, enable **Independent mode** to hide hints, translations, and reference solutions. The final chapter is an original run-length-codec debugging practice exam; allow up to 120 minutes using your own timer.

### Scores and saved state

Each chapter offers 100 XP: 20 for its concept question, 10 per snippet match, and up to 40 proportional to passing unit tests. Best scores are retained; replaying an activity does not farm XP or erase mastery. Matching accuracy describes the current round and does not penalize retries.

Chapter selection, comparison language, code drafts, and best scores are stored in browser `localStorage` under `python-study-cafe:v1`. No account or backend is required. Progress is local to that browser and origin; it does not sync across devices. Clearing browser data clears it. **Reset code** and **Reset progress** ask for confirmation.

## Curriculum

1. Values, names, truthiness, identity, and arithmetic
2. Control flow, functions, ranges, and argument defaults
3. Lists, tuples, slicing, comprehensions, and reference sharing
4. Dictionaries, sets, counting, and hashable keys
5. Strings, splitting, whitespace, and Unicode code points
6. UTF-8 encoding/decoding, byte budgets, and incremental decoders
7. Classes, methods, state ownership, and mutable defaults
8. Exceptions, generators, iterators, and context managers
9. `unittest`, tracebacks, print debugging, and `pdb` concepts
10. Integrated debugging capstone: run-length encoding/decoding

Includes 30 lesson sections, 10 executable repair exercises with 53 test methods, 10 concept questions, 40 matching pairs, and 45 glossary entries. All content is authored study material; it does not predict the private assessment algorithm.

## Runner and privacy limits

- Pyodide **0.27.7** loads on demand from `cdn.jsdelivr.net`; the first run needs an internet connection. Standard-library practice requires no package installation. Google Fonts are requested for typography, with system fallbacks.
- Python runs in a module Web Worker so an infinite loop does not block the page. **Stop** terminates the worker. Runtime loading has a 90-second deadline; execution has a separate 12-second deadline. A subsequent run creates a new worker after cancellation or timeout.
- Every run has a fresh student module namespace. Standard output/error is limited to 16,000 characters per stream. Test failures, subtest failures, fixture errors, and syntax errors are visible.
- The runner is not an interactive terminal: use `print` rather than `input()`, `breakpoint()`, or `pdb`. It does not emulate CodeSignal proctoring or its precise runtime.
- Code is not submitted to a grading backend. **Do not execute untrusted code**: Pyodide can access worker/browser APIs, and a worker is not a security boundary against deliberately malicious Python. Scores are self-study feedback, not tamper-proof certification.
- Close this site for the real restricted assessment. Follow the invitation: no AI assistance, web search, external editor/code, or pasting.

## Practice editors and references

- [Programiz Python editor](https://www.programiz.com/python-programming/online-compiler/): simple editor/output layout and visualization controls.
- [Online Python](https://www.online-python.com/online_python_compiler): browser editor with run/debug controls.
- [Official Python tutorial](https://docs.python.org/3/tutorial/)
- [Official unittest reference](https://docs.python.org/3/library/unittest.html)
- [Unicode HOWTO](https://docs.python.org/3/howto/unicode.html)
- [pdb reference](https://docs.python.org/3/library/pdb.html)

The editors are independent alternatives for preparation, not claims of identical CodeSignal behavior.

## Implementation

- `src/App.jsx`: study interface, scoring, navigation, matching, persistence, and reference desk.
- `src/curriculum.js`: lessons, original exercises/tests/solutions, comparisons, glossary, and resources.
- `src/PythonEditor.jsx`: lazily loaded CodeMirror editor with Python highlighting and no AI/autocompletion.
- `src/usePython.js`: worker lifecycle, cancellation, and deadlines.
- `public/python-worker.js`: pinned Pyodide runtime, output capture, and unittest result collection.
- `src/styles.css`: responsive parchment/coffee palette, reading typography, and reduced-motion support.

## Exercised verification

The real browser runner was used to execute every broken starter and corrected reference implementation. All reference solutions passed **53/53 tests**; every starter failed at least one. All 30 lesson snippets were executed in chapter order without exceptions. Browser checks covered scoring, incorrect-answer feedback, matching, unlocks, read-ahead gating, persistence, draft recovery, language switching, glossary search/empty results, independent mode, stop/timeout recovery, syntax errors, and capped output. Worker checks also covered failed subtests, failed class fixtures, and namespace isolation.

The production build completed successfully with the editor split into an on-demand chunk. Desktop (1440px) and mobile (390px) surfaces were inspected in Chromium; the mobile page had no horizontal overflow. Keyboard matching, the mobile contents drawer, reset confirmation/cancellation, fresh-start persistence, and resource navigation were also exercised. No browser runtime errors were reported during those checks.
