import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_HIDDEN_PATTERN_GROUPS,
  G4B_U04_HIDDEN_PATTERN_SPECS,
  getG4BU04HiddenPatternGroupById,
  getG4BU04HiddenPatternGroups,
  getG4BU04HiddenPatternSpecById,
  getG4BU04HiddenPatternSpecs,
  getG4BU04HiddenPatternSpecsByGroupId,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";

const S64_PATH = new URL("../../data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json", import.meta.url);
const S66_PATH = new URL("../../data/curriculum/contracts/S66_G4B_U04_PatternSpecContractDesign.json", import.meta.url);
const S67_PATH = new URL("../../data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA.json", import.meta.url);
const S67_CLOSEOUT_PATH = new URL("../../data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA_Closeout.json", import.meta.url);
const S68_MAPPING_PATH = new URL("../../data/curriculum/mapping/S68_G4B_U04_FormalMapping.json", import.meta.url);
const S68_REGISTRY_PATH = new URL("../../data/curriculum/pattern_specs/S68_G4B_U04_PatternSpecRegistry.json", import.meta.url);

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

function rowsToObjects(fields, rows) {
  return rows.map((values) => Object.fromEntries(fields.map((field, index) => [field, values[index]])));
}

function mappingRows(document) {
  return rowsToObjects(document.rowFields, document.formalMappings);
}

function groupRows(document) {
  return rowsToObjects(document.groupRowFields, document.patternGroups);
}

function specRows(document) {
  return rowsToObjects(document.specRowFields, document.patternSpecs);
}

test("S68 preflight requires the accepted S67 closeout and higher-precedence QA overlay", () => {
  const closeout = readJson(S67_CLOSEOUT_PATH);
  const mapping = readJson(S68_MAPPING_PATH);
  const registry = readJson(S68_REGISTRY_PATH);

  assert.equal(closeout.status, "qa_passed_ci_synced_and_merged");
  assert.equal(mapping.refs.qaCloseout, "data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA_Closeout.json");
  assert.equal(mapping.effectiveContract.s67CloseoutRequired, true);
  assert.equal(registry.refs.qaCloseout, "data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA_Closeout.json");
  assert.deepEqual(registry.effectiveContract.loadOrder, ["S66_base_contract", "S67_qa_overlay"]);
  assert.equal(registry.effectiveContract.higherPrecedence, "S67_qa_overlay");
});

test("S68 materializes all 17 candidate mappings one-to-one as authoritative hidden FormalMappings", () => {
  const candidates = readJson(S64_PATH);
  const mapping = readJson(S68_MAPPING_PATH);
  const rows = mappingRows(mapping);
  const materializedByCandidate = new Map(rows.map((row) => [row.sourceMappingCandidateId, row]));

  assert.equal(mapping.schemaName, "G4BU04FormalMapping");
  assert.equal(mapping.status, "authoritative_materialized_hidden_not_routed_pending_ci");
  assert.equal(rows.length, 17);
  assert.equal(materializedByCandidate.size, 17);

  for (const candidate of candidates.formalMappingCandidates) {
    const row = materializedByCandidate.get(candidate.id);
    assert.ok(row, `${candidate.id}: missing materialized FormalMapping`);
    assert.equal(row.formalMappingId, candidate.id.replace(/^fmc_/, "fm_"));
    assert.equal(row.patternSpecId, candidate.ps);
    assert.equal(row.knowledgePointId, candidate.kp);
    assert.equal(row.patternGroupId, candidate.pg.replace(/^pgc_/, "pg_"));
    assert.equal(row.mode, candidate.mode);
    assert.equal(row.answerModelId, candidate.answer);
    assert.equal(row.implementationClass, candidate.class);
    assert.deepEqual(row.sourceEvidence, candidate.evidence);
  }

  assert.deepEqual(mapping.lifecycle, {
    selectorVisibility: "hidden",
    canonicalRouting: "disabled",
    generatorStatus: "hidden_not_implemented",
    validatorStatus: "contract_only_not_runtime",
    productionUse: "forbidden",
    genericFallback: "forbidden",
  });
});

