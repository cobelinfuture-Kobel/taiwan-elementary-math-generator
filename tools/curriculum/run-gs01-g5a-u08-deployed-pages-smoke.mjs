import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = resolve(HERE, "run-g5a-u08-r1-deployed-pages-smoke.mjs");

const LEGACY_ROUTER_IMPORT = `import {
  normalizeG5AU08ResolverPlan,
} from "../../site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";`;
const CAPACITY_AUTHORITY_IMPORT = `${LEGACY_ROUTER_IMPORT}
import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";`;

const LEGACY_MATRIX_CLASSIFICATION = `        const normalized = normalizeG5AU08ResolverPlan(baseResolverPlan(controls));
        const allocated = (normalized.allocation ?? []).reduce(
          (total, entry) => total + (entry.questionCount ?? 0),
          0,
        );
        rows.push(Object.freeze({
          ...controls,
          expected: normalized.allocation?.length > 0 && allocated === PER_COMBINATION_QUESTION_COUNT
            ? "generate"
            : "block",
          patternGroupCount: normalized.selectedPatternGroupIds?.length ?? 0,
          patternSpecCount: normalized.patternSpecIds?.length ?? 0,
        }));`;
const CAPACITY_MATRIX_CLASSIFICATION = `        const normalized = normalizeG5AU08ResolverPlan(baseResolverPlan(controls));
        const allocated = (normalized.allocation ?? []).reduce(
          (total, entry) => total + (entry.questionCount ?? 0),
          0,
        );
        const publicBinding = resolvePublicUiCapabilityBinding({
          sourceId: SOURCE_ID,
          selectionMode: "mixedKnowledgePointsSameUnit",
          selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
          selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
          requestedQuestionType: questionMode,
          requestedDepthMode: depthMode,
          requestedContextMode: contextMode,
        });
        const questionAvailable = publicBinding.availableQuestionTypeOptions
          .some((option) => option.value === questionMode);
        const depthApplicable = publicBinding.depthOptions.length > 0;
        const contextApplicable = publicBinding.contextOptions.length > 0;
        const depthMatches = depthApplicable ? publicBinding.depthMode === depthMode : depthMode === "mixed";
        const contextMatches = contextApplicable ? publicBinding.contextMode === contextMode : contextMode === "mixed";
        const publicAdmitted = !publicBinding.blocked
          && questionAvailable
          && depthMatches
          && contextMatches
          && publicBinding.questionCount.max > 0;
        const canonicalAllocated = normalized.allocation?.length > 0
          && allocated === PER_COMBINATION_QUESTION_COUNT;
        rows.push(Object.freeze({
          ...controls,
          expected: publicAdmitted && canonicalAllocated ? "generate" : "block",
          publicAdmitted,
          canonicalAllocated,
          depthApplicable,
          contextApplicable,
          capacityRouteIds: [...publicBinding.capacityRouteIds],
          patternGroupCount: normalized.selectedPatternGroupIds?.length ?? 0,
          patternSpecCount: normalized.patternSpecIds?.length ?? 0,
        }));`;

const LEGACY_REPLAY_SELECTION = `  const replayControls = { questionMode: "application", depthMode: "N_PLUS_1", contextMode: "sdg" };
  const replayRow = controlMatrix.find((row) =>
    row.questionMode === replayControls.questionMode
    && row.depthMode === replayControls.depthMode
    && row.contextMode === replayControls.contextMode);
  if (replayRow?.expected !== "generate") {
    fail("G5A_U08_R1_REPLAY_COMBINATION_NOT_GENERATABLE", { replayRow });
  }`;
const CAPACITY_REPLAY_SELECTION = `  const preferredReplayControls = { questionMode: "mixed", depthMode: "N_PLUS_1", contextMode: "sdg" };
  const replayRow = controlMatrix.find((row) =>
    row.expected === "generate"
    && row.questionMode === preferredReplayControls.questionMode
    && row.depthMode === preferredReplayControls.depthMode
    && row.contextMode === preferredReplayControls.contextMode)
    ?? controlMatrix.find((row) => row.expected === "generate");
  if (!replayRow) {
    fail("G5A_U08_R1_REPLAY_COMBINATION_NOT_GENERATABLE", { controlMatrix });
  }
  const replayControls = {
    questionMode: replayRow.questionMode,
    depthMode: replayRow.depthMode,
    contextMode: replayRow.contextMode,
  };`;

const LEGACY_ASSERTION = `  const expectedSuffix = \`｜\${questionCount} 題｜\${includeAnswerKey ? "含答案頁" : "不含答案頁"}\`;
  if (!previewMeta.endsWith(expectedSuffix) || /undefined|null/i.test(previewMeta)) {
    fail("G5A_U08_R1_DEPLOYED_PREVIEW_META_INVALID", {
      label,
      previewMeta,
      expectedSuffix,
    });
  }`;
