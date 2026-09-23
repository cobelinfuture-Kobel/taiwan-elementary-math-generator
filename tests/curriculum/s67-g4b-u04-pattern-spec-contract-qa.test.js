import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S66_URL = new URL(
  "../../data/curriculum/contracts/S66_G4B_U04_PatternSpecContractDesign.json",
  import.meta.url,
);
const S67_URL = new URL(
  "../../data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

function placeholders(prompt) {
  return [
    ...new Set(
      [...prompt.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]),
    ),
  ].sort();
}

function qaErrors(s66, s67) {
  const errors = [];
  const overlay = s67.effectiveContractOverlay;

  if (s66.patternSpecs.length !== 17) errors.push("PATTERN_SPEC_COUNT");
  if (s66.patternGroups.length !== 12) errors.push("PATTERN_GROUP_COUNT");

  const patternSpecIds = s66.patternSpecs.map((row) => row.patternSpecId);
  if (new Set(patternSpecIds).size !== patternSpecIds.length) {
    errors.push("PATTERN_SPEC_ID_DUPLICATE");
  }

  for (const spec of s66.patternSpecs) {
    for (const field of s66.requiredPatternSpecFields) {
      if (!Object.hasOwn(spec, field)) errors.push(`MISSING_FIELD:${spec.patternSpecId}:${field}`);
    }
    if (spec.lifecycle.selectorVisibility !== "hidden") errors.push(`PUBLIC_SELECTOR:${spec.patternSpecId}`);
    if (spec.lifecycle.canonicalRouting !== "disabled") errors.push(`PUBLIC_ROUTING:${spec.patternSpecId}`);
    if (spec.lifecycle.productionUse !== "forbidden") errors.push(`PRODUCTION:${spec.patternSpecId}`);
    if (spec.generationContract.freeFormAI !== "forbidden") errors.push(`FREE_FORM_AI:${spec.patternSpecId}`);
  }
  if (s66.fixedLifecycle.genericFallback !== "forbidden") errors.push("GENERIC_FALLBACK_LIFECYCLE");
  if (s66.validatorContract.resultContract.fallbackQuestionAllowed !== false) {
    errors.push("GENERIC_FALLBACK_RESULT");
  }

  const schemaNames = Object.keys(s66.answerModelSchemas).sort();
  const closedNames = [...overlay.answerSchemaPolicy.closedSchemaNames].sort();
  if (overlay.answerSchemaPolicy.additionalProperties !== false) errors.push("ANSWER_SCHEMA_OPEN");
  if (JSON.stringify(schemaNames) !== JSON.stringify(closedNames)) errors.push("ANSWER_SCHEMA_COVERAGE");

  const methodOutputs = overlay.answerSchemaPolicy.methodComparisonOutputs;
  const expectedOutputs = ["unconditionalDown", "unconditionalUp", "roundHalfUp"];
  if (methodOutputs.type !== "object" || methodOutputs.additionalProperties !== false) {
    errors.push("METHOD_OUTPUT_OBJECT_OPEN");
  }
  if (JSON.stringify([...methodOutputs.required].sort()) !== JSON.stringify([...expectedOutputs].sort())) {
    errors.push("METHOD_OUTPUT_REQUIRED");
  }
  for (const field of expectedOutputs) {
    if (methodOutputs.properties?.[field]?.type !== "integer") {
      errors.push(`METHOD_OUTPUT_FIELD:${field}`);
    }
  }
  const numericUnit = overlay.answerSchemaPolicy.numericAnswerConditionalRequired;
  if (numericUnit.requiredField !== "unitLabel" || numericUnit.nonemptyString !== true) {
    errors.push("NUMERIC_UNIT_CONDITION");
  }

  const templateOverrides = overlay.controlledTemplateOverrides;
  const templateById = new Map(templateOverrides.map((row) => [row.templateFamilyId, row]));
  if (templateById.size !== 9) errors.push("TEMPLATE_COUNT");
  for (const template of templateOverrides) {
    const roles = [...template.requiredRoles].sort();
    const promptRoles = placeholders(template.promptSkeletonZh);
    const bindingRoles = Object.keys(template.roleBindings).sort();
    if (JSON.stringify(roles) !== JSON.stringify(promptRoles)) {
      errors.push(`TEMPLATE_PLACEHOLDER_ROLE:${template.templateFamilyId}`);
    }
    if (JSON.stringify(roles) !== JSON.stringify(bindingRoles)) {
      errors.push(`TEMPLATE_BINDING_ROLE:${template.templateFamilyId}`);
    }
    for (const binding of Object.values(template.roleBindings)) {
      if (!/^(input|context|derived)\./.test(binding)) {
        errors.push(`TEMPLATE_BINDING_SOURCE:${template.templateFamilyId}`);
      }
    }
    if (template.computationInputsVisible !== true) {
      errors.push(`TEMPLATE_INPUT_VISIBILITY:${template.templateFamilyId}`);
    }
  }

  for (const spec of s66.patternSpecs.filter((row) => row.implementationClass === "D")) {
    for (const ref of spec.promptContract.templateFamilyRefs) {
      const template = templateById.get(ref);
      if (!template) {
        errors.push(`TEMPLATE_REF_MISSING:${spec.patternSpecId}:${ref}`);
      } else if (template.mappingId !== spec.sourceMappingCandidateId) {
        errors.push(`TEMPLATE_MAPPING:${spec.patternSpecId}:${ref}`);
      }
    }
  }

  const requiredVisibleRoles = {
    ps_g4b_u04_round_then_add: [
      "operandA", "operandB", "methodALabel", "methodBLabel", "targetPlaceLabelA", "targetPlaceLabelB",
    ],
    ps_g4b_u04_round_then_subtract: [
      "operandA", "operandB", "methodALabel", "methodBLabel", "targetPlaceLabelA", "targetPlaceLabelB",
    ],
    ps_g4b_u04_round_then_multiply: ["value", "methodLabel", "targetPlaceLabel", "factor"],
    ps_g4b_u04_round_then_divide: ["value", "methodLabel", "targetPlaceLabel", "divisor"],
  };
  for (const [patternSpecId, requiredRoles] of Object.entries(requiredVisibleRoles)) {
    const spec = s66.patternSpecs.find((row) => row.patternSpecId === patternSpecId);
    const template = templateById.get(spec.promptContract.templateFamilyRefs[0]);
    const roleSet = new Set(template?.requiredRoles ?? []);
    for (const role of requiredRoles) {
      if (!roleSet.has(role)) errors.push(`ROUND_INPUT_HIDDEN:${patternSpecId}:${role}`);
    }
    for (const forbidden of overlay.operationEstimationPromptPolicy.forbiddenDerivedOnlyRoles) {
      if (roleSet.has(forbidden)) errors.push(`ROUND_DERIVED_ONLY:${patternSpecId}:${forbidden}`);
    }
  }

  const masks = overlay.digitMaskContracts;
  const oneMask = masks.ps_g4b_u04_inverse_digit_set;
  const twoMask = masks.ps_g4b_u04_inverse_original_values;
  if (
    oneMask.placeholderCount !== 1 ||
    oneMask.placeholderInternal !== true ||
    oneMask.leadingZeroForbidden !== true ||
    oneMask.groupSeparatorsForbidden !== true
  ) {
    errors.push("ONE_MASK_POLICY");
  }
  if (
    twoMask.placeholderCount !== 2 ||
    twoMask.placeholdersContiguous !== true ||
    twoMask.placeholderInternal !== true ||
    twoMask.leadingZeroForbidden !== true ||
    twoMask.groupSeparatorsForbidden !== true
  ) {
    errors.push("TWO_MASK_POLICY");
  }
  const onePattern = new RegExp(oneMask.pattern);
  const twoPattern = new RegExp(twoMask.pattern);
  for (const valid of ["2□318", "47□61"]) {
    if (!onePattern.test(valid)) errors.push(`ONE_MASK_VALID_REJECTED:${valid}`);
  }
  for (const invalid of ["□2318", "23□", "02□18", "2,□318", "2□□18"]) {
    if (onePattern.test(invalid)) errors.push(`ONE_MASK_INVALID_ACCEPTED:${invalid}`);
  }
  for (const valid of ["4□□99", "12□□34"]) {
    if (!twoPattern.test(valid)) errors.push(`TWO_MASK_VALID_REJECTED:${valid}`);
  }
  for (const invalid of ["□□499", "4□9□9", "4□□", "04□□99", "4,□□99"]) {
    if (twoPattern.test(invalid)) errors.push(`TWO_MASK_INVALID_ACCEPTED:${invalid}`);
  }

  const stageRows = overlay.validatorCoverageByStage;
  if (stageRows.length !== 8) errors.push("VALIDATOR_STAGE_COUNT");
  const stageNumbers = stageRows.map((row) => row.stage);
  if (JSON.stringify(stageNumbers) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) {
    errors.push("VALIDATOR_STAGE_ORDER");
  }
  const coveredCodes = stageRows.flatMap((row) => row.blockingCodes);
  if (new Set(coveredCodes).size !== coveredCodes.length) errors.push("VALIDATOR_CODE_DUPLICATE");
  if (coveredCodes.length !== s66.validatorContract.blockingCodeCount) {
    errors.push("VALIDATOR_CODE_COUNT");
  }
  if (
    JSON.stringify([...coveredCodes].sort()) !==
    JSON.stringify([...s66.validatorContract.blockingCodes].sort())
  ) {
    errors.push("VALIDATOR_CODE_COVERAGE");
  }
  for (const stage of stageRows) {
    const sourceStage = s66.validatorContract.stages.find((row) => row.stage === stage.stage);
    if (!sourceStage || sourceStage.name !== stage.name) {
      errors.push(`VALIDATOR_STAGE_NAME:${stage.stage}`);
    }
    if (stage.blockingCodes.length === 0) errors.push(`VALIDATOR_STAGE_EMPTY:${stage.stage}`);
  }

  return errors;
}

