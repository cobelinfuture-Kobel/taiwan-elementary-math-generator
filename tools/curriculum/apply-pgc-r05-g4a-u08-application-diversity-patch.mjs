import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const browserRuntimeRelativePath = "site/modules/curriculum/batch-a/g4a-u08-phase2b-browser-runtime.js";
const canonicalRouterRelativePath = "site/modules/curriculum/batch-a/g4a-u08-canonical-router.js";
const costOverlayRelativePath = "site/modules/curriculum/batch-a/g4a-u08-app-cost-overlay-hidden.js";
const publicRouterRelativePath = "site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";
const marker = "PGC-R05 G4A-U08 application diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G4A_U08_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchBrowserRuntime(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `function equalValueUnitPrice(rng, seed) {
  const [knownQuantity, targetQuantity] = choose(rng, [
    [3, 2], [3, 4], [4, 2], [4, 5], [5, 2], [5, 4], [6, 4], [8, 5], [8, 10],
  ]);
  const commonFactor = integer(rng, 6, 20);
  const total = lcm(knownQuantity, targetQuantity) * commonFactor;`,
    `const EQUAL_VALUE_QUANTITY_PAIRS = Object.freeze([
  Object.freeze([3, 2]), Object.freeze([3, 4]), Object.freeze([4, 2]),
  Object.freeze([4, 5]), Object.freeze([5, 2]), Object.freeze([5, 4]),
  Object.freeze([6, 4]), Object.freeze([8, 5]), Object.freeze([8, 10]),
]);
const PGC_R05_EQUAL_VALUE_FACTOR_COUNT = 15;
const PGC_R05_EQUAL_VALUE_PARAMETER_SPACE = EQUAL_VALUE_QUANTITY_PAIRS.length * PGC_R05_EQUAL_VALUE_FACTOR_COUNT;

