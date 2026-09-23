import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ID = "g3b_u04_3b04";
const UNIT_CODE = "3B-U04";
const UNIT_TITLE = "兩步驟計算";
const SOURCE_TEMPLATE_PATH = resolve(ROOT, "data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json");
const OUTPUT_JSON_PATH = resolve(ROOT, "data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json");
const OUTPUT_JS_PATH = resolve(ROOT, "site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js");
const OUTPUT_TEST_PATH = resolve(ROOT, "tests/curriculum/g3b-u04-semantic-pattern-specs.test.js");

const KNOWLEDGE_POINT_METADATA = Object.freeze({
  kp_g3b_u04_add_then_divide: Object.freeze({
    displayName: "先加再除",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "addition_then_division", "word_problem"])
  }),
  kp_g3b_u04_multiply_then_divide_average_unit_price: Object.freeze({
    displayName: "先乘再除求平均單價",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "multiplication_then_division", "average_unit_price", "word_problem"])
  }),
  kp_g3b_u04_subtract_then_divide: Object.freeze({
    displayName: "先減再除",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "subtraction_then_division", "word_problem"])
  }),
  kp_g3b_u04_divide_then_add: Object.freeze({
    displayName: "先除再加",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "division_then_addition", "word_problem"])
  }),
  kp_g3b_u04_total_minus_shared_amount: Object.freeze({
    displayName: "總量減去平均分擔量",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "division_before_subtraction", "personal_share", "word_problem"])
  }),
  kp_g3b_u04_group_total_minus_remaining: Object.freeze({
    displayName: "分組總數減剩餘組數",
    canonicalSkillId: "integer_mixed_operations",
    skillTags: Object.freeze(["two_step", "division_then_subtraction", "group_count", "word_problem"])
  }),
  kp_g3b_u04_consecutive_multiplication: Object.freeze({
    displayName: "連續乘法",
    canonicalSkillId: "integer_multiplication",
    skillTags: Object.freeze(["two_step", "consecutive_multiplication", "word_problem"])
  }),
  kp_g3b_u04_composite_multiplicative_ratio: Object.freeze({
    displayName: "複合倍數關係",
    canonicalSkillId: "multiplicative_comparison",
    skillTags: Object.freeze(["two_step", "multiplicative_ratio", "relationship_chain", "word_problem"])
  }),
  kp_g3b_u04_multiplicative_quantity_chain: Object.freeze({
    displayName: "倍數數量鏈",
    canonicalSkillId: "multiplicative_comparison",
    skillTags: Object.freeze(["two_step", "multiplicative_quantity_chain", "relationship_chain", "word_problem"])
  })
});

