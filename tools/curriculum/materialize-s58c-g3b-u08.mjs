import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ID = "g3b_u08_3b08";
const UNIT_CODE = "3B-U08";
const UNIT_TITLE = "乘法與除法";
const SOURCE_TEMPLATE_PATH = resolve(ROOT, "data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json");
const FREEZE_PATH = resolve(ROOT, "data/curriculum/contracts/S58A1_G3B_U08_24FamilyHumanReadbackFreeze.json");
const OUTPUT_JSON_PATH = resolve(ROOT, "data/curriculum/pattern_specs/S58C_G3B_U08_SemanticPatternSpecRegistry.json");
const OUTPUT_JS_PATH = resolve(ROOT, "site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js");
const OUTPUT_TEST_PATH = resolve(ROOT, "tests/curriculum/g3b-u08-semantic-pattern-specs.test.js");

const KP_METADATA = Object.freeze({
  kp_g3b_u08_total_from_groups: Object.freeze({
    displayName: "已知每組量與組數，求總量",
    canonicalSkillId: "multiplication_word_problem",
    skillTags: Object.freeze(["multiplication", "equal_groups", "find_total", "word_problem"]),
    answerModelShape: "semantic_single_integer_with_unit"
  }),
  kp_g3b_u08_group_count_from_total: Object.freeze({
    displayName: "已知總量與每組量，求組數",
    canonicalSkillId: "division_word_problem",
    skillTags: Object.freeze(["division", "quotative_division", "find_group_count", "word_problem"]),
    answerModelShape: "semantic_single_integer_with_unit"
  }),
  kp_g3b_u08_per_group_from_total: Object.freeze({
    displayName: "已知總量與組數，求每組量",
    canonicalSkillId: "division_word_problem",
    skillTags: Object.freeze(["division", "partitive_division", "find_per_group", "word_problem"]),
    answerModelShape: "semantic_single_integer_with_unit"
  }),
  kp_g3b_u08_reverse_base_from_multiple: Object.freeze({
    displayName: "已知比較量與倍數，反求基準量",
    canonicalSkillId: "multiplicative_comparison",
    skillTags: Object.freeze(["division", "multiplicative_comparison", "find_base_quantity", "word_problem"]),
    answerModelShape: "semantic_single_integer_with_unit"
  }),
  kp_g3b_u08_shopping_estimation: Object.freeze({
    displayName: "購物估算：判斷夠不夠、多或少",
    canonicalSkillId: "integer_estimation",
    skillTags: Object.freeze(["estimation", "shopping", "hundred_benchmark", "word_problem"]),
    answerModelShape: "semantic_estimation_judgment"
  }),
  kp_g3b_u08_same_price_value_comparison: Object.freeze({
    displayName: "相同價格下比較哪個方案較划算",
    canonicalSkillId: "multiplicative_comparison",
    skillTags: Object.freeze(["multiplication", "same_price", "compare_total_quantity", "word_problem"]),
    answerModelShape: "semantic_same_price_comparison"
  })
});

const ANSWER_MODEL_FIELDS = Object.freeze({
  semantic_single_integer_with_unit: Object.freeze([
    "equationModel",
    "finalAnswer",
    "finalAnswerUnit",
    "finalAnswerWithUnit",
    "semanticSnapshot"
  ]),
  semantic_estimation_judgment: Object.freeze([
    "estimateEquationModel",
    "estimateValue",
    "judgment",
    "exactEquationModel",
    "exactDifference",
    "finalAnswerWithUnit",
    "semanticSnapshot"
  ]),
  semantic_same_price_comparison: Object.freeze([
    "optionAEquationModel",
    "optionATotal",
    "optionBEquationModel",
    "optionBTotal",
    "comparisonDimension",
    "winner",
    "conclusionZh",
    "semanticSnapshot"
  ])
});

const CANONICAL_PROMPT_OVERRIDES = Object.freeze({
  tpl_g3b_u08_group_count_equal_segments:
    "一條{item}長{a}{lengthUnit}，每段長{b}{lengthUnit}，可以剪成幾段？",
  tpl_g3b_u08_total_score_per_success:
    "每{successAction}可得{a}分，{person}{successCountClause}，一共得到多少分？",
  tpl_g3b_u08_group_count_score_events:
    "{person}共得到{a}分，每{successAction}可得{b}分，{person}{successQuestionClause}？"
});

