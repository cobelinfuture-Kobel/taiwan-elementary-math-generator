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
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f22-extension.js";
import {
  listPublicPatternGroupChoices,
} from "../../site/assets/browser/state/public-pattern-group-selection.js";
import {
  buildPgcR02UiCapabilityBindingContract,
} from "../../tools/curriculum/materialize-pgc-r02-ui-capability-binding-r03.mjs";

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

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

test("PGC-R02 post-R03 closes all capacity-aware public UI binding cases", () => {
  const contract = buildPgcR02UiCapabilityBindingContract();
  const audit = auditPublicUiCapabilityBinding();
  assert.equal(contract.status, "PASS", JSON.stringify(contract.gaps, null, 2));
  assert.equal(contract.schemaName, "PublicUiCapabilityBindingContractV2");
  assert.equal(contract.summary.publicSourceCount, 28);
  assert.equal(contract.summary.visibleKnowledgePointCount, 206);
  assert.equal(contract.summary.publicSurfaceCount, 3);
  assert.equal(contract.summary.gapCount, 0);
  assert.equal(contract.summary.blockedBindingCount, 0);
  assert.equal(contract.summary.unverifiedCapacityExposureCount, 0);
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.caseCount, contract.summary.surfaceCaseCount);
});

test("PGC-R02 keeps Classic, 404 fallback and Pixel capacity parity", () => {
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
      const expected = {
        questionTypes: optionValues(snapshots[0]),
        max: snapshots[0].questionCount.max,
        status: snapshots[0].capacityStatus,
      };
      for (const snapshot of snapshots) {
        assert.equal(snapshot.blocked, false, `${source.sourceId}|${snapshot.surfaceId}|${input.selectionMode}`);
        assert.deepEqual(optionValues(snapshot), expected.questionTypes);
        assert.equal(snapshot.questionCount.max, expected.max);
        assert.equal(snapshot.capacityStatus, expected.status);
        assert.ok(snapshot.questionCount.max >= 1 && snapshot.questionCount.max <= PUBLIC_UI_SAFE_QUESTION_COUNT.max);
        assert.ok(["VERIFIED_20", "VERIFIED_LIMITED", "STRUCTURAL_FALLBACK_AVAILABLE", "FAIL_CLOSED_PENDING_PGC_R03"].includes(snapshot.capacityStatus));
      }
    }
  }
});

test("PGC-R02 browser selector form registry contains every capacity-exposed form", () => {
  let applicationWitnessCount = 0;
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const base = resolvePublicUiCapabilityBinding({
      sourceId: kp.sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [kp.knowledgePointId],
    });
    const expectedGroupIds = uniqueSorted(base.availableQuestionTypeOptions
      .filter((option) => option.value !== "pbl")
      .flatMap((option) => resolvePublicUiCapabilityBinding({
        sourceId: kp.sourceId,
        selectionMode: "singleKnowledgePoint",
        selectedKnowledgePointIds: [kp.knowledgePointId],
        requestedQuestionType: option.value,
      }).compatiblePatternGroupIds));
    const selectorGroupIds = new Set(listPublicPatternGroupChoices([kp.knowledgePointId]).map((choice) => choice.patternGroupId));
    for (const patternGroupId of expectedGroupIds) {
      assert.equal(selectorGroupIds.has(patternGroupId), true, `${kp.knowledgePointId}:${patternGroupId}`);
    }
    if (base.availableQuestionTypeOptions.some((option) => option.value === "application")) applicationWitnessCount += 1;
  }
  assert.ok(applicationWitnessCount > 0, "expected at least one application-capable public KP");
});

test("PGC-R02 derives types from KP capability before filtering legal forms", () => {
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
  assert.ok(withFormSelection.questionCount.max >= 1);
});

test("PGC-R02 exposes only legal forms and verified per-capability limits", () => {
  const contract = buildPgcR02UiCapabilityBindingContract();
  for (const row of contract.bindings) {
    assert.equal(row.blocked, false, row.bindingId);
    assert.equal(row.questionCountMin, PUBLIC_UI_SAFE_QUESTION_COUNT.min);
    assert.ok(row.questionCountDefault <= row.questionCountMax, row.bindingId);
    assert.ok(row.questionCountMax >= 1 && row.questionCountMax <= PUBLIC_UI_SAFE_QUESTION_COUNT.max, row.bindingId);
    assert.ok(["VERIFIED_20", "VERIFIED_LIMITED", "STRUCTURAL_FALLBACK_AVAILABLE", "FAIL_CLOSED_PENDING_PGC_R03"].includes(row.capacityStatus), row.bindingId);
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

test("PGC-R02 public HTML entries expose ceiling 240 and shared adapters", () => {
  const classic = fs.readFileSync(path.join(repoRoot, "site/index.html"), "utf8");
  const fallback = fs.readFileSync(path.join(repoRoot, "site/404.html"), "utf8");
  const pixel = fs.readFileSync(path.join(repoRoot, "site/pixel/index.html"), "utf8");

  assert.match(classic, /id="batch-a-question-count-input"[^>]*max="240"/);
  assert.match(fallback, /id="batch-a-question-count-input"[^>]*max="240"/);
  assert.match(pixel, /id="pixel-question-count"[^>]*max="240"/);
  assert.match(classic, /assets\/browser\/public-capability-ui\.js/);
  assert.match(fallback, /assets\/browser\/public-capability-ui\.js/);
  assert.match(pixel, /pixel-public-capability-ui\.js/);
});

test("PGC-R02 committed capacity artifacts retain stable route identity after the global UI ceiling override", () => {
  if (!fs.existsSync(contractPath)) return;
  const committed = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const rebuilt = buildPgcR02UiCapabilityBindingContract();
  assert.equal(committed.schemaName, rebuilt.schemaName);
  assert.equal(committed.schemaVersion, rebuilt.schemaVersion);
  assert.equal(committed.summary.publicSourceCount, rebuilt.summary.publicSourceCount);
  assert.equal(committed.summary.visibleKnowledgePointCount, rebuilt.summary.visibleKnowledgePointCount);
  assert.equal(committed.summary.publicSurfaceCount, rebuilt.summary.publicSurfaceCount);
  assert.deepEqual(committed.bindings.map((row) => row.bindingId), rebuilt.bindings.map((row) => row.bindingId));
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, committed.bindings.length + 1);
  assert.match(fs.readFileSync(readbackPath, "utf8"), /NEXT_SHORTEST_STEP\s+= PGC-R04_NumericGenerationFullFix/);
});
