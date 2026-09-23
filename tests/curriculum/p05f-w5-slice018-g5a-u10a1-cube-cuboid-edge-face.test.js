import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {
  auditG5AU10A1P05F18Projection,
  G5A_U10A1_P05F18_EDGE_KP_ID,
  G5A_U10A1_P05F18_EDGE_SPEC_IDS,
  G5A_U10A1_P05F18_EXISTING_KP_ID,
  G5A_U10A1_P05F18_FACE_KP_ID,
  G5A_U10A1_P05F18_FACE_SPEC_IDS,
  G5A_U10A1_P05F18_FUTURE_KP_IDS,
  G5A_U10A1_P05F18_PATTERN_SPECS,
  G5A_U10A1_P05F18_SOURCE_ID,
  G5A_U10A1_P05F18_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u10a1-cube-cuboid-edge-face-selector-projection-p05f18.js";
import {
  auditP05F18PublicSelectorComposition,
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f18-extension.js";
import {
  generateG5AU10A1P05F18Questions,
  validateG5AU10A1P05F18Question,
} from "../../site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-edge-face-runtime-p05f18.js";
import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f18.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f18-extension.js";
import {
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f18.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const SOURCE = G5A_U10A1_P05F18_SOURCE_ID;
const EDGE = G5A_U10A1_P05F18_EDGE_KP_ID;
const FACE = G5A_U10A1_P05F18_FACE_KP_ID;

function generationOptions(knowledgePointId, questionCount = 24, generationSeed = "p05f18-focused") {
  return {
    sourceId: SOURCE,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    questionCount,
    generationSeed,
  };
}

test("Q018 exact frozen queue row remains the two-KP edge then face authority", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const row = queue.queueEntries[17];
  assert.equal(row.queuePosition, 18);
  assert.equal(row.sliceId, "p05e_q018_r1_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(row.primarySourceNodeId, SOURCE);
  assert.deepEqual(row.knowledgePointIds, [EDGE, FACE]);
});

test("Q018 projection keeps exactly two KPs and seven source-backed PatternSpecs", () => {
  const audit = auditG5AU10A1P05F18Projection();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.deepEqual(audit.counts, {
    knowledgePoints: 2,
    patternGroups: 2,
    patternSpecs: 7,
    formalMappings: 2,
  });
  assert.equal(G5A_U10A1_P05F18_PATTERN_SPECS.length, 7);
  assert.equal(G5A_U10A1_P05F18_EDGE_SPEC_IDS.length, 2);
  assert.equal(G5A_U10A1_P05F18_FACE_SPEC_IDS.length, 5);
});

test("EDGE KP generates only EDGE target semantics and FACE KP generates only FACE target semantics", () => {
  const edge = generateG5AU10A1P05F18Questions({
    selectedKnowledgePointIds: [EDGE],
    questionCount: 40,
    generationSeed: "edge-target-semantics",
  });
  const face = generateG5AU10A1P05F18Questions({
    selectedKnowledgePointIds: [FACE],
    questionCount: 40,
    generationSeed: "face-target-semantics",
  });
  assert.equal(edge.ok, true, edge.errors.join(","));
  assert.equal(face.ok, true, face.errors.join(","));
  assert.ok(edge.questions.every((question) => question.knowledgePointId === EDGE && question.geometryDiagram.targetElement === "EDGE"));
  assert.ok(face.questions.every((question) => question.knowledgePointId === FACE && question.geometryDiagram.targetElement === "FACE"));
  assert.ok(edge.questions.every((question) => validateG5AU10A1P05F18Question(question).ok));
  assert.ok(face.questions.every((question) => validateG5AU10A1P05F18Question(question).ok));
});

test("validator fails closed when EDGE and FACE target semantics are swapped", () => {
  const edge = generateG5AU10A1P05F18Questions({ selectedKnowledgePointIds: [EDGE], questionCount: 1, generationSeed: "edge-tamper" }).questions[0];
  const face = generateG5AU10A1P05F18Questions({ selectedKnowledgePointIds: [FACE], questionCount: 1, generationSeed: "face-tamper" }).questions[0];
  const edgeAsFace = { ...edge, geometryDiagram: { ...edge.geometryDiagram, targetElement: "FACE" } };
  const faceAsEdge = { ...face, geometryDiagram: { ...face.geometryDiagram, targetElement: "EDGE" } };
  const edgeResult = validateG5AU10A1P05F18Question(edgeAsFace);
  const faceResult = validateG5AU10A1P05F18Question(faceAsEdge);
  assert.equal(edgeResult.ok, false);
  assert.equal(faceResult.ok, false);
  assert.ok(edgeResult.errors.includes("P05F18_DIAGRAM_TARGET_ELEMENT_INVALID"));
  assert.ok(faceResult.errors.includes("P05F18_DIAGRAM_TARGET_ELEMENT_INVALID"));
});

test("every Q018 PatternSpec proves 240 distinct deterministic validated variants with its KP-specific target", () => {
  for (const patternSpecId of G5A_U10A1_P05F18_SPEC_IDS) {
    const expectedKnowledgePointId = G5A_U10A1_P05F18_EDGE_SPEC_IDS.includes(patternSpecId) ? EDGE : FACE;
    const expectedTargetElement = expectedKnowledgePointId === EDGE ? "EDGE" : "FACE";
    const generated = generateG5AU10A1P05F18Questions({
      selectedKnowledgePointIds: [expectedKnowledgePointId],
      patternSpecIds: [patternSpecId],
      questionCount: 240,
      generationSeed: `capacity-${patternSpecId}`,
    });
    assert.equal(generated.ok, true, `${patternSpecId}:${generated.errors.join(",")}`);
    assert.equal(generated.questions.length, 240);
    assert.equal(new Set(generated.questions.map((question) => question.questionSignature)).size, 240);
    assert.ok(generated.questions.every((question) => question.geometryDiagram.targetElement === expectedTargetElement));
    assert.ok(generated.questions.every((question) => validateG5AU10A1P05F18Question(question).ok));
  }
});

test("public selector and binding expose only the two Q018 KPs while preserving Q008 source-unit ownership", () => {
  const selectorAudit = auditP05F18PublicSelectorComposition();
  assert.equal(selectorAudit.ok, true, selectorAudit.errors.join(","));
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 53);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 334);
  const source = listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.equal(source.visibleCount, 3);
  assert.equal(source.hiddenPendingCount, 2);
  assert.equal(source.notSelectableCount, 2);
  for (const id of [G5A_U10A1_P05F18_EXISTING_KP_ID, EDGE, FACE]) assert.ok(getVisibleBatchAKnowledgePoint(id));
  for (const id of G5A_U10A1_P05F18_FUTURE_KP_IDS) assert.equal(getVisibleBatchAKnowledgePoint(id), null);

  const bindingAudit = auditPublicUiCapabilityBinding();
  assert.equal(bindingAudit.ok, true, bindingAudit.errors.join(","));
  const edge = resolvePublicUiCapabilityBinding(generationOptions(EDGE));
  const face = resolvePublicUiCapabilityBinding(generationOptions(FACE));
  assert.equal(edge.blocked, false);
  assert.equal(face.blocked, false);
  assert.equal(edge.edgeLengthRelationAdmission, true);
  assert.equal(edge.faceRelationshipAdmission, false);
  assert.equal(face.edgeLengthRelationAdmission, false);
  assert.equal(face.faceRelationshipAdmission, true);
  assert.equal(edge.sourceUnitOwnershipKnowledgePointId, G5A_U10A1_P05F18_EXISTING_KP_ID);
  assert.equal(face.sourceUnitOwnershipKnowledgePointId, G5A_U10A1_P05F18_EXISTING_KP_ID);
});

test("browser plan, generator, worksheet and shared renderer preserve EDGE/FACE target semantics end to end", () => {
  for (const [knowledgePointId, expectedTargetElement] of [[EDGE, "EDGE"], [FACE, "FACE"]]) {
    const options = {
      ...generationOptions(knowledgePointId, 24, `e2e-${expectedTargetElement.toLowerCase()}`),
      includeAnswerKey: true,
      printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
    };
    const plan = buildBatchABrowserPlan(options);
    assert.deepEqual(plan.selectedKnowledgePointIds, [knowledgePointId]);
    const generated = generateBatchABrowserQuestions(options);
    assert.equal(generated.ok, true, generated.errors.join(","));
    assert.equal(generated.questions.length, 24);
    assert.ok(generated.questions.every((question) => question.geometryDiagram.targetElement === expectedTargetElement));

    const worksheet = buildBatchABrowserWorksheetDocument(options);
    assert.equal(worksheet.ok, true, worksheet.errors.join(","));
    assert.equal(worksheet.worksheetDocument.questionCount, 24);
    assert.equal(worksheet.worksheetDocument.answerKeyItems.length, 24);
    assert.ok(worksheet.worksheetDocument.generatedQuestions.every((question) => question.geometryDiagram.targetElement === expectedTargetElement));
    const html = renderWorksheetDocumentToHtml(worksheet.worksheetDocument);
    assert.ok(html.includes(`data-target-element="${expectedTargetElement}"`));
  }
});

test("Q018 mixed EDGE/FACE selection remains explicitly unadmitted", () => {
  const generated = generateG5AU10A1P05F18Questions({
    selectedKnowledgePointIds: [EDGE, FACE],
    questionCount: 20,
    generationSeed: "mixed-not-admitted",
  });
  assert.equal(generated.ok, false);
  assert.deepEqual(generated.errors, ["P05F18_MIXED_KP_NOT_ADMITTED"]);
});

test("Q018 changed static relative imports all resolve from repository HEAD", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const files = [
    "site/modules/curriculum/registry/g5a-u10a1-cube-cuboid-edge-face-selector-projection-p05f18.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f18-extension.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-edge-face-runtime-p05f18.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f18.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f18-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f18.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  ];
  for (const file of files) {
    const absolute = path.resolve(root, file);
    const text = readFileSync(absolute, "utf8");
    const directory = path.dirname(absolute);
    for (const match of text.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)) {
      const target = path.resolve(directory, match[1]);
      assert.ok(existsSync(target) || existsSync(`${target}.js`) || existsSync(`${target}.mjs`), `${file} missing ${match[1]}`);
    }
  }
});
