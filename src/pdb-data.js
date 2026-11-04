export const pdbSource = { title: 'spiside/pdb-tutorial', url: 'https://github.com/spiside/pdb-tutorial', description: 'The requested dice-game tutorial: stepping, breakpoints, command-name collisions, breakpoint command lists, and post-mortem debugging. The guide below is an original summary with new examples.' };

export const pdbSections = [
  { title: 'Start a debugger, not another guessing session', body: 'The spiside tutorial uses a broken dice game to demonstrate inspecting running state, testing a hypothesis, and following execution. Its older Python 2.7/3.4 context is historical; practice with Python 3. Built-in pdb needs no installation. Start with python -m pdb main.py, insert import pdb; pdb.set_trace(), or use breakpoint() on Python 3.7+. The ordinary Workbench is not an interactive terminal. The separate pdb lab runs real debugger commands from an editable script and shows the transcript.', language: 'Terminal · preparation only', code: 'python --version\npython -m pdb main.py\n\n# In Python source instead:\n# import pdb; pdb.set_trace()\n# breakpoint()' },
  { title: 'Learn the tutorial’s five navigation commands', body: 'l lists nearby source; ll shows the current function. s steps into a call; n advances within the current function rather than stepping into that call. b sets a breakpoint; c continues to a stop. r runs until the current function returns. The arrow identifies the line about to execute, not a line already completed. Inspect the returned value rather than assuming an executed function was correct.', language: 'pdb command examples', code: 'l\nll\ns\nn\nb pdb_lab.py:7\nc\nr\np result' },
  { title: 'Inspect before changing state', body: 'Use p expression or pp expression to inspect values, args for arguments, and w (where) for the stack. u and d select older/newer frames without executing the program. A variable called c conflicts with the continue command: use p c to inspect it, or ! to force a Python statement. Statements such as !result = 0 mutate live state; they test a hypothesis but do not repair the source file.', language: 'pdb command examples', code: 'p value\npp locals()\nargs\nw\nu\nd\np c\n!result = 0\nh next' },
  { title: 'Break where the evidence is', body: 'b without arguments lists breakpoints. b filename:line, condition stops only when the condition is true; cl number deletes a breakpoint by its identifier, not its source line. This avoids stepping through every loop iteration. With commands number, enter commands to run at that breakpoint and terminate the list with end. A continue in the command list makes a useful tracepoint; use expressions carefully because they execute in the paused program.', language: 'pdb command examples', code: 'b pdb_lab.py:7, value == 4\nb\nc\np value\ncl 1\n\n# In a fresh debugger, after setting breakpoint 1:\n# commands 1\n# p (value, result)\n# c\n# end' },
  { title: 'Inspect a crash with post-mortem debugging', body: 'The tutorial uses pdb.pm() after an unhandled exception in an interactive Python session; it uses the last traceback recorded by that interpreter. Within an exception handler, pdb.post_mortem() inspects the current exception, or accepts an explicit traceback. Starting a script with python -m pdb also offers post-mortem inspection on an uncaught exception. Post-mortem lets you inspect the failed stack; it does not resume the failed calculation or repair it. Our lab demonstrates the actual exception-frame inspection through a scripted Pdb session.', language: 'Python · interactive terminal', code: 'import pdb\n\ntry:\n    result = 1 / 0\nexcept ZeroDivisionError:\n    pdb.post_mortem()\n\n# In a Python REPL, after an unhandled exception:\n# pdb.pm()' },
  { title: 'A practical workflow from the tutorial', body: 'Reproduce the failure, locate the calculation, inspect the inputs, step into the suspicious helper, and compare its actual return with the contract. Then fix source code and rerun tests from a fresh state. In the original tutorial the dice total counted dice instead of adding their values; our new lab has a different small program with the same category of mistake. Use q to leave the debugger. Open the upstream repository for its full dice-game exercise and solutions before your restricted assessment; do not bring external code into that assessment.', language: 'Independent preparation', code: '# Optional terminal practice with the original repository:\n# git clone https://github.com/spiside/pdb-tutorial\n# cd pdb-tutorial\n# python -m pdb main.py\n# Follow README.md; line numbers differ from this site’s lab.' },
];

