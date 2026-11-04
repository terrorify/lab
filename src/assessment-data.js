import practice from './practice';

export const assessmentSources = [
  { title: 'Preparation and research rules', url: 'https://support.codesignal.com/hc/en-us/articles/360040370993-How-do-I-prepare-for-this-coding-assessment-Am-I-allowed-to-use-Google-to-help-me-research', description: 'General GCA syntax-search guidance; your invitation is stricter and forbids web search.' },
  { title: 'How to practice on CodeSignal', url: 'https://support.codesignal.com/hc/en-us/articles/21025134150423-How-do-I-practice-coding-questions-on-CodeSignal', description: 'Find Assessment Practice, navigate question types, and understand its practice timer and reset behavior.' },
  { title: 'GCA rules and setup', url: 'https://support.codesignal.com/hc/en-us/articles/360051960134-General-Coding-Assessment-GCA-Rules-and-Setup', description: 'General setup, identity checks, timer and submission guidance—not proof that your custom assessment is the GCA.' },
  { title: 'Understanding Assessment Score', url: 'https://support.codesignal.com/hc/en-us/articles/13408542717079-Understanding-Assessment-Score', description: 'Certified 200–600 scoring, module base/bonus points, and developmental skill feedback. No conversion from local test percentages.' },
];

export const codeSignalChapter = {
  id: 'codesignal', title: 'Your CodeSignal field guide', subtitle: 'The rules, the platform & an independent rehearsal', group: 'Bonus · assessment preparation', minutes: 25, bonus: true,
  intro: 'A dedicated guide to your invitation and the four official CodeSignal articles you supplied. The fellowship exercise is a custom Python debugging assessment; nothing in the email establishes that it is the standard General Coding Assessment (GCA). Read this guide before the real session, never during it.',
  sections: [
    { title: 'Your invitation is the controlling contract', body: 'The email specifies Python only, one broken algorithm to repair against a specification, up to 120 minutes, and one real attempt with no retakes. Read and run the provided unittest tests early and often; they resolve ambiguous requirements. You are graded on the number passing. Code style is not graded; execution speed matters only where explicitly stated. The email states no minimum score for consideration. The stated deadline is November 16, 2026; use your invitation for the exact cutoff and timezone.' },
    { title: 'Keep generic GCA rules separate', body: 'The general GCA articles permit syntax-reference searches, normally specify 70 minutes unless a company changes the duration, and describe retaining the highest-scoring submission for a question. Your email instead forbids all web search, AI assistance, external libraries/code, and external editors; it requires typing entirely inside CodeSignal and warns that pasting external code is flagged. It does not state whether a best or last intermediate submission is retained. Check the actual assessment instructions for that behavior—do not assume the GCA policy applies.' },
    { title: 'Practice the actual interface before test day', body: 'Sign into your CodeSignal Developer account, open Assessments, and use Assessment Practice or the direct practice link below. A pending invitation may show “Get familiar with the platform.” Use Question Type Summary to switch types. CodeSignal says companies do not see this practice activity or performance. Its practice session offers one hour, then Continue resets that hour; practice code resets every two weeks. The article says there is currently one practice question per question type, and Submit does not advance to another. This familiarizes you with the interface, not the confidential assessment algorithm.' },
    { title: 'Rehearse the setup, not just the algorithm', body: 'Before starting, check stable internet, machine compatibility, webcam, microphone, and government-issued photo ID. Use the name on your ID and a comfortably sized screen. The general GCA setup guide says its timer starts after setup is complete and its rules can be revisited in the IDE menu; read the actual rules shown for your invitation. This site does not collect identity documents or simulate proctoring. Your email says there are no retakes for technical issues on your end.' },
    { title: 'Understand the score you can actually measure', body: 'Your email’s stated metric is passing unit tests. The local practice room therefore reports passed / total and a percentage, with no style penalty or speed bonus. CodeSignal’s certified Assessment Score is different: 200–600, with relatively equal module base points and additional bonuses for fully solved modules based on their calibrated properties. Skill proficiency labels—Developing, Intermediate, Advanced, Expert—are separate, developmental feedback. We cannot infer an official Assessment Score, percentile, pass cutoff, or fellowship outcome from these local exercises.' },
    { title: 'Use fresh attempts as practice—not as retakes', body: 'The practice room offers three original debugging exercises. Each attempt starts from broken code and defaults to 120 minutes; shorter drills are clearly labeled alternatives. The clock continues across navigation and reloads. You can inspect the visible tests and run them repeatedly. Finish attempt, or reaching the deadline, freezes the current draft and grades that exact snapshot. The final score and the best intermediate check are displayed separately: this is an explicit local policy, not a claim about your assessment. Solutions and this site’s reference desk are hidden while an attempt is active. New local attempts are unlimited; the real assessment remains one attempt only.' },
  ],
  sources: assessmentSources,
};

