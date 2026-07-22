import fs from 'node:fs';

const runtimePath = 'src/curriculum/application/w01-relation-surface-remediation-runtime.mjs';
const testPath = 'tests/curriculum/postg-app-w01-a06c-relation-surfaces.test.js';

function replaceExactlyOnce(source, oldText, newText, code) {
  if (source.includes(newText)) return { source, changed: false };
  const first = source.indexOf(oldText);
  const second = first < 0 ? -1 : source.indexOf(oldText, first + oldText.length);
  if (first < 0 || second >= 0) {
    throw new Error(JSON.stringify({ code, first, second }));
  }
  return {
    source: source.replace(oldText, newText),
    changed: true
  };
}

let runtime = fs.readFileSync(runtimePath, 'utf8');
let runtimeChanged = false;

const spacingPatch = replaceExactlyOnce(
  runtime,
  `  return output
    .replace(/\\s+([，。？！：；])/gu, '$1')`,
  `  return output
    .replace(/(\\d)\\s+(?=[\\u4e00-\\u9fff])/gu, '$1')
    .replace(/\\s+([，。？！：；])/gu, '$1')`,
  'POSTG_APP_W01_A06C_NUMBER_UNIT_SPACING_ANCHOR_INVALID'
);
runtime = spacingPatch.source;
runtimeChanged ||= spacingPatch.changed;

const promptAuthorityPatch = replaceExactlyOnce(
  runtime,
  `  const originalPrompt = normalizePrompt(a05Row.originalPrompt, policy);`,
  `  const originalPrompt = normalizePrompt(
    descriptor.reviewPair?.originalPrompt ?? a05Row.originalPrompt,
    policy
  );`,
  'POSTG_APP_W01_A06C_PROMPT_AUTHORITY_ANCHOR_INVALID'
);
runtime = promptAuthorityPatch.source;
runtimeChanged ||= promptAuthorityPatch.changed;

if (runtimeChanged) fs.writeFileSync(runtimePath, runtime, 'utf8');

let tests = fs.readFileSync(testPath, 'utf8');
let testChanged = false;
const replacements = [
  ['kp_g4b_u02_floor_complete_groups', 'kp_g4b_u04_context_floor_ceiling_selection'],
  ['kp_g3b_u08_total_daily_saving', 'kp_g3b_u08_total_from_groups'],
  ['kp_g5a_u02_equal_partition', 'kp_g5a_u02_equal_partition_factor_application'],
  ['kp_g6a_u01_place_value_composition', 'kp_g3a_u01_place_value_composition']
];
for (const [oldId, newId] of replacements) {
  if (tests.includes(newId)) continue;
  const first = tests.indexOf(oldId);
  const second = first < 0 ? -1 : tests.indexOf(oldId, first + oldId.length);
  if (first < 0 || second >= 0) {
    throw new Error(JSON.stringify({
      code: 'POSTG_APP_W01_A06C_TEST_KP_ID_ANCHOR_INVALID',
      oldId,
      first,
      second
    }));
  }
  tests = tests.replace(oldId, newId);
  testChanged = true;
}
if (testChanged) fs.writeFileSync(testPath, tests, 'utf8');

console.log(JSON.stringify({
  status: runtimeChanged || testChanged
    ? 'POSTG_APP_W01_A06C_SURFACE_FIX_BOOTSTRAPPED'
    : 'POSTG_APP_W01_A06C_SURFACE_FIX_ALREADY_ALIGNED',
  runtimeChanged,
  testChanged,
  promptAuthorityAligned: runtime.includes('descriptor.reviewPair?.originalPrompt ?? a05Row.originalPrompt'),
  numberUnitSpacingAligned: runtime.includes(".replace(/(\\d)\\s+(?=[\\u4e00-\\u9fff])/gu, '$1')"),
  knowledgePointIdsAligned: replacements.every(([, newId]) => tests.includes(newId))
}, null, 2));
