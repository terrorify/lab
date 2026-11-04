import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs';

const runtime = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });

// The grader lives outside the student's module; code is for local practice, not trusted scoring.
const harness = String.raw`
import contextlib as _contextlib
import io as _io
import json as _json
import sys as _sys
import traceback as _traceback
import types as _types
import unittest as _unittest

class _LimitedOutput(_io.StringIO):
    def __init__(self):
        super().__init__()
        self.remaining = 16000
        self.truncated = False
    def write(self, text):
        size = len(text)
        if self.remaining > 0:
            super().write(text[:self.remaining])
            self.remaining -= min(size, self.remaining)
        if size > 0 and self.remaining == 0 and not self.truncated:
            super().write('\n[Output limited to 16,000 characters]\n')
            self.truncated = True
        return size

class _Results(_unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.failed_subtests = set()
    def addSuccess(self, test):
        super().addSuccess(test)
        if test.id() not in self.failed_subtests:
            self.rows.append({'name': test.id(), 'passed': True, 'detail': ''})
    def _failure(self, test, err):
        name = test.id()
        detail = self._exc_info_to_string(err, test)[-6000:]
        existing = next((row for row in self.rows if row['name'] == name), None)
        if existing is None:
            self.rows.append({'name': name, 'passed': False, 'detail': detail})
        else:
            existing['passed'] = False
            existing['detail'] = (existing['detail'] + '\n' + detail)[-6000:]
    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._failure(test, err)
    def addError(self, test, err):
        super().addError(test, err)
        self._failure(test, err)
    def addSubTest(self, test, subtest, err):
        super().addSubTest(test, subtest, err)
        if err is not None:
            self.failed_subtests.add(test.id())
            self._failure(test, err)
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self.rows.append({'name': test.id(), 'passed': False, 'detail': 'Skipped: ' + reason})
    def addExpectedFailure(self, test, err):
        super().addExpectedFailure(test, err)
        self._failure(test, err)
    def addUnexpectedSuccess(self, test):
        super().addUnexpectedSuccess(test)
        self.rows.append({'name': test.id(), 'passed': False, 'detail': 'Unexpected success of a test marked expectedFailure.'})

_out, _err = _LimitedOutput(), _LimitedOutput()
_result = {'stdout': '', 'stderr': '', 'passed': 0, 'total': 0, 'tests': []}
_module = _types.ModuleType('cafe_practice')
_sys.modules['cafe_practice'] = _module
try:
    with _contextlib.redirect_stdout(_out), _contextlib.redirect_stderr(_err):
        exec(compile(_student_source, 'practice.py', 'exec'), _module.__dict__)
        if _test_source.strip():
            exec(compile(_test_source, 'test_practice.py', 'exec'), _module.__dict__)
            _suite = _unittest.defaultTestLoader.loadTestsFromModule(_module)
            _expected = _suite.countTestCases()
            _collector = _Results()
            _suite.run(_collector)
            _result['tests'] = _collector.rows
            _result['total'] = max(_expected, len(_collector.rows))
            _result['passed'] = sum(row['passed'] for row in _collector.rows)
            if not _expected:
                _result['error'] = 'No unittest tests discovered. Define a unittest.TestCase with test_ methods.'
except BaseException:
    _result['error'] = _traceback.format_exc()[-8000:]
finally:
    _sys.modules.pop('cafe_practice', None)
_result['stdout'] = _out.getvalue()
_result['stderr'] = _err.getvalue()
_json.dumps(_result)
`;

self.onmessage = async ({ data: { id, code, tests } }) => {
  let globals;
  let dict;
  try {
    const py = await runtime;
    self.postMessage({ id, type: 'running' });
    dict = py.globals.get('dict');
    globals = dict();
    globals.set('_student_source', code);
    globals.set('_test_source', tests || '');
    const serialized = await py.runPythonAsync(harness, { globals });
    self.postMessage({ id, type: 'result', result: JSON.parse(serialized) });
  } catch (error) {
    self.postMessage({ id, type: 'error', message: error.message || String(error) });
  } finally {
    globals?.destroy();
    dict?.destroy();
  }
};