test("S68 freezes 12 complete hidden PatternGroups and 17 ordered hidden PatternSpecs", () => {
  const registry = readJson(S68_REGISTRY_PATH);
  const groups = groupRows(registry);
  const specs = specRows(registry);
  const groupIds = groups.map((row) => row.patternGroupId);
  const specIds = specs.map((row) => row.patternSpecId);
  const groupedSpecIds = groups.flatMap((row) => row.patternSpecIds);
  const modeCounts = specs.reduce((acc, row) => {
    acc[row.mode] = (acc[row.mode] ?? 0) + 1;
    return acc;
  }, {});
  const classCounts = specs.reduce((acc, row) => {
    acc[row.implementationClass] = (acc[row.implementationClass] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(groups.length, 12);
  assert.equal(specs.length, 17);
  assert.equal(new Set(groupIds).size, 12);
  assert.equal(new Set(specIds).size, 17);
  assert.equal(groupedSpecIds.length, 17);
  assert.equal(new Set(groupedSpecIds).size, 17);
  assert.deepEqual([...groupedSpecIds].sort(), [...specIds].sort());
  assert.deepEqual(specs.map((row) => row.patternOrder), Array.from({ length: 17 }, (_, index) => index + 1));
  assert.deepEqual(modeCounts, {
    concept: 4,
    numeric: 3,
    application: 4,
    operation_estimation: 4,
    reasoning: 2,
  });
  assert.deepEqual(classCounts, { C: 9, D: 8 });

  for (const group of groups) {
    for (const patternSpecId of group.patternSpecIds) {
      const spec = specs.find((row) => row.patternSpecId === patternSpecId);
      assert.ok(spec, `${patternSpecId}: missing`);
      assert.equal(spec.patternGroupId, group.patternGroupId);
      assert.equal(spec.knowledgePointId, group.knowledgePointId);
      assert.equal(spec.mode, group.mode);
    }
  }
});

test("S68 registry remains identity-aligned with S66 base contracts and materialized FormalMappings", () => {
  const s66 = readJson(S66_PATH);
  const mapping = readJson(S68_MAPPING_PATH);
  const registry = readJson(S68_REGISTRY_PATH);
  const mappings = mappingRows(mapping);
  const specs = specRows(registry);
  const baseById = new Map(s66.patternSpecs.map((row) => [row.patternSpecId, row]));
  const formalById = new Map(mappings.map((row) => [row.formalMappingId, row]));

  assert.equal(baseById.size, 17);
  assert.equal(formalById.size, 17);

  for (const spec of specs) {
    const base = baseById.get(spec.patternSpecId);
    const formal = formalById.get(spec.formalMappingId);
    assert.ok(base, `${spec.patternSpecId}: missing S66 base`);
    assert.ok(formal, `${spec.formalMappingId}: missing FormalMapping`);
    assert.equal(spec.sourceMappingCandidateId, base.sourceMappingCandidateId);
    assert.equal(spec.patternGroupId, base.patternGroupId);
    assert.equal(spec.knowledgePointId, base.knowledgePointId);
    assert.equal(spec.mode, base.mode);
    assert.equal(spec.answerModelId, base.answerModel);
    assert.equal(spec.implementationClass, base.implementationClass);
    assert.deepEqual(spec.sourceEvidence, base.sourceEvidence);
    assert.deepEqual(spec.templateFamilyIds, base.promptContract.templateFamilyRefs ?? []);
    assert.equal(formal.patternSpecId, spec.patternSpecId);
    assert.equal(formal.patternGroupId, spec.patternGroupId);
    assert.equal(formal.knowledgePointId, spec.knowledgePointId);
    assert.equal(formal.answerModelId, spec.answerModelId);
  }
});

test("S68 makes all five S67 corrections mandatory for every later consumer", () => {
  const s67 = readJson(S67_PATH);
  const registry = readJson(S68_REGISTRY_PATH);
  const specs = specRows(registry);
  const overlay = s67.effectiveContractOverlay;

  assert.equal(registry.effectiveContract.answerSchemasClosed, true);
  assert.equal(registry.effectiveContract.templateRoleBindingsRequired, true);
  assert.equal(registry.effectiveContract.operationInputsVisible, true);
  assert.equal(registry.effectiveContract.digitMaskGrammarLocked, true);
  assert.equal(registry.effectiveContract.validatorCodeCoverageExact, true);

  assert.equal(overlay.answerSchemaPolicy.closedSchemaNames.length, 9);
  assert.equal(overlay.answerSchemaPolicy.additionalProperties, false);
  assert.equal(overlay.controlledTemplateOverrides.length, 9);
  for (const template of overlay.controlledTemplateOverrides) {
    assert.deepEqual(Object.keys(template.roleBindings).sort(), [...template.requiredRoles].sort());
    assert.equal(template.computationInputsVisible, true);
  }

  const registryTemplateIds = new Set(specs.flatMap((row) => row.templateFamilyIds));
  assert.deepEqual(
    [...registryTemplateIds].sort(),
    overlay.controlledTemplateOverrides.map((row) => row.templateFamilyId).sort(),
  );
  assert.deepEqual(
    overlay.operationEstimationPromptPolicy.affectedPatternSpecIds,
    [
      "ps_g4b_u04_round_then_add",
      "ps_g4b_u04_round_then_subtract",
      "ps_g4b_u04_round_then_multiply",
      "ps_g4b_u04_round_then_divide",
    ],
  );
  assert.equal(Object.keys(overlay.digitMaskContracts).length, 2);

  const coveredCodes = overlay.validatorCoverageByStage.flatMap((row) => row.blockingCodes);
  assert.equal(overlay.validatorCoverageByStage.length, 8);
  assert.equal(coveredCodes.length, 44);
  assert.equal(new Set(coveredCodes).size, 44);
});

test("S68 browser-neutral hidden projection exactly matches the authoritative registry", () => {
  const registry = readJson(S68_REGISTRY_PATH);
  const groups = groupRows(registry);
  const specs = specRows(registry);

  assert.deepEqual(
    G4B_U04_HIDDEN_PATTERN_GROUPS.map((row) => ({
      patternGroupId: row.patternGroupId,
      knowledgePointId: row.primaryKnowledgePointId,
      mode: row.mode,
      patternSpecIds: row.patternSpecIds,
    })),
    groups,
  );

  assert.deepEqual(
    G4B_U04_HIDDEN_PATTERN_SPECS.map((row) => ({
      patternSpecId: row.patternSpecId,
      formalMappingId: row.formalMappingId,
      sourceMappingCandidateId: row.sourceMappingCandidateId,
      patternGroupId: row.patternGroupId,
      knowledgePointId: row.knowledgePointId,
      mode: row.mode,
      answerModelId: row.answerModel.shape,
      implementationClass: row.implementationClass,
      templateFamilyIds: row.templateFamilyIds,
      sourceEvidence: row.sourceEvidence,
      patternOrder: row.patternOrder,
    })),
    specs,
  );
});

test("S68 hidden projection is deeply frozen and exposes stable read-only accessors", () => {
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_GROUPS), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_SPECS), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_GROUPS[0]), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_GROUPS[0].patternSpecIds), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_SPECS[0]), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_SPECS[0].answerModel), true);
  assert.equal(Object.isFrozen(G4B_U04_HIDDEN_PATTERN_SPECS[7].templateFamilyIds), true);

  assert.equal(getG4BU04HiddenPatternGroups(), G4B_U04_HIDDEN_PATTERN_GROUPS);
  assert.equal(getG4BU04HiddenPatternSpecs(), G4B_U04_HIDDEN_PATTERN_SPECS);
  assert.equal(getG4BU04HiddenPatternGroupById("pg_g4b_u04_payment_ceiling")?.patternSpecIds.length, 2);
  assert.equal(getG4BU04HiddenPatternSpecById("ps_g4b_u04_inverse_original_values")?.patternOrder, 17);
  assert.equal(getG4BU04HiddenPatternSpecsByGroupId("pg_g4b_u04_method_comparison").length, 2);
  assert.equal(getG4BU04HiddenPatternGroupById("unknown"), null);
  assert.equal(getG4BU04HiddenPatternSpecById("unknown"), null);
});

