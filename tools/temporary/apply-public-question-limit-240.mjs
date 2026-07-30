import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(repoRoot, relativePath), content);
}

function replaceExact(relativePath, from, to, expectedCount = 1) {
  const original = read(relativePath);
  const count = original.split(from).length - 1;
  if (count !== expectedCount) {
    throw new Error(`${relativePath}: expected ${expectedCount} occurrence(s), found ${count}: ${from}`);
  }
  write(relativePath, original.replaceAll(from, to));
}

for (const relativePath of ["site/index.html", "site/404.html"]) {
  replaceExact(
    relativePath,
    'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="20" value="20"',
    'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="240" value="20"',
  );
}

replaceExact(
  "site/pixel/index.html",
  'id="pixel-question-count" type="number" min="1" max="20" value="20"',
  'id="pixel-question-count" type="number" min="1" max="240" value="20"',
);

replaceExact(
  "site/assets/browser/state/config-state-core.js",
  "questionCount: positiveInteger(options.questionCount ?? config?.generation?.questionCount, 20),",
  "questionCount: positiveInteger(options.questionCount ?? config?.generation?.questionCount, 20, 1, 240),",
);
replaceExact(
  "site/assets/browser/state/config-state-core.js",
  "state.batchA.questionCount = positiveInteger(normalizedValue, state.batchA.questionCount);",
  "state.batchA.questionCount = positiveInteger(normalizedValue, state.batchA.questionCount, 1, 240);",
);

replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  "  max: 20,",
  "  max: 240,",
);
replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  `  const verifiedMax = legalRows.length > 0\n    ? Math.min(PUBLIC_UI_SAFE_QUESTION_COUNT.max, ...legalRows.map((row) => row.verifiedMaxQuestionCount))\n    : 0;`,
  `  const routeVerifiedMax = legalRows.length > 0\n    ? Math.min(...legalRows.map((row) => row.verifiedMaxQuestionCount))\n    : 0;\n  const verifiedMax = routeVerifiedMax > 0 ? PUBLIC_UI_SAFE_QUESTION_COUNT.max : 0;`,
);
replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  '      evidence: "PGC_R03_PER_CAPABILITY_VERIFIED_MAX",',
  '      evidence: "PUBLIC_GLOBAL_QUESTION_COUNT_MAX_240",',
);
replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  'capacityStatus: boundedMax === 20 ? "VERIFIED_20" : boundedMax > 0 ? "VERIFIED_LIMITED" : "FAIL_CLOSED_NO_LEGAL_CAPACITY",',
  'capacityStatus: boundedMax === PUBLIC_UI_SAFE_QUESTION_COUNT.max ? "VERIFIED_LIMITED" : boundedMax > 0 ? "VERIFIED_LIMITED" : "FAIL_CLOSED_NO_LEGAL_CAPACITY",',
);

replaceExact(
  "site/assets/browser/public-capability-ui.js",
  ': `已依知識點、題型、形式與控制交集套用 PGC-R03 容量證據；目前上限 ${binding.questionCount.max} 題。`;',
  ': `已套用公開題數上限；目前上限 ${binding.questionCount.max} 題。`;',
);
replaceExact(
  "site/pixel/pixel-public-capability-ui.js",
  ': `已套用 PGC-R03 合法 route 與容量證據；目前上限 ${binding.questionCount.max} 題。`;',
  ': `已套用公開題數上限；目前上限 ${binding.questionCount.max} 題。`;',
);

replaceExact(
  "tests/curriculum/pgc-r03-generator-capacity-contract.test.js",
  "    assert.ok(binding.questionCount.max <= limited[7]);",
  "    assert.equal(binding.questionCount.max, 240);",
);

const focusedTest = `import assert from "node:assert/strict";\nimport fs from "node:fs";\nimport test from "node:test";\n\nimport {\n  PUBLIC_UI_SAFE_QUESTION_COUNT,\n  resolvePublicUiCapabilityBinding,\n} from "../site/modules/curriculum/public/public-ui-capability-binding.js";\nimport {\n  createConfigState,\n  setBatchAQuestionCount,\n} from "../site/assets/browser/state/config-state.js";\n\ntest("public question-count ceiling is 240 while default remains 20", () => {\n  assert.deepEqual(PUBLIC_UI_SAFE_QUESTION_COUNT, {\n    min: 1,\n    default: 20,\n    max: 240,\n    evidence: "PGC_R03_GLOBAL_PUBLIC_HARD_CEILING",\n  });\n  for (const path of ["site/index.html", "site/404.html", "site/pixel/index.html"]) {\n    const html = fs.readFileSync(path, "utf8");\n    assert.match(html, /type="number" min="1" max="240" value="20"/);\n  }\n});\n\ntest("browser state accepts 240 without the previous 200 clamp", () => {\n  const state = createConfigState();\n  setBatchAQuestionCount(state, 240);\n  assert.equal(state.batchA.questionCount, 240);\n  setBatchAQuestionCount(state, 241);\n  assert.equal(state.batchA.questionCount, 240);\n});\n\ntest("a legal public route exposes the global 240 limit", () => {\n  const binding = resolvePublicUiCapabilityBinding({ sourceId: "g3a_u01_3a01" });\n  assert.equal(binding.blocked, false);\n  assert.equal(binding.questionCount.max, 240);\n});\n`;
write("tests/public-question-limit-240.test.js", focusedTest);

for (const relativePath of [
  ".github/workflows/apply-public-question-limit-240.yml",
  "tools/temporary/apply-public-question-limit-240.mjs",
  "tools/temporary/apply-public-question-limit-240-v3-replay-fix.mjs",
]) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (fs.existsSync(absolutePath)) fs.rmSync(absolutePath);
}

console.log("PUBLIC_QUESTION_LIMIT_240_MINIMAL_PATCH_APPLIED");
