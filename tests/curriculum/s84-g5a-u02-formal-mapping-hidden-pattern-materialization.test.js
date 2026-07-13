import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G5A_U02_SOURCE_PACKET_IDS,
  G5A_U02_HIDDEN_PATTERN_GROUPS,
  G5A_U02_HIDDEN_PATTERN_SPECS,
  getG5AU02HiddenPatternGroupById,
  getG5AU02HiddenPatternGroups,
  getG5AU02HiddenPatternSpecById,
  getG5AU02HiddenPatternSpecs,
  getG5AU02HiddenPatternSpecsByGroupId,
} from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

const path = (value) => new URL(`../../${value}`, import.meta.url);
const readJson = (value) => JSON.parse(readFileSync(path(value), "utf8"));
const rowsToObjects = (fields, rows) =>
  rows.map((values) => Object.fromEntries(fields.map((field, index) => [field, values[index]])));

function loadS82() {
  const index = readJson("data/curriculum/contracts/S82_G5A_U02_PatternSpecContractDesign.json");
  const groups = readJson(index.artifacts.patternGroups).patternGroups;
  const specs = index.artifacts.patternSpecs
    .flatMap((artifact) => readJson(artifact).patternSpecs)
    .sort((a, b) => a.patternOrder - b.patternOrder);
  return { index, groups, specs };
}

function loadS83() {
  const index = readJson("data/curriculum/contracts/S83_G5A_U02_PatternSpecContractQA.json");
  return {
    index,
    answer: readJson(index.artifacts.answerSchemaOverlay),
    template: readJson(index.artifacts.templateSemanticOverlay),
    grammar: readJson(index.artifacts.semanticGrammarOverlay),
    validator: readJson(index.artifacts.validatorCoverageOverlay),
  };
}

function loadS84() {
  const mapping = readJson("data/curriculum/mapping/S84_G5A_U02_FormalMapping.json");
  const registry = readJson("data/curriculum/pattern_specs/S84_G5A_U02_PatternSpecRegistry.json");
  return {
    mapping,
    registry,
    mappings: rowsToObjects(mapping.rowFields, mapping.formalMappings),
    groups: rowsToObjects(registry.groupRowFields, registry.patternGroups),
    specs: rowsToObjects(registry.specRowFields, registry.patternSpecs),
  };
}

test("S84 preflight requires merged S82 and S83 with S83 as the higher-precedence contract", () => {
  const { index: s82 } = loadS82();
  const { index: s83 } = loadS83();
  const { mapping, registry } = loadS84();

  assert.equal(s82.status, "pass_ci_synced_and_merged");
  assert.equal(s83.status, "qa_passed_ci_synced_and_merged");
  assert.deepEqual(mapping.effectiveContract.loadOrder, ["S82_base_contract", "S83_qa_overlay"]);
  assert.equal(mapping.effectiveContract.higherPrecedence, "S83_qa_overlay");
  assert.equal(mapping.effectiveContract.s83CloseoutRequired, true);
  assert.deepEqual(registry.effectiveContract, mapping.effectiveContract);
});

test("S84 materializes all 22 QA-accepted candidates one-to-one as authoritative FormalMappings", () => {
  const candidates = readJson("data/curriculum/mapping/g5a_u02_formal_mapping_candidates.json");
  const candidateQA = readJson("data/curriculum/mapping/g5a_u02_formal_mapping_candidate_qa.json");
  const { mapping, mappings } = loadS84();
  const byCandidate = new Map(mappings.map((row) => [row.sourceMappingCandidateId, row]));

  assert.equal(mapping.schemaName, "G5AU02FormalMapping");
  assert.equal(mapping.status, "authoritative_materialized_hidden_not_routed_pending_ci");
  assert.equal(mappings.length, 22);
  assert.equal(byCandidate.size, 22);
  assert.deepEqual([...byCandidate.keys()].sort(), [...candidateQA.acceptedMappingCandidateIds].sort());

  for (const candidate of candidates.formalMappingCandidates) {
    const row = byCandidate.get(candidate.id);
    assert.ok(row, `${candidate.id}: missing materialized mapping`);
    assert.equal(row.formalMappingId, candidate.id.replace(/^fmc_/, "fm_"));
    assert.equal(row.patternSpecId, candidate.ps);
    assert.equal(row.knowledgePointId, candidate.kp);
    assert.equal(row.patternGroupId, candidate.pg.replace(/^pgc_/, "pg_"));
    assert.equal(row.mode, candidate.mode);
    assert.equal(row.answerModelId, candidate.answer);
    assert.equal(row.implementationClass, candidate.class);
    assert.deepEqual(row.sourceEvidence, candidate.evidence);
  }
});

