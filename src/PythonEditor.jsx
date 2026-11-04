import { useMemo } from 'react';
import { StateField } from '@codemirror/state';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, keymap, Decoration, WidgetType } from '@codemirror/view';
import { autocompletion, acceptCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';

const theme = EditorView.theme({
  '&': { backgroundColor: '#fbf8f0', color: '#38382e', fontSize: '13px' },
  '.cm-content': { fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace', padding: '16px 0', caretColor: '#5d7048' },
  '.cm-gutters': { backgroundColor: '#f4efe3', color: '#a19886', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#e9e5d566' },
  '&.cm-focused': { outline: '2px solid #a3ae86', outlineOffset: '-2px' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#faf7ee',
    border: '1px solid #dcd5c2',
    borderRadius: '6px',
    boxShadow: '0 4px 14px rgba(78, 64, 38, 0.12)',
    fontFamily: '"Cascadia Code", Consolas, monospace',
    fontSize: '12px'
  },
  '.cm-tooltip-autocomplete > ul > li': { padding: '4px 8px', color: '#4a533c' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#e5ebd6', color: '#2d381e' },
  '.cm-completionLabel': { fontWeight: '500' },
  '.cm-completionDetail': { fontStyle: 'italic', color: '#888470', marginLeft: '6px' }
});

const extensions = [
  python(),
  autocompletion({ activateOnTyping: true }),
  keymap.of([
    { key: 'Tab', run: acceptCompletion },
    indentWithTab
  ]),
  theme,
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({ 'aria-label': 'Python code editor' })
];

const setup = {
  autocompletion: true,
  highlightActiveLine: true,
  foldGutter: false,
  indentOnInput: true
};

const noHints = [];

class LineHint extends WidgetType {
  constructor(text, line) {
    super();
    this.text = text;
    this.line = line;
  }
  eq(other) { return this.text === other.text && this.line === other.line; }
  toDOM() {
    const node = document.createElement('div');
    node.className = 'editor-line-hint';
    node.setAttribute('role', 'note');
    const label = document.createElement('strong');
    label.textContent = `Line ${this.line} hint · `;
    node.append(label, document.createTextNode(this.text));
    return node;
  }
}

function hintDecorations(doc, hints) {
  const positions = new Map();
  for (let number = 1; number <= doc.lines; number++) {
    const line = doc.line(number);
    const anchor = line.text.trim();
    // Ambiguous or edited starter lines get no hint, never a guessed location.
    positions.set(anchor, positions.has(anchor) ? null : line);
  }
  const decorations = [];
  for (const hint of hints) {
    const line = positions.get(hint.anchor);
    if (!line) continue;
    decorations.push(Decoration.line({ class: 'editor-hint-target' }).range(line.from));
    decorations.push(Decoration.widget({
      widget: new LineHint(hint.text, line.number), block: true, side: 1,
    }).range(line.to));
  }
  return Decoration.set(decorations, true);
}

function lineHintField(hints) {
  return StateField.define({
    create: state => hintDecorations(state.doc, hints),
    update: (decorations, transaction) => transaction.docChanged
      ? hintDecorations(transaction.state.doc, hints) : decorations,
    provide: field => EditorView.decorations.from(field),
  });
}

export default function PythonEditor({ value, onChange, disabled, lineHints = noHints, showLineHints = false }) {
  const editorExtensions = useMemo(() => showLineHints && lineHints.length
    ? [...extensions, lineHintField(lineHints)] : extensions, [lineHints, showLineHints]);
  return (
    <CodeMirror
      value={value}
      height="300px"
      extensions={editorExtensions}
      onChange={onChange}
      editable={!disabled}
      basicSetup={setup}
    />
  );
}
