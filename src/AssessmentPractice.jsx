import { lazy, Suspense, useState } from 'react';
import { CheckCircle2, Clock3, Play, RotateCcw, ShieldCheck, Square, Trophy } from 'lucide-react';
import { assessmentExercises } from './assessment-data';

const PythonEditor = lazy(() => import('./PythonEditor.jsx'));
export const formatTime = milliseconds => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
};
function Results({ result }) {
  if (!result) return null;
  return <div className="output-panel attempt-results" aria-live="polite">
    <div className="output-heading"><CheckCircle2 size={15}/><span>Unit-test results</span><strong>{result.passed}/{result.total} passing</strong></div>
    {result.error && <pre className="error-output">{result.error}</pre>}
    {result.stdout && <pre>{result.stdout}</pre>}{result.stderr && <pre className="error-output">{result.stderr}</pre>}
    {result.tests.map((test, i) => <details className={`test-result ${test.passed ? 'passed' : 'failed'}`} key={`${test.name}-${i}`}><summary><span>{test.name.replace('cafe_practice.TestPractice.', '')}</span><small>{test.passed ? 'PASS' : 'FAIL'}</small></summary>{test.detail && <pre>{test.detail}</pre>}</details>)}
  </div>;
}
export default function AssessmentPractice({ assessment, confirm }) {
  const { active, history, remaining, status } = assessment;
  const [selected, setSelected] = useState(assessmentExercises[0].id);
  const [minutes, setMinutes] = useState(120);
  const [ready, setReady] = useState([false, false, false]);
  const [showTests, setShowTests] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const exercise = assessmentExercises.find(item => item.id === (active?.exerciseId || selected));
  const reviewed = history.find(item => item.id === reviewId) || history[0];
  const reviewedExercise = reviewed && assessmentExercises.find(item => item.id === reviewed.exerciseId);
  const busy = status === 'loading' || status === 'running';
  const frozen = !!active?.submittedAt;
  const last = active?.lastCheck;
  const unchanged = last?.code === active?.code;
  return <section className="assessment-room entry">
    <div className="section-kicker"><ShieldCheck size={16}/> ORIGINAL PRACTICE · NOT AN OFFICIAL ASSESSMENT</div>
    <h2>A quiet rehearsal.</h2>
    <p>Your invitation says passing unit tests determine the grade. These attempts use that same visible metric: one point per passing test, no style penalty, no speed bonus. They do not reproduce a private question or predict a certified CodeSignal score.</p>
    {assessment.storageError && <p className="storage-warning" role="alert">Attempt storage is unavailable or full. This tab still works, but a reload may lose your current draft and history.</p>}
    {!active ? <div className="attempt-setup">
      <div className="lab-controls"><label>Original debugging exercise<select aria-label="Assessment exercise" value={selected} onChange={event => { setSelected(event.target.value); setShowTests(false); }}>{assessmentExercises.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>Time allowance<select aria-label="Attempt duration" value={minutes} onChange={event => setMinutes(Number(event.target.value))}><option value={120}>120 min · invitation rehearsal</option><option value={30}>30 min · shorter drill</option><option value={15}>15 min · shorter drill</option></select></label></div>
      <div className="practice-callout"><Clock3 size={17}/><span>The timer starts only when you start an attempt. It continues if you leave this chapter, reload, or close the tab. Reopening after expiry grades the saved deadline draft. Use one tab for a rehearsal.</span></div>
      <h3>{exercise.title}</h3><p className="muted small-text">{exercise.topic} · {exercise.testCount} visible tests</p><p className="practice-spec">{exercise.spec}</p>
      <fieldset className="preflight"><legend>Before you begin</legend>{['I understand this is original local practice, not the real assessment or a CodeSignal score.', 'I will work independently in this editor and use the visible tests to debug.', 'I understand the clock will not pause, and finishing freezes my current code.'].map((text, i) => <label className="checkbox-label" key={text}><input type="checkbox" checked={ready[i]} onChange={event => setReady(values => values.map((value, j) => i === j ? event.target.checked : value))}/><span>{text}</span></label>)}</fieldset>
      <button className="button primary" disabled={!ready.every(Boolean)} onClick={() => { setReviewId(null); assessment.start(selected, minutes); }} data-testid="start-attempt"><Play size={15}/> Start fresh attempt</button>
      <p className="fine-print">Repeats are for preparation only. Your actual fellowship assessment allows one attempt, with no retakes. Familiarity with a repeated practice question can inflate your result.</p>
    </div> : <div className="active-attempt">
      <div className={`attempt-clock ${remaining < 300000 && !frozen ? 'time-warning' : ''}`}><div><span>{frozen ? 'SUBMISSION FROZEN' : 'TIME REMAINING · NO PAUSE'}</span><strong role="timer" aria-live="off">{formatTime(frozen ? active.deadlineAt - active.submittedAt : remaining)}</strong></div><div><span>{active.durationMinutes}-minute {active.durationMinutes === 120 ? 'rehearsal' : 'drill'}</span><small>{frozen ? active.reason === 'expired' ? 'Time expired; grading saved code.' : 'Grading the submitted snapshot.' : 'Draft autosaved in this browser.'}</small></div></div>
      <h3>{exercise.title}</h3><p className="practice-spec">{exercise.spec}</p>
      <div className="editor-shell"><div className="editor-toolbar"><span>assessment.py</span><span className="small-text muted">{frozen ? 'Read only · submitted' : 'Python only · no assistance'}</span></div><Suspense fallback={<p className="editor-loading">Opening Python editor…</p>}><PythonEditor value={active.code} onChange={assessment.edit} disabled={frozen || busy}/></Suspense>
        <div className="run-toolbar"><span className="runtime-status">{status === 'loading' ? 'Loading Python…' : status === 'running' ? 'Running the visible tests…' : `${active.checkCount} checks · best checked ${active.bestPassed}/${exercise.testCount}`}</span><div className="button-row">{!frozen && (busy ? <button className="button subtle small" onClick={assessment.stopCheck}><Square size={14}/> Stop check</button> : <button className="button primary small" onClick={assessment.check} data-testid="check-attempt"><Play size={14}/> Run tests</button>)}{!frozen && <button className="button subtle small" onClick={() => confirm({ title: 'Finish this attempt?', text: 'Your current draft will be frozen and graded. The final score uses this code, not your best earlier check. You can start a separate fresh practice attempt afterward.', confirmLabel: 'Submit current code', action: () => assessment.finish() })}>Finish attempt</button>}</div></div></div>
      {assessment.checkError && <p className="feedback retry" role="alert">{assessment.checkError}</p>}
      {frozen && active.gradingError && <div className="feedback retry" role="alert"><div><p>Saved submission is frozen but ungraded: {active.gradingError}</p><button className="button subtle small" onClick={assessment.retryGrading}>Retry grading saved submission</button></div></div>}
      {last && <><p className="fine-print">{unchanged ? 'Latest check is for the current draft.' : 'The draft has changed since this check. Rerun tests; final grading uses the current draft.'} Best checked score does not replace the final submission.</p><Results result={last.result}/></>}
      {!last && !frozen && <p className="empty-output">Run the broken starter now to establish a baseline. Read failures before editing.</p>}
    </div>}
    <button className="disclosure-button" onClick={() => setShowTests(value => !value)} aria-expanded={showTests}>{showTests ? 'Hide' : 'Read'} all {exercise.testCount} unit tests</button>
    {showTests && <div className="code-block"><div className="code-label">Read-only contract · test_assessment.py</div><pre><code>{exercise.tests}</code></pre></div>}
    {!active && reviewed && <section className="attempt-report" data-testid="attempt-report"><div className="section-kicker"><Trophy size={16}/> SAVED FINAL RESULT</div><h3>{reviewedExercise.title}</h3><div className="attempt-score"><strong>{reviewed.result.passed}<span> / {reviewed.result.total}</span></strong><div><b>{Math.round(reviewed.result.passed / reviewed.result.total * 100)}% of unit tests passed</b><span>No style grade · no speed bonus · no official score conversion</span></div></div><p className="small-text muted">{reviewed.reason === 'expired' ? 'Deadline reached' : 'Submitted early'} · elapsed {formatTime(reviewed.submittedAt - reviewed.startedAt)} · best intermediate check: {reviewed.bestPassed}/{reviewedExercise.testCount} across {reviewed.checkCount} checks.</p><p className="fine-print">Final result grades the frozen submitted code. Repeated practice results are not a minimum-score recommendation or a fellowship outcome prediction.</p><Results result={reviewed.result}/><details className="review-code"><summary>Review submitted code</summary><pre><code>{reviewed.code}</code></pre></details><details className="review-code"><summary>Reveal reference solution · after-attempt review</summary><pre><code>{reviewedExercise.solution}</code></pre></details></section>}
    <section className="attempt-history"><div className="history-heading"><h3>Attempt history</h3><button className="text-button" disabled={!!active || history.length === 0} onClick={() => confirm({ title: 'Clear local attempt history?', text: 'This deletes saved assessment attempts and their submitted code from this browser. Your chapter XP and drafts are unchanged.', action: assessment.clearHistory })}><RotateCcw size={13}/> Clear history</button></div>{history.length === 0 ? <p className="small-text muted">No completed attempts yet. Final scores and submitted code will be saved here.</p> : <div className="history-scroll"><table><thead><tr><th>Attempt</th><th>Exercise</th><th>Final tests</th><th>Ended</th></tr></thead><tbody>{history.map((attempt, i) => <tr key={attempt.id}><td><button className="text-button" disabled={!!active} onClick={() => { setReviewId(attempt.id); document.querySelector('.attempt-report')?.scrollIntoView({ block: 'start' }); }}>#{history.length - i} · Review</button><small>{new Date(attempt.startedAt).toLocaleString()}</small></td><td>{assessmentExercises.find(item => item.id === attempt.exerciseId).title}</td><td>{attempt.result.passed}/{attempt.result.total}</td><td>{attempt.reason === 'expired' ? 'Time expired' : 'Submitted'}</td></tr>)}</tbody></table></div>}</section>
    <p className="fine-print">This is a local, honor-based rehearsal, not proctoring or a tamper-proof clock. Python executes in a worker. Runtime download or execution failures do not fabricate a score: a frozen submission can be regraded without editing. The exercise difficulty and test distribution have not been calibrated to your real assessment.</p>
  </section>;
}
