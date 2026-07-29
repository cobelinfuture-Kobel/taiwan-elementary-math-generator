import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import {
  buildPgcR02UiCapabilityBindingContract,
} from "../../tools/curriculum/materialize-pgc-r02-ui-capability-binding.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/ui_capability_binding_contract.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/ui_option_filter_matrix.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R02_ui_capability_binding_readback.md");

function visibleBySource() {
  const grouped = new Map();
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const rows = grouped.get(kp.sourceId) ?? [];
    rows.push(kp);
    grouped.set(kp.sourceId, rows);
  }
  return grouped;
}

function optionValues(binding) {
  return binding.availableQuestionTypeOptions.map((option) => option.value);
}

test("PGC-R02 closes all public UI binding cases", () => {
  const contract = buildPgcR02UiCapabilityBindingContract();
  const audit = auditPublicUiCapabilityBinding();
  assert.equal(contract.status, "PASS", JSON.stringify(contract.gaps, null, 2));
  assert.equal(contract.summary.publicSourceCount, 26);
  assert.equal(contract.summary.visibleKnowledgePointCount, 193);
  assert.equal(contract.summary.publicSurfaceCount, 3);
  assert.equal(contract.summary.gapCount, 0);
  assert.equal(contract.summary.blockedBindingCount, 0);
  assert.equal(contract.summary.unverifiedCapacityExposureCount, 0);
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.caseCount, contract.summary.surfaceCaseCount);
});

test("PGC-R02 keeps Classic, 404 fallback and Pixel option parity", () => {
  const grouped = visibleBySource();
  for (const source of CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS) {
    const kps = grouped.get(source.sourceId) ?? [];
    const cases = [
      { selectionMode: "sourceUnit", selectedKnowledgePointIds: [] },
      ...kps.map((kp) => ({ selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [kp.knowledgePointId] })),
      ...(kps.length >= 2 ? [{ selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: kps.map((kp) => kp.knowledgePointId) }] : []),
    ];
    for (const input of cases) {
      const snapshots = Object.values(PUBLIC_UI_SURFACES).map((surfaceId) => resolvePublicUiCapabilityBinding({
        sourceId: source.sourceId,
        surfaceId,
        ...input,
      }));
      const expected = optionValues(snapshots[0]);
      for (const snapshot of snapshots) {
        assert.equal(snapshot.blocked, false, `${source.sourceId}|${snapshot.surfaceId}|${input.selectionMode}`);
        assert.deepEqual(optionValues(snapshot), expected);
        assert.equal(snapshot.questionCount.max, 20);
      }
    }
  }
});

test("PGC-R02 derives types from KP capability before filtering forms", () => {
  let witness = null;
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const base = resolvePublicUiCapabilityBinding({
      sourceId: kp.sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [kp.knowledgePointId],
    });
    if (base.availableQuestionTypeOptions.length < 2 || base.compatiblePatternGroups.length === 0) continue;
    witness = { kp, base };
    break;
  }
  assert.ok(witness, "expected a multi-type visible KP witness");
  const selectedGroupId = witness.base.compatiblePatternGroups[0].patternGroupId;
  const withFormSelection = resolvePublicUiCapabilityBinding({
    sourceId: witness.kp.sourceId,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [witness.kp.knowledgePointId],
    selectedPatternGroupIds: [selectedGroupId],
  });
  assert.deepEqual(optionValues(withFormSelection), optionValues(witness.base));
  assert.equal(withFormSelection.compatiblePatternGroups.some((group) => group.patternGroupId === selectedGroupId), true);
});

test("PGC-R02 exposes only compatible forms for each selected question type", () => {
  const contract = buildPgcR02UiCapabilityBindingContract();
  for (const row of contract.bindings) {
    assert.equal(row.blocked, false, row.bindingId);
    assert.equal(row.questionCountMin, PUBLIC_UI_SAFE_QUESTION_COUNT.min);
    assert.equal(row.questionCountDefault, PUBLIC_UI_SAFE_QUESTION_COUNT.default);
    assert.equal(row.questionCountMax, PUBLIC_UI_SAFE_QUESTION_COUNT.max);
    assert.equal(row.capacityStatus, "FAIL_CLOSED_PENDING_PGC_R03");
    if (row.questionType === "pbl") {
      assert.equal(row.selectionMode, "sourceUnit");
      assert.equal(row.compatiblePatternGroupIds.length, 0);
    } else {
      assert.ok(row.compatiblePatternGroupIds.length > 0, row.bindingId);
      assert.ok(row.compatiblePatternSpecIds.length > 0, row.bindingId);
      assert.ok(row.questionFormLabels.length > 0, row.bindingId);
    }
    if (["numeric", "concept", "representation", "operation_estimation"].includes(row.questionType)) {
      assert.deepEqual(row.depthModes, []);
      assert.deepEqual(row.contextModes, []);
    }
  }
});

test("PGC-R02 public HTML entries use shared adapters and max 20", () => {
  const classic = fs.readFileSync(path.join(repoRoot, "site/index.html"), "utf8");
  const fallback = fs.readFileSync(path.join(repoRoot, "site/404.html"), "utf8");
  const pixel = fs.readFileSync(path.join(repoRoot, "site/pixel/index.html"), "utf8");

  assert.match(classic, /id="batch-a-question-count-input"[^>]*max="20"/);
  assert.match(fallback, /id="batch-a-question-count-input"[^>]*max="20"/);
  assert.match(pixel, /id="pixel-question-count"[^>]*max="20"/);
  assert.match(classic, /assets\/browser\/public-capability-ui\.js/);
  assert.match(fallback, /assets\/browser\/public-capability-ui\.js/);
  assert.match(pixel, /pixel-public-capability-ui\.js/);
  assert.doesNotMatch(classic, /assets\/browser\/public-control-ui\.js/);
  assert.doesNotMatch(fallback, /assets\/browser\/public-control-ui\.js/);
});

test("PGC-R02 committed artifacts stay synchronized when present", () => {
  if (!fs.existsSync(contractPath)) return;
  const committed = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const rebuilt = buildPgcR02UiCapabilityBindingContract();
  assert.deepEqual(committed.summary, rebuilt.summary);
  assert.deepEqual(committed.gaps, rebuilt.gaps);
  assert.deepEqual(committed.bindings.map((row) => row.bindingId), rebuilt.bindings.map((row) => row.bindingId));
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, committed.bindings.length + 1);
  assert.match(fs.readFileSync(readbackPath, "utf8"), /NEXT_SHORTEST_STEP\s+= PGC-R03_PublicGeneratorCapacityContract/);
});
