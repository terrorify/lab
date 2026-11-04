import { useState } from 'react';
import { Bug, Play, Square, ExternalLink } from 'lucide-react';
import usePython from './usePython';
import { buildPdbScript, pdbCommands, pdbPresets, pdbProgram, pdbSource, postMortemProgram } from './pdb-data';

export default function PdbLab() {
  const [presetId, setPresetId] = useState(pdbPresets[0].id);
  const [commands, setCommands] = useState(pdbPresets[0].commands);
  const [repaired, setRepaired] = useState(false);
  const [output, setOutput] = useState('');
  const { status, run, stop } = usePython();
  const preset = pdbPresets.find(item => item.id === presetId);
  const source = preset.mode === 'postmortem' ? postMortemProgram : repaired ? pdbProgram.replace('return 1', 'return value') : pdbProgram;
  const busy = status === 'loading' || status === 'running';
  async function execute() {
    // A fresh interpreter resets pdb's process-global breakpoint numbering for each transcript.
    stop();
    setOutput('');
    try {
      const result = await run({ code: buildPdbScript(commands, preset.mode, repaired) });
      setOutput([result.stdout, result.stderr, result.error].filter(Boolean).join('\n'));
    } catch (error) { setOutput(error.message); }
  }
  return <section className="pdb-lab entry">
    <div className="section-kicker"><Bug size={16}/> REAL DEBUGGER, SMALL EXPERIMENTS</div>
    <h2>Follow the program, frame by frame.</h2>
    <p>This lab runs Python’s actual <code>pdb.Pdb</code> with your commands supplied as a script. It is not a live terminal or a simulated transcript. Every run starts fresh; edit the command sequence to explore. A final <code>q</code> is supplied so the worker never waits for terminal input.</p>
    <a className="text-button" href={pdbSource.url} target="_blank" rel="noopener noreferrer">Read the original spiside tutorial <ExternalLink size={14}/></a>
    <div className="lab-controls"><label>Walkthrough<select aria-label="pdb walkthrough" value={presetId} disabled={busy} onChange={event => { const next = pdbPresets.find(p => p.id === event.target.value); setPresetId(next.id); setCommands(next.commands); setOutput(''); }}>{pdbPresets.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>{preset.mode !== 'postmortem' && <label className="checkbox-label"><input type="checkbox" checked={repaired} disabled={busy} onChange={event => setRepaired(event.target.checked)}/> Use repaired helper</label>}</div>
    <div className="practice-callout"><Bug size={17}/><span>{preset.goal}</span></div>
    <div className="code-block"><div className="code-label">pdb_lab.py · read-only example</div><pre className="numbered-source">{source.trimEnd().split('\n').map((line, index) => <span key={index}><i>{index + 1}</i><code>{line || ' '}</code></span>)}</pre></div>
    <label className="command-label" htmlFor="pdb-commands">Debugger commands · one per line</label><textarea id="pdb-commands" className="command-editor" value={commands} disabled={busy} spellCheck={false} onChange={event => setCommands(event.target.value)}/>
    <div className="button-row">{busy ? <button className="button danger" onClick={stop}><Square size={14}/> Stop debugger</button> : <button className="button primary" onClick={execute}><Play size={15}/> Run debugger commands</button>}<span className="small-text muted">{status === 'loading' ? 'Loading a fresh Python interpreter…' : status === 'running' ? 'Executing pdb…' : 'No XP · learn by inspecting'}</span></div>
    <div className="output-panel" aria-live="polite"><div className="output-heading">pdb transcript</div>{output ? <pre data-testid="pdb-output">{output}</pre> : <p className="empty-output">Run a walkthrough to inspect real source lines, frames, values, and return events.</p>}</div>
    <details className="debug-command-reference"><summary>Command reference</summary><table><thead><tr><th>Command</th><th>Use</th></tr></thead><tbody>{pdbCommands.map(([command, use]) => <tr key={command}><td><code>{command}</code></td><td>{use}</td></tr>)}</tbody></table></details>
    <p className="fine-print">The upstream tutorial’s examples and line numbers differ. For a genuine interactive session, practice <code>python -m pdb main.py</code> in a terminal before the assessment. This lab does not establish which debugger integrations CodeSignal will expose.</p>
  </section>;
}
