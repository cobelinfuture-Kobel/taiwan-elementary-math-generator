import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const replacements = [
  {
    path: "src/curriculum/full-product/p03f-slice001-product-admission.mjs",
    pairs: [
      [
        'import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";',
        'import { listP03F2FullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";',
      ],
      [
        "const currentSources = listCurrentFullProductPublicSourceUnits();",
        "const currentSources = listP03F2FullProductPublicSourceUnits();",
      ],
    ],
  },
  {
    path: "src/curriculum/full-product/p03f-slice002-product-admission.mjs",
    pairs: [
      [
        'import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";',
        'import { listP03F2FullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";',
      ],
      [
        "const currentSources = listCurrentFullProductPublicSourceUnits();",
        "const currentSources = listP03F2FullProductPublicSourceUnits();",
      ],
    ],
  },
];

for (const entry of replacements) {
  const filePath = path.join(ROOT, entry.path);
  let text = fs.readFileSync(filePath, "utf8");
  for (const [before, after] of entry.pairs) {
    if (!text.includes(before)) throw new Error(`P03F3_REPLACEMENT_MISSING:${entry.path}:${before}`);
    text = text.replace(before, after);
  }
  fs.writeFileSync(filePath, text);
}

const testPath = path.join(ROOT, "tests/curriculum/p03f-slice002-pixel-current.test.js");
fs.writeFileSync(testPath, `import test from "node:test";
import assert from "node:assert/strict";

import { P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f2-extension.js";

const SOURCE_ID = "g3a_u08_3a08";
const EXPECTED_KPS = new Set([
  "kp_g3a_u08_part_whole_fraction",
  "kp_g3a_u08_discrete_set_fraction",
  "kp_g3a_u08_unit_fraction_accumulation",
]);

test("P03F2 explicit historical Pixel authority remains a 20-source three-KP snapshot", () => {
  assert.equal(P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 20);
  const source = P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.find((row) => row.sourceId === SOURCE_ID);
  assert.ok(source);
  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(knowledgePoints.length, 3);
  assert.deepEqual(new Set(knowledgePoints.map((row) => row.knowledgePointId)), EXPECTED_KPS);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 3);
  assert.equal(availability.hiddenPendingCount, 4);
});
`);

const workflowPath = path.join(ROOT, ".github/workflows/p03f3-one-shot-reconcile.yml");
const selfPath = fileURLToPath(import.meta.url);
fs.rmSync(workflowPath, { force: true });
fs.rmSync(selfPath, { force: true });

execFileSync("git", ["config", "user.name", "github-actions[bot]"], { cwd: ROOT });
execFileSync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: ROOT });
execFileSync("git", ["add", "src/curriculum/full-product/p03f-slice001-product-admission.mjs", "src/curriculum/full-product/p03f-slice002-product-admission.mjs", "tests/curriculum/p03f-slice002-pixel-current.test.js", ".github/workflows/p03f3-one-shot-reconcile.yml", "tools/curriculum/p03f3-reconcile-historical-authorities.mjs"], { cwd: ROOT });
execFileSync("git", ["commit", "-m", "P03F3: separate historical source authorities"], { cwd: ROOT, stdio: "inherit" });
execFileSync("git", ["push", "origin", "HEAD:p03f-w3-direct-product-vertical-slice003-v1"], { cwd: ROOT, stdio: "inherit" });
