import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S64_URL = new URL(
  "../../data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json",
  import.meta.url,
);
const S65_URL = new URL(
  "../../data/curriculum/mapping/g4b_u04_formal_mapping_candidate_qa.json",
  import.meta.url,
);
const S66_URL = new URL(
  "../../data/curriculum/contracts/S66_G4B_U04_PatternSpecContractDesign.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function roundDown(value, unit) {
  return Math.floor(value / unit) * unit;
}

function roundUp(value, unit) {
  return Math.ceil(value / unit) * unit;
}

function roundHalfUp(value, unit) {
  return Math.floor((value + unit / 2) / unit) * unit;
}

function inverseInterval(roundedValue, unit, maxInput = 99_999_999) {
  return [
    Math.max(0, roundedValue - unit / 2),
    Math.min(maxInput, roundedValue + unit / 2 - 1),
  ];
}

function valuesForMask(mask, roundedValue, unit) {
  const placeholders = [...mask].reduce((indexes, char, index) => {
    if (char === "□") indexes.push(index);
    return indexes;
  }, []);
  const limit = 10 ** placeholders.length;
  const results = [];
  for (let n = 0; n < limit; n += 1) {
    const digits = String(n).padStart(placeholders.length, "0");
    const chars = [...mask];
    placeholders.forEach((index, offset) => {
      chars[index] = digits[offset];
    });
    if (chars[0] === "0") continue;
    const value = Number(chars.join(""));
    if (roundHalfUp(value, unit) === roundedValue) results.push(value);
  }
  return results;
}

test("S66 projects all 17 S65-accepted mappings one-to-one into final PatternSpec contracts", async () => {
  const [s64, s65, s66] = await Promise.all([load(S64_URL), load(S65_URL), load(S66_URL)]);
  assert.equal(s66.schemaName, "G4BU04PatternSpecContractDesign");
  assert.equal(s66.task, "S66_G4B_U04_PatternSpecContractDesign");
  assert.equal(s66.sourceId, "g4b_u04_4b04");
  assert.equal(s65.status, "qa_passed_ci_synced_and_merged");

  const accepted = new Set(s65.acceptedMappingCandidateIds);
  const specsByMapping = new Map(
    s66.patternSpecs.map((row) => [row.sourceMappingCandidateId, row]),
  );
  assert.equal(accepted.size, 17);
  assert.equal(specsByMapping.size, 17);

  for (const mapping of s64.formalMappingCandidates) {
    assert.ok(accepted.has(mapping.id), `${mapping.id}: not accepted by S65`);
    const spec = specsByMapping.get(mapping.id);
    assert.ok(spec, `${mapping.id}: missing S66 PatternSpec`);
    assert.equal(spec.patternSpecId, mapping.ps);
    assert.equal(spec.knowledgePointId, mapping.kp);
    assert.equal(spec.patternGroupId, mapping.pg.replace(/^pgc_/, "pg_"));
    assert.equal(spec.answerModel, mapping.answer);
    assert.equal(spec.implementationClass, mapping.class);
    assert.deepEqual(spec.sourceEvidence, mapping.evidence);
  }
});

test("S66 freezes 12 PatternGroups, 17 unique PatternSpecs and stable pattern order", async () => {
  const s66 = await load(S66_URL);
  assert.deepEqual(s66.cardinality, {
    knowledgePointCount: 12,
    patternGroupCount: 12,
    patternSpecContractCount: 17,
    answerModelSchemaCount: 9,
    controlledTemplateFamilyCount: 9,
    implementationClassCCount: 9,
    implementationClassDCount: 8,
  });

  assert.equal(s66.patternGroups.length, 12);
  assert.equal(s66.patternSpecs.length, 17);
  assert.equal(new Set(s66.patternGroups.map((row) => row.patternGroupId)).size, 12);
  assert.equal(new Set(s66.patternSpecs.map((row) => row.patternSpecId)).size, 17);
  assert.deepEqual(
    s66.patternSpecs.map((row) => row.patternOrder),
    Array.from({ length: 17 }, (_, index) => index + 1),
  );

  const indexedSpecs = s66.patternGroups.flatMap((row) => row.patternSpecIds).sort();
  assert.deepEqual(indexedSpecs, s66.patternSpecs.map((row) => row.patternSpecId).sort());
  assert.equal(new Set(s66.patternGroups.map((row) => row.knowledgePointId)).size, 12);
});