test("S84 freezes 18 complete hidden PatternGroups and 22 ordered hidden PatternSpecs", () => {
  const { groups, specs } = loadS84();
  const groupedIds = groups.flatMap((row) => row.patternSpecIds);
  const modeCounts = Object.fromEntries(
    [...new Set(specs.map((row) => row.mode))].map((mode) => [mode, specs.filter((row) => row.mode === mode).length]),
  );
  const classCounts = Object.fromEntries(
    [...new Set(specs.map((row) => row.implementationClass))]
      .map((kind) => [kind, specs.filter((row) => row.implementationClass === kind).length]),
  );

  assert.equal(groups.length, 18);
  assert.equal(specs.length, 22);
  assert.equal(new Set(groups.map((row) => row.patternGroupId)).size, 18);
  assert.equal(new Set(specs.map((row) => row.patternSpecId)).size, 22);
  assert.equal(groupedIds.length, 22);
  assert.equal(new Set(groupedIds).size, 22);
  assert.deepEqual([...groupedIds].sort(), specs.map((row) => row.patternSpecId).sort());
  assert.deepEqual(specs.map((row) => row.patternOrder), Array.from({ length: 22 }, (_, index) => index + 1));
  assert.deepEqual(modeCounts, {
    concept: 4,
    numeric: 6,
    representation: 1,
    reasoning: 3,
    application: 4,
    reasoning_application: 2,
    geometry_application: 2,
  });
  assert.deepEqual(classCounts, { C: 14, D: 8 });

  for (const group of groups) {
    const members = specs.filter((row) => row.patternGroupId === group.patternGroupId);
    assert.deepEqual(members.map((row) => row.patternSpecId), group.patternSpecIds);
    assert.ok(members.every((row) => row.knowledgePointId === group.knowledgePointId));
    assert.deepEqual([...new Set(members.map((row) => row.mode))], group.modes);
    assert.deepEqual([...new Set(members.map((row) => row.answerModelId))], group.answerModelIds);
  }
});

test("S84 registry remains identity-aligned with S82 contracts and materialized FormalMappings", () => {
  const { groups: baseGroups, specs: baseSpecs } = loadS82();
  const { mappings, groups, specs } = loadS84();
  const baseSpecById = new Map(baseSpecs.map((row) => [row.patternSpecId, row]));
  const baseGroupById = new Map(baseGroups.map((row) => [row.patternGroupId, row]));
  const formalById = new Map(mappings.map((row) => [row.formalMappingId, row]));

  for (const group of groups) {
    const base = baseGroupById.get(group.patternGroupId);
    assert.ok(base, `${group.patternGroupId}: missing S82 group`);
    assert.equal(group.knowledgePointId, base.knowledgePointId);
    assert.equal(group.displayName, base.displayName);
    assert.deepEqual(group.patternSpecIds, base.patternSpecIds);
    assert.deepEqual(group.answerModelIds, base.answerModels);
  }

  for (const spec of specs) {
    const base = baseSpecById.get(spec.patternSpecId);
    const formal = formalById.get(spec.formalMappingId);
    assert.ok(base, `${spec.patternSpecId}: missing S82 contract`);
    assert.ok(formal, `${spec.formalMappingId}: missing FormalMapping`);
    assert.equal(spec.sourceMappingCandidateId, base.sourceMappingCandidateId);
    assert.equal(spec.patternGroupId, base.patternGroupId);
    assert.equal(spec.knowledgePointId, base.knowledgePointId);
    assert.equal(spec.mode, base.mode);
    assert.equal(spec.answerModelId, base.answerModel);
    assert.equal(spec.implementationClass, base.implementationClass);
    assert.deepEqual(spec.sourceEvidence, base.sourceEvidence);
    assert.deepEqual(spec.templateFamilyIds, base.promptContract.templateFamilyRefs ?? []);
    assert.deepEqual(spec.qaOverlayRefs, base.qaOverlayRefs);
    assert.equal(formal.patternSpecId, spec.patternSpecId);
    assert.equal(formal.patternGroupId, spec.patternGroupId);
    assert.equal(formal.answerModelId, spec.answerModelId);
  }
});

