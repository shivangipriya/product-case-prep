'use strict';
// Tests the question-type classifier and outline completeness, matching the
// README's Testing section: design/improvement/metrics/strategy phrasings,
// the overlap case, the general fallback, and outline completeness.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const prefix = script.slice(0, script.indexOf('// ===PARSE-END==='));
const { classifyCase, CASE_TYPES, GENERAL } = new Function(prefix + '; return { classifyCase, CASE_TYPES, GENERAL };')();

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}

check('design phrasing classifies as design', classifyCase('Design an app for elderly people to order groceries').tag === 'design');
check('design phrasing with "for" classifies as design', classifyCase('Design a tool for first-time investors').tag === 'design');
check('metrics phrasing classifies as metrics', classifyCase('What metrics would you track for this feature?').tag === 'metrics');
check('overlap: measuring a redesign classifies as metrics, not design', classifyCase('How would you measure the success of a checkout redesign?').tag === 'metrics');
check('improvement phrasing classifies as improve', classifyCase('How would you improve Instagram Reels?').tag === 'improve');
check('strategy phrasing classifies as strategy', classifyCase('Should Netflix enter the gaming market?').tag === 'strategy');
check('non-case question falls back to general', classifyCase('Tell me about a time you disagreed with a teammate').tag === 'general');
check('general fallback is the GENERAL outline object', classifyCase('Why do you want this job?') === GENERAL);

for (const t of CASE_TYPES.concat([GENERAL])) {
  check(t.tag + ': ships clarifying questions', Array.isArray(t.clarify) && t.clarify.length >= 1 && t.clarify.every((q) => typeof q === 'string' && q.length > 0));
  check(t.tag + ': ships at least four sections', Array.isArray(t.sections) && t.sections.length >= 4);
  check(t.tag + ': every section has a head and hints', t.sections.every((s) => s.head && Array.isArray(s.hints) && s.hints.length >= 1));
}

console.log('\n' + (pass + fail) + ' cases, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
