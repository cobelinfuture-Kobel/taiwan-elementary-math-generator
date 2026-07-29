import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "src/curriculum/g5a-u02/browser-dynamic-entry.js";
const marker = "PGC-R05 G5A-U02 public application diversity profile FullFix V1";
const profileId = "pgc-r05-application-diversity-v1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G5A_U02_PROFILE_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05G5AU02ApplicationDiversityProfilePatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_G5A_U02_APPLICATION_DIVERSITY_PROFILE_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
      profileId,
      hiddenWorksheetProfileConnected: true,
      semanticRegenerationProfileConnected: true,
      patternSpecsModified: false,
      answerModelsModified: false,
      secondPipelineAdded: false,
    });
    console.log(`PGC_R05_G5A_U02_APPLICATION_PROFILE_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    'const MAX_SEED = 0x7fffffff;',
    `const MAX_SEED = 0x7fffffff;\nconst PGC_R05_APPLICATION_DIVERSITY_PROFILE = "${profileId}";`,
    "profile-constant",
  );
  source = replaceRequired(
    source,
    `    const canonicalItem = generateG5AU02Canonical(record.patternSpecId, {\n      seed: seedFor(input.baseSeed, index),\n    });`,
    `    const canonicalItem = generateG5AU02Canonical(record.patternSpecId, {\n      seed: seedFor(input.baseSeed, index),\n      generationProfile: input.generationProfile,\n    });`,
    "semantic-regeneration-profile",
  );
  source = replaceRequired(
    source,
    `    baseSeed: normalizeG5AU02BrowserSeed(plan.generationSeed ?? plan.baseSeed ?? 1),\n    includeAnswerKey: plan.includeAnswerKey !== false,`,
    `    baseSeed: normalizeG5AU02BrowserSeed(plan.generationSeed ?? plan.baseSeed ?? 1),\n    generationProfile: plan.questionMode === "application"\n      ? PGC_R05_APPLICATION_DIVERSITY_PROFILE\n      : "legacy",\n    includeAnswerKey: plan.includeAnswerKey !== false,`,
    "hidden-worksheet-profile",
  );
  source = replaceRequired(
    source,
    `    generationSeed: input.baseSeed,\n    semanticProjection: freeze({`,
    `    generationSeed: input.baseSeed,\n    generationProfile: input.generationProfile,\n    semanticProjection: freeze({`,
    "worksheet-profile-readback",
  );
  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);

  const result = Object.freeze({
    status: "PASS_PGC_R05_G5A_U02_APPLICATION_DIVERSITY_PROFILE_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    verifiedFiles: Object.freeze([relativePath]),
    profileId,
    hiddenWorksheetProfileConnected: true,
    semanticRegenerationProfileConnected: true,
    canonicalBundleRebuildRequired: true,
    patternSpecsModified: false,
    answerModelsModified: false,
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G5A_U02_APPLICATION_PROFILE_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G5AU02ApplicationDiversityProfilePatch();
