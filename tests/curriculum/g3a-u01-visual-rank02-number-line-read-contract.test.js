import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { validatePatternSpec } from "../../src/validation/core/validate-pattern-spec.js";
import { validateFractionNumberLineModel } from "../../site/modules/renderer/fraction-number-line.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank02_integer_number_line_read_value.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const RESOLUTION_PATH = new URL("../../data/curriculum/mapping/g3a_u01_number_line_candidate_resolution.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const visual = JSON.parse(fs.readFileSync(VISUAL_PATH, "utf8"));
const mappings = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));
const resolution = JSON.parse(fs.readFileSync(RESOLUTION_PATH, "utf8"));
const kp = JSON.parse(fs.readFileSync(KP_PATH, "utf8"));

const FAMILY_ID = "vf_g3a_u01_integer_number_line_read_value";
const KPC_ID = "kpc_g3a_u01_integer_number_line_scale_location";
const SPEC_ID = "psc_g3a_u01_visual_number_line_read_value";

test("Rank02 preflight locks the source-backed number-line read family at priority 2", () => {
  const family = visual.families.find((row) => row.visualFamilyId === FAMILY_ID);
  const priority = resolution.patternSpecPriorityOrderingV2.find((row) => row.rank === 2);
  assert.ok(family);
  assert.equal(family.nameZh, "整數數線讀值");
  assert.equal(family.count, 50);
  assert.equal(family.taskCore, "READ_MARKER_VALUE");
  assert.equal(family.representationFamily, "integer_number_line");
  assert.equal(priority.visualFamilyId, FAMILY_ID);
  assert.equal(priority.wave, "P1_SHARED_NUMBER_LINE_EXTENSION");
  assert.equal(contract.sourceAuthorityPreflight.decision, "PASS_FOR_CONTRACT_MATERIALIZATION_ONLY");
});

test("Rank02 materializes the exact FormalMapping candidate without minting a KnowledgePoint", () => {
  const candidate = mappings.mappings.find((row) => row.visualFamilyId === FAMILY_ID);
  const resolvedCandidate = resolution.knowledgePointCandidateResolution.find(
    (row) => row.knowledgePointCandidateId === KPC_ID
  );
  assert.ok(candidate);
  assert.equal(candidate.formalMappingCandidateId, "fmc_g3a_u01_integer_number_line_read_value");
  assert.equal(candidate.primaryKnowledgePointId, KPC_ID);
  assert.equal(candidate.mappingStatus, "CANDIDATE_KP_DEPENDENCY");

  assert.equal(resolvedCandidate.disposition, "APPROVED_FOR_PATTERNSPEC_DESIGN_NOT_MINTED");
  assert.equal(resolvedCandidate.runtimeAuthorityChanged, false);

  assert.equal(contract.formalMapping.sourceMappingCandidateId, candidate.formalMappingCandidateId);
  assert.equal(contract.formalMapping.primaryKnowledgePointId, null);
  assert.equal(contract.formalMapping.primaryKnowledgePointCandidateId, KPC_ID);
  assert.equal(contract.formalMapping.runtimeAdmission, false);

  assert.equal(
    kp.knowledgePoints.some((row) => row.knowledgePointId === "kp_g3a_u01_integer_number_line_scale_location"),
    false
  );
  assert.equal(contract.lifecycle.newKnowledgePointMinted, false);
});

test("Rank02 PatternSpec contract passes the repository core schema helper", () => {
  assert.equal(contract.schemaName, "G3AU01VisualPatternSpecRank02Contract");
  assert.equal(contract.patternSpec.patternSpecId, SPEC_ID);
  assert.equal(contract.patternSpec.knowledgePointId, null);
  assert.equal(contract.patternSpec.knowledgePointCandidateId, KPC_ID);
  assert.equal(contract.patternSpec.selectorStatus, "hidden");
  assert.equal(contract.patternSpec.productionUse, "forbidden");

  const result = validatePatternSpec(contract.patternSpec);
  assert.equal(result.validationStatus, "pass");
  assert.deepEqual(result.errorCodes, []);
});

test("Rank02 preserves exact 50-question source lineage", () => {
  const family = visual.families.find((row) => row.visualFamilyId === FAMILY_ID);
  const candidate = mappings.mappings.find((row) => row.visualFamilyId === FAMILY_ID);
  assert.equal(family.count, 50);
  assert.equal(candidate.questionCount, 50);
  assert.equal(contract.sourceCoverage.sourceQuestionCount, 50);
  assert.deepEqual([...contract.sourceCoverage.sourceQuestionIds].sort(), [...family.questionIds].sort());
  assert.deepEqual(
    [...contract.patternSpec.sourceMetadata.sourceQuestionIds].sort(),
    [...family.questionIds].sort()
  );
});

test("Rank02 curriculum calibration fixtures implement uniform integer scale reading", () => {
  assert.deepEqual(
    contract.sourceCalibrationFixtures.map((fixture) => fixture.expectedAnswer.answerValue),
    [20, 6, 100]
  );
  for (const fixture of contract.sourceCalibrationFixtures) {
    const { startValue, step, targetMarker } = fixture.model;
    assert.equal(
      fixture.expectedAnswer.answerValue,
      startValue + targetMarker.tickIndex * step
    );
    for (const anchor of fixture.model.visibleAnchors) {
      assert.equal(anchor.value, startValue + anchor.tickIndex * step);
    }
  }
});

test("Rank02 correctly requires an extension of the existing fraction number-line renderer", () => {
  assert.equal(contract.rendererBinding.classification, "EXTEND");
  assert.equal(
    contract.rendererBinding.existingRendererPath,
    "site/modules/renderer/fraction-number-line.js"
  );
  assert.equal(contract.rendererBinding.plannedModelKind, "integer_number_line");
  assert.equal(contract.rendererBinding.rendererCodeChangeRequired, true);
  assert.equal(contract.rendererBinding.rendererCodeChanged, false);

  // A Rank02 integer model must not be silently treated as the current fraction-number-line model.
  assert.equal(validateFractionNumberLineModel(contract.sourceCalibrationFixtures[0].model), false);
});

test("Rank02 stops at D2 contract materialization and does not leak into Rank03+", () => {
  assert.equal(contract.lifecycle.formalMappingMaterialized, true);
  assert.equal(contract.lifecycle.patternSpecMaterialized, true);
  assert.equal(contract.lifecycle.validatorContractMaterialized, true);
  assert.equal(contract.lifecycle.rendererExtensionContractMaterialized, true);
  assert.equal(contract.lifecycle.generatorImplemented, false);
  assert.equal(contract.lifecycle.validatorRuntimeImplemented, false);
  assert.equal(contract.lifecycle.rendererCodeChanged, false);
  assert.equal(contract.lifecycle.selectorVisible, false);
  assert.equal(contract.lifecycle.productionUse, "forbidden");
  assert.equal(contract.patternSpec.constraints.generation.rank03ToRank05OperationsForbidden, true);
  assert.deepEqual(contract.rendererBinding.explicitlyDeferredRank03PlusFeatures, [
    "learner_marks_given_value",
    "complete_missing_scale_labels",
    "multi_position_matching",
    "movement_segments"
  ]);
});
