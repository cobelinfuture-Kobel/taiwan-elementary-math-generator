import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G5A_U08_HIDDEN_PATTERN_GROUPS,
  G5A_U08_HIDDEN_PATTERN_SPECS,
} from "../../site/modules/curriculum/batch-a/source-pattern-g5a-u08-extension.js";
import {
  buildGS02Registries,
  recomputeGS02Seed,
} from "./build-gs02-g5a-u08-global-context-expansion.mjs";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const S60D_PATH = resolve(ROOT, "data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json");

const error = (code, details = {}) => ({ code, ...details });
const operationFromTemplateFamilyId = (id) => id.replace(/^tf_g5a_u08_/, "");

export function validateGS02Registries(input = buildGS02Registries()) {
  const { familyRegistry, bindingRegistry, coverage } = input;
  const errors = [];
  const families = familyRegistry?.contextFamilies ?? [];
  const bindings = bindingRegistry?.bindings ?? [];
  const targets = familyRegistry?.acceptanceTargets ?? {};
  const s60d = JSON.parse(readFileSync(S60D_PATH, "utf8"));
  const knownTemplateFamilyIds = new Set(s60d.templateFamilies.map((row) => row.templateFamilyId));
  const knownKnowledgePointIds = new Set(G5A_U08_HIDDEN_PATTERN_GROUPS.map((row) => row.primaryKnowledgePointId));
  const knownPatternGroupIds = new Set(G5A_U08_HIDDEN_PATTERN_GROUPS.map((row) => row.patternGroupId));
  const knownPatternSpecIds = new Set(G5A_U08_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId));

  if (families.length !== targets.targetScenarioFamilies || families.length < targets.minimumScenarioFamilies) {
    errors.push(error("GS02_CONTEXT_FAMILY_COUNT_INVALID", { actual: families.length }));
  }
  const domains = new Set(families.map((row) => row.domain));
  if (domains.size < targets.minimumDomainCount) errors.push(error("GS02_DOMAIN_COUNT_TOO_LOW", { actual: domains.size }));

  const familyIds = families.map((row) => row.contextFamilyId);
  if (new Set(familyIds).size !== familyIds.length) errors.push(error("GS02_DUPLICATE_CONTEXT_FAMILY_ID"));
  const fingerprints = families.map((row) => row.canonicalSemanticModel?.semanticFingerprint);
  if (new Set(fingerprints).size !== fingerprints.length || fingerprints.some((value) => !value)) {
    errors.push(error("GS02_DUPLICATE_OR_MISSING_SEMANTIC_FINGERPRINT"));
  }

  const compatibility = new Map([...knownTemplateFamilyIds].map((id) => [id, 0]));
  let surfaceTemplateCount = 0;
  let seedQACount = 0;
  const seedIds = [];
  for (const family of families) {
    const templates = family.surfaceTemplates ?? [];
    const seeds = family.seedQA ?? [];
    surfaceTemplateCount += templates.length;
    seedQACount += seeds.length;
    seedIds.push(...seeds.map((row) => row.seedId));

    if (templates.length < targets.minimumTemplatesPerFamily) {
      errors.push(error("GS02_FAMILY_TEMPLATE_COUNT_TOO_LOW", { contextFamilyId: family.contextFamilyId, actual: templates.length }));
    }
    if (new Set(templates.map((row) => row.templateId)).size !== templates.length
      || new Set(templates.map((row) => row.textZh)).size !== templates.length) {
      errors.push(error("GS02_DUPLICATE_SURFACE_TEMPLATE", { contextFamilyId: family.contextFamilyId }));
    }
    if (seeds.length < 5) errors.push(error("GS02_FAMILY_SEED_QA_COUNT_TOO_LOW", { contextFamilyId: family.contextFamilyId }));
    if (family.lifecycle?.productionSelectable !== false || family.lifecycle?.runtimeResolvable !== false) {
      errors.push(error("GS02_PREMATURE_FAMILY_PRODUCTION_OR_RUNTIME", { contextFamilyId: family.contextFamilyId }));
    }
    if (family.parameterSchema?.dataPolicy !== "fictionalized_for_practice"
      || family.parameterSchema?.externalKnowledgeRequired !== false) {
      errors.push(error("GS02_UNCONTROLLED_DATA_OR_EXTERNAL_KNOWLEDGE", { contextFamilyId: family.contextFamilyId }));
    }
    if (!family.forbiddenCombinations?.includes("free-form AI runtime composition")) {
      errors.push(error("GS02_FREE_FORM_AI_GUARD_MISSING", { contextFamilyId: family.contextFamilyId }));
    }

    for (const id of family.compatibleTemplateFamilyIds ?? []) {
      if (!knownTemplateFamilyIds.has(id)) errors.push(error("GS02_UNKNOWN_TEMPLATE_FAMILY_REF", { contextFamilyId: family.contextFamilyId, id }));
      else compatibility.set(id, compatibility.get(id) + 1);
    }
    for (const id of family.compatibleKnowledgePoints ?? []) {
      if (!knownKnowledgePointIds.has(id)) errors.push(error("GS02_UNKNOWN_KNOWLEDGE_POINT_REF", { contextFamilyId: family.contextFamilyId, id }));
    }
    for (const id of family.compatiblePatternGroups ?? []) {
      if (!knownPatternGroupIds.has(id)) errors.push(error("GS02_UNKNOWN_PATTERN_GROUP_REF", { contextFamilyId: family.contextFamilyId, id }));
    }
    for (const id of family.compatiblePatternSpecs ?? []) {
      if (!knownPatternSpecIds.has(id)) errors.push(error("GS02_UNKNOWN_PATTERN_SPEC_REF", { contextFamilyId: family.contextFamilyId, id }));
    }

    for (const seed of seeds) {
      if (!family.compatibleTemplateFamilyIds.includes(seed.templateFamilyId)) {
        errors.push(error("GS02_SEED_NOT_ELIGIBLE_FOR_FAMILY", { seedId: seed.seedId }));
        continue;
      }
      const operation = operationFromTemplateFamilyId(seed.templateFamilyId);
      let witness;
      try {
        witness = recomputeGS02Seed(operation, seed.parameters);
      } catch (cause) {
        errors.push(error("GS02_SEED_RECOMPUTATION_FAILED", { seedId: seed.seedId, message: cause.message }));
        continue;
      }
      if (!Number.isInteger(witness.answer) || witness.answer !== seed.answer || witness.equation !== seed.equation) {
        errors.push(error("GS02_SEED_ANSWER_WITNESS_MISMATCH", {
          seedId: seed.seedId,
          expectedAnswer: witness.answer,
          actualAnswer: seed.answer,
        }));
      }
      if (!knownPatternGroupIds.has(seed.patternGroupId) || !knownPatternSpecIds.has(seed.patternSpecId)) {
        errors.push(error("GS02_SEED_AUTHORITY_REF_INVALID", { seedId: seed.seedId }));
      }
      if (seed.expectedValidation !== "PASS" || seed.fictionalizedPracticeData !== true) {
        errors.push(error("GS02_SEED_LIFECYCLE_INVALID", { seedId: seed.seedId }));
      }
    }
  }

  if (new Set(seedIds).size !== seedIds.length) errors.push(error("GS02_DUPLICATE_SEED_ID"));
  if (surfaceTemplateCount < targets.targetScenarioFamilies * targets.minimumTemplatesPerFamily) {
    errors.push(error("GS02_SURFACE_TEMPLATE_TOTAL_TOO_LOW", { actual: surfaceTemplateCount }));
  }
  if (seedQACount < targets.minimumGeneratedQASamples) errors.push(error("GS02_SEED_QA_TOTAL_TOO_LOW", { actual: seedQACount }));
  for (const [templateFamilyId, count] of compatibility) {
    if (count < targets.minimumFamiliesPerWordPattern) {
      errors.push(error("GS02_WORD_PATTERN_FAMILY_COVERAGE_TOO_LOW", { templateFamilyId, count }));
    }
  }

  if (bindings.length !== families.length || bindingRegistry?.bindingCount !== families.length) {
    errors.push(error("GS02_BINDING_COUNT_MISMATCH", { familyCount: families.length, bindingCount: bindings.length }));
  }
  const familyById = new Map(families.map((row) => [row.contextFamilyId, row]));
  for (const binding of bindings) {
    const family = familyById.get(binding.contextFamilyId);
    if (!family) {
      errors.push(error("GS02_ORPHAN_UNIT_CONTEXT_BINDING", { bindingId: binding.unitContextBindingId }));
      continue;
    }
    const parityFields = [
      ["eligibleTemplateFamilyIds", "compatibleTemplateFamilyIds"],
      ["eligibleKnowledgePointIds", "compatibleKnowledgePoints"],
      ["eligiblePatternGroupIds", "compatiblePatternGroups"],
      ["eligiblePatternSpecIds", "compatiblePatternSpecs"],
    ];
    for (const [bindingField, familyField] of parityFields) {
      if (JSON.stringify(binding[bindingField]) !== JSON.stringify(family[familyField])) {
        errors.push(error("GS02_BINDING_FAMILY_PARITY_MISMATCH", { bindingId: binding.unitContextBindingId, field: bindingField }));
      }
    }
    if (binding.lifecycle?.productionSelectable !== false || binding.lifecycle?.runtimeResolvable !== false) {
      errors.push(error("GS02_PREMATURE_BINDING_PRODUCTION_OR_RUNTIME", { bindingId: binding.unitContextBindingId }));
    }
    if (binding.eligibilityRules?.contextMayChangeMath !== false
      || binding.eligibilityRules?.contextMayReplaceTemplateFamily !== false) {
      errors.push(error("GS02_CONTEXT_OWNS_MATH_ILLEGALLY", { bindingId: binding.unitContextBindingId }));
    }
  }

  const expectedCoverage = {
    contextFamilyCount: families.length,
    domainCount: domains.size,
    surfaceTemplateCount,
    seedQACount,
    bindingCount: bindings.length,
  };
  for (const [key, value] of Object.entries(expectedCoverage)) {
    const actual = key === "bindingCount" ? coverage?.bindingCount : coverage?.[key];
    if (actual !== value) errors.push(error("GS02_COVERAGE_SUMMARY_MISMATCH", { key, expected: value, actual }));
  }
  if (coverage?.runtimeChanged !== false || coverage?.productionSelectable !== false) {
    errors.push(error("GS02_COVERAGE_PREMATURE_PRODUCTION_CLAIM"));
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      contextFamilyCount: families.length,
      domainCount: domains.size,
      surfaceTemplateCount,
      seedQACount,
      bindingCount: bindings.length,
      minimumFamiliesPerWordPattern: Math.min(...compatibility.values()),
      templateFamilyCompatibilityCount: Object.fromEntries([...compatibility].sort()),
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateGS02Registries();
  console.log(`GS02_GLOBAL_CONTEXT_VALIDATION=${JSON.stringify(result.summary)}`);
  if (!result.ok) {
    console.error(JSON.stringify(result.errors, null, 2));
    process.exitCode = 1;
  }
}