const OBSOLETE_S43E6_PSEUDO_KPS = Object.freeze([
  "kp_g3b_u04_divide_then_subtract",
  "kp_g3b_u04_basic_multiplicative_comparison",
  "kp_g3b_u04_multiplicative_relationship_chain",
  "kp_g3b_u04_line_segment_two_step_word_problem",
  "kp_g3b_u04_equal_sharing_then_add_subtract",
  "kp_g3b_u04_packaging_then_add_subtract",
  "kp_g3b_u04_multiplication_context_rows_boxes_groups",
  "kp_g3b_u04_multi_layer_multiplicative_reasoning"
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function patternSpecIdFor(templateFamilyId) {
  assert(/^tpl_g3b_u04_/.test(templateFamilyId), `Unexpected template family id: ${templateFamilyId}`);
  return templateFamilyId.replace(/^tpl_/, "ps_");
}

function patternGroupIdFor(knowledgePointId) {
  return knowledgePointId.replace(/^kp_/, "pg_");
}

function buildPatternSpec(family, familyOrder, familyOrderWithinKnowledgePoint) {
  const kp = KNOWLEDGE_POINT_METADATA[family.knowledgePointId];
  assert(kp, `Unapproved knowledge point: ${family.knowledgePointId}`);
  return {
    patternSpecId: patternSpecIdFor(family.templateFamilyId),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    kind: "g3bU04SemanticWordProblem",
    patternGroupId: patternGroupIdFor(family.knowledgePointId),
    knowledgePointId: family.knowledgePointId,
    templateFamilyId: family.templateFamilyId,
    semanticSignature: family.semanticSignature,
    equationShape: family.equationShape,
    unknownRole: family.unknownRole,
    quantityRoles: family.quantityRoles,
    contextDomains: family.contextDomains,
    promptSkeletonZh: family.promptSkeletonZh,
    requiredConstraints: family.requiredConstraints,
    numericPolicyRef: "S57.sharedNumericPolicy",
    semanticValidatorRef: "S57_G3B_U04_SemanticValidationContract",
    answerModel: {
      shape: "semantic_equation_answer",
      fields: ["equationModel", "finalAnswer", "finalAnswerWithUnit", "semanticSnapshot"]
    },
    canonicalSkillIds: [kp.canonicalSkillId],
    skillTags: [...kp.skillTags],
    difficultyTags: ["batch_a_browser_bridge", "g3b_u04_semantic_word_problem", "hidden_s57e1"],
    patternTags: ["batch_a", "g3b_u04", "semantic_family", family.templateFamilyId],
    curriculumNodeIds: [SOURCE_ID],
    familyOrder,
    familyOrderWithinKnowledgePoint,
    generatorStatus: "hidden_implementation_candidate",
    validatorStatus: "blocking_validator_required",
    runtimeProjectionStatus: "materialized_not_routed",
    selectorStatus: "hidden",
    productionUse: "forbidden"
  };
}

function buildPatternGroups(patternSpecs) {
  return Object.entries(KNOWLEDGE_POINT_METADATA).map(([knowledgePointId, metadata]) => ({
    patternGroupId: patternGroupIdFor(knowledgePointId),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: metadata.displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "B",
    patternSpecIds: patternSpecs.filter((spec) => spec.knowledgePointId === knowledgePointId).map((spec) => spec.patternSpecId),
    allocationPolicy: "balanced_by_family",
    visibilityStatus: "hidden",
    holdReason: "semantic_runtime_and_smoke_qa_required"
  }));
}

function stableCoverage(patternSpecs) {
  return Object.fromEntries(Object.keys(KNOWLEDGE_POINT_METADATA).map((knowledgePointId) => [
    knowledgePointId,
    patternSpecs.filter((spec) => spec.knowledgePointId === knowledgePointId).length
  ]));
}

function validateSourceRegistry(source) {
  assert(source.schemaName === "G3BU04SemanticTemplateFamilyRegistry", "Unexpected source schema");
  assert(source.sourceId === SOURCE_ID, "Unexpected source id");
  assert(source.unitCode === UNIT_CODE, "Unexpected unit code");
  assert(Array.isArray(source.templateFamilies), "templateFamilies must be an array");
  assert(source.templateFamilies.length === 32, `Expected 32 families, got ${source.templateFamilies.length}`);
  const familyIds = source.templateFamilies.map((family) => family.templateFamilyId);
  assert(new Set(familyIds).size === 32, "Duplicate template family id");
  const approvedKps = new Set(Object.keys(KNOWLEDGE_POINT_METADATA));
  for (const family of source.templateFamilies) {
    assert(approvedKps.has(family.knowledgePointId), `Family mapped to unapproved KP: ${family.templateFamilyId}`);
    assert(!OBSOLETE_S43E6_PSEUDO_KPS.includes(family.knowledgePointId), `Obsolete pseudo-KP reintroduced: ${family.knowledgePointId}`);
    for (const key of ["semanticSignature", "equationShape", "unknownRole", "promptSkeletonZh"]) {
      assert(typeof family[key] === "string" && family[key].length > 0, `Missing ${key}: ${family.templateFamilyId}`);
    }
    assert(family.quantityRoles && typeof family.quantityRoles === "object", `Missing quantityRoles: ${family.templateFamilyId}`);
    assert(Array.isArray(family.contextDomains) && family.contextDomains.length > 0, `Missing contextDomains: ${family.templateFamilyId}`);
    assert(Array.isArray(family.requiredConstraints) && family.requiredConstraints.length > 0, `Missing requiredConstraints: ${family.templateFamilyId}`);
  }
}

function renderRuntimeModule(patternSpecs, patternGroups) {
  const specsLiteral = JSON.stringify(patternSpecs, null, 2);
  const groupsLiteral = JSON.stringify(patternGroups, null, 2);
  return `import {\n  getBatchABrowserPatternDefinition as baseGetDefinition,\n  getBatchAPatternSpecIdsForSource as baseGetPatternIds\n} from "./source-pattern-g4a-u08-phase2a-extension.js";\n\nexport const G3B_U04_SOURCE_ID = ${JSON.stringify(SOURCE_ID)};\n\nfunction deepFreeze(value) {\n  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;\n  for (const nested of Object.values(value)) deepFreeze(nested);\n  return Object.freeze(value);\n}\n\nconst patternSpecs = deepFreeze(${specsLiteral});\nconst patternGroups = deepFreeze(${groupsLiteral});\nconst definitions = new Map(patternSpecs.map((spec) => [spec.patternSpecId, spec]));\n\nexport const G3B_U04_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(patternSpecs.map((spec) => spec.patternSpecId));\nexport const G3B_U04_SEMANTIC_PATTERN_DEFINITIONS = Object.freeze(Object.fromEntries(definitions));\nexport const G3B_U04_SEMANTIC_PATTERN_GROUPS = patternGroups;\n\nexport function isG3BU04SemanticPatternSpecId(patternSpecId) {\n  return definitions.has(patternSpecId);\n}\n\nexport function getG3BU04SemanticPatternDefinition(patternSpecId) {\n  return definitions.get(patternSpecId) ?? null;\n}\n\nexport function listG3BU04SemanticPatternDefinitions() {\n  return [...patternSpecs];\n}\n\nexport function listG3BU04SemanticPatternGroups() {\n  return [...patternGroups];\n}\n\nexport function getBatchABrowserPatternDefinition(patternSpecId) {\n  return definitions.get(patternSpecId) ?? baseGetDefinition(patternSpecId);\n}\n\nexport function getBatchAPatternSpecIdsForSource(sourceId) {\n  const baseIds = baseGetPatternIds(sourceId);\n  if (sourceId === G3B_U04_SOURCE_ID) return [...baseIds, ...G3B_U04_SEMANTIC_PATTERN_SPEC_IDS];\n  return baseIds;\n}\n`;
}

function renderTestModule() {
  return `import test from "node:test";\nimport assert from "node:assert/strict";\nimport { existsSync, readFileSync } from "node:fs";\n\nimport {\n  G3B_U04_SEMANTIC_PATTERN_SPEC_IDS,\n  getBatchABrowserPatternDefinition,\n  getBatchAPatternSpecIdsForSource,\n  getG3BU04SemanticPatternDefinition,\n  listG3BU04SemanticPatternDefinitions,\n  listG3BU04SemanticPatternGroups\n} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";\n\nconst SOURCE_ID = "g3b_u04_3b04";\nconst source = JSON.parse(readFileSync(new URL("../../data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json", import.meta.url), "utf8"));\nconst registry = JSON.parse(readFileSync(new URL("../../data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json", import.meta.url), "utf8"));\nconst obsoletePseudoKps = new Set(${JSON.stringify(OBSOLETE_S43E6_PSEUDO_KPS, null, 2)});\n\nfunction projectedFamily(spec) {\n  return {\n    templateFamilyId: spec.templateFamilyId,\n    knowledgePointId: spec.knowledgePointId,\n    semanticSignature: spec.semanticSignature,\n    equationShape: spec.equationShape,\n    unknownRole: spec.unknownRole,\n    contextDomains: spec.contextDomains,\n    quantityRoles: spec.quantityRoles,\n    promptSkeletonZh: spec.promptSkeletonZh,\n    requiredConstraints: spec.requiredConstraints\n  };\n}\n\ntest("S57E1 materializes exactly 32 semantic PatternSpecs across the approved nine KnowledgePoints", () => {\n  assert.equal(registry.schemaName, "G3BU04SemanticPatternSpecRegistry");\n  assert.equal(registry.task, "S57E1_G3B_U04_SemanticPatternSpecMaterialization");\n  assert.equal(registry.sourceId, SOURCE_ID);\n  assert.equal(registry.patternSpecs.length, 32);\n  assert.equal(registry.patternGroups.length, 9);\n  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)).size, 32);\n  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.templateFamilyId)).size, 32);\n  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.knowledgePointId)).size, 9);\n  assert.equal(registry.summary.orphanPatternSpecCount, 0);\n  assert.equal(registry.summary.selectorVisibleCount, 0);\n  assert.equal(registry.summary.productionReadyCount, 0);\n  for (const spec of registry.patternSpecs) {\n    assert.equal(spec.patternSpecId, spec.templateFamilyId.replace(/^tpl_/, "ps_"));\n    assert.equal(spec.kind, "g3bU04SemanticWordProblem");\n    assert.equal(spec.sourceId, SOURCE_ID);\n    assert.equal(spec.patternGroupId, spec.knowledgePointId.replace(/^kp_/, "pg_"));\n    assert.equal(spec.selectorStatus, "hidden");\n    assert.equal(spec.productionUse, "forbidden");\n    assert.equal(spec.runtimeProjectionStatus, "materialized_not_routed");\n    assert.equal(spec.generatorStatus, "hidden_implementation_candidate");\n    assert.equal(spec.validatorStatus, "blocking_validator_required");\n    assert.deepEqual(spec.answerModel, {\n      shape: "semantic_equation_answer",\n      fields: ["equationModel", "finalAnswer", "finalAnswerWithUnit", "semanticSnapshot"]\n    });\n    assert.equal(obsoletePseudoKps.has(spec.knowledgePointId), false);\n  }\n});\n\ntest("S57E1 PatternSpecs preserve the approved S57 family contract without registry drift", () => {\n  const sourceByFamily = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));\n  assert.equal(sourceByFamily.size, 32);\n  for (const spec of registry.patternSpecs) {\n    assert.deepEqual(projectedFamily(spec), sourceByFamily.get(spec.templateFamilyId));\n  }\n  assert.deepEqual(registry.coverageSummary, source.coverageSummary);\n});\n\ntest("S57E1 PatternGroups partition all 32 families and preserve hidden balanced allocation", () => {\n  const groupedIds = registry.patternGroups.flatMap((group) => group.patternSpecIds);\n  assert.equal(groupedIds.length, 32);\n  assert.equal(new Set(groupedIds).size, 32);\n  assert.deepEqual(new Set(groupedIds), new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)));\n  for (const group of registry.patternGroups) {\n    assert.equal(group.patternGroupId, group.primaryKnowledgePointId.replace(/^kp_/, "pg_"));\n    assert.deepEqual(group.knowledgePointIds, [group.primaryKnowledgePointId]);\n    assert.equal(group.allocationPolicy, "balanced_by_family");\n    assert.equal(group.visibilityStatus, "hidden");\n    assert.equal(group.holdReason, "semantic_runtime_and_smoke_qa_required");\n    assert.equal(group.patternSpecIds.length, source.coverageSummary[group.primaryKnowledgePointId]);\n  }\n});\n\ntest("S57E1 browser projection is an exact drift-checked copy and delegates prior definitions", () => {\n  const runtimeSpecs = listG3BU04SemanticPatternDefinitions();\n  const runtimeGroups = listG3BU04SemanticPatternGroups();\n  assert.deepEqual(runtimeSpecs, registry.patternSpecs);\n  assert.deepEqual(runtimeGroups, registry.patternGroups);\n  assert.deepEqual(G3B_U04_SEMANTIC_PATTERN_SPEC_IDS, registry.patternSpecs.map((spec) => spec.patternSpecId));\n  for (const spec of registry.patternSpecs) assert.deepEqual(getG3BU04SemanticPatternDefinition(spec.patternSpecId), spec);\n  assert.equal(getBatchABrowserPatternDefinition("ps_g3b_u04_consecutive_multiplication")?.patternSpecId, "ps_g3b_u04_consecutive_multiplication");\n  const sourceIds = getBatchAPatternSpecIdsForSource(SOURCE_ID);\n  for (const patternSpecId of G3B_U04_SEMANTIC_PATTERN_SPEC_IDS) assert.equal(sourceIds.includes(patternSpecId), true);\n});\n\ntest("S57E1 keeps selector visibility deferred to S57F", () => {\n  const selectorPath = new URL("../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js", import.meta.url);\n  assert.equal(existsSync(selectorPath), false);\n});\n`;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE_TEMPLATE_PATH, "utf8"));
  validateSourceRegistry(source);
  const withinKp = new Map();
  const patternSpecs = source.templateFamilies.map((family, index) => {
    const next = (withinKp.get(family.knowledgePointId) ?? 0) + 1;
    withinKp.set(family.knowledgePointId, next);
    return buildPatternSpec(family, index + 1, next);
  });
  const patternGroups = buildPatternGroups(patternSpecs);
  const coverageSummary = stableCoverage(patternSpecs);
  assert(JSON.stringify(coverageSummary) === JSON.stringify(source.coverageSummary), "Coverage summary drift");
  assert(patternSpecs.length === 32, "PatternSpec count drift");
  assert(patternGroups.length === 9, "PatternGroup count drift");

  const registry = {
    schemaName: "G3BU04SemanticPatternSpecRegistry",
    schemaVersion: 1,
    task: "S57E1_G3B_U04_SemanticPatternSpecMaterialization",
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    materializationStatus: "authoritative_materialized_hidden_not_routed",
    sourceTemplateRegistryRef: "data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json",
    semanticValidationContractRef: "data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json",
    sourceMappingRef: "data/curriculum/mapping/S57_G3B_U04_SourceFieldKnowledgePointMapping.json",
    designRef: "docs/curriculum/architecture/S57D_G3B_U04_PatternSpecAndSemanticGeneratorImplementation_DesignScan.md",
    policy: {
      oneSemanticFamilyPerPatternSpec: true,
      authoritativeArtifact: true,
      runtimeProjectionRequired: true,
      selectorVisibility: "hidden",
      productionUse: "forbidden",
      generatorRouting: "not_implemented_in_s57e1",
      semanticValidationRuntime: "not_implemented_in_s57e1",
      freeFormAIGeneration: "forbidden"
    },
    sharedNumericPolicy: source.sharedNumericPolicy,
    patternGroups,
    patternSpecs,
    coverageSummary,
    summary: {
      patternSpecCount: patternSpecs.length,
      patternGroupCount: patternGroups.length,
      knowledgePointCount: Object.keys(coverageSummary).length,
      templateFamilyCount: source.templateFamilies.length,
      orphanPatternSpecCount: 0,
      selectorVisibleCount: 0,
      productionReadyCount: 0,
      runtimeCodeChanged: false,
      browserProjectionMaterialized: true,
      browserProjectionRouted: false
    }
  };

  await Promise.all([OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH].map((path) => mkdir(dirname(path), { recursive: true })));
  await writeFile(OUTPUT_JSON_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await writeFile(OUTPUT_JS_PATH, renderRuntimeModule(patternSpecs, patternGroups), "utf8");
  await writeFile(OUTPUT_TEST_PATH, renderTestModule(), "utf8");
  console.log(JSON.stringify({ patternSpecCount: patternSpecs.length, patternGroupCount: patternGroups.length, output: [OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH] }, null, 2));
}

await main();
