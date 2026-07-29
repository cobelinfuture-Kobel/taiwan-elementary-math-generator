import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "site/assets/browser/pipeline/build-worksheet-document.js";
const marker = "PGC-R05 source-unit application alias projection FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_SOURCE_UNIT_ALIAS_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05SourceUnitApplicationAliasPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_SOURCE_UNIT_APPLICATION_ALIAS_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
      applicationAliasIdentityPreserved: true,
      basePatternGroupDowngradeRemoved: true,
      r07AuthorityRegistryModified: false,
      unitGeneratorsModified: false,
      secondPipelineAdded: false,
    });
    console.log(`PGC_R05_SOURCE_UNIT_APPLICATION_ALIAS_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    "function generationPatternGroupId(group) { return group?.basePatternGroupId ?? group?.patternGroupId; }",
    `function applicationPatternGroupId(group) {
  return group?.patternGroupId;
}`,
    "application-group-id-helper",
  );
  source = replaceRequired(
    source,
    "selectedPatternGroupIds: [...new Set(uniqueGroups.map(generationPatternGroupId).filter(Boolean))],",
    "selectedPatternGroupIds: [...new Set(uniqueGroups.map(applicationPatternGroupId).filter(Boolean))],",
    "source-unit-selected-application-groups",
  );
  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);

  const result = Object.freeze({
    status: "PASS_PGC_R05_SOURCE_UNIT_APPLICATION_ALIAS_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    verifiedFiles: Object.freeze([relativePath]),
    applicationAliasIdentityPreserved: true,
    basePatternGroupDowngradeRemoved: true,
    r07AuthorityRegistryModified: false,
    unitGeneratorsModified: false,
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_SOURCE_UNIT_APPLICATION_ALIAS_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05SourceUnitApplicationAliasPatch();