test("S67 reviews and accepts all 17 S66 PatternSpec contracts with five blocking corrections", async () => {
  const [s66, s67] = await Promise.all([load(S66_URL), load(S67_URL)]);
  assert.equal(s67.schemaName, "G4BU04PatternSpecContractQA");
  assert.equal(s67.task, "S67_G4B_U04_PatternSpecContractQA");
  assert.equal(s67.sourceId, "g4b_u04_4b04");
  assert.deepEqual(s67.summary, {
    patternSpecContractsReviewed: 17,
    patternSpecContractsAccepted: 17,
    patternSpecContractsRejected: 0,
    patternGroupsReviewed: 12,
    answerModelSchemasReviewed: 9,
    controlledTemplateFamiliesReviewed: 9,
    validatorStagesReviewed: 8,
    blockingCodesReviewed: 44,
    qaCorrectionsApplied: 5,
    mutationCaseCount: 28,
  });
  assert.equal(s67.corrections.length, 5);
  assert.equal(qaErrors(s66, s67).length, 0, qaErrors(s66, s67).join(","));
});

test("S67 closes all nine answer schemas and fully specifies method-comparison outputs", async () => {
  const [s66, s67] = await Promise.all([load(S66_URL), load(S67_URL)]);
  const policy = s67.effectiveContractOverlay.answerSchemaPolicy;
  assert.deepEqual(
    [...policy.closedSchemaNames].sort(),
    Object.keys(s66.answerModelSchemas).sort(),
  );
  assert.equal(policy.additionalProperties, false);
  assert.deepEqual(policy.methodComparisonOutputs.required, [
    "unconditionalDown",
    "unconditionalUp",
    "roundHalfUp",
  ]);
  for (const field of policy.methodComparisonOutputs.required) {
    assert.deepEqual(policy.methodComparisonOutputs.properties[field], {
      type: "integer",
      minimum: 0,
      maximum: 999999999,
    });
  }
  assert.deepEqual(policy.numericAnswerConditionalRequired, {
    when: "PatternSpec.promptContract.answerUnitRequired === true",
    requiredField: "unitLabel",
    nonemptyString: true,
  });
});

