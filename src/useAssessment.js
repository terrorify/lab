import { useCallback, useEffect, useRef, useState } from 'react';
import usePython from './usePython';
import { assessmentExercises } from './assessment-data';

const STORAGE = 'python-study-cafe:attempts:v1';
const exerciseFor = id => assessmentExercises.find(exercise => exercise.id === id);
const fresh = () => ({ active: null, history: [] });
function validAttempt(attempt) {
  return attempt && typeof attempt.id === 'string' && exerciseFor(attempt.exerciseId) && typeof attempt.code === 'string'
    && Number.isFinite(attempt.startedAt) && Number.isFinite(attempt.deadlineAt) && attempt.deadlineAt > attempt.startedAt;
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (!saved) return fresh();
    return { active: validAttempt(saved.active) ? saved.active : null, history: Array.isArray(saved.history) ? saved.history.filter(validAttempt) : [] };
  } catch { return fresh(); }
}
function gradedResult(result, exercise) {
  // Syntax/runtime errors before discovery mean none of the fixed test suite passed.
  if (result.error) return { ...result, passed: 0, total: exercise.testCount };
  if (result.total !== exercise.testCount) throw new Error('The full test suite did not complete. Retry grading the frozen submission.');
  return result;
}

export default function useAssessment() {
  const [store, setStore] = useState(load);
  const [now, setNow] = useState(Date.now);
  const [storageError, setStorageError] = useState(false);
  const [checkError, setCheckError] = useState('');
  const { run, stop, status } = usePython();
  const current = useRef(store.active);
  current.current = store.active;
  const sequence = useRef(0);
  const working = useRef(false);
  useEffect(() => () => { sequence.current++; }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(store)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [store]);

  const finish = useCallback((reason = 'submitted') => {
    const attempt = current.current;
    if (!attempt || attempt.submittedAt) return;
    const ended = Date.now();
    const expired = ended >= attempt.deadlineAt;
    sequence.current++;
    working.current = false;
    stop();
    setCheckError('');
    setStore(previous => previous.active?.id !== attempt.id || previous.active.submittedAt ? previous : {
      ...previous,
      active: { ...previous.active, submittedAt: expired ? attempt.deadlineAt : ended, reason: expired ? 'expired' : reason, gradingError: null },
    });
  }, [stop]);

  useEffect(() => {
    if (!store.active || store.active.submittedAt) return;
    const tick = () => {
      const time = Date.now(); setNow(time);
      if (current.current && time >= current.current.deadlineAt) finish('expired');
    };
    tick();
    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [store.active?.id, store.active?.deadlineAt, store.active?.submittedAt, finish]);

  useEffect(() => {
    const attempt = store.active;
    if (!attempt?.submittedAt || attempt.gradingError) return;
    const token = ++sequence.current;
    working.current = true;
    const exercise = exerciseFor(attempt.exerciseId);
    run({ code: attempt.code, tests: exercise.tests }).then(output => {
      const result = gradedResult(output, exercise);
      if (sequence.current !== token) return;
      setStore(previous => previous.active?.id !== attempt.id ? previous : {
        active: null,
        history: [{ ...previous.active, result, gradedAt: Date.now(), gradingError: null }, ...previous.history],
      });
    }).catch(error => {
      if (sequence.current !== token) return;
      setStore(previous => previous.active?.id !== attempt.id ? previous : { ...previous, active: { ...previous.active, gradingError: error.message } });
    }).finally(() => { if (sequence.current === token) working.current = false; });
  }, [store.active?.id, store.active?.submittedAt, store.active?.gradingError, run]);

  function start(exerciseId, minutes) {
    if (current.current || !exerciseFor(exerciseId) || ![15, 30, 120].includes(minutes)) return;
    const startedAt = Date.now();
    stop(); setNow(startedAt); setCheckError('');
    setStore(previous => ({ ...previous, active: {
      id: crypto.randomUUID(), exerciseId, durationMinutes: minutes, startedAt,
      deadlineAt: startedAt + minutes * 60000, code: exerciseFor(exerciseId).starter,
      submittedAt: null, reason: null, gradingError: null, checkCount: 0, bestPassed: 0, lastCheck: null,
    } }));
  }
  function edit(code) {
    const attempt = current.current;
    if (!attempt || attempt.submittedAt) return;
    if (Date.now() >= attempt.deadlineAt) { finish('expired'); return; }
    setStore(previous => previous.active?.id !== attempt.id || previous.active.submittedAt ? previous : { ...previous, active: { ...previous.active, code } });
  }
  async function check() {
    const attempt = current.current;
    if (!attempt || attempt.submittedAt || working.current) return;
    if (Date.now() >= attempt.deadlineAt) { finish('expired'); return; }
    const token = ++sequence.current;
    working.current = true; setCheckError('');
    const exercise = exerciseFor(attempt.exerciseId);
    try {
      const result = gradedResult(await run({ code: attempt.code, tests: exercise.tests }), exercise);
      if (sequence.current !== token) return;
      if (Date.now() >= attempt.deadlineAt) { finish('expired'); return; }
      setStore(previous => previous.active?.id !== attempt.id || previous.active.submittedAt ? previous : {
        ...previous,
        active: { ...previous.active, checkCount: previous.active.checkCount + 1,
          bestPassed: Math.max(previous.active.bestPassed, result.passed),
          lastCheck: { code: attempt.code, result, at: Date.now() } },
      });
    } catch (error) { if (sequence.current === token) setCheckError(error.message); }
    finally { if (sequence.current === token) working.current = false; }
  }
  function stopCheck() {
    if (current.current?.submittedAt) return;
    sequence.current++; working.current = false; stop();
    setCheckError('Check stopped. The attempt clock continues; your draft is unchanged.');
  }
  function retryGrading() {
    if (!current.current?.submittedAt || !current.current.gradingError) return;
    setStore(previous => ({ ...previous, active: { ...previous.active, gradingError: null } }));
  }
  function clearHistory() { if (!current.current) setStore(fresh()); }
  return {
    active: store.active, history: store.history, start, edit, check, finish, stopCheck, retryGrading, clearHistory,
    status, checkError, storageError,
    remaining: store.active ? Math.max(0, store.active.deadlineAt - now) : 0,
  };
}