export const pdbCommands = [
  ['l / ll', 'List nearby source / the current function.'],
  ['s', 'Step into the next call.'], ['n', 'Step over a call in the current frame.'],
  ['r', 'Run until this function returns.'], ['c', 'Continue until a breakpoint or other stop.'],
  ['b file:line, condition', 'Set a breakpoint, optionally conditional.'], ['b / cl 1', 'List breakpoints / clear breakpoint number 1.'],
  ['p / pp expression', 'Inspect an expression / pretty-print it.'], ['args', 'Inspect arguments in the selected frame.'],
  ['w / u / d', 'Show stack / select older / select newer frame.'], ['!statement', 'Execute a Python statement; may change state.'],
  ['commands 1 … end', 'Attach a command list to breakpoint 1.'], ['h command', 'Ask pdb for command help.'], ['q', 'Quit the debugger.'],
];

export const pdbProgram = `def contribution(value):
    return 1

def total(values):
    result = 0
    for value in values:
        result += contribution(value)
    return result

dice = [2, 4, 6]
answer = total(dice)
print("Observed total:", answer)
`;
export const postMortemProgram = `def average(values):
    return sum(values) / len(values)

def run_demo():
    values = []
    return average(values)

run_demo()
`;
export const pdbPresets = [
  { id: 'step', title: 'Step inside the helper', mode: 'step', commands: 'b 7\nc\np (value, result)\ns\nargs\nr\np __return__\nw\nq', goal: 'Find a helper returning 1 for an input of 2. The source arrow marks the next line; r reveals the return value.' },
  { id: 'next', title: 'Step over the helper', mode: 'step', commands: 'b 7\nc\np (value, result)\nn\np result\nq', goal: 'Contrast n with s. The helper runs without entering its frame, and result becomes 1.' },
  { id: 'conditional', title: 'Stop on the second value', mode: 'step', commands: 'b 7, value == 4\nb\nc\np (value, result)\ncl 1\nc', goal: 'Skip the first iteration, inspect value 4, clear the breakpoint, and finish. The broken total is 3; the repaired total is 12.' },
  { id: 'commands', title: 'Trace each iteration', mode: 'step', commands: 'b 7\ncommands 1\np (value, result)\nc\nend\nc', goal: 'A real breakpoint command list prints the value and running total before each addition, then continues.' },
  { id: 'postmortem', title: 'Inspect the failed stack', mode: 'postmortem', commands: 'w\np values\np len(values)\nu\nargs\np values\nq', goal: 'Investigate an actual ZeroDivisionError. Move from average to its caller and inspect the empty input; this does not resume the failed program.' },
];

export function buildPdbScript(commands, mode = 'step', repaired = false) {
  const source = mode === 'postmortem' ? postMortemProgram : repaired ? pdbProgram.replace('return 1', 'return value') : pdbProgram;
  return `import pdb as _pdb\nimport io as _io\nimport linecache as _linecache\nimport sys as _sys\nimport tempfile as _tempfile\n\n_source = ` + JSON.stringify(source) + `\n_commands = ` + JSON.stringify(commands + '\nq\n') + `\n_file = _tempfile.NamedTemporaryFile('w', suffix='.py', delete=False)\n_filename = _file.name\n_file.write(_source)\n_file.flush()\n_file.close()\n_linecache.cache[_filename] = (len(_source), None, _source.splitlines(True), _filename)\n_program = compile(_source, _filename, 'exec')\n_namespace = {'__name__': 'pdb_lab'}\n_debugger = _pdb.Pdb(stdin=_io.StringIO(_commands), stdout=_sys.stdout, nosigint=True)\n_debugger.use_rawinput = False\ntry:\n` + (mode === 'postmortem' ? `    try:\n        exec(_program, _namespace, _namespace)\n    except Exception as error:\n        print(type(error).__name__ + ": " + str(error))\n        _debugger.reset()\n        _debugger.interaction(None, error.__traceback__)\n` : `    _debugger.run(_program, _namespace, _namespace)\n`) + `finally:\n    _sys.settrace(None)\n    _debugger.clear_all_breaks()\n    _linecache.cache.pop(_filename, None)\n`;
}