test("S67 role-binds all nine controlled templates with exact placeholder parity", async () => {
  const [s66, s67] = await Promise.all([load(S66_URL), load(S67_URL)]);
  const templates = s67.effectiveContractOverlay.controlledTemplateOverrides;
  assert.equal(templates.length, 9);
  assert.equal(new Set(templates.map((row) => row.templateFamilyId)).size, 9);
  for (const template of templates) {
    assert.deepEqual(placeholders(template.promptSkeletonZh), [...template.requiredRoles].sort());
    assert.deepEqual(Object.keys(template.roleBindings).sort(), [...template.requiredRoles].sort());
    assert.equal(template.computationInputsVisible, true);
  }
  const refs = s66.patternSpecs
    .filter((row) => row.implementationClass === "D")
    .flatMap((row) => row.promptContract.templateFamilyRefs);
  assert.deepEqual([...new Set(refs)].sort(), templates.map((row) => row.templateFamilyId).sort());
});

test("S67 round-then-operate prompts expose original values, methods and target places", async () => {
  const s67 = await load(S67_URL);
  const byId = new Map(
    s67.effectiveContractOverlay.controlledTemplateOverrides.map((row) => [row.templateFamilyId, row]),
  );
  const expected = {
    tpl_g4b_u04_population_total: ["operandA", "operandB", "methodALabel", "methodBLabel", "targetPlaceLabelA", "targetPlaceLabelB"],
    tpl_g4b_u04_population_difference: ["operandA", "operandB", "methodALabel", "methodBLabel", "targetPlaceLabelA", "targetPlaceLabelB"],
    tpl_g4b_u04_recurring_cost_multiply: ["value", "methodLabel", "targetPlaceLabel", "factor"],
    tpl_g4b_u04_equal_share_divide: ["value", "methodLabel", "targetPlaceLabel", "divisor"],
  };
  for (const [templateId, roles] of Object.entries(expected)) {
    const template = byId.get(templateId);
    assert.ok(template, templateId);
    for (const role of roles) assert.ok(template.requiredRoles.includes(role), `${templateId}: ${role}`);
    for (const forbidden of ["roundedA", "roundedB", "largerRounded", "smallerRounded", "roundedValue"]) {
      assert.equal(template.requiredRoles.includes(forbidden), false, `${templateId}: ${forbidden}`);
    }
  }
});