test("S84 makes all six S83 corrections mandatory for later consumers", () => {
  const { mapping, registry, specs } = loadS84();
  const s83 = loadS83();

  assert.equal(s83.index.summary.qaCorrectionsApplied, 6);
  assert.equal(Object.keys(s83.answer.answerSchemaPolicy.closedSchemas).length, 16);
  assert.equal(s83.answer.answerSchemaPolicy.additionalProperties, false);
  assert.equal(s83.template.controlledTemplateOverrides.length, 8);
  assert.equal(
    s83.template.controlledTemplateOverrides
      .find((row) => row.templateFamilyId === "tpl_g5a_u02_equal_partition_segments")
      .controlledVariants.length,
    2,
  );
  assert.equal(s83.grammar.problemTypeDecisionTable.freeFormClassificationForbidden, true);
  assert.equal(s83.grammar.closedStatementGrammar.unknownStatementKindsForbidden, true);
  assert.equal(s83.grammar.closedStatementGrammar.targetParityAndFactorCountParitySeparated, true);

  const coveredCodes = s83.validator.validatorCoverageByStage.flatMap((row) => row.blockingCodes);
  assert.equal(s83.validator.validatorCoverageByStage.length, 9);
  assert.equal(coveredCodes.length, 64);
  assert.equal(new Set(coveredCodes).size, 64);

  for (const field of [
    "answerSchemasClosed",
    "factorQuotientWitnessConditional",
    "templateRoleBindingsExact",
    "areaUnitDerivationLocked",
    "problemTypeDecisionTableClosed",
    "statementGrammarClosed",
    "s81OverlayHookRequired",
    "validatorCodeCoverageExact",
  ]) {
    assert.equal(mapping.effectiveContract[field], true, field);
    assert.equal(registry.effectiveContract[field], true, field);
  }
  assert.equal(mapping.effectiveContract.equalPartitionVariantCount, 2);
  assert.equal(mapping.effectiveContract.applicationCrossCategoryEqualityRequired, false);

  const templateIds = new Set(specs.flatMap((row) => row.templateFamilyIds));
  assert.deepEqual(
    [...templateIds].sort(),
    s83.template.controlledTemplateOverrides.map((row) => row.templateFamilyId).sort(),
  );
});

test("S84 retains source packet identity but keeps public metadata promotion blocked", () => {
  const { mapping, registry } = loadS84();
  for (const boundary of [mapping.sourceIdentityBoundary, registry.sourceIdentityBoundary]) {
    assert.deepEqual(boundary.packetIdsRetained, ["g5a_u02_5a02a", "g5a_u02_5a02a1"]);
    assert.equal(boundary.hiddenMaterializationAllowed, true);
    assert.equal(boundary.publicCatalogPromotionRequiresMetadataCorrection, true);
    assert.deepEqual(boundary.requiredMetadataCorrection, {
      sourceId: "g5a_u02_5a02a1",
      displayTitle: "公因數",
      sourceUrl: "https://meow911.com/5a03b/",
    });
  }
});