export const assessmentExercises = [
  {
    id: 'interval-merger', topic: 'Sorting · boundaries · non-mutation',
    ...practice('Repair the interval merger', 'merge_ranges(ranges) accepts a list of (start, end) integer tuples representing closed intervals, with start <= end guaranteed. Return a new list of sorted, disjoint tuples. Merge intervals when they overlap, including a shared endpoint; do NOT merge intervals separated by a gap, even a gap of 1. Preserve the furthest end for contained intervals. Empty input returns []. Do not mutate the input. Only these valid inputs are tested.',
`def merge_ranges(ranges):
    ranges.sort()
    start, end = ranges[0]
    result = []
    for left, right in ranges[1:]:
        if left < end:
            end = right
        else:
            result.append((start, end))
            start, end = left, right
    return result`,
`def merge_ranges(ranges):
    if not ranges:
        return []
    ordered = sorted(ranges)
    start, end = ordered[0]
    result = []
    for left, right in ordered[1:]:
        if left <= end:
            end = max(end, right)
        else:
            result.append((start, end))
            start, end = left, right
    result.append((start, end))
    return result`, [
      ['empty', 'self.assertEqual(merge_ranges([]), [])'],
      ['one', 'self.assertEqual(merge_ranges([(2, 5)]), [(2, 5)])'],
      ['overlap', 'self.assertEqual(merge_ranges([(1, 4), (3, 8)]), [(1, 8)])'],
      ['shared_endpoint', 'self.assertEqual(merge_ranges([(1, 3), (3, 5)]), [(1, 5)])'],
      ['gap', 'self.assertEqual(merge_ranges([(1, 2), (3, 4)]), [(1, 2), (3, 4)])'],
      ['contained', 'self.assertEqual(merge_ranges([(1, 10), (2, 3), (4, 5)]), [(1, 10)])'],
      ['unsorted_chain', 'self.assertEqual(merge_ranges([(6, 9), (1, 4), (3, 7)]), [(1, 9)])'],
      ['negative', 'self.assertEqual(merge_ranges([(-5, -2), (-3, 0)]), [(-5, 0)])'],
      ['points_and_duplicates', 'self.assertEqual(merge_ranges([(2, 2), (2, 2), (5, 5)]), [(2, 2), (5, 5)])'],
      ['input_preserved', 'ranges = [(5, 7), (1, 2)]\nmerge_ranges(ranges)\nself.assertEqual(ranges, [(5, 7), (1, 2)])'],
    ]),
  },
  {
    id: 'record-buffer', topic: 'UTF-8 · bytes · streaming state',
    ...practice('Repair the UTF-8 record buffer', 'RecordBuffer.feed(chunk) accepts bytes from a valid UTF-8 stream, returns every complete newline-delimited record as str, and buffers the unfinished tail. Bytes for a character can cross feed calls. A newline is exactly byte 0x0A; remove only that delimiter. Preserve spaces and carriage returns, and include empty records between delimiters. finish() returns the remaining tail as one decoded record if nonempty, otherwise []; then clears the buffer. Complete input at finish is guaranteed valid UTF-8. Instances must be independent. Repeated finish() returns [] and reuse after finish is allowed. No malformed UTF-8 is tested.',
`class RecordBuffer:
    pending = ""

    def feed(self, chunk):
        text = chunk.decode("utf-8")
        records = (self.pending + text).split("\\n")
        self.pending = ""
        return [record.strip() for record in records if record]

    def finish(self):
        return [self.pending]`,
`class RecordBuffer:
    def __init__(self):
        self.pending = b""

    def feed(self, chunk):
        parts = (self.pending + chunk).split(b"\\n")
        self.pending = parts[-1]
        return [part.decode("utf-8") for part in parts[:-1]]

    def finish(self):
        tail = self.pending
        self.pending = b""
        return [tail.decode("utf-8")] if tail else []`, [
      ['complete_record', 'buffer = RecordBuffer()\nself.assertEqual(buffer.feed(b"tea\\n"), ["tea"])'],
      ['partial_record', 'buffer = RecordBuffer()\nself.assertEqual(buffer.feed(b"te"), [])\nself.assertEqual(buffer.feed(b"a\\n"), ["tea"])'],
      ['multiple_records', 'buffer = RecordBuffer()\nself.assertEqual(buffer.feed(b"a\\nb\\nc"), ["a", "b"])\nself.assertEqual(buffer.finish(), ["c"])'],
      ['empty_records', 'self.assertEqual(RecordBuffer().feed(b"\\n\\n"), ["", ""])'],
      ['spaces', 'self.assertEqual(RecordBuffer().feed(b" a \\n"), [" a "])'],
      ['carriage_return', 'self.assertEqual(RecordBuffer().feed(b"tea\\r\\n"), ["tea\\r"])'],
      ['split_utf8', 'buffer = RecordBuffer()\nraw = "café\\n".encode("utf-8")\nself.assertEqual(buffer.feed(raw[:4]), [])\nself.assertEqual(buffer.feed(raw[4:]), ["café"])'],
      ['split_four_byte_character', 'buffer = RecordBuffer()\nraw = "A\\U0001f600B".encode("utf-8")\nself.assertEqual(buffer.feed(raw[:3]), [])\nself.assertEqual(buffer.feed(raw[3:]), [])\nself.assertEqual(buffer.finish(), ["A\\U0001f600B"])'],
      ['empty_feed', 'buffer = RecordBuffer()\nbuffer.feed(b"x")\nself.assertEqual(buffer.feed(b""), [])\nself.assertEqual(buffer.finish(), ["x"])'],
      ['empty_finish', 'self.assertEqual(RecordBuffer().finish(), [])'],
      ['finish_clears_and_reuses', 'buffer = RecordBuffer()\nbuffer.feed(b"a")\nself.assertEqual(buffer.finish(), ["a"])\nself.assertEqual(buffer.finish(), [])\nself.assertEqual(buffer.feed(b"b\\n"), ["b"])'],
      ['independent_instances', 'a, b = RecordBuffer(), RecordBuffer()\na.feed(b"first")\nb.feed(b"second")\nself.assertEqual(a.finish(), ["first"])\nself.assertEqual(b.finish(), ["second"])'],
    ]),
  },
  {
    id: 'window-counter', topic: 'Dictionaries · queues · state ownership',
    ...practice('Repair the sliding frequency counter', 'WindowCounter(size) tracks counts in the most recent size values. size is a positive integer. push(value) accepts a string, evicts the oldest value when necessary, and returns a new dictionary snapshot of counts in the current window. snapshot() also returns a new dictionary. Omit zero-count keys; preserve case exactly. Instances and returned snapshots must be independent. No other inputs are tested. Performance is not graded in this exercise.',
`class WindowCounter:
    values = []
    counts = {}

    def __init__(self, size):
        self.size = size

    def push(self, value):
        self.values.append(value)
        self.counts[value] = 1
        if len(self.values) >= self.size:
            old = self.values.pop()
            self.counts.pop(old, None)
        return self.counts

    def snapshot(self):
        return self.counts`,
`class WindowCounter:
    def __init__(self, size):
        self.size = size
        self.values = []
        self.counts = {}

    def push(self, value):
        self.values.append(value)
        self.counts[value] = self.counts.get(value, 0) + 1
        if len(self.values) > self.size:
            old = self.values.pop(0)
            self.counts[old] -= 1
            if self.counts[old] == 0:
                del self.counts[old]
        return self.snapshot()

    def snapshot(self):
        return self.counts.copy()`, [
      ['empty', 'self.assertEqual(WindowCounter(3).snapshot(), {})'],
      ['first', 'self.assertEqual(WindowCounter(3).push("tea"), {"tea": 1})'],
      ['full_capacity', 'counter = WindowCounter(2)\ncounter.push("a")\nself.assertEqual(counter.push("b"), {"a": 1, "b": 1})'],
      ['evicts_oldest', 'counter = WindowCounter(2)\ncounter.push("a")\ncounter.push("b")\nself.assertEqual(counter.push("c"), {"b": 1, "c": 1})'],
      ['repeated_values', 'counter = WindowCounter(3)\ncounter.push("a")\nself.assertEqual(counter.push("a"), {"a": 2})'],
      ['decrements_not_deletes', 'counter = WindowCounter(3)\nfor value in ["a", "a", "b"]:\n    counter.push(value)\nself.assertEqual(counter.push("c"), {"a": 1, "b": 1, "c": 1})'],
      ['same_value_evicted', 'counter = WindowCounter(2)\ncounter.push("x")\ncounter.push("x")\nself.assertEqual(counter.push("x"), {"x": 2})'],
      ['size_one', 'counter = WindowCounter(1)\nself.assertEqual(counter.push("a"), {"a": 1})\nself.assertEqual(counter.push("b"), {"b": 1})'],
      ['snapshot_ownership', 'counter = WindowCounter(3)\nfirst = counter.push("a")\nfirst["a"] = 99\nview = counter.snapshot()\nview["b"] = 10\nself.assertEqual(counter.snapshot(), {"a": 1})'],
      ['independent_instances', 'a, b = WindowCounter(2), WindowCounter(2)\na.push("a")\nb.push("b")\nself.assertEqual(a.snapshot(), {"a": 1})\nself.assertEqual(b.snapshot(), {"b": 1})'],
      ['case_preserved', 'counter = WindowCounter(3)\ncounter.push("A")\nself.assertEqual(counter.push("a"), {"A": 1, "a": 1})'],
    ]),
  },
];