const GS01_ASSERTION = `  const requiredSegments = [
    \`\${questionCount} 題\`,
    includeAnswerKey ? "含答案頁" : "不含答案頁",
  ];
  const previewSegments = previewMeta.split("｜").map((segment) => segment.trim()).filter(Boolean);
  const missingSegments = requiredSegments.filter((segment) => !previewSegments.includes(segment));
  if (missingSegments.length > 0 || /undefined|null/i.test(previewMeta)) {
    fail("G5A_U08_R1_DEPLOYED_PREVIEW_META_INVALID", {
      label,
      previewMeta,
      requiredSegments,
      previewSegments,
      missingSegments,
    });
  }`;

const LEGACY_SINGLE_KP_MIXED_CONTROL = `  await setControls(page, { questionMode: "mixed", depthMode: "mixed", contextMode: "mixed" });

  const kpButtons`;
const CAPACITY_ALIGNED_SINGLE_KP_CONTROL = `  // PGC-R07 A02: single-KP controls remain capacity-derived. The public
  // matrix is exercised only after switching to mixedKnowledgePointsSameUnit.

  const kpButtons`;

const LEGACY_SET_CONTROLS = `async function setControls(page, controls) {
  await page.selectOption(CONTROL_IDS.questionMode, controls.questionMode);
  await page.selectOption(CONTROL_IDS.depthMode, controls.depthMode);
  await page.selectOption(CONTROL_IDS.contextMode, controls.contextMode);
  const url = new URL(page.url());
  for (const [key, value] of Object.entries(controls)) {
    if (url.searchParams.get(key) !== value) {
      fail("G5A_U08_R1_CONTROL_QUERY_MISMATCH", {
        controls,
        key,
        actual: url.searchParams.get(key),
      });
    }
  }
}`;
const CAPACITY_AWARE_SET_CONTROLS = `async function optionValues(page, selector) {
  return page.locator(selector).evaluate((select) => [...select.options].map((option) => option.value));
}

async function controlSnapshot(page) {
  return {
    sourceId: await page.locator("#g5a-u08-public-controls").getAttribute("data-source-id"),
    questions: await optionValues(page, CONTROL_IDS.questionMode),
    depths: await optionValues(page, CONTROL_IDS.depthMode),
    contexts: await optionValues(page, CONTROL_IDS.contextMode),
    url: page.url(),
  };
}

async function selectAvailableOption(page, selector, value, diagnostic = {}) {
  try {
    await page.waitForFunction(
      ({ selector, value }) => [...(document.querySelector(selector)?.options ?? [])].some((option) => option.value === value),
      { selector, value },
      { timeout: 15000 },
    );
  } catch (error) {
    fail("G5A_U08_R1_EXPECTED_GENERATE_CONTROL_NOT_EXPOSED", {
      ...diagnostic,
      selector,
      value,
      options: await optionValues(page, selector),
      snapshot: await controlSnapshot(page),
      error: String(error?.message ?? error),
    });
  }

  await page.selectOption(selector, value);
  try {
    await page.waitForFunction(
      ({ selector, value }) => document.querySelector(selector)?.value === value,
      { selector, value },
      { timeout: 15000 },
    );
  } catch (error) {
    fail("G5A_U08_R1_CONTROL_SELECTION_DID_NOT_SETTLE", {
      ...diagnostic,
      selector,
      value,
      actual: await page.locator(selector).inputValue(),
      options: await optionValues(page, selector),
      snapshot: await controlSnapshot(page),
      error: String(error?.message ?? error),
    });
  }
}

async function setControls(page, controls, row = {}, label = "unlabeled") {
  const diagnostic = { label, row, controls };
  await selectAvailableOption(page, CONTROL_IDS.questionMode, controls.questionMode, diagnostic);
  if (row.contextApplicable) {
    const contexts = await optionValues(page, CONTROL_IDS.contextMode);
    if (contexts.includes("mixed")) await selectAvailableOption(page, CONTROL_IDS.contextMode, "mixed", diagnostic);
  }
  if (row.depthApplicable) {
    const depths = await optionValues(page, CONTROL_IDS.depthMode);
    if (depths.includes("mixed")) await selectAvailableOption(page, CONTROL_IDS.depthMode, "mixed", diagnostic);
    await selectAvailableOption(page, CONTROL_IDS.depthMode, controls.depthMode, diagnostic);
  }
  if (row.contextApplicable) await selectAvailableOption(page, CONTROL_IDS.contextMode, controls.contextMode, diagnostic);
  const url = new URL(page.url());
  if (url.searchParams.get("questionMode") !== controls.questionMode) {
    fail("G5A_U08_R1_CONTROL_QUERY_MISMATCH", { controls, key: "questionMode", actual: url.searchParams.get("questionMode") });
  }
  if (row.depthApplicable && url.searchParams.get("depthMode") !== controls.depthMode) {
    fail("G5A_U08_R1_CONTROL_QUERY_MISMATCH", { controls, key: "depthMode", actual: url.searchParams.get("depthMode") });
  }
  if (row.contextApplicable && url.searchParams.get("contextMode") !== controls.contextMode) {
    fail("G5A_U08_R1_CONTROL_QUERY_MISMATCH", { controls, key: "contextMode", actual: url.searchParams.get("contextMode") });
  }
}

async function assertNotExposed(page, row, label) {
  const questions = await optionValues(page, CONTROL_IDS.questionMode);
  const depths = await optionValues(page, CONTROL_IDS.depthMode);
  const contexts = await optionValues(page, CONTROL_IDS.contextMode);
  const exactExposed = questions.includes(row.questionMode)
    && (row.depthApplicable ? depths.includes(row.depthMode) : row.depthMode === "mixed")
    && (row.contextApplicable ? contexts.includes(row.contextMode) : row.contextMode === "mixed");
  if (exactExposed) {
    fail("G5A_U08_R1_UNADMITTED_CONTROL_INTERSECTION_EXPOSED", { label, row, questions, depths, contexts });
  }
  return { questions, depths, contexts };
}`;