const FULLFIX_RULES_BY_FAMILY = Object.freeze({
  tpl_g3b_u08_group_count_equal_segments: Object.freeze(["SEGMENT_LENGTH_WORDING_NATURAL"]),
  tpl_g3b_u08_total_score_per_success: Object.freeze(["SUCCESS_EVENT_PHRASE_NATURAL"]),
  tpl_g3b_u08_group_count_score_events: Object.freeze([
    "SUCCESS_EVENT_PHRASE_NATURAL",
    "SUCCESS_EVENT_CLASSIFIER_MATCH"
  ]),
  tpl_g3b_u08_same_price_compare_weight: Object.freeze(["SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"]),
  tpl_g3b_u08_same_price_compare_capacity: Object.freeze(["SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"]),
  tpl_g3b_u08_same_price_compare_item_count: Object.freeze(["SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"]),
  tpl_g3b_u08_same_price_compare_total_length: Object.freeze(["SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"])
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function patternSpecIdFor(templateFamilyId) {
  assert(/^tpl_g3b_u08_/.test(templateFamilyId), `Unexpected template family id: ${templateFamilyId}`);
  return templateFamilyId.replace(/^tpl_/, "ps_");
}

function patternGroupIdFor(knowledgePointId) {
  return knowledgePointId.replace(/^kp_/, "pg_");
}

function canonicalPromptFor(family) {
  return CANONICAL_PROMPT_OVERRIDES[family.templateFamilyId] ?? family.promptSkeletonZh;
}

function buildAnswerModel(kp) {
  return {
    shape: kp.answerModelShape,
    fields: [...ANSWER_MODEL_FIELDS[kp.answerModelShape]]
  };
}

function buildPatternSpec(family, familyOrder, familyOrderWithinKnowledgePoint) {
  const kp = KP_METADATA[family.knowledgePointId];
  assert(kp, `Unapproved KnowledgePoint: ${family.knowledgePointId}`);
  return {
    patternSpecId: patternSpecIdFor(family.templateFamilyId),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    kind: "g3bU08SemanticApplication",
    patternGroupId: patternGroupIdFor(family.knowledgePointId),
    knowledgePointId: family.knowledgePointId,
    templateFamilyId: family.templateFamilyId,
    semanticSignature: family.semanticSignature,
    equationShape: family.equationShape,
    unknownRole: family.unknownRole,
    quantityRoles: family.quantityRoles,
    contextDomains: family.contextDomains,
    promptSkeletonZh: canonicalPromptFor(family),
    sourcePromptSkeletonZh: family.promptSkeletonZh,
    requiredConstraints: family.requiredConstraints,
    fullFixRules: [...(FULLFIX_RULES_BY_FAMILY[family.templateFamilyId] ?? [])],
    sourceEvidenceTier: family.sourceEvidenceTier,
    numericPolicyRef: "S58.sharedNumericPolicy",
    semanticValidatorRef: "S58B_G3B_U08_SemanticValidationContract",
    answerModel: buildAnswerModel(kp),
    representation: "horizontal_only",
    canonicalSkillIds: [kp.canonicalSkillId],
    skillTags: [...kp.skillTags],
    difficultyTags: ["batch_a_browser_bridge", "g3b_u08_semantic_application", "hidden_s58c"],
    patternTags: ["batch_a", "g3b_u08", "semantic_family", family.templateFamilyId],
    curriculumNodeIds: [SOURCE_ID],
    familyOrder,
    familyOrderWithinKnowledgePoint,
    generatorStatus: "hidden_not_implemented",
    validatorStatus: "contract_only_not_runtime",
    runtimeProjectionStatus: "materialized_not_routed",
    selectorStatus: "hidden",
    productionUse: "forbidden"
  };
}

function buildPatternGroups(patternSpecs) {
  return Object.entries(KP_METADATA).map(([knowledgePointId, metadata]) => ({
    patternGroupId: patternGroupIdFor(knowledgePointId),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: metadata.displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "B",
    answerModelShape: metadata.answerModelShape,
    patternSpecIds: patternSpecs
      .filter((spec) => spec.knowledgePointId === knowledgePointId)
      .map((spec) => spec.patternSpecId),
    allocationPolicy: "balanced_by_family",
    visibilityStatus: "hidden",
    holdReason: "hidden_generator_validator_and_public_smoke_required"
  }));
}

function stableCoverage(patternSpecs) {
  return Object.fromEntries(
    Object.keys(KP_METADATA).map((knowledgePointId) => [
      knowledgePointId,
      patternSpecs.filter((spec) => spec.knowledgePointId === knowledgePointId).length
    ])
  );
}

function validateInputs(source, freeze) {
  assert(source.schemaName === "G3BU08SemanticTemplateFamilyRegistry", "Unexpected source schema");
  assert(source.sourceId === SOURCE_ID, "Unexpected source id");
  assert(source.unitCode === UNIT_CODE, "Unexpected unit code");
  assert(source.publicScopePolicy.representation === "horizontal_only", "Horizontal-only drift");
  assert(Array.isArray(source.templateFamilies), "templateFamilies must be an array");
  assert(source.templateFamilies.length === 24, `Expected 24 families, got ${source.templateFamilies.length}`);
  assert(freeze.status === "accepted_family_contract_frozen_for_patternspecific_design", "Family freeze not accepted");
  assert(freeze.acceptedFamilyCount === 24, "Family freeze count drift");
  const familyIds = source.templateFamilies.map((family) => family.templateFamilyId);
  assert(new Set(familyIds).size === 24, "Duplicate family id");
  const approvedKps = new Set(Object.keys(KP_METADATA));
  for (const family of source.templateFamilies) {
    assert(approvedKps.has(family.knowledgePointId), `Family mapped to unapproved KP: ${family.templateFamilyId}`);
    for (const key of ["semanticSignature", "equationShape", "unknownRole", "promptSkeletonZh", "sourceEvidenceTier"]) {
      assert(typeof family[key] === "string" && family[key].length > 0, `Missing ${key}: ${family.templateFamilyId}`);
    }
    assert(family.quantityRoles && typeof family.quantityRoles === "object", `Missing quantityRoles: ${family.templateFamilyId}`);
    assert(Array.isArray(family.contextDomains) && family.contextDomains.length > 0, `Missing contextDomains: ${family.templateFamilyId}`);
    assert(Array.isArray(family.requiredConstraints) && family.requiredConstraints.length >= 4, `Insufficient constraints: ${family.templateFamilyId}`);
  }
}

function renderRuntimeModule(patternSpecs, patternGroups) {
  const specsLiteral = JSON.stringify(patternSpecs, null, 2);
  const groupsLiteral = JSON.stringify(patternGroups, null, 2);
  return `export const G3B_U08_SOURCE_ID = ${JSON.stringify(SOURCE_ID)};\n\nfunction deepFreeze(value) {\n  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;\n  for (const nested of Object.values(value)) deepFreeze(nested);\n  return Object.freeze(value);\n}\n\nconst patternSpecs = deepFreeze(${specsLiteral});\nconst patternGroups = deepFreeze(${groupsLiteral});\nconst definitions = new Map(patternSpecs.map((spec) => [spec.patternSpecId, spec]));\nconst groups = new Map(patternGroups.map((group) => [group.patternGroupId, group]));\n\nexport const G3B_U08_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(patternSpecs.map((spec) => spec.patternSpecId));\nexport const G3B_U08_SEMANTIC_PATTERN_DEFINITIONS = Object.freeze(Object.fromEntries(definitions));\nexport const G3B_U08_SEMANTIC_PATTERN_GROUPS = patternGroups;\n\nexport function isG3BU08SemanticPatternSpecId(patternSpecId) {\n  return definitions.has(patternSpecId);\n}\n\nexport function getG3BU08SemanticPatternDefinition(patternSpecId) {\n  return definitions.get(patternSpecId) ?? null;\n}\n\nexport function getG3BU08SemanticPatternGroup(patternGroupId) {\n  return groups.get(patternGroupId) ?? null;\n}\n\nexport function listG3BU08SemanticPatternDefinitions() {\n  return [...patternSpecs];\n}\n\nexport function listG3BU08SemanticPatternGroups() {\n  return [...patternGroups];\n}\n\nexport function listG3BU08SemanticPatternDefinitionsForKnowledgePoint(knowledgePointId) {\n  return patternSpecs.filter((spec) => spec.knowledgePointId === knowledgePointId);\n}\n`;
}

function renderTestModule() {
  return `import test from "node:test";\nimport assert from "node:assert/strict";\nimport { existsSync, readFileSync } from "node:fs";\n\nimport {\n  G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,\n  getG3BU08SemanticPatternDefinition,\n  getG3BU08SemanticPatternGroup,\n  listG3BU08SemanticPatternDefinitions,\n  listG3BU08SemanticPatternDefinitionsForKnowledgePoint,\n  listG3BU08SemanticPatternGroups\n} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";\n\nconst source = JSON.parse(readFileSync(new URL("../../data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json", import.meta.url), "utf8"));\nconst registry = JSON.parse(readFileSync(new URL("../../data/curriculum/pattern_specs/S58C_G3B_U08_SemanticPatternSpecRegistry.json", import.meta.url), "utf8"));\n\nfunction projectedFamily(spec) {\n  return {\n    templateFamilyId: spec.templateFamilyId,\n    knowledgePointId: spec.knowledgePointId,\n    semanticSignature: spec.semanticSignature,\n    equationShape: spec.equationShape,\n    unknownRole: spec.unknownRole,\n    contextDomains: spec.contextDomains,\n    quantityRoles: spec.quantityRoles,\n    requiredConstraints: spec.requiredConstraints,\n    sourceEvidenceTier: spec.sourceEvidenceTier\n  };\n}\n\ntest("S58C materializes exactly 24 hidden PatternSpecs in six PatternGroups", () => {\n  assert.equal(registry.schemaName, "G3BU08SemanticPatternSpecRegistry");\n  assert.equal(registry.patternSpecs.length, 24);\n  assert.equal(registry.patternGroups.length, 6);\n  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)).size, 24);\n  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.templateFamilyId)).size, 24);\n  assert.equal(registry.summary.selectorVisibleCount, 0);\n  assert.equal(registry.summary.productionReadyCount, 0);\n  for (const spec of registry.patternSpecs) {\n    assert.equal(spec.patternSpecId, spec.templateFamilyId.replace(/^tpl_/, "ps_"));\n    assert.equal(spec.kind, "g3bU08SemanticApplication");\n    assert.equal(spec.sourceId, "g3b_u08_3b08");\n    assert.equal(spec.patternGroupId, spec.knowledgePointId.replace(/^kp_/, "pg_"));\n    assert.equal(spec.representation, "horizontal_only");\n    assert.equal(spec.selectorStatus, "hidden");\n    assert.equal(spec.productionUse, "forbidden");\n    assert.equal(spec.runtimeProjectionStatus, "materialized_not_routed");\n    assert.equal(spec.generatorStatus, "hidden_not_implemented");\n    assert.equal(spec.validatorStatus, "contract_only_not_runtime");\n  }\n});\n\ntest("S58C preserves every frozen family contract without semantic drift", () => {\n  const sourceByFamily = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));\n  assert.equal(sourceByFamily.size, 24);\n  for (const spec of registry.patternSpecs) {\n    const family = sourceByFamily.get(spec.templateFamilyId);\n    const expected = {\n      templateFamilyId: family.templateFamilyId,\n      knowledgePointId: family.knowledgePointId,\n      semanticSignature: family.semanticSignature,\n      equationShape: family.equationShape,\n      unknownRole: family.unknownRole,\n      contextDomains: family.contextDomains,\n      quantityRoles: family.quantityRoles,\n      requiredConstraints: family.requiredConstraints,\n      sourceEvidenceTier: family.sourceEvidenceTier\n    };\n    assert.deepEqual(projectedFamily(spec), expected);\n  }\n  assert.deepEqual(registry.coverageSummary, source.familyAllocation);\n});\n\ntest("S58C applies the four frozen human-readback FullFix policies", () => {\n  const segment = getG3BU08SemanticPatternDefinition("ps_g3b_u08_group_count_equal_segments");\n  assert.match(segment.promptSkeletonZh, /每段長/);\n  assert.doesNotMatch(segment.promptSkeletonZh, /每段剪成/);\n  const scoreTotal = getG3BU08SemanticPatternDefinition("ps_g3b_u08_total_score_per_success");\n  const scoreCount = getG3BU08SemanticPatternDefinition("ps_g3b_u08_group_count_score_events");\n  assert.ok(scoreTotal.fullFixRules.includes("SUCCESS_EVENT_PHRASE_NATURAL"));\n  assert.ok(scoreCount.fullFixRules.includes("SUCCESS_EVENT_CLASSIFIER_MATCH"));\n  for (const spec of registry.patternSpecs.filter((entry) => entry.knowledgePointId === "kp_g3b_u08_same_price_value_comparison")) {\n    assert.ok(spec.fullFixRules.includes("SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"));\n  }\n});\n\ntest("S58C PatternGroups partition the 24 families and remain hidden", () => {\n  const ids = registry.patternGroups.flatMap((group) => group.patternSpecIds);\n  assert.equal(ids.length, 24);\n  assert.equal(new Set(ids).size, 24);\n  assert.deepEqual(new Set(ids), new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)));\n  for (const group of registry.patternGroups) {\n    assert.equal(group.patternSpecIds.length, 4);\n    assert.equal(group.visibilityStatus, "hidden");\n    assert.equal(group.allocationPolicy, "balanced_by_family");\n    assert.equal(listG3BU08SemanticPatternDefinitionsForKnowledgePoint(group.primaryKnowledgePointId).length, 4);\n    assert.deepEqual(getG3BU08SemanticPatternGroup(group.patternGroupId), group);\n  }\n});\n\ntest("S58C browser-neutral runtime projection exactly matches the authoritative registry", () => {\n  assert.deepEqual(listG3BU08SemanticPatternDefinitions(), registry.patternSpecs);\n  assert.deepEqual(listG3BU08SemanticPatternGroups(), registry.patternGroups);\n  assert.deepEqual(G3B_U08_SEMANTIC_PATTERN_SPEC_IDS, registry.patternSpecs.map((spec) => spec.patternSpecId));\n  for (const spec of registry.patternSpecs) assert.deepEqual(getG3BU08SemanticPatternDefinition(spec.patternSpecId), spec);\n});\n\ntest("S58C does not expose a selector, generator, validator runtime or router", () => {\n  assert.equal(existsSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-g3b-u08-semantic-extension.js", import.meta.url)), false);\n  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js", import.meta.url)), false);\n  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js", import.meta.url)), false);\n});\n`;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE_TEMPLATE_PATH, "utf8"));
  const freeze = JSON.parse(await readFile(FREEZE_PATH, "utf8"));
  validateInputs(source, freeze);
  const withinKp = new Map();
  const patternSpecs = source.templateFamilies.map((family, index) => {
    const next = (withinKp.get(family.knowledgePointId) ?? 0) + 1;
    withinKp.set(family.knowledgePointId, next);
    return buildPatternSpec(family, index + 1, next);
  });
  const patternGroups = buildPatternGroups(patternSpecs);
  const coverageSummary = stableCoverage(patternSpecs);
  assert(JSON.stringify(coverageSummary) === JSON.stringify(source.familyAllocation), "Coverage summary drift");
  assert(patternSpecs.length === 24, "PatternSpec count drift");
  assert(patternGroups.length === 6, "PatternGroup count drift");

  const registry = {
    schemaName: "G3BU08SemanticPatternSpecRegistry",
    schemaVersion: 1,
    task: "S58C_G3B_U08_FormalMappingAndPatternSpecMaterialization",
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    materializationStatus: "authoritative_materialized_hidden_not_routed",
    sourceTemplateRegistryRef: "data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json",
    familyFreezeRef: "data/curriculum/contracts/S58A1_G3B_U08_24FamilyHumanReadbackFreeze.json",
    formalMappingDesignRef: "data/curriculum/mapping/S58B_G3B_U08_FormalMappingDesign.json",
    patternSpecSchemaRef: "data/curriculum/contracts/S58B_G3B_U08_PatternSpecSchema.json",
    semanticValidationContractRef: "data/curriculum/contracts/S58B_G3B_U08_SemanticValidationContract.json",
    policy: {
      oneSemanticFamilyPerPatternSpec: true,
      authoritativeArtifact: true,
      runtimeProjectionRequired: true,
      selectorVisibility: "hidden",
      productionUse: "forbidden",
      generatorRouting: "not_implemented_in_s58c",
      semanticValidationRuntime: "not_implemented_in_s58c",
      freeFormAIGeneration: "forbidden",
      representation: "horizontal_only"
    },
    sharedNumericPolicy: source.sharedNumericPolicy,
    patternGroups,
    patternSpecs,
    coverageSummary,
    summary: {
      knowledgePointCount: Object.keys(coverageSummary).length,
      patternGroupCount: patternGroups.length,
      patternSpecCount: patternSpecs.length,
      templateFamilyCount: source.templateFamilies.length,
      orphanPatternSpecCount: 0,
      selectorVisibleCount: 0,
      productionReadyCount: 0,
      browserNeutralRuntimeProjectionMaterialized: true,
      browserProjectionRouted: false,
      minimumPlannedContextVariantCount: source.minimumPlannedContextVariantCount
    }
  };

  await Promise.all([OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH].map((path) => mkdir(dirname(path), { recursive: true })));
  await writeFile(OUTPUT_JSON_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await writeFile(OUTPUT_JS_PATH, renderRuntimeModule(patternSpecs, patternGroups), "utf8");
  await writeFile(OUTPUT_TEST_PATH, renderTestModule(), "utf8");
  console.log(JSON.stringify({ patternSpecCount: patternSpecs.length, patternGroupCount: patternGroups.length, output: [OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH] }, null, 2));
}

await main();
