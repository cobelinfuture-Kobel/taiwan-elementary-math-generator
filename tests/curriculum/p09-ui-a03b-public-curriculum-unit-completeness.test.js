import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
  listBatchAKnowledgePointAvailabilityBySource,
  auditP09A03BPublicSelectorComposition,
} from "../../site/modules/curriculum/registry/batch-a-selector-p09-a03b-extension.js";
import { P09_A03B_SOURCE_ROUTE_ALIASES } from "../../site/modules/curriculum/registry/public-curriculum-source-route-aliases-p09-a03b.js";
import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p09-a03b.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p09-a03b-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p09-a03b.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const G3A = "g3a_u08_3a08";
const G4B = "g4b_u03_4b03";
const G6B = "g6b_u02_6b02";

const G3A_KPS = Object.freeze([
  "kp_g3a_u08_part_whole_fraction",
  "kp_g3a_u08_unit_fraction_accumulation",
  "kp_g3a_u08_discrete_set_fraction",
  "kp_g3a_u08_same_denominator_compare",
  "kp_g3a_u08_measurement_fraction",
  "kp_g3a_u08_whole_as_fraction",
  "kp_g3a_u08_unlike_denominator_comparison_limit",
]);

const aliasById = new Map(P09_A03B_SOURCE_ROUTE_ALIASES.map((row) => [row.sourceId, row]));

function options(sourceId, selectionMode, selectedKnowledgePointIds, questionCount) {
  return {
    sourceId,
    selectionMode,
    selectedKnowledgePointIds,
    questionCount,
    questionMode: selectionMode === "singleKnowledgePoint" ? "numeric" : "mixed",
    ordering: "groupedByPattern",
    generationSeed: `p09-a03b-${sourceId}-${selectionMode}-${questionCount}`,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

test("P09 A03B authority locks 78 curriculum units, 482 unique KPs and 493 source-KP routes", () => {
  const authority = readJson("data/curriculum/full-product/p09/p09-ui-a03b-public-curriculum-unit-completeness-implementation.json");
  assert.equal(authority.sourceAuthority.canonicalSourceNodeCount, 79);
  assert.equal(authority.sourceAuthority.publicCurriculumUnitCount, 78);
  assert.equal(authority.sourceAuthority.canonicalUniqueKnowledgePointCount, 482);
  assert.equal(authority.sourceAuthority.publicSourceKnowledgePointRouteProjectionCount, 493);
  assert.equal(authority.corrections.g5bU10.fullUnitIdentityClaimed, false);
  assert.equal(authority.corrections.g5bU10.additionalSplitInvented, false);
});

test("current browser public source inventory restores G4B-U03 and G6B-U02 without inventing G5B-U10", () => {
  globalThis.document = Object.create(null);
  try {
    const units = listBatchASourceUnits();
    const ids = units.map((row) => row.sourceId);
    assert.equal(new Set(ids).size, 78);
    assert.ok(ids.includes(G4B));
    assert.ok(ids.includes(G6B));
    assert.ok(ids.includes("g5b_u10_5b10a"));
    assert.equal(ids.includes("g5b_u10_5b10"), false);
    assert.equal(ids.includes("g5b_u10b_5b10b"), false);
  } finally {
    delete globalThis.document;
  }
});

test("selector projects 493 curriculum routes over 482 canonical KP identities", () => {
  const audit = auditP09A03BPublicSelectorComposition();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  const rows = listVisibleBatchAKnowledgePoints();
  assert.equal(rows.length, 493);
  assert.equal(new Set(rows.map((row) => row.knowledgePointId)).size, 482);
  assert.equal(rows.filter((row) => row.sourceId === G4B).length, 6);
  assert.equal(rows.filter((row) => row.sourceId === G6B).length, 5);
  assert.equal(rows.filter((row) => row.sourceId === G3A).length, 7);
});

test("G3A-U08 whole-unit route integrates all seven KPs including the former A02 single-only pair", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A);
  assert.equal(availability.visibleCount, 7);
  assert.deepEqual(new Set(availability.visibleKnowledgePointIds), new Set(G3A_KPS));

  const input = options(G3A, "sourceUnit", [], 28);
  const binding = resolvePublicUiCapabilityBinding(input);
  assert.equal(binding.blocked, false, JSON.stringify(binding.errors));
  assert.equal(binding.selectedKnowledgePointIds.length, 7);
  assert.equal(binding.sameUnitMixedAdmission, true);

  const generation = generateBatchABrowserQuestions(input);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 28);
  assert.deepEqual(new Set(generation.questions.map((q) => q.knowledgePointId)), new Set(G3A_KPS));
  assert.equal(generation.knowledgePointAllocation.length, 7);
  assert.ok(generation.questions.some((q) => q.knowledgePointId === "kp_g3a_u08_whole_as_fraction"));
  assert.ok(generation.questions.some((q) => q.knowledgePointId === "kp_g3a_u08_unlike_denominator_comparison_limit"));
});

