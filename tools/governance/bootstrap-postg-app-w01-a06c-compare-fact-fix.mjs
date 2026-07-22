import fs from 'node:fs';

const runtimePath = 'src/curriculum/application/w01-relation-surface-remediation-runtime.mjs';
let source = fs.readFileSync(runtimePath, 'utf8');
let changed = false;

function replaceExactlyOnce(oldText, newText, code) {
  if (source.includes(newText)) return;
  const first = source.indexOf(oldText);
  const second = first < 0 ? -1 : source.indexOf(oldText, first + oldText.length);
  if (first < 0 || second >= 0) {
    throw new Error(JSON.stringify({ code, first, second }));
  }
  source = source.replace(oldText, newText);
  changed = true;
}

replaceExactlyOnce(
  `function numberMultisetEqual(left, right) {
  return JSON.stringify(canonicalNumberMultiset(left)) === JSON.stringify(canonicalNumberMultiset(right));
}`,
  `function canonicalNumberFacts(semanticClass, text) {
  const values = canonicalNumberMultiset(text);
  return semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE'
    ? [...new Set(values)]
    : values;
}

function numberFactMultisetEqual(semanticClass, left, right) {
  return JSON.stringify(canonicalNumberFacts(semanticClass, left))
    === JSON.stringify(canonicalNumberFacts(semanticClass, right));
}`,
  'POSTG_APP_W01_A06C_NUMBER_FACT_FUNCTION_ANCHOR_INVALID'
);

replaceExactlyOnce(
  `    numberMultisetPreserved: numberMultisetEqual(originalPrompt, surface.promptText),`,
  `    numberMultisetPreserved: numberFactMultisetEqual(
      descriptor.semanticClass,
      originalPrompt,
      surface.promptText
    ),`,
  'POSTG_APP_W01_A06C_NUMBER_FACT_CONSUMER_ANCHOR_INVALID'
);

if (changed) fs.writeFileSync(runtimePath, source, 'utf8');

console.log(JSON.stringify({
  status: changed
    ? 'POSTG_APP_W01_A06C_COMPARE_SEMANTIC_FACT_FIX_BOOTSTRAPPED'
    : 'POSTG_APP_W01_A06C_COMPARE_SEMANTIC_FACT_FIX_ALREADY_ALIGNED',
  changed,
  semanticFactFunctionAligned: source.includes('function numberFactMultisetEqual(semanticClass, left, right)'),
  semanticFactConsumerAligned: source.includes('numberFactMultisetEqual(\n      descriptor.semanticClass')
}, null, 2));