test("S67 locks source-backed internal digit-mask grammar", async () => {
  const s67 = await load(S67_URL);
  const masks = s67.effectiveContractOverlay.digitMaskContracts;
  const one = new RegExp(masks.ps_g4b_u04_inverse_digit_set.pattern);
  const two = new RegExp(masks.ps_g4b_u04_inverse_original_values.pattern);
  for (const value of ["2□318", "47□61"]) assert.equal(one.test(value), true, value);
  for (const value of ["□2318", "23□", "02□18", "2,□318", "2□□18"]) {
    assert.equal(one.test(value), false, value);
  }
  for (const value of ["4□□99", "12□□34"]) assert.equal(two.test(value), true, value);
  for (const value of ["□□499", "4□9□9", "4□□", "04□□99", "4,□□99"]) {
    assert.equal(two.test(value), false, value);
  }
});

test("S67 covers all 44 blocking codes exactly once across the eight validator stages", async () => {
  const [s66, s67] = await Promise.all([load(S66_URL), load(S67_URL)]);
  const coverage = s67.effectiveContractOverlay.validatorCoverageByStage;
  const coveredCodes = coverage.flatMap((row) => row.blockingCodes);
  assert.deepEqual(coverage.map((row) => row.stage), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(coveredCodes.length, 44);
  assert.equal(new Set(coveredCodes).size, 44);
  assert.deepEqual([...coveredCodes].sort(), [...s66.validatorContract.blockingCodes].sort());
  assert.deepEqual(
    coverage.map((row) => row.name),
    s66.validatorContract.stages.map((row) => row.name),
  );
});

test("S67 executable QA rejects representative schema, template, lifecycle, mask and coverage mutations", async () => {
  const [base66, base67] = await Promise.all([load(S66_URL), load(S67_URL)]);
  assert.deepEqual(qaErrors(base66, base67), []);

  const mutations = [
    (s66) => { s66.patternSpecs[1].patternSpecId = s66.patternSpecs[0].patternSpecId; },
    (s66) => { delete s66.patternSpecs[0].answerSchemaRef; },
    (s66) => { s66.patternSpecs[0].lifecycle.selectorVisibility = "visible"; },
    (s66) => { s66.patternSpecs[0].lifecycle.productionUse = "allowed"; },
    (s66) => { s66.patternSpecs[0].generationContract.freeFormAI = "allowed"; },
    (s66) => { s66.fixedLifecycle.genericFallback = "allowed"; },
    (_s66, s67) => { s67.effectiveContractOverlay.answerSchemaPolicy.additionalProperties = true; },
    (_s66, s67) => { delete s67.effectiveContractOverlay.answerSchemaPolicy.methodComparisonOutputs.properties.roundHalfUp; },
    (_s66, s67) => { delete s67.effectiveContractOverlay.controlledTemplateOverrides[0].roleBindings.total; },
    (_s66, s67) => { s67.effectiveContractOverlay.controlledTemplateOverrides[0].mappingId = "fmc_g4b_u04_wrong"; },
    (_s66, s67) => { s67.effectiveContractOverlay.controlledTemplateOverrides[5].requiredRoles = ["roundedA", "roundedB", "unitLabel"]; },
    (_s66, s67) => { s67.effectiveContractOverlay.digitMaskContracts.ps_g4b_u04_inverse_digit_set.pattern = "^.*$"; },
    (_s66, s67) => { s67.effectiveContractOverlay.validatorCoverageByStage[0].blockingCodes.pop(); },
    (_s66, s67) => { s67.effectiveContractOverlay.validatorCoverageByStage[1].blockingCodes.push("G4BU04_REQUIRED_FIELD_MISSING"); },
    (s66) => { s66.validatorContract.resultContract.fallbackQuestionAllowed = true; },
  ];

  for (const [index, mutate] of mutations.entries()) {
    const s66 = clone(base66);
    const s67 = clone(base67);
    mutate(s66, s67);
    assert.ok(qaErrors(s66, s67).length > 0, `mutation ${index + 1} escaped QA`);
  }
});

test("S67 freezes 28 named mutation requirements", async () => {
  const s67 = await load(S67_URL);
  assert.equal(s67.mutationRequirements.length, 28);
  assert.equal(new Set(s67.mutationRequirements).size, 28);
  for (const required of [
    "ANSWER_SCHEMA_NOT_CLOSED",
    "TEMPLATE_ROLE_BINDING_MISSING",
    "ROUND_THEN_ADD_HIDES_OPERANDS",
    "DIGIT_MASK_NONCONTIGUOUS_DOUBLE_PLACEHOLDER",
    "VALIDATOR_CODE_OMITTED",
    "GENERIC_FALLBACK_ENABLED",
  ]) {
    assert.ok(s67.mutationRequirements.includes(required));
  }
});

test("S67 remains QA-only and stops before hidden materialization", async () => {
  const s67 = await load(S67_URL);
  assert.deepEqual(s67.scopeBoundary, {
    baseS66ContractRewritten: false,
    formalMappingMaterialized: false,
    patternGroupsMaterialized: false,
    patternSpecsMaterialized: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    canonicalRoutingEnabled: false,
    productionUse: "forbidden",
  });
  assert.equal(
    s67.goalDistance.nextShortestStep,
    "S68_G4B_U04_FormalMappingAndHiddenPatternSpecMaterialization",
  );
  assert.equal(s67.goalDistance.stopReason, "NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE");
});
