export default function practice(title, spec, starter, solution, cases) {
  return {
    title, spec, starter, solution, testCount: cases.length,
    tests: 'import unittest\n\nclass TestPractice(unittest.TestCase):\n' + cases.map(([name, body]) => `    def test_${name}(self):\n${body.split('\n').map(line => '        ' + line).join('\n')}\n`).join('\n'),
  };
}
