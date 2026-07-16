import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

const AUDIT_PATH = new URL(
  "../../data/curriculum/audits/G5AU02_S98_All22SourceMethodAndRepresentationParityAudit.json",
  import.meta.url,
);

async function loadAudit() {
  return JSON.parse(await readFile(AUDIT_PATH, "utf8"));
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = String(row[key]);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function sortedObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

test("S98 audit identity and no-runtime-change boundary are locked", async () => {
  const audit = await loadAudit();
  assert.equal(audit.schemaName, "G5AU02All22SourceMethodAndRepresentationParityAudit");
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.task, "G5AU02-S98_All22SourceMethodAndRepresentationParityAudit");
  assert.equal(audit.unitId, "g5a_u02");
  assert.equal(audit.scope.patternSpecCount, 22);
  assert.equal(audit.scope.runtimeChangeAllowed, false);
  assert.equal(audit.scope.generatorChangeAllowed, false);
  assert.equal(audit.scope.validatorChangeAllowed, false);
  assert.equal(audit.scope.publicBehaviorChangeAllowed, false);
  assert.deepEqual(
    audit.scope.sourcePackets.map((row) => row.sourcePacketId),
    ["g5a_u02_5a02a", "g5a_u02_5a02a1"],
  );
  assert.deepEqual(
    audit.scope.sourcePackets.map((row) => row.canonicalUrl),
    ["https://meow911.com/5a02b/", "https://meow911.com/5a03b/"],
  );
});

test("S98 covers every canonical PatternSpec exactly once in canonical order", async () => {
  const audit = await loadAudit();
  const rows = audit.patternAudits;
  const canonical = getG5AU02HiddenPatternSpecs()
    .slice()
    .sort((left, right) => left.patternOrder - right.patternOrder);

  assert.equal(rows.length, 22);
  assert.equal(new Set(rows.map((row) => row.patternSpecId)).size, 22);
  assert.deepEqual(rows.map((row) => row.patternOrder), Array.from({ length: 22 }, (_, index) => index + 1));
  assert.deepEqual(rows.map((row) => row.patternSpecId), canonical.map((row) => row.patternSpecId));
  assert.deepEqual(countBy(rows, "implementationClass"), { C: 14, D: 8 });
});

test("S98 separates learner-visible completeness from source parity", async () => {
  const audit = await loadAudit();
  const rows = audit.patternAudits;

  assert.ok(rows.every((row) => row.learnerVisibleComplete === true));
  assert.deepEqual(audit.summary.learnerVisibleComplete, { true: 22, false: 0 });
  assert.equal(audit.summary.all22SemanticD0Eligible, false);

  assert.deepEqual(
    sortedObject(countBy(rows, "semanticRoleParity")),
    sortedObject(audit.summary.semanticRoleParity),
  );
  assert.deepEqual(audit.summary.semanticRoleParity, { PASS: 16, PARTIAL: 6 });

  assert.deepEqual(
    sortedObject(countBy(rows, "methodParity")),
    sortedObject(audit.summary.methodParity),
  );
  assert.deepEqual(audit.summary.methodParity, { PASS: 10, PARTIAL: 8, MISSING: 4 });

  assert.deepEqual(
    sortedObject(countBy(rows, "representationParity")),
    sortedObject(audit.summary.representationParity),
  );
  assert.deepEqual(audit.summary.representationParity, { PARTIAL: 6, MISSING: 8, NOT_REQUIRED: 8 });

  assert.deepEqual(
    sortedObject(countBy(rows, "generativeDiversity")),
    sortedObject(audit.summary.generativeDiversity),
  );
  assert.deepEqual(audit.summary.generativeDiversity, { PASS: 19, PARTIAL: 2, SOURCE_FIXED: 1 });

  assert.deepEqual(
    sortedObject(countBy(rows, "priority")),
    sortedObject(audit.summary.priority),
  );
  assert.deepEqual(audit.summary.priority, { P0: 12, P1: 6, P2: 4 });
});

test("S98 every gap is source-grounded and assigned to a bounded repair track", async () => {
  const audit = await loadAudit();
  const trackIds = new Set(audit.repairTracks.map((row) => row.repairTrackId));
  assert.equal(trackIds.size, audit.repairTracks.length);

  for (const row of audit.patternAudits) {
    assert.match(row.patternSpecId, /^ps_g5a_u02_/);
    assert.ok(["g5a_u02_5a02a", "g5a_u02_5a02a1"].includes(row.sourcePacketId));
    assert.ok(Array.isArray(row.sourceEvidence) && row.sourceEvidence.length > 0);
    assert.ok(row.sourceMethodFamily.length > 0);
    assert.ok(row.sourceRepresentationFamily.length > 0);
    assert.ok(row.currentPublicBehavior.length > 20);
    assert.ok(trackIds.has(row.repairTrackId));
    assert.ok(["P0", "P1", "P2"].includes(row.priority));

    const hasGap = row.semanticRoleParity !== "PASS"
      || row.methodParity !== "PASS"
      || !["NOT_REQUIRED"].includes(row.representationParity)
      || row.generativeDiversity !== "PASS";
    if (hasGap) assert.ok(row.issueCodes.length > 0, `${row.patternSpecId} gap must have issueCodes`);
    else assert.deepEqual(row.issueCodes, []);
  }
});

test("S98 P0 sequence targets method loss, degeneracy, geometry and fixed-source repetition", async () => {
  const audit = await loadAudit();
  const p0 = audit.patternAudits.filter((row) => row.priority === "P0");
  assert.equal(p0.length, 12);
  assert.ok(p0.some((row) => row.issueCodes.includes("G5AU02_S98_TRIAL_DIVISION_METHOD_COLLAPSED")));
  assert.ok(p0.some((row) => row.issueCodes.includes("G5AU02_S98_PROBLEM_TYPE_CLASSIFICATION_DEFINITION_ONLY")));
  assert.equal(
    p0.filter((row) => row.issueCodes.includes("G5AU02_S98_EQUAL_OPERAND_DEGENERACY_ALLOWED")).length,
    2,
  );
  assert.ok(p0.some((row) => row.issueCodes.includes("G5AU02_S98_RECTANGLE_SQUARE_PARTITION_DIAGRAM_MISSING")));
  assert.ok(p0.some((row) => row.issueCodes.includes("G5AU02_S98_TILE_DIAGRAM_MISSING")));
  assert.ok(p0.some((row) => row.issueCodes.includes("G5AU02_S98_SOURCE_EXAMPLE_REPEATED_AS_GENERATIVE_PATTERN")));
  assert.equal(audit.nextShortestStep, "G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract");
});