test("S66 required fields, identity and contract-only lifecycle are complete", async () => {
  const s66 = await load(S66_URL);
  const required = s66.requiredPatternSpecFields;
  assert.equal(new Set(required).size, required.length);

  for (const spec of s66.patternSpecs) {
    for (const field of required) {
      assert.ok(Object.hasOwn(spec, field), `${spec.patternSpecId}: missing ${field}`);
    }
    assert.match(spec.patternSpecId, /^ps_g4b_u04_[a-z0-9_]+$/);
    assert.match(spec.patternGroupId, /^pg_g4b_u04_[a-z0-9_]+$/);
    assert.match(spec.knowledgePointId, /^kp_g4b_u04_[a-z0-9_]+$/);
    assert.match(spec.sourceMappingCandidateId, /^fmc_g4b_u04_[a-z0-9_]+$/);
    assert.equal(spec.sourceId, "g4b_u04_4b04");
    assert.equal(spec.unitCode, "4B-U04");
    assert.equal(spec.unitTitle, "概數");
    assert.equal(spec.kind, "g4bU04RoundingApproximation");
    assert.deepEqual(spec.lifecycle, {
      contractStatus: "designed_not_materialized",
      selectorVisibility: "hidden",
      canonicalRouting: "disabled",
      generatorStatus: "not_implemented",
      validatorStatus: "contract_only",
      productionUse: "forbidden",
    });
    assert.ok(spec.validatorHooks.length >= 4, `${spec.patternSpecId}: insufficient hooks`);
    assert.ok(spec.sourceEvidence.length > 0, `${spec.patternSpecId}: evidence missing`);
  }
});

test("S66 materializes all nine answer-model schemas as deterministic contracts", async () => {
  const [s64, s66] = await Promise.all([load(S64_URL), load(S66_URL)]);
  assert.deepEqual(
    Object.keys(s66.answerModelSchemas).sort(),
    [...s64.answerModelCandidates].sort(),
  );

  assert.deepEqual(
    s66.answerModelSchemas.methodChoiceAnswer.properties.method.enum,
    ["unconditional_down", "unconditional_up"],
  );
  assert.deepEqual(
    s66.answerModelSchemas.symbolReadingAnswer.properties.acceptedReadings.const,
    ["約等於", "近似於"],
  );
  assert.deepEqual(
    s66.answerModelSchemas.banknoteCountAnswer.properties.denomination.enum,
    [100, 1000],
  );
  assert.equal(s66.answerModelSchemas.digitSetAnswer.properties.digits.unique, true);
  assert.equal(s66.answerModelSchemas.possibleValuesAnswer.properties.values.maxItems, 100);

  for (const spec of s66.patternSpecs) {
    assert.ok(s66.answerModelSchemas[spec.answerModel]);
    assert.equal(spec.answerSchemaRef, `#/answerModelSchemas/${spec.answerModel}`);
  }
});

