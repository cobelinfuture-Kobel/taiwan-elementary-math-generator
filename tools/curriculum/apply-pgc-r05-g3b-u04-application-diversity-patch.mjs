import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "site/modules/curriculum/batch-a/g3b-u04-canonical-semantic-router.js";
const marker = "PGC-R05 G3B-U04 canonical prompt diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G3B_U04_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05G3BU04ApplicationDiversityPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_G3B_U04_APPLICATION_DIVERSITY_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
      profile: "pgc-r05-seed-only",
      deterministicRetryLimit: 32,
      legacySeedBehaviorPreserved: true,
      validatorRelaxed: false,
      secondPipelineAdded: false,
    });
    console.log(`PGC_R05_G3B_U04_DIVERSITY_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `function contextDomainForFamily(patternSpecId, familyIndex) {
  const domains = getG3BU04SemanticPatternDefinition(patternSpecId)?.contextDomains ?? [];
  return domains.length > 0 ? domains[familyIndex % domains.length] : undefined;
}`,
    `const PGC_R05_PROMPT_DIVERSITY_RETRY_LIMIT = 32;

function isPgcR05ApplicationDiversityPlan(plan = {}) {
  return String(plan.generationSeed ?? "").includes("pgc-r05");
}

function generationSeedForVariant(plan, allocationEntry, familyIndex, variantAttempt) {
  const base = \`${"${plan.generationSeed}"}:canonical:${"${allocationEntry.patternSpecId}"}:${"${familyIndex + 1}"}\`;
  return variantAttempt === 0 ? base : \`${"${base}"}:pgc-r05-diversity:${"${variantAttempt}"}\`;
}

function contextDomainForFamily(patternSpecId, familyIndex) {
  const domains = getG3BU04SemanticPatternDefinition(patternSpecId)?.contextDomains ?? [];
  return domains.length > 0 ? domains[familyIndex % domains.length] : undefined;
}`,
    "diversity-profile-helpers",
  );

  source = replaceRequired(
    source,
    `  for (const allocationEntry of plan.allocation) {
    for (let familyIndex = 0; familyIndex < allocationEntry.questionCount; familyIndex += 1) {
      const questionIndex = sequenceNumber;
      sequenceNumber += 1;
      const generated = generateForPattern(allocationEntry.patternSpecId, {
        seed: \`${"${plan.generationSeed}"}:canonical:${"${allocationEntry.patternSpecId}"}:${"${familyIndex + 1}"}\`,
        sequenceNumber: sequenceNumber,
        contextDomain: contextDomainForFamily(allocationEntry.patternSpecId, familyIndex)
      });
      warnings.push(...pathIssues(generated.warnings, questionIndex));
      if (!generated.ok || !generated.question) {
        errors.push(...pathIssues(generated.errors?.length ? generated.errors : [
          issue("G3B_U04_CANONICAL_GENERATION_FAILED", "generation", "Canonical semantic generation failed.")
        ], questionIndex));
        continue;
      }

      const promotedQuestion = applyG3BU04HumanSemanticQualityV2(
        promoteQuestionForCanonicalRoute(generated.question, plan, allocationEntry)
      );
      const checked = validator(promotedQuestion, { recentPrompts });
      const readback = validateG3BU04HumanSemanticQualityV2(promotedQuestion);
      errors.push(...pathIssues(checked.errors, questionIndex));
      errors.push(...pathIssues(readback.errors, questionIndex));
      warnings.push(...pathIssues(checked.warnings, questionIndex));
      warnings.push(...pathIssues(readback.warnings, questionIndex));
      if (!checked.ok || !readback.ok) continue;

      promotedQuestion.id = \`${"${allocationEntry.patternSpecId}"}-${"${sequenceNumber}"}\`;
      promotedQuestion.semanticSnapshot.validationCodes = unique([
        ...(checked.warnings ?? []).map((warning) => warning.code),
        ...(readback.warnings ?? []).map((warning) => warning.code)
      ]);
      generatedQuestions.push(promotedQuestion);
      recentPrompts.push(promotedQuestion.promptText);
    }
  }`,
    `  const diversityRetryEnabled = isPgcR05ApplicationDiversityPlan(plan);
  const variantLimit = diversityRetryEnabled ? PGC_R05_PROMPT_DIVERSITY_RETRY_LIMIT : 1;

  for (const allocationEntry of plan.allocation) {
    for (let familyIndex = 0; familyIndex < allocationEntry.questionCount; familyIndex += 1) {
      const questionIndex = sequenceNumber;
      sequenceNumber += 1;
      let acceptedQuestion = null;
      let acceptedChecked = null;
      let acceptedReadback = null;
      let acceptedGenerationWarnings = [];
      let terminalErrors = [];
      let terminalWarnings = [];

      for (let variantAttempt = 0; variantAttempt < variantLimit; variantAttempt += 1) {
        const generated = generateForPattern(allocationEntry.patternSpecId, {
          seed: generationSeedForVariant(plan, allocationEntry, familyIndex, variantAttempt),
          sequenceNumber,
          contextDomain: contextDomainForFamily(allocationEntry.patternSpecId, familyIndex)
        });
        acceptedGenerationWarnings = generated.warnings ?? [];
        if (!generated.ok || !generated.question) {
          terminalErrors = generated.errors?.length ? generated.errors : [
            issue("G3B_U04_CANONICAL_GENERATION_FAILED", "generation", "Canonical semantic generation failed.")
          ];
          if (variantAttempt + 1 < variantLimit) continue;
          break;
        }

        const promotedQuestion = applyG3BU04HumanSemanticQualityV2(
          promoteQuestionForCanonicalRoute(generated.question, plan, allocationEntry)
        );
        if (diversityRetryEnabled && recentPrompts.includes(promotedQuestion.promptText)) {
          terminalErrors = [issue(
            "G3B_U04_CANONICAL_PROMPT_DIVERSITY_EXHAUSTED",
            "promptText",
            "Unable to produce a unique learner-visible prompt within the deterministic R05 retry budget."
          )];
          if (variantAttempt + 1 < variantLimit) continue;
          break;
        }

        const checked = validator(promotedQuestion, { recentPrompts });
        const readback = validateG3BU04HumanSemanticQualityV2(promotedQuestion);
        terminalErrors = [...(checked.errors ?? []), ...(readback.errors ?? [])];
        terminalWarnings = [...(checked.warnings ?? []), ...(readback.warnings ?? [])];
        if (!checked.ok || !readback.ok) break;

        acceptedQuestion = promotedQuestion;
        acceptedChecked = checked;
        acceptedReadback = readback;
        break;
      }

      warnings.push(...pathIssues(acceptedGenerationWarnings, questionIndex));
      warnings.push(...pathIssues(terminalWarnings, questionIndex));
      if (!acceptedQuestion || !acceptedChecked || !acceptedReadback) {
        errors.push(...pathIssues(terminalErrors, questionIndex));
        continue;
      }

      acceptedQuestion.id = \`${"${allocationEntry.patternSpecId}"}-${"${sequenceNumber}"}\`;
      acceptedQuestion.semanticSnapshot.validationCodes = unique([
        ...(acceptedChecked.warnings ?? []).map((warning) => warning.code),
        ...(acceptedReadback.warnings ?? []).map((warning) => warning.code)
      ]);
      generatedQuestions.push(acceptedQuestion);
      recentPrompts.push(acceptedQuestion.promptText);
    }
  }`,
    "canonical-generation-loop",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);

  const result = Object.freeze({
    status: "PASS_PGC_R05_G3B_U04_APPLICATION_DIVERSITY_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    verifiedFiles: Object.freeze([relativePath]),
    profile: "pgc-r05-seed-only",
    deterministicRetryLimit: 32,
    finalVisiblePromptCheckedBeforeAdmission: true,
    blockingValidatorStillRequired: true,
    legacySeedBehaviorPreserved: true,
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G3B_U04_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G3BU04ApplicationDiversityPatch();