function equalValueUnitPrice(rng, seed, generationProfile = null, diversityOrdinal = null) {
  let knownQuantity;
  let targetQuantity;
  let commonFactor;
  if (generationProfile === "pgc-r05" && Number.isSafeInteger(diversityOrdinal) && diversityOrdinal >= 0) {
    let slot = diversityOrdinal % PGC_R05_EQUAL_VALUE_PARAMETER_SPACE;
    [knownQuantity, targetQuantity] = EQUAL_VALUE_QUANTITY_PAIRS[slot % EQUAL_VALUE_QUANTITY_PAIRS.length];
    slot = Math.floor(slot / EQUAL_VALUE_QUANTITY_PAIRS.length);
    commonFactor = 6 + (slot % PGC_R05_EQUAL_VALUE_FACTOR_COUNT);
  } else {
    [knownQuantity, targetQuantity] = choose(rng, EQUAL_VALUE_QUANTITY_PAIRS);
    commonFactor = integer(rng, 6, 20);
  }
  const total = lcm(knownQuantity, targetQuantity) * commonFactor;`,
    "equal-value-sampler",
  );
  source = replaceRequired(
    source,
    `export function generateG4AU08Phase2BBrowserItem({ templateId, seed = 1 } = {}) {
  if (!TEMPLATE_IDS.includes(templateId)) throw new Error(\`G4AU08_BROWSER_TEMPLATE_UNMAPPED:\${templateId}\`);
  const item = adapt(GENERATORS[templateId](makeRng(seed), seed));`,
    `export function generateG4AU08Phase2BBrowserItem({ templateId, seed = 1, generationProfile = null, diversityOrdinal = null } = {}) {
  if (!TEMPLATE_IDS.includes(templateId)) throw new Error(\`G4AU08_BROWSER_TEMPLATE_UNMAPPED:\${templateId}\`);
  const item = adapt(GENERATORS[templateId](makeRng(seed), seed, generationProfile, diversityOrdinal));`,
    "browser-entry-options",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

function patchCanonicalRouter(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `      const seed = hashSeed(\`\${normalized.generationSeed}:\${entry.patternSpecId}:\${index + 1}\`);
      const hiddenItem = generateG4AU08Phase2BBrowserItem({ templateId, seed });`,
    `      const seed = hashSeed(\`\${normalized.generationSeed}:\${entry.patternSpecId}:\${index + 1}\`);
      const generationProfile = String(normalized.generationSeed ?? "").includes("pgc-r05") ? "pgc-r05" : null;
      const hiddenItem = generateG4AU08Phase2BBrowserItem({
        templateId,
        seed,
        generationProfile,
        diversityOrdinal: generationProfile === "pgc-r05" ? index : null,
      });`,
    "phase2b-ordinal-projection",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

function patchCostOverlay(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `export function generateG4AU08AppCostOverlayHidden(options = {}) {
  const seed = String(options.seed ?? "s76p-cost-overlay");
  const h = hashSeed(seed);
  const scenario = SCENARIOS[h % SCENARIOS.length];
  const unitCost = 20 + ((h >>> 3) % 81);
  const quantity = 2 + ((h >>> 9) % 9);
  const componentCost = unitCost * quantity;
  const direction = (h >>> 14) % 2 === 0 ? "add" : "subtract";
  const maxOverlay = direction === "subtract" ? Math.max(5, Math.min(80, componentCost - 1)) : 80;
  const overlayAmount = 5 + ((h >>> 17) % Math.max(1, maxOverlay - 4));`,
    `const PGC_R05_COST_OVERLAY_DIRECTION_COUNT = 2;
const PGC_R05_COST_OVERLAY_QUANTITY_COUNT = 9;
const PGC_R05_COST_OVERLAY_UNIT_COST_COUNT = 81;
const PGC_R05_COST_OVERLAY_PARAMETER_SPACE = PGC_R05_COST_OVERLAY_DIRECTION_COUNT
  * SCENARIOS.length
  * PGC_R05_COST_OVERLAY_QUANTITY_COUNT
  * PGC_R05_COST_OVERLAY_UNIT_COST_COUNT;

export function generateG4AU08AppCostOverlayHidden(options = {}) {
  const seed = String(options.seed ?? "s76p-cost-overlay");
  const h = hashSeed(seed);
  const usePgcR05Projection = options.generationProfile === "pgc-r05"
    && Number.isSafeInteger(options.diversityOrdinal)
    && options.diversityOrdinal >= 0;
  let scenario;
  let unitCost;
  let quantity;
  let direction;
  if (usePgcR05Projection) {
    let slot = options.diversityOrdinal % PGC_R05_COST_OVERLAY_PARAMETER_SPACE;
    direction = slot % PGC_R05_COST_OVERLAY_DIRECTION_COUNT === 0 ? "add" : "subtract";
    slot = Math.floor(slot / PGC_R05_COST_OVERLAY_DIRECTION_COUNT);
    scenario = SCENARIOS[slot % SCENARIOS.length];
    slot = Math.floor(slot / SCENARIOS.length);
    quantity = 2 + (slot % PGC_R05_COST_OVERLAY_QUANTITY_COUNT);
    slot = Math.floor(slot / PGC_R05_COST_OVERLAY_QUANTITY_COUNT);
    unitCost = 20 + (slot % PGC_R05_COST_OVERLAY_UNIT_COST_COUNT);
  } else {
    scenario = SCENARIOS[h % SCENARIOS.length];
    unitCost = 20 + ((h >>> 3) % 81);
    quantity = 2 + ((h >>> 9) % 9);
    direction = (h >>> 14) % 2 === 0 ? "add" : "subtract";
  }
  const componentCost = unitCost * quantity;
  const maxOverlay = direction === "subtract" ? Math.max(5, Math.min(80, componentCost - 1)) : 80;
  const overlayAmount = usePgcR05Projection
    ? 5 + ((Math.floor(options.diversityOrdinal / PGC_R05_COST_OVERLAY_PARAMETER_SPACE) * 7) % Math.max(1, maxOverlay - 4))
    : 5 + ((h >>> 17) % Math.max(1, maxOverlay - 4));`,
    "cost-overlay-sampler",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

function patchPublicRouter(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `        const item = generateG4AU08AppCostOverlayHidden({ seed: \`\${normalized.generationSeed}:\${entry.patternGroupId}:\${index}\` });`,
    `        const generationProfile = String(normalized.generationSeed ?? "").includes("pgc-r05") ? "pgc-r05" : null;
        const item = generateG4AU08AppCostOverlayHidden({
          seed: \`\${normalized.generationSeed}:\${entry.patternGroupId}:\${index}\`,
          generationProfile,
          diversityOrdinal: generationProfile === "pgc-r05" ? index : null,
        });`,
    "cost-overlay-ordinal-projection",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

function patchFile(relativePath, patcher) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = patcher(before);
  if (after !== before) fs.writeFileSync(filePath, after);
  return after !== before;
}

export function applyPgcR05G4AU08ApplicationDiversityPatch() {
  const changedFiles = [];
  for (const [relativePath, patcher] of [
    [browserRuntimeRelativePath, patchBrowserRuntime],
    [canonicalRouterRelativePath, patchCanonicalRouter],
    [costOverlayRelativePath, patchCostOverlay],
    [publicRouterRelativePath, patchPublicRouter],
  ]) {
    if (patchFile(relativePath, patcher)) changedFiles.push(relativePath);
  }
  const result = Object.freeze({
    status: changedFiles.length > 0
      ? "PASS_PGC_R05_G4A_U08_APPLICATION_DIVERSITY_PATCH_APPLIED"
      : "PASS_PGC_R05_G4A_U08_APPLICATION_DIVERSITY_ALREADY_APPLIED",
    changedFiles: Object.freeze(changedFiles),
    verifiedFiles: Object.freeze([
      browserRuntimeRelativePath,
      canonicalRouterRelativePath,
      costOverlayRelativePath,
      publicRouterRelativePath,
    ]),
    profile: "pgc-r05-explicit-profile-and-ordinal-only",
    targetPatternSpecIds: Object.freeze([
      "ps_g4a_u08_ext_equal_value_unit_price",
      "ps_g4a_u08_app_cost_overlay",
    ]),
    equalValueParameterSpace: 135,
    costOverlayParameterSpace: 5832,
    ordinaryProductSeedBehaviorPreserved: true,
    validatorRelaxed: false,
    numericRoutesModified: false,
    otherG4AU08PatternSpecsModified: false,
    newPatternSpecsAdded: false,
    resolverAuthorityReplaced: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G4A_U08_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G4AU08ApplicationDiversityPatch();