test("S66 Class D patterns use only source-backed controlled template families", async () => {
  const s66 = await load(S66_URL);
  const templates = new Map(
    s66.controlledTemplateFamilies.map((row) => [row.templateFamilyId, row]),
  );
  assert.equal(templates.size, 9);

  for (const template of templates.values()) {
    assert.match(template.templateFamilyId, /^tpl_g4b_u04_[a-z0-9_]+$/);
    const placeholders = [
      ...new Set(
        [...template.promptSkeletonZh.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(
          (match) => match[1],
        ),
      ),
    ].sort();
    assert.deepEqual(placeholders, [...template.requiredRoles].sort());
  }

  const classCounts = { C: 0, D: 0 };
  for (const spec of s66.patternSpecs) {
    classCounts[spec.implementationClass] += 1;
    assert.equal(spec.generationContract.freeFormAI, "forbidden");
    if (spec.implementationClass === "D") {
      assert.equal(spec.generationContract.controlledTemplateRequired, true);
      assert.ok(spec.promptContract.templateFamilyRefs.length >= 1);
      for (const ref of spec.promptContract.templateFamilyRefs) {
        const template = templates.get(ref);
        assert.ok(template, `${spec.patternSpecId}: unknown template ${ref}`);
        assert.equal(template.mappingId, spec.sourceMappingCandidateId);
      }
    }
  }
  assert.deepEqual(classCounts, { C: 9, D: 8 });
});

test("S66 locks S65 formulas, boundaries and three corrected edge contracts", async () => {
  const s66 = await load(S66_URL);
  assert.deepEqual(s66.globalBoundary, {
    inputRange: [0, 99999999],
    targetPlaceUnits: [10, 100, 1000, 10000],
    contextGroupSizes: [10, 100, 1000],
    paymentDenominations: [100, 1000],
    factorOrDivisorRange: [2, 9],
    maximumAnswer: 999999999,
    integerOnly: true,
    negativeAnswerAllowed: false,
    inversePreimageClampedToInputRange: true,
  });
  assert.deepEqual(s66.formalRules, {
    down: "floor(v/u)*u",
    up: "ceil(v/u)*u",
    halfUp: "floor((v+u/2)/u)*u",
    floorGroups: "floor(t/g)",
    ceilingGroups: "ceil(t/g)",
    paymentAmount: "ceil(p/d)*d",
    banknoteCount: "ceil(p/d)",
    inverse: "intersect([y-u/2,y+u/2-1],[0,maxInput])",
  });

  assert.equal(roundDown(753, 100), 700);
  assert.equal(roundUp(753, 100), 800);
  assert.equal(roundHalfUp(647, 10), 650);
  assert.equal(roundHalfUp(647, 100), 600);
  assert.equal(Math.floor(8427 / 10), 842);
  assert.equal(Math.ceil(8427 / 10), 843);
  assert.equal(Math.ceil(7699 / 1000) * 1000, 8000);
  assert.equal(Math.ceil(7699 / 100), 77);
  assert.deepEqual(inverseInterval(0, 10), [0, 4]);

  const byId = new Map(s66.patternSpecs.map((row) => [row.patternSpecId, row]));
  const methodChoice = byId.get("ps_g4b_u04_method_identify_from_result");
  assert.equal(methodChoice.generationContract.inputNotMultipleOfUnit, true);
  assert.equal(methodChoice.generationContract.shownResultMatchesExactlyOneMethod, true);
  assert.equal(methodChoice.generationContract.shownResultDiffersFromHalfUpOutput, true);

  assert.deepEqual(valuesForMask("2□318", 30000, 10000), [25318, 26318, 27318, 28318, 29318]);
  assert.deepEqual(valuesForMask("47□61", 47000, 1000), [47061, 47161, 47261, 47361, 47461]);
  assert.deepEqual(valuesForMask("4□□99", 45000, 1000), [
    44599, 44699, 44799, 44899, 44999,
    45099, 45199, 45299, 45399, 45499,
  ]);
});

test("S66 validator contract has eight blocking stages and 44 unique error codes", async () => {
  const s66 = await load(S66_URL);
  const validator = s66.validatorContract;
  assert.equal(validator.validationMode, "blocking_before_question_return");
  assert.equal(validator.stageCount, 8);
  assert.equal(validator.stages.length, 8);
  assert.deepEqual(
    validator.stages.map((row) => row.stage),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.equal(validator.blockingCodeCount, 44);
  assert.equal(validator.blockingCodes.length, 44);
  assert.equal(new Set(validator.blockingCodes).size, 44);
  for (const code of [
    "G4BU04_METHOD_CHOICE_AMBIGUOUS",
    "G4BU04_INVERSE_INTERVAL_NOT_CLAMPED",
    "G4BU04_PAYMENT_DENOMINATION_NOT_ALLOWED",
    "G4BU04_DIVISION_NONINTEGER",
    "G4BU04_GENERIC_FALLBACK_FORBIDDEN",
  ]) {
    assert.ok(validator.blockingCodes.includes(code));
  }
  assert.equal(validator.warnings.length, 3);
  assert.equal(validator.resultContract.fallbackQuestionAllowed, false);
});

test("S66 preserves no-materialization scope and advances only to PatternSpec contract QA", async () => {
  const s66 = await load(S66_URL);
  assert.deepEqual(s66.scopeBoundary, {
    formalMappingMaterialized: false,
    patternGroupsMaterialized: false,
    patternSpecsMaterialized: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    canonicalRoutingEnabled: false,
    productionUse: "forbidden",
  });
  assert.deepEqual(s66.acceptance, {
    allS65AcceptedMappingsProjectedOneToOne: true,
    allPatternSpecsSourceEvidenced: true,
    allAnswerModelsSchemaDefined: true,
    allClassDPatternsControlledTemplateOnly: true,
    allPatternSpecsContractOnly: true,
    patternSpecContractCount: 17,
    patternGroupCount: 12,
    answerModelSchemaCount: 9,
    controlledTemplateFamilyCount: 9,
    blockingCodeCount: 44,
  });
  assert.equal(s66.goalDistance.before, "D2_G4B_U04_FORMAL_MAPPING_CANDIDATES_QA_LOCKED");
  assert.equal(s66.goalDistance.after, "D2_G4B_U04_PATTERNSPEC_AND_ANSWER_CONTRACTS_DESIGNED");
  assert.equal(s66.goalDistance.nextShortestStep, "S67_G4B_U04_PatternSpecContractQA");
  assert.equal(s66.goalDistance.stopReason, "NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE");
});