const LEGACY_MATRIX_LOOP = `    await setControls(page, controls);
    await page.fill(
      "#generation-seed-input",
      \`g5a-u08-r1-\${row.questionMode}-\${row.depthMode}-\${row.contextMode}\`,
    );
    const label = \`\${row.questionMode}/\${row.depthMode}/\${row.contextMode}\`;
    if (row.expected === "generate") {
      const output = await assertGenerated(page, PER_COMBINATION_QUESTION_COUNT, true, label);
      controlMatrixResults.push({ ...row, actual: "generated", previewMeta: output.previewMeta });
    } else {
      const output = await assertBlocked(page, label);
      controlMatrixResults.push({ ...row, actual: "blocked", status: output.status });
    }`;
const CAPACITY_MATRIX_LOOP = `    const label = \`\${row.questionMode}/\${row.depthMode}/\${row.contextMode}\`;
    const rowSeed = \`g5a-u08-r1-\${row.questionMode}-\${row.depthMode}-\${row.contextMode}\`;
    const rowUrl = new URL(page.url());
    rowUrl.searchParams.set("sourceId", SOURCE_ID);
    rowUrl.searchParams.set("selectionMode", "mixedKnowledgePointsSameUnit");
    rowUrl.searchParams.delete("kp");
    for (const knowledgePointId of G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS) rowUrl.searchParams.append("kp", knowledgePointId);
    rowUrl.searchParams.delete("pg");
    for (const patternGroupId of G5A_U08_PROMOTED_PATTERN_GROUP_IDS) rowUrl.searchParams.append("pg", patternGroupId);
    rowUrl.searchParams.set("questionCount", String(PER_COMBINATION_QUESTION_COUNT));
    rowUrl.searchParams.set("ordering", "groupedByPattern");
    rowUrl.searchParams.set("answerKey", "1");
    rowUrl.searchParams.set("generationSeed", rowSeed);
    rowUrl.searchParams.set("questionMode", row.questionMode);
    rowUrl.searchParams.set("depthMode", row.depthMode);
    rowUrl.searchParams.set("contextMode", row.contextMode);
    await page.goto(rowUrl.href, { waitUntil: "networkidle", timeout: 120000 });
    try {
      await page.waitForFunction(
        (sourceId) => document.querySelector("#g5a-u08-public-controls")?.dataset.sourceId === sourceId,
        SOURCE_ID,
        { timeout: 30000 },
      );
    } catch (error) {
      fail("G5A_U08_R1_MATRIX_CAPABILITY_SYNC_TIMEOUT", {
        label,
        row,
        snapshot: await controlSnapshot(page),
        error: String(error?.message ?? error),
      });
    }
    const isolatedUrl = new URL(page.url());
    if (
      isolatedUrl.searchParams.get("selectionMode") !== "mixedKnowledgePointsSameUnit"
      || new Set(isolatedUrl.searchParams.getAll("kp")).size !== EXPECTED_KP_COUNT
      || new Set(isolatedUrl.searchParams.getAll("pg")).size !== EXPECTED_PATTERN_GROUP_COUNT
    ) {
      fail("G5A_U08_R1_MATRIX_ROW_STATE_NOT_ISOLATED", {
        label,
        url: isolatedUrl.href,
        knowledgePointCount: new Set(isolatedUrl.searchParams.getAll("kp")).size,
        patternGroupCount: new Set(isolatedUrl.searchParams.getAll("pg")).size,
      });
    }
    if (row.expected === "generate") {
      await setControls(page, controls, row, label);
      const output = await assertGenerated(page, PER_COMBINATION_QUESTION_COUNT, true, label);
      controlMatrixResults.push({ ...row, actual: "generated", previewMeta: output.previewMeta });
    } else {
      const exposure = await assertNotExposed(page, row, label);
      controlMatrixResults.push({ ...row, actual: "not_exposed", exposure });
    }`;

