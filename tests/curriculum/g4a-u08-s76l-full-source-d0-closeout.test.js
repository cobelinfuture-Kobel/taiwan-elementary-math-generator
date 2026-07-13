import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import {
  G4A_U08_BATCH_A_MIGRATION_READBACK,
  validateG4AU08BatchAMigrationReadback,
} from "../../site/modules/curriculum/batch-a/g4a-u08-d0-closeout.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u08-phase2b-promotion.js";
import {
  G4A_U08_PRODUCTION_EVIDENCE,
  G4A_U08_PRODUCTION_LIFECYCLE,
  G4A_U08_STRESS_ACCEPTANCE,
  getG4AU08ProductionPromotionProjection,
  validateG4AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-production-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT,
  validateBatchAAllUnitsProductionCloseoutContract,
} from "../../site/modules/curriculum/batch-a/batch-a-production-closeout.js";

const SOURCE_ID = "g4a_u08_4a08";
const registry = JSON.parse(fs.readFileSync(
  "data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json",
  "utf8",
));
const extensionGroupSet = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);
const phase2AKnowledgePointIds = [
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub",
];

function phase2AGroupId(knowledgePointId) {
  return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
    .find((group) => !extensionGroupSet.has(group.patternGroupId))?.patternGroupId;
}

function phase2BOptions(questionCount = 120, seed = "s76l-fresh-main") {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "application",
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
  };
}

test("S76L promotes the S76K production projection to D0", () => {
  const checked = validateG4AU08ProductionPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, {
    knowledgePoints: 3,
    patternGroups: 4,
    patternSpecs: 4,
    totalExecutablePatternSpecs: 26,
    primaryStressQuestions: 1806,
  });
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.distance, "D0_G4A_U08");
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.htmlPdfStatus, "production_smoke_pass");
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.batchAMigrationStatus, "readback_accepted");
  assert.equal(G4A_U08_PRODUCTION_LIFECYCLE.requiredNextGate, "S77_BatchA_NextUnitSourcePriorityLock");
});

test("S76L preserves exact S76K CI, smoke artifact and stress evidence", () => {
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.stressImplementationPr, 154);
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.stressMergeCommit, "c995a2e5d741bbc07f000205eed8d145b7002f13");
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.smokeWorkflowRunId, 29268903266);
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.smokeArtifactId, 8286611935);
  assert.match(G4A_U08_PRODUCTION_EVIDENCE.smokeArtifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.standardWorkflowCount, 8);
  assert.equal(G4A_U08_PRODUCTION_EVIDENCE.standardWorkflowFailures, 0);
  assert.equal(G4A_U08_STRESS_ACCEPTANCE.primaryStressQuestionCount, 1806);
  assert.equal(G4A_U08_STRESS_ACCEPTANCE.maximumAcceptedQuestionCount, 1000);
  assert.equal(G4A_U08_STRESS_ACCEPTANCE.firstRejectedQuestionCount, 1001);
});

test("S76L authority readback keeps 15 KnowledgePoints and 28 PatternGroups", () => {
  assert.equal(registry.summary.knowledgePointCount, 15);
  assert.equal(registry.summary.patternGroupCount, 28);
  assert.equal(registry.summary.numericPatternGroupCount, 11);
  assert.equal(registry.summary.applicationPatternGroupCount, 17);
  assert.equal(registry.summary.applicationCorePatternGroupCount, 13);
  assert.equal(registry.summary.applicationExtensionPatternGroupCount, 4);
  assert.equal(new Set(registry.knowledgePoints.map((row) => row.knowledgePointId)).size, 15);
  assert.equal(new Set(registry.patternGroups.map((row) => row.patternGroupId)).size, 28);
});

test("S76L fresh-main numeric, Phase2A and Phase2B routes all remain executable", () => {
  const numeric = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    questionCount: 50,
    ordering: "groupedByPattern",
    generationSeed: "s76l-numeric",
  });
  assert.equal(numeric.ok, true, JSON.stringify(numeric.errors));
  assert.equal(numeric.questions.length, 50);
  assert.equal(new Set(numeric.questions.map((row) => row.patternSpecId)).size, 10);

  const phase2A = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: phase2AKnowledgePointIds,
    selectedPatternGroupIds: phase2AKnowledgePointIds.map(phase2AGroupId),
    questionCount: 60,
    ordering: "groupedByPattern",
    generationSeed: "s76l-phase2a",
  });
  assert.equal(phase2A.ok, true, JSON.stringify(phase2A.errors));
  assert.equal(phase2A.questions.length, 60);
  assert.equal(new Set(phase2A.questions.map((row) => row.patternSpecId)).size, 12);

  const phase2B = generateBatchABrowserQuestions(phase2BOptions(120));
  assert.equal(phase2B.ok, true, JSON.stringify(phase2B.errors));
  assert.equal(phase2B.questions.length, 120);
  assert.deepEqual(new Set(phase2B.questions.map((row) => row.patternGroupId)), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(new Set(phase2B.questions.map((row) => row.patternSpecId)), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS));
});

test("S76L fresh-main worksheet and answer key are production-accepted by the D0 overlay", () => {
  const result = buildBatchABrowserWorksheetDocument(phase2BOptions(120, "s76l-worksheet"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 120);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 120);
  assert.equal(result.worksheetDocument.rendererBehaviorChanged, false);
  assert.equal(result.worksheetDocument.productionUse, "preview_only_pending_s76k");

  const production = getG4AU08ProductionPromotionProjection();
  assert.equal(production.lifecycle.productionUse, "allowed");
  assert.equal(production.lifecycle.distance, "D0_G4A_U08");
  assert.equal(production.lifecycle.status, "full_source_d0_closeout_integrated");
});

test("S76L Batch A migration readback preserves the 13-source aggregate release", () => {
  const aggregate = validateBatchAAllUnitsProductionCloseoutContract();
  const readback = validateG4AU08BatchAMigrationReadback();
  assert.equal(aggregate.ok, true, aggregate.errors.join(","));
  assert.equal(readback.ok, true, readback.errors.join(","));
  assert.equal(BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.sourceUnitCount, 13);
  assert.equal(BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.publicSurfaces.length, 3);
  assert.deepEqual(readback.counts, {
    batchASourceUnits: 13,
    legacyVisibleKnowledgePoints: 8,
    authoritativeKnowledgePoints: 15,
    authoritativePatternGroups: 28,
    executablePatternSpecs: 26,
    phase2BPatternGroups: 4,
    phase2BPatternSpecs: 4,
  });
  assert.equal(G4A_U08_BATCH_A_MIGRATION_READBACK.aggregateBatchASourceCountChanged, false);
  assert.equal(G4A_U08_BATCH_A_MIGRATION_READBACK.publicSurfaceCountChanged, false);
  assert.equal(G4A_U08_BATCH_A_MIGRATION_READBACK.rendererVisualChanged, false);
  assert.equal(G4A_U08_BATCH_A_MIGRATION_READBACK.goalDistance, "D0_G4A_U08");
});
