export default function practice(title, spec, starter, solution, cases) {
  const caseEntries = cases.map(c => {
    const [name, body, why, mend] = c;
    return { name, body, why: why || '', mend: mend || '' };
  });

  const diagnostics = {};
  for (const c of caseEntries) {
    if (c.why || c.mend) {
      diagnostics[`test_${c.name}`] = { why: c.why, mend: c.mend };
    }
  }

  return {
    title,
    spec,
    starter,
    solution,
    testCount: caseEntries.length,
    diagnostics,
    tests:
      'import unittest\n\nclass TestPractice(unittest.TestCase):\n' +
      caseEntries
        .map(
          c =>
            `    def test_${c.name}(self):\n${c.body
              .split('\n')
              .map(line => '        ' + line)
              .join('\n')}\n`
        )
        .join('\n'),
  };
}