test("S68 keeps every materialized row hidden, unrouted and forbidden in production", () => {
  const mapping = readJson(S68_MAPPING_PATH);
  const registry = readJson(S68_REGISTRY_PATH);

  assert.deepEqual(mapping.scopeBoundary, {
    formalMappingMaterialized: true,
    patternGroupsMaterialized: true,
    patternSpecsMaterialized: true,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    canonicalRoutingEnabled: false,
    productionUse: "forbidden",
  });
  assert.deepEqual(registry.scopeBoundary, mapping.scopeBoundary);
  assert.equal(registry.lifecycle.selectorStatus, "hidden");
  assert.equal(registry.lifecycle.canonicalRouting, "disabled");
  assert.equal(registry.lifecycle.productionUse, "forbidden");
  assert.equal(registry.lifecycle.genericFallback, "forbidden");
  assert.equal(registry.summary.visibleSpecCount, 0);
  assert.equal(registry.summary.routedSpecCount, 0);
  assert.equal(registry.summary.productionSpecCount, 0);

  for (const group of G4B_U04_HIDDEN_PATTERN_GROUPS) {
    assert.equal(group.visibilityStatus, "hidden");
    assert.equal(group.canonicalRouting, "disabled");
    assert.equal(group.productionUse, "forbidden");
  }
  for (const spec of G4B_U04_HIDDEN_PATTERN_SPECS) {
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.productionUse, "forbidden");
    assert.equal(spec.generatorStatus, "hidden_not_implemented");
    assert.equal(spec.validatorStatus, "contract_only_not_runtime");
    assert.equal(spec.genericFallback, "forbidden");
  }
});
