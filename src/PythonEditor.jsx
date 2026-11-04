import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, keymap } from '@codemirror/view';
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

export default function PythonEditor({ value, onChange, disabled }) {
  return (
    <CodeMirror
      value={value}
      height="300px"
      extensions={extensions}
      onChange={onChange}
      editable={!disabled}
      basicSetup={setup}
    />
  );
}
