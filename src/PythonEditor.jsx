import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';

const theme = EditorView.theme({
  '&': { backgroundColor: '#fbf8f0', color: '#38382e', fontSize: '13px' },
  '.cm-content': { fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace', padding: '16px 0', caretColor: '#5d7048' },
  '.cm-gutters': { backgroundColor: '#f4efe3', color: '#a19886', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#e9e5d566' },
  '&.cm-focused': { outline: '2px solid #a3ae86', outlineOffset: '-2px' },
  '.cm-scroller': { overflow: 'auto' },
});
const extensions = [python(), theme, EditorView.lineWrapping, EditorView.contentAttributes.of({ 'aria-label': 'Python code editor' })];
const setup = { autocompletion: false, highlightActiveLine: true, foldGutter: false };

export default function PythonEditor({ value, onChange, disabled }) {
  return <CodeMirror value={value} height="300px" extensions={extensions} onChange={onChange} editable={!disabled} basicSetup={setup}/>;
}
