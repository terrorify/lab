import { useCallback, useEffect, useRef, useState } from 'react';

export default function usePython() {
  const [status, setStatus] = useState('idle');
  const active = useRef(null);
  const workerRef = useRef(null);
  const nextId = useRef(0);

  const terminate = useCallback((reason, update = true) => {
    workerRef.current?.terminate();
    workerRef.current = null;
    const pending = active.current;
    if (pending) {
      clearTimeout(pending.timer);
      active.current = null;
      pending.reject(new Error(reason));
    }
    if (update) setStatus('idle');
  }, []);

  useEffect(() => () => terminate('Python session closed.', false), [terminate]);

  const run = useCallback(({ code, tests = '' }) => new Promise((resolve, reject) => {
    if (active.current) { reject(new Error('A Python run is already active.')); return; }
    const id = ++nextId.current;
    setStatus(workerRef.current ? 'running' : 'loading');
    const pending = { id, resolve, reject, timer: null };
    active.current = pending;
    const fail = (message) => {
      terminate(message, false);
      setStatus('error');
    };
    pending.timer = setTimeout(() => fail('Python could not load within 90 seconds. Check your connection and try again.'), 90000);
    if (!workerRef.current) {
      const worker = new Worker(`${import.meta.env.BASE_URL}python-worker.js`, { type: 'module' });
      workerRef.current = worker;
      worker.onerror = (event) => fail(event.message || 'Unable to load Python. Check your connection to cdn.jsdelivr.net.');
      worker.onmessage = ({ data }) => {
        const current = active.current;
        if (!current || data.id !== current.id) return;
        if (data.type === 'running') {
          clearTimeout(current.timer);
          setStatus('running');
          current.timer = setTimeout(() => fail('Execution stopped after 12 seconds. Check for an infinite loop or excessive work.'), 12000);
        } else if (data.type === 'result') {
          clearTimeout(current.timer);
          active.current = null;
          setStatus('ready');
          current.resolve(data.result);
        } else if (data.type === 'error') {
          fail(data.message);
        }
      };
    }
    workerRef.current.postMessage({ id, code, tests });
  }), [terminate]);

  const stop = useCallback(() => terminate('Execution stopped. Your code is still saved.'), [terminate]);
  return { status, run, stop };
}