function replaceExactlyOnce(source, target, replacement, errorPrefix) {
  const occurrenceCount = source.split(target).length - 1;
  if (occurrenceCount !== 1) throw new Error(`${errorPrefix}_TARGET_COUNT_INVALID:${occurrenceCount}`);
  const patched = source.replace(target, replacement);
  if (patched === source) throw new Error(`${errorPrefix}_PATCH_FAILED`);
  return patched;
}

export function patchG5AU08DeployedSmokeHarness(source) {
  let patched = replaceExactlyOnce(source, LEGACY_ROUTER_IMPORT, CAPACITY_AUTHORITY_IMPORT, "PGC_R07_A02_CAPACITY_IMPORT");
  patched = replaceExactlyOnce(patched, LEGACY_MATRIX_CLASSIFICATION, CAPACITY_MATRIX_CLASSIFICATION, "PGC_R07_A02_MATRIX_CLASSIFICATION");
  patched = replaceExactlyOnce(patched, LEGACY_REPLAY_SELECTION, CAPACITY_REPLAY_SELECTION, "PGC_R07_A02_REPLAY_SELECTION");
  patched = replaceExactlyOnce(patched, LEGACY_ASSERTION, GS01_ASSERTION, "GS01_PREVIEW_META_ASSERTION");
  patched = replaceExactlyOnce(patched, LEGACY_SINGLE_KP_MIXED_CONTROL, CAPACITY_ALIGNED_SINGLE_KP_CONTROL, "PGC_R07_A02_SINGLE_KP_CONTROL");
  patched = replaceExactlyOnce(patched, LEGACY_SET_CONTROLS, CAPACITY_AWARE_SET_CONTROLS, "PGC_R07_A02_CAPACITY_AWARE_CONTROLS");
  patched = replaceExactlyOnce(patched, LEGACY_MATRIX_LOOP, CAPACITY_MATRIX_LOOP, "PGC_R07_A02_CAPACITY_MATRIX_LOOP");
  if (
    !patched.includes("resolvePublicUiCapabilityBinding")
    || !patched.includes("publicAdmitted")
    || !patched.includes("preferredReplayControls")
    || !patched.includes("assertNotExposed")
    || !patched.includes('actual: "not_exposed"')
    || !patched.includes("G5A_U08_R1_MATRIX_ROW_STATE_NOT_ISOLATED")
    || !patched.includes("G5A_U08_R1_MATRIX_CAPABILITY_SYNC_TIMEOUT")
    || !patched.includes("G5A_U08_R1_EXPECTED_GENERATE_CONTROL_NOT_EXPOSED")
    || !patched.includes("G5A_U08_R1_CONTROL_SELECTION_DID_NOT_SETTLE")
    || !patched.includes('rowUrl.searchParams.delete("kp")')
    || !patched.includes('rowUrl.searchParams.delete("pg")')
    || !patched.includes("requiredSegments")
    || patched.includes("endsWith(expectedSuffix)")
    || patched.includes(LEGACY_SINGLE_KP_MIXED_CONTROL)
  ) throw new Error("PGC_R07_A02_DEPLOYED_SMOKE_PATCH_FAILED");
  return patched;
}

export function previewMetaSatisfiesGS01Contract(previewMeta, questionCount, includeAnswerKey) {
  const requiredSegments = [`${questionCount} 題`, includeAnswerKey ? "含答案頁" : "不含答案頁"];
  const previewSegments = String(previewMeta ?? "").split("｜").map((segment) => segment.trim()).filter(Boolean);
  return {
    ok: requiredSegments.every((segment) => previewSegments.includes(segment)) && !/undefined|null/i.test(String(previewMeta ?? "")),
    requiredSegments,
    previewSegments,
    missingSegments: requiredSegments.filter((segment) => !previewSegments.includes(segment)),
  };
}

export async function runGS01DeployedSmoke() {
  const source = await readFile(SOURCE_PATH, "utf8");
  const patched = patchG5AU08DeployedSmokeHarness(source);
  const temporaryPath = resolve(HERE, `.gs01-g5a-u08-deployed-pages-smoke-${process.pid}.mjs`);
  await writeFile(temporaryPath, patched, "utf8");
  try {
    await import(`${pathToFileURL(temporaryPath).href}?gs01=${Date.now()}`);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await runGS01DeployedSmoke();