test("G3A-U08 same-unit current route can explicitly select all seven KPs", () => {
  const input = options(G3A, "mixedKnowledgePointsSameUnit", [...G3A_KPS], 28);
  const binding = resolvePublicUiCapabilityBinding(input);
  assert.equal(binding.blocked, false, JSON.stringify(binding.errors));
  assert.equal(binding.selectedKnowledgePointIds.length, 7);
  const generation = generateBatchABrowserQuestions(input);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.deepEqual(new Set(generation.questions.map((q) => q.knowledgePointId)), new Set(G3A_KPS));
});

for (const sourceId of [G4B, G6B]) {
  const alias = aliasById.get(sourceId);
  test(`${sourceId} restored curriculum sourceUnit route reuses canonical owner runtime`, () => {
    const count = alias.knowledgePointIds.length * 4;
    const input = options(sourceId, "sourceUnit", [], count);
    const binding = resolvePublicUiCapabilityBinding(input);
    assert.equal(binding.blocked, false, JSON.stringify(binding.errors));
    assert.deepEqual(new Set(binding.selectedKnowledgePointIds), new Set(alias.knowledgePointIds));

    const plan = buildBatchABrowserPlan(input);
    assert.equal(plan.semanticOwnerSourceId, alias.semanticOwnerSourceId);
    const generation = generateBatchABrowserQuestions(input);
    assert.equal(generation.ok, true, JSON.stringify(generation.errors));
    assert.equal(generation.questions.length, count);
    assert.deepEqual(new Set(generation.questions.map((q) => q.knowledgePointId)), new Set(alias.knowledgePointIds));
    assert.ok(generation.questions.every((q) => q.sourceId === sourceId));
    assert.ok(generation.questions.every((q) => q.metadata?.requestedCurriculumSourceId === sourceId));
    assert.ok(generation.questions.every((q) => q.metadata?.semanticOwnerSourceId === alias.semanticOwnerSourceId));
  });

  for (const knowledgePointId of alias.knowledgePointIds) {
    test(`${sourceId} single-KP route ${knowledgePointId} is executable under requested curriculum source identity`, () => {
      const input = options(sourceId, "singleKnowledgePoint", [knowledgePointId], 4);
      const binding = resolvePublicUiCapabilityBinding(input);
      assert.equal(binding.blocked, false, JSON.stringify(binding.errors));
      const generation = generateBatchABrowserQuestions(input);
      assert.equal(generation.ok, true, JSON.stringify(generation.errors));
      assert.equal(generation.questions.length, 4);
      assert.deepEqual(new Set(generation.questions.map((q) => q.knowledgePointId)), new Set([knowledgePointId]));
      assert.ok(generation.questions.every((q) => q.sourceId === sourceId));
    });
  }
}

for (const [sourceId, count] of [[G3A, 28], [G4B, 24], [G6B, 20]]) {
  test(`${sourceId} sourceUnit worksheet has questions, answers and printable HTML`, () => {
    const result = buildBatchABrowserWorksheetDocument(options(sourceId, "sourceUnit", [], count));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    const doc = result.worksheetDocument;
    assert.equal(doc.questionCount, count);
    assert.equal(doc.generatedQuestions.length, count);
    assert.equal(doc.answerKeyItems.length, count);
    assert.equal(doc.metadata.publicCurriculumUnitCount, 78);
    assert.equal(doc.metadata.canonicalUniqueKnowledgePointCount, 482);
    assert.equal(doc.metadata.publicSourceKnowledgePointRouteProjectionCount, 493);
    const html = renderWorksheetDocumentToHtml(doc, { stylesheetHref: "./assets/styles/print-styles.css" });
    assert.match(html, /worksheet-document/);
    assert.equal(html.includes("<script>"), false);
  });
}

test("restored alias units remain bounded: same-unit and cross-unit mixed are fail-closed", () => {
  for (const sourceId of [G4B, G6B]) {
    const alias = aliasById.get(sourceId);
    const mixed = resolvePublicUiCapabilityBinding({
      sourceId,
      selectionMode: "mixedKnowledgePointsSameUnit",
      selectedKnowledgePointIds: alias.knowledgePointIds.slice(0, 2),
    });
    assert.equal(mixed.blocked, true);
    assert.ok(mixed.errors.some((row) => row.code === "P09_A03B_ALIAS_MIXED_NOT_ADMITTED"));
  }
});
