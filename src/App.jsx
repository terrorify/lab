import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bug, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Code2, Coffee, Copy, ExternalLink, Eye, FlaskConical, GraduationCap, HelpCircle, Leaf, Library, Lightbulb, List, LockKeyhole, Menu, Play, RotateCcw, Search, ShieldCheck, Sparkles, Square, Terminal, Trophy, X } from 'lucide-react';
import { chapters, glossary, resources } from './curriculum';
import usePython from './usePython';

const PythonEditor = lazy(() => import('./PythonEditor.jsx'));
const PdbLab = lazy(() => import('./PdbLab.jsx'));
import AssessmentPractice, { formatTime } from './AssessmentPractice.jsx';
import useAssessment from './useAssessment';

const STORAGE = 'python-study-cafe:v1';
const emptyProgress = () => ({ chapter: chapters[0].id, language: 'rust', scores: {}, drafts: {} });
function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE));
    if (!data || typeof data !== 'object') return emptyProgress();
    const scores = {}, drafts = {};
    for (const chapter of chapters) {
      const score = data.scores?.[chapter.id];
      if (score && typeof score === 'object') scores[chapter.id] = { quiz: score.quiz === true, match: Math.min(4, Math.max(0, Number(score.match) || 0)), practice: Math.min(1, Math.max(0, Number(score.practice) || 0)) };
      if (typeof data.drafts?.[chapter.id] === 'string') drafts[chapter.id] = data.drafts[chapter.id];
    }
    return { chapter: chapters.some(c => c.id === data.chapter) ? data.chapter : chapters[0].id, language: ['rust', 'java', 'kotlin'].includes(data.language) ? data.language : 'rust', scores, drafts };
  } catch { return emptyProgress(); }
}
const coreChapters = chapters.filter(c => !c.bonus);
const mastered = score => !!score?.quiz && score?.match === 4 && score?.practice === 1;
const earned = score => (score?.quiz ? 20 : 0) + (score?.match || 0) * 10 + Math.round((score?.practice || 0) * 40);
function Code({ children, label = 'Python', compact = false }) {
  return <div className={`code-block ${compact ? 'compact' : ''}`}><div className="code-label"><span className="code-dot" />{label}</div><pre><code>{children}</code></pre></div>;
}
function CupArt() {
  return <svg className="cup-art" viewBox="0 0 200 160" aria-hidden="true"><ellipse cx="94" cy="132" rx="69" ry="13" fill="#c4b697" opacity=".26"/><ellipse cx="94" cy="124" rx="67" ry="13" fill="#ded3b8" stroke="#8e8165" strokeWidth="1.5"/><path d="M139 61h13c29 0 24 45-5 45h-11" fill="none" stroke="#8e8165" strokeWidth="9"/><path d="M139 61h13c29 0 24 45-5 45h-11" fill="none" stroke="#ebe2cd" strokeWidth="6"/><path d="M43 56h102l-9 54c-4 18-78 18-84 0z" fill="#eee4cd" stroke="#8e8165" strokeWidth="1.5"/><ellipse cx="94" cy="56" rx="51" ry="12" fill="#f8f0dc" stroke="#8e8165" strokeWidth="1.5"/><ellipse cx="94" cy="57" rx="43" ry="8" fill="#897051"/><path d="M77 17c-14 15 13 14 0 28m20-33c-14 15 13 14 0 28m19-20c-12 13 11 13 0 25" fill="none" stroke="#a69574" strokeWidth="2" strokeLinecap="round" opacity=".6"/><path d="M83 78l-8 8 8 8m22-16 8 8-8 8m-7-20-8 24" stroke="#6e7c51" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="m157 128 18 7m-5-16 12 6" stroke="#78654c" strokeWidth="6" strokeLinecap="round"/></svg>;
}
function Confirmation({ request, close }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className="confirmation" onCancel={close}><div className="dialog-heading"><h2>{request.title}</h2><button className="icon-button" onClick={close} aria-label="Close confirmation"><X size={20}/></button></div><p>{request.text}</p><div className="button-row"><button className="button subtle" onClick={close}>Cancel</button><button className="button primary" onClick={() => { request.action(); close(); }}>Confirm reset</button></div></dialog>;
}
function Workbench({ chapter, draft, setDraft, unlocked, onGrade, confirm, independent }) {
  const { status, run, stop } = usePython();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showTests, setShowTests] = useState(false);
  const [solution, setSolution] = useState(false);
  const [graded, setGraded] = useState(false);
  const busy = status === 'loading' || status === 'running';
  async function execute(withTests) {
    setError(''); setResult(null); setGraded(withTests);
    try {
      const output = await run({ code: draft, tests: withTests ? chapter.practice.tests : '' });
      setResult(output);
      if (withTests && unlocked && !output.error && output.total > 0) onGrade(output.passed / output.total);
    } catch (err) { setError(err.message); }
  }
  return <section className="workbench entry">
    <div className="section-kicker"><FlaskConical size={15}/> REPAIR THE IMPLEMENTATION</div>
    <h2>{chapter.practice.title}</h2><p className="practice-spec">{chapter.practice.spec}</p>
    <div className="practice-callout"><Lightbulb size={17}/><span>The starter is intentionally broken. Run its tests first, then make one focused change.</span></div>
    <div className="editor-shell"><div className="editor-toolbar"><span><Code2 size={15}/> practice.py</span><button className="text-button" disabled={busy} onClick={() => confirm({ title: 'Reset this code?', text: 'Your draft for this chapter will be replaced with the broken starter. Earned progress stays saved.', action: () => { setDraft(chapter.practice.starter); setResult(null); setError(''); } })}><RotateCcw size={14}/> Reset code</button></div>
      <Suspense fallback={<p className="editor-loading" role="status">Opening your Python notebook…</p>}><PythonEditor value={draft} onChange={setDraft} disabled={busy}/></Suspense>
      <div className="run-toolbar"><span className={`runtime-status ${busy ? 'working' : ''}`}><i/>{status === 'loading' ? 'Loading Python…' : status === 'running' ? 'Running Python…' : 'Python · in your browser'}</span><div className="button-row">{busy ? <button className="button danger small" onClick={stop}><Square size={14}/> Stop</button> : <><button className="button subtle small" onClick={() => execute(false)}><Play size={14}/> Run code</button><button className="button primary small" disabled={!unlocked} onClick={() => execute(true)} data-testid="run-tests"><CheckCircle2 size={15}/> Check tests</button></>}</div></div>
    </div>
    <div className="output-panel" aria-live="polite"><div className="output-heading"><Terminal size={15}/><span>Console & test results</span>{result && graded && <strong className={result.passed === result.total && result.total > 0 && !result.error ? 'success-text' : ''}>{result.passed}/{result.total} passed</strong>}</div>
      {!result && !error && <p className="empty-output">{busy ? 'The first run downloads the Python runtime. Your page stays responsive.' : 'Your output will appear here. Print values with repr() to reveal the details.'}</p>}
      {error && <pre className="error-output">{error}</pre>}{result?.error && <pre className="error-output">{result.error}</pre>}
      {result?.stdout && <pre>{result.stdout}</pre>}{result?.stderr && <pre className="error-output">{result.stderr}</pre>}
      {result && !graded && !result.stdout && !result.stderr && !result.error && <p className="empty-output">Finished. No output—add print(...) to inspect a value, or use Check tests.</p>}
      {result?.tests?.map((test, index) => <details className={`test-result ${test.passed ? 'passed' : 'failed'}`} key={`${test.name}-${index}`}><summary>{test.passed ? <Check size={15}/> : <X size={15}/>}<span>{test.name.replace('cafe_practice.TestPractice.', '')}</span><small>{test.passed ? 'PASS' : 'FAIL'}</small></summary>{test.detail && <pre>{test.detail}</pre>}</details>)}
      {result && graded && result.total > 0 && result.passed === result.total && !result.error && <p className="feedback success"><CheckCircle2 size={17}/> All tests passed. Complete the checkpoint to master this chapter.</p>}
    </div>
    <button className="disclosure-button" onClick={() => setShowTests(!showTests)} aria-expanded={showTests}><ChevronDown size={16} className={showTests ? 'rotated' : ''}/> {showTests ? 'Hide' : 'Read'} the unit tests <span>They are the contract.</span></button>
    {showTests && <Code label="test_practice.py">{chapter.practice.tests}</Code>}
    {!independent && <div className="solution-area"><button className="text-button" onClick={() => setSolution(!solution)} aria-expanded={solution}><Eye size={15}/> {solution ? 'Hide' : 'Reveal'} reference solution</button><span>Try independently first. Viewing earns no XP.</span>{solution && <Code>{chapter.practice.solution}</Code>}</div>}
    <p className="fine-print">Standard-library practice. No interactive stdin or pdb in this runner. Execution stops after 12 seconds. Python downloads from jsDelivr; your code is executed in a worker, not sent to a grading server. Do not run untrusted code here.</p>
  </section>;
}
function Checkpoint({ chapter, unlocked, score, onQuiz, onMatch }) {
  const [choice, setChoice] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [round, setRound] = useState(0);
  const shuffled = useMemo(() => {
    const values = chapter.matches.map((_, index) => index);
    for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
    return values;
  }, [chapter.id, round]);
  function pair(l, r) {
    setAttempts(a => a + 1);
    if (l === r) {
      const next = [...matched, l]; setMatched(next); onMatch(next.length);
      setFeedback({ correct: true, text: next.length === chapter.matches.length ? 'A perfect set. All four concepts connected.' : 'That’s a match. Keep going.' });
    } else setFeedback({ correct: false, text: 'Not quite. Re-read the operation, then try another pair. Nothing is locked out.' });
    setLeft(null); setRight(null);
  }
  function selectLeft(i) { if (right !== null) pair(i, right); else setLeft(i); }
  function selectRight(i) { if (left !== null) pair(left, i); else setRight(i); }
  return <div className="checkpoint entry">
    <div className="section-kicker"><GraduationCap size={16}/> A LITTLE RETRIEVAL PRACTICE</div><h2>Make it stick.</h2><p>No lives to lose. Mistakes are part of the process. Your best result stays saved.</p>
    <section className="quiz-card"><div className="card-eyebrow"><span>01 / CONCEPT CHECK</span><span>{score?.quiz ? <><Check size={13}/> Completed</> : '20 XP'}</span></div><h3>{chapter.quiz.question}</h3>
      <div className="answer-options">{chapter.quiz.options.map((option, index) => <button key={option} className={`answer-option ${choice === index ? 'selected' : ''} ${answered && choice === index ? index === chapter.quiz.answer ? 'correct' : 'incorrect' : ''}`} disabled={!unlocked || answered} aria-pressed={choice === index} onClick={() => setChoice(index)}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answered && choice === index && (index === chapter.quiz.answer ? <CheckCircle2 size={18}/> : <X size={18}/>)}</button>)}</div>
      {!answered ? <button className="button primary" disabled={choice === null || !unlocked} onClick={() => { setAnswered(true); if (choice === chapter.quiz.answer) onQuiz(); }} data-testid="check-answer">Check answer <ArrowRight size={15}/></button> : <><div className={`feedback ${choice === chapter.quiz.answer ? 'success' : 'retry'}`}><HelpCircle size={18}/><p><strong>{choice === chapter.quiz.answer ? 'Exactly right. ' : 'Let’s unpack that. '}</strong>{chapter.quiz.explanation}</p></div>{choice !== chapter.quiz.answer && <button className="text-button" onClick={() => { setAnswered(false); setChoice(null); }}>Try again <RotateCcw size={14}/></button>}</>}
    </section>
    <section className="quiz-card matching-card"><div className="card-eyebrow"><span>02 / CONNECT THE DOTS</span><span>{matched.length}/4 matched · 40 XP</span></div><h3>Match the idea to the Python.</h3><p className="muted small-text">Choose a term and its snippet, in either order. Keyboard friendly, too.</p><div className="matching-grid"><div className="match-column">{chapter.matches.map((item, i) => <button key={item.term} className={`match-tile ${left === i ? 'selected' : ''} ${matched.includes(i) ? 'matched' : ''}`} disabled={!unlocked || matched.includes(i)} aria-pressed={left === i} onClick={() => selectLeft(i)} data-term={i}>{item.term}{matched.includes(i) && <Check size={16}/>}</button>)}</div><div className="match-column">{shuffled.map(i => <button key={i} className={`match-tile snippet ${right === i ? 'selected' : ''} ${matched.includes(i) ? 'matched' : ''}`} disabled={!unlocked || matched.includes(i)} aria-pressed={right === i} onClick={() => selectRight(i)} data-snippet={i}><code>{chapter.matches[i].code}</code>{matched.includes(i) && <Check size={16}/>}</button>)}</div></div>
      <div aria-live="polite">{feedback && <div className={`feedback ${feedback.correct ? 'success' : 'retry'}`}>{feedback.correct ? <CheckCircle2 size={18}/> : <HelpCircle size={18}/>}<p>{feedback.text}</p></div>}</div>
      <div className="matching-footer"><span>{attempts > 0 ? `${Math.round(matched.length / attempts * 100)}% accuracy this round · ${attempts} attempts` : 'Four connections. One concept at a time.'}</span><button className="text-button" disabled={!unlocked} onClick={() => { setLeft(null); setRight(null); setMatched([]); setAttempts(0); setFeedback(null); setRound(r => r + 1); }}>Shuffle & retry <RotateCcw size={13}/></button></div>
    </section>
  </div>;
}
function ReferenceDesk({ chapter, language, setLanguage, notify, go, independent, setIndependent }) {
  const [tab, setTab] = useState('compare');
  const [hintCount, setHintCount] = useState(0);
  useEffect(() => setHintCount(0), [chapter.id]);
  if (!chapter.comparison) return <aside className="reference-desk"><div className="desk-heading"><div><ShieldCheck size={17}/><h2>Assessment guidance</h2></div><span className="tiny-tag">REFERENCE</span></div><p className="desk-description">Field notes from your invitation and official CodeSignal articles.</p><div className="reference-content"><h4>Key rules to remember</h4><ul className="pitfalls"><li>Python only; no external libraries or frameworks required.</li><li>Strictly no AI assistance, web search, external code, or external editors.</li><li>Do not paste code: all code must be written within the platform.</li><li>Grading is based entirely on passing unit tests.</li><li>One official attempt only: up to 120 minutes with no retakes.</li></ul></div><div className="sticky-note"><span>A NOTE TO YOURSELF</span><p>“Run the tests early and often.<br/>They are the final word.”</p><Leaf size={22}/></div></aside>;
  async function copy() {
    try { await navigator.clipboard.writeText(chapter.comparison.python); notify('Python reference snippet copied. For practice only.'); }
    catch { notify('Clipboard access unavailable. Select and copy the snippet manually.'); }
  }
  if (independent) return <aside className="reference-desk independent-desk"><ShieldCheck size={28}/><h3>Your own thinking, first.</h3><p>The reference desk is tucked away. Lessons and visible tests are still available.</p><button className="button subtle small" onClick={() => setIndependent(false)}>Show reference desk</button></aside>;
  return <aside className="reference-desk"><div className="desk-heading"><div><Sparkles size={17}/><h2>Your reference desk</h2></div><span className="tiny-tag">NOT AI</span></div><p className="desk-description">A familiar language. A new perspective.</p>
    <div className="desk-tabs" role="tablist" aria-label="Reference desk"><button role="tab" aria-selected={tab === 'compare'} className={tab === 'compare' ? 'active' : ''} onClick={() => setTab('compare')}>Translate</button><button role="tab" aria-selected={tab === 'hints'} className={tab === 'hints' ? 'active' : ''} onClick={() => setTab('hints')}>Hints & notes</button></div>
    {tab === 'compare' ? <div className="reference-content"><label className="language-label" htmlFor="native-language">I THINK IN<select id="native-language" value={language} onChange={event => setLanguage(event.target.value)}><option value="rust">Rust</option><option value="java">Java</option><option value="kotlin">Kotlin</option></select></label><Code compact label={language === 'rust' ? 'Rust' : language === 'java' ? 'Java' : 'Kotlin'}>{chapter.comparison[language]}</Code><div className="translation-divider"><span/><ArrowRight size={16}/><span/></div><div className="python-reference"><Code compact>{chapter.comparison.python}</Code><button className="copy-button" aria-label="Copy Python reference snippet" onClick={copy}><Copy size={14}/></button></div><div className="translation-note"><Lightbulb size={17}/><div><h4>Mind the difference</h4><p>{chapter.comparison.notes[language]}</p></div></div></div> : <div className="reference-content"><h4>Small nudges, not a shortcut.</h4><p className="muted small-text">Reveal one hint at a time after you’ve tried the exercise.</p>{chapter.hints.slice(0, hintCount).map((hint, i) => <div className="hint-card" key={hint}><span>{i + 1}</span><p>{hint}</p></div>)}<button className="button subtle small full-width" disabled={hintCount === chapter.hints.length} onClick={() => setHintCount(n => n + 1)}><Lightbulb size={15}/>{hintCount === chapter.hints.length ? 'All hints revealed' : `Reveal hint ${hintCount + 1}`}</button><h4 className="watch-heading">Watch for these</h4><ul className="pitfalls">{chapter.pitfalls.map(p => <li key={p}>{p}</li>)}</ul></div>}
    <div className="desk-glossary"><div className="small-heading"><BookOpen size={15}/><h4>Words to know</h4></div>{glossary.filter(g => g.chapterId === chapter.id).slice(0, 3).map(g => <details key={g.term}><summary>{g.term}<ChevronDown size={13}/></summary><p>{g.definition}</p></details>)}<button className="text-button" onClick={() => go('glossary')}>Open the glossary <ArrowUpRight size={14}/></button></div>
    <div className="sticky-note"><span>A NOTE TO YOURSELF</span><p>“Don’t memorize the answer.<br/>Understand why it works.”</p><Leaf size={22}/></div>
  </aside>;
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [view, setView] = useState('study');
  const [lessonTab, setLessonTab] = useState('lesson');
  const assessment = useAssessment();
  const [sidebar, setSidebar] = useState(false);
  const [independent, setIndependent] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const main = useRef(null);
  const index = chapters.findIndex(c => c.id === progress.chapter);
  const chapter = chapters[index];
  const score = progress.scores[chapter.id] || {};
  const coreComplete = coreChapters.filter(c => mastered(progress.scores[c.id])).length;
  const frontier = coreChapters.findIndex(c => !mastered(progress.scores[c.id]));
  const unlocked = chapter.bonus || frontier === -1 || index <= frontier;
  const xp = coreChapters.reduce((sum, c) => sum + earned(progress.scores[c.id]), 0);
  const totalXP = coreChapters.length * 100;

  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(progress)); setStorageError(false); } catch { setStorageError(true); } }, [progress]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = main.current?.querySelectorAll('.entry');
    if (!targets?.length) return;
    const animation = animate(targets, { opacity: [0, 1], translateY: [12, 0], duration: 450, delay: stagger(55), ease: 'outQuad' });
    return () => animation.revert();
  }, [chapter.id, view, lessonTab]);
  function selectChapter(id) { setProgress(p => ({ ...p, chapter: id })); setView('study'); setLessonTab('lesson'); setSidebar(false); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function go(next) { setView(next); setSidebar(false); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function updateScore(key, value) {
    if (!unlocked) return;
    setProgress(p => {
      const previous = p.scores[chapter.id] || {};
      const next = { ...previous, [key]: key === 'quiz' ? true : Math.max(previous[key] || 0, value) };
      return { ...p, scores: { ...p.scores, [chapter.id]: next } };
    });
  }
  const filteredGlossary = glossary.filter(g => `${g.term} ${g.definition}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={`app ${independent ? 'focus-mode' : ''}`}>
    <header className="topbar"><div className="brand"><button className="icon-button mobile-menu" aria-label="Toggle table of contents" aria-expanded={sidebar} onClick={() => setSidebar(!sidebar)}><Menu size={21}/></button><button className="brand-link" onClick={() => go('study')}><span className="brand-mark"><Coffee size={25} strokeWidth={1.7}/></span><span>Python <em>Study Café</em></span></button></div><nav className="top-nav" aria-label="Main navigation">{[['study', 'Study desk'], ['map', 'Course map'], ['glossary', 'Glossary'], ['resources', 'Resources']].map(([id, label]) => <button className={view === id ? 'active' : ''} key={id} onClick={() => go(id)}>{label}</button>)}</nav><div className="header-stats">{assessment.active && <button className="attempt-badge" onClick={() => { selectChapter('codesignal'); setLessonTab('practice'); }}><Clock3 size={14}/><span>{formatTime(assessment.remaining)}</span></button>}<span className="xp-pill"><Sparkles size={15}/><strong>{xp}</strong> XP</span><span className="avatar" aria-label="Your local learner profile">you</span></div></header>
    {storageError && <div className="storage-warning" role="alert">Browser storage is unavailable or full. Changes work in this tab but may not survive a reload.</div>}
    <div className="app-shell">
      {sidebar && <button className="sidebar-backdrop" aria-label="Close table of contents" onClick={() => setSidebar(false)}/>}
      <aside className={`course-sidebar ${sidebar ? 'open' : ''}`}><div className="sidebar-intro"><span className="eyebrow">YOUR LEARNING PATH</span><h2>From familiar<br/>to fluent.</h2><p>A Python refresher for<br/>people who already code.</p></div><div className="course-progress"><div><span>Core curriculum</span><strong>{coreComplete}/{coreChapters.length}</strong></div><div className="progress-track" role="progressbar" aria-label="Chapters mastered" aria-valuemin={0} aria-valuemax={coreChapters.length} aria-valuenow={coreComplete}><span style={{ width: `${coreComplete / coreChapters.length * 100}%` }}/></div><small>{coreComplete === 0 ? 'Your first chapter is ready.' : coreComplete === coreChapters.length ? 'Core path mastered. Practice bonus chapters.' : 'One small step. Real progress.'}</small></div>
        <nav className="chapter-nav" aria-label="Table of contents">{chapters.map((item, i) => { const done = mastered(progress.scores[item.id]); const locked = !item.bonus && frontier !== -1 && i > frontier; return <div key={item.id}>{(i === 0 || item.group !== chapters[i - 1].group) && <div className="chapter-group">{item.group}</div>}<button className={`chapter-link ${item.id === chapter.id && view === 'study' ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => selectChapter(item.id)} aria-current={item.id === chapter.id && view === 'study' ? 'page' : undefined} title={item.bonus ? 'Bonus chapter: open for independent preparation' : locked ? 'Preview chapter; complete earlier checkpoints to unlock scoring' : item.title}><span className="chapter-number">{done ? <Check size={14}/> : item.bonus ? <ShieldCheck size={13}/> : String(i + 1).padStart(2, '0')}</span><span>{item.title}</span>{locked ? <LockKeyhole className="chapter-state" size={12}/> : item.id === chapter.id ? <ChevronRight className="chapter-state" size={14}/> : null}</button></div>; })}</nav>
        <div className="sidebar-bottom"><div><Leaf size={16}/><span>Slow progress is still progress.</span></div><button className="text-button" onClick={() => setConfirmation({ title: 'Start a fresh notebook?', text: 'This permanently clears all saved chapter progress, XP, and code drafts in this browser. (Attempt history is cleared separately in the CodeSignal practice room.)', action: () => { setProgress(emptyProgress()); setView('study'); setLessonTab('lesson'); setToast('A fresh notebook. Your first chapter is ready.'); } })}><RotateCcw size={13}/> Reset progress</button></div>
      </aside>
      <div className="workspace"><div className="workspace-topline"><span><Library size={14}/>{view === 'study' ? <>{chapter.group}<ChevronRight size={12}/><strong>{chapter.bonus ? 'Bonus' : `Chapter ${String(index + 1).padStart(2, '0')}`}</strong></> : view === 'map' ? 'The full learning path' : view === 'glossary' ? 'Your Python vocabulary' : 'A few good companions'}</span><button className={`focus-toggle ${independent ? 'enabled' : ''}`} onClick={() => setIndependent(!independent)} aria-pressed={independent}><ShieldCheck size={15}/><span>Independent mode</span><span className="toggle-track"><i/></span></button></div>
        <div className="desk-layout"><main className="main-content" ref={main} id="main-content">
          {view === 'study' && <><section className="lesson-hero entry"><div className="hero-copy"><div className="section-kicker"><span className="small-line"/> ONE CONCEPT AT A TIME</div><h1>{chapter.title}<span className="title-dot">.</span></h1><p>{chapter.subtitle}</p><div className="lesson-meta"><span><BookOpen size={14}/> {chapter.bonus ? 'Dedicated bonus guide' : `Chapter ${index + 1} of ${chapters.length}`}</span><i/><span>{chapter.minutes} min</span>{!chapter.bonus && <><i/><span className="green-text">{earned(score)} / 100 XP</span></>}</div></div><CupArt/></section>
          {!unlocked && <div className="preview-banner"><LockKeyhole size={18}/><div><strong>You’re reading ahead.</strong><p>All lessons and code are open to explore. Master chapter {frontier + 1} to move the scoring gate forward.</p></div><button className="text-button" onClick={() => selectChapter(coreChapters[frontier].id)}>Go there <ArrowRight size={14}/></button></div>}
          {mastered(score) && <div className="mastered-banner"><Trophy size={20}/><div><strong>Chapter mastered.</strong><span>{index === coreChapters.length - 1 ? 'Your learning path is complete. Revisit any exercise.' : 'The next chapter is unlocked. Your best scores are saved.'}</span></div></div>}
          <div className="lesson-tabs" role="tablist" aria-label="Chapter activities">
            <button role="tab" aria-selected={lessonTab === 'lesson'} className={lessonTab === 'lesson' ? 'active' : ''} onClick={() => setLessonTab('lesson')} data-testid="tab-lesson"><BookOpen size={16}/>{chapter.bonus ? 'Field guide' : 'The lesson'}</button>
            {chapter.debugger && <button role="tab" aria-selected={lessonTab === 'pdb'} className={lessonTab === 'pdb' ? 'active' : ''} onClick={() => setLessonTab('pdb')} data-testid="tab-pdb"><Bug size={16}/>pdb lab</button>}
            {chapter.practice && <button role="tab" aria-selected={lessonTab === 'practice'} className={lessonTab === 'practice' ? 'active' : ''} onClick={() => setLessonTab('practice')} data-testid="tab-practice"><Code2 size={16}/>Workbench{score.practice === 1 && <Check size={13}/>}</button>}
            {chapter.bonus && <button role="tab" aria-selected={lessonTab === 'practice'} className={lessonTab === 'practice' ? 'active' : ''} onClick={() => setLessonTab('practice')} data-testid="tab-practice"><ShieldCheck size={16}/>Practice room{assessment.active && <span className="tab-pill">{formatTime(assessment.remaining)}</span>}</button>}
            {chapter.quiz && <button role="tab" aria-selected={lessonTab === 'checkpoint'} className={lessonTab === 'checkpoint' ? 'active' : ''} onClick={() => setLessonTab('checkpoint')} data-testid="tab-checkpoint"><GraduationCap size={16}/>Checkpoint{score.quiz && score.match === 4 && <Check size={13}/>}</button>}
          </div>
          {lessonTab === 'lesson' && <article className="lesson-body"><p className="lesson-intro entry">{chapter.intro}</p>{chapter.sections.map((section, i) => <section className="lesson-section entry" key={section.title}><div className="lesson-section-title"><span>{String(i + 1).padStart(2, '0')}</span><h2>{section.title}</h2></div><p>{section.body}</p>{section.code && <Code label={section.language || 'Python'}>{section.code}</Code>}</section>)}{chapter.sources && <div className="sources-callout"><h4>Primary source references</h4>{chapter.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-button">{source.title} <ExternalLink size={13}/></a>)}</div>}<div className="lesson-call-to-action entry"><div><h3>Reading is the warm-up.</h3><p>{chapter.bonus ? 'Try a timed, independent debugging rehearsal.' : chapter.debugger ? 'Step through real pdb execution in the lab, or open the workbench.' : 'Let’s make the idea work in actual Python.'}</p></div><button className="button primary" onClick={() => setLessonTab(chapter.debugger ? 'pdb' : 'practice')}>{chapter.bonus ? 'Open practice room' : chapter.debugger ? 'Open pdb lab' : 'Open workbench'} <ArrowRight size={16}/></button></div></article>}
          {lessonTab === 'pdb' && chapter.debugger && <Suspense fallback={<p className="editor-loading">Opening debugger lab…</p>}><PdbLab/></Suspense>}
          {lessonTab === 'practice' && chapter.practice && <Workbench key={chapter.id} chapter={chapter} draft={progress.drafts[chapter.id] ?? chapter.practice.starter} setDraft={value => setProgress(p => ({ ...p, drafts: { ...p.drafts, [chapter.id]: value } }))} unlocked={unlocked} onGrade={value => updateScore('practice', value)} confirm={setConfirmation} independent={independent}/>}
          {lessonTab === 'practice' && chapter.bonus && <Suspense fallback={<p className="editor-loading">Opening assessment practice room…</p>}><AssessmentPractice assessment={assessment} confirm={setConfirmation}/></Suspense>}
          {lessonTab === 'checkpoint' && chapter.quiz && <Checkpoint key={chapter.id} chapter={chapter} unlocked={unlocked} score={score} onQuiz={() => updateScore('quiz', true)} onMatch={value => updateScore('match', value)}/>}
          {!chapter.bonus && <div className="mastery-strip"><span>CHAPTER CHECKLIST</span><div className={score.practice === 1 ? 'complete' : ''}><CheckCircle2 size={14}/> Code tests</div><div className={score.quiz ? 'complete' : ''}><CheckCircle2 size={14}/> Concept check</div><div className={score.match === 4 ? 'complete' : ''}><CheckCircle2 size={14}/> Match all four</div></div>}
          <footer className="chapter-footer"><button className="text-button" disabled={index === 0} onClick={() => selectChapter(chapters[index - 1].id)}><ArrowLeft size={16}/> Previous chapter</button><span>{String(index + 1).padStart(2, '0')} / {chapters.length}</span><button className="text-button" disabled={index === chapters.length - 1} onClick={() => selectChapter(chapters[index + 1].id)}>{!chapters[index + 1]?.bonus && frontier !== -1 && index + 1 > frontier ? 'Preview next' : 'Next chapter'} <ArrowRight size={16}/></button></footer></>}
          {view === 'map' && <section className="directory-view entry"><div className="section-kicker"><List size={15}/> YOUR TABLE OF CONTENTS</div><h1>A path, not a race.</h1><p>Read ahead whenever curiosity strikes. To earn each unlock, pass the code tests, answer the concept check, and match all four snippets in the preceding core chapter. The CodeSignal field guide is open immediately as a dedicated bonus chapter.</p><div className="map-summary"><div><strong>{coreComplete}</strong><span>chapters mastered</span></div><div><strong>{xp}</strong><span>of {totalXP} XP earned</span></div><div><strong>{chapters.length}</strong><span>chapters & rehearsal rooms</span></div></div><div className="course-map">{chapters.map((item, i) => { const done = mastered(progress.scores[item.id]); const locked = !item.bonus && frontier !== -1 && i > frontier; return <button className={`map-card ${done ? 'done' : ''}`} key={item.id} onClick={() => selectChapter(item.id)}><span className="map-number">{done ? <Check size={22}/> : item.bonus ? <ShieldCheck size={18}/> : String(i + 1).padStart(2, '0')}</span><div><small>{item.group} · {item.minutes} min</small><h3>{item.title}</h3><p>{item.subtitle}</p></div><span className="map-status">{done ? 'Mastered' : item.bonus ? 'Rehearsal' : locked ? <><LockKeyhole size={13}/> Preview</> : 'Study'}<ArrowRight size={16}/></span></button>; })}</div></section>}
          {view === 'glossary' && <section className="directory-view entry"><div className="section-kicker"><BookOpen size={15}/> THE WORDS BEHIND THE CODE</div><h1>A shared vocabulary.</h1><p>Small definitions for the concepts that come up again and again. Jump straight to a chapter when you want the bigger picture.</p><label className="search-box"><Search size={18}/><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a term, like slice or iterator…" aria-label="Search glossary"/><kbd>{filteredGlossary.length}</kbd></label><div className="glossary-list">{filteredGlossary.map(item => <article className="glossary-item" key={item.term}><div><h3>{item.term}</h3><p>{item.definition}</p></div><button className="icon-button" aria-label={`Study ${item.term}`} onClick={() => selectChapter(item.chapterId)}><ArrowUpRight size={18}/></button></article>)}{filteredGlossary.length === 0 && <div className="no-results"><Search size={24}/><h3>No matching terms.</h3><p>Try “bytes,” “copy,” or “iteration.”</p><button className="text-button" onClick={() => setQuery('')}>Clear search</button></div>}</div></section>}
          {view === 'resources' && <section className="directory-view entry"><div className="section-kicker"><ExternalLink size={15}/> GOOD COMPANY FOR YOUR PRACTICE</div><h1>Keep these nearby.</h1><p>Browser editors for independent practice, and primary-source references when you want to go deeper. These are preparation resources—not tools to use during your restricted assessment.</p><div className="resource-list">{resources.map((resource, i) => <a className="resource-card" key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer"><span className="resource-icon">{i < 2 ? <Terminal size={22}/> : <BookOpen size={22}/>}</span><div><h3>{resource.title}</h3><p>{resource.description}</p><small>{new URL(resource.url).hostname}</small></div><ArrowUpRight size={18}/></a>)}</div><div className="rules-card"><ShieldCheck size={24}/><div><h3>Preparation stays here.</h3><p>The real assessment is Python-only, 120 minutes, one attempt, and entirely inside CodeSignal. Your invitation forbids AI, web search, external code, external editors, and pasting. Close study tools before starting. Check your invitation for the exact deadline and proctoring requirements.</p></div></div></section>}
        </main>
        <ReferenceDesk chapter={chapter} language={progress.language} setLanguage={language => setProgress(p => ({ ...p, language }))} notify={setToast} go={go} independent={independent} setIndependent={setIndependent}/>
        </div><div className="site-footer"><span><Coffee size={13}/> Made for a fresh start, not a shortcut.</span><span>Local progress · No account · No AI connection</span></div>
      </div>
    </div>
    {toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}<button className="icon-button" onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
    {confirmation && <Confirmation request={confirmation} close={() => setConfirmation(null)}/>}
  </div>;
}