test("S84 browser-neutral projection exactly matches authoritative JSON", () => {
  const { groups, specs } = loadS84();

  assert.deepEqual(
    G5A_U02_HIDDEN_PATTERN_GROUPS.map((row) => ({
      patternGroupId: row.patternGroupId,
      knowledgePointId: row.primaryKnowledgePointId,
      displayName: row.displayName,
      modes: row.modes,
      patternSpecIds: row.patternSpecIds,
      answerModelIds: row.answerModelIds,
    })),
    groups,
  );

  assert.deepEqual(
    G5A_U02_HIDDEN_PATTERN_SPECS.map((row) => ({
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
      qaOverlayRefs: row.qaOverlayRefs,
    })),
    specs,
  );
});

test("S84 projection is deeply frozen and exposes stable read-only accessors", () => {
  assert.equal(Object.isFrozen(G5A_U02_SOURCE_PACKET_IDS), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_GROUPS), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_SPECS), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_GROUPS[0]), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_GROUPS[0].modes), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_GROUPS[2].patternSpecIds), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_SPECS[0].answerModel), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_SPECS[8].templateFamilyIds), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_PATTERN_SPECS[0].sourcePacketIds), true);

  assert.equal(getG5AU02HiddenPatternGroups(), G5A_U02_HIDDEN_PATTERN_GROUPS);
  assert.equal(getG5AU02HiddenPatternSpecs(), G5A_U02_HIDDEN_PATTERN_SPECS);
  assert.equal(getG5AU02HiddenPatternGroupById("pg_g5a_u02_factor_enumeration_pairs")?.patternSpecIds.length, 2);
  assert.equal(getG5AU02HiddenPatternSpecById("ps_g5a_u02_multi_constraint_digit_code")?.patternOrder, 22);
  assert.equal(getG5AU02HiddenPatternSpecsByGroupId("pg_g5a_u02_equal_partition_application").length, 2);
  assert.equal(getG5AU02HiddenPatternGroupById("unknown"), null);
  assert.equal(getG5AU02HiddenPatternSpecById("unknown"), null);
});

test("S84 keeps all materialized authority hidden, unrouted and forbidden in production", () => {
  const { mapping, registry } = loadS84();
  const expectedScope = {
    sourceMetadataMutated: false,
    formalMappingMaterialized: true,
    patternGroupsMaterialized: true,
    patternSpecsMaterialized: true,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    canonicalRoutingEnabled: false,
    productionUse: "forbidden",
  };

  assert.deepEqual(mapping.scopeBoundary, expectedScope);
  assert.deepEqual(registry.scopeBoundary, expectedScope);
  assert.equal(registry.lifecycle.selectorStatus, "hidden");
  assert.equal(registry.lifecycle.canonicalRouting, "disabled");
  assert.equal(registry.lifecycle.generatorStatus, "hidden_not_implemented");
  assert.equal(registry.lifecycle.validatorStatus, "contract_only_not_runtime");
  assert.equal(registry.lifecycle.productionUse, "forbidden");
  assert.equal(registry.lifecycle.genericFallback, "forbidden");
  assert.equal(registry.summary.visibleSpecCount, 0);
  assert.equal(registry.summary.routedSpecCount, 0);
  assert.equal(registry.summary.productionSpecCount, 0);

  for (const group of G5A_U02_HIDDEN_PATTERN_GROUPS) {
    assert.equal(group.visibilityStatus, "hidden");
    assert.equal(group.canonicalRouting, "disabled");
    assert.equal(group.productionUse, "forbidden");
  }
  for (const spec of G5A_U02_HIDDEN_PATTERN_SPECS) {
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.generatorStatus, "hidden_not_implemented");
    assert.equal(spec.validatorStatus, "contract_only_not_runtime");
    assert.equal(spec.productionUse, "forbidden");
    assert.equal(spec.genericFallback, "forbidden");
  }
});
