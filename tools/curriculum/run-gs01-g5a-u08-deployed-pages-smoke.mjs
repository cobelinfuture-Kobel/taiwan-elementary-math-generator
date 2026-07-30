import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = resolve(HERE, "run-g5a-u08-r1-deployed-pages-smoke.mjs");

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
  const previewSegments = previewMeta
    .split("｜")
    .map((segment) => segment.trim())
    .filter(Boolean);
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

const CAPACITY_ALIGNED_SINGLE_KP_CONTROL = `  // PGC-R07 A02: single-KP controls remain capacity-derived. The mixed control
  // matrix is exercised only after switching to mixedKnowledgePointsSameUnit.

  const kpButtons`;

function replaceExactlyOnce(source, target, replacement, errorPrefix) {
  const occurrenceCount = source.split(target).length - 1;
  if (occurrenceCount !== 1) {
    throw new Error(`${errorPrefix}_TARGET_COUNT_INVALID:${occurrenceCount}`);
  }
  const patched = source.replace(target, replacement);
  if (patched === source) throw new Error(`${errorPrefix}_PATCH_FAILED`);
  return patched;
}

export function patchG5AU08DeployedSmokeHarness(source) {
  const previewPatched = replaceExactlyOnce(
    source,
    LEGACY_ASSERTION,
    GS01_ASSERTION,
    "GS01_PREVIEW_META_ASSERTION",
  );
  const patched = replaceExactlyOnce(
    previewPatched,
    LEGACY_SINGLE_KP_MIXED_CONTROL,
    CAPACITY_ALIGNED_SINGLE_KP_CONTROL,
    "PGC_R07_A02_SINGLE_KP_CONTROL",
  );
  if (
    !patched.includes("requiredSegments")
    || patched.includes("endsWith(expectedSuffix)")
    || patched.includes(LEGACY_SINGLE_KP_MIXED_CONTROL)
    || !patched.includes("mixedKnowledgePointsSameUnit")
  ) {
    throw new Error("PGC_R07_A02_DEPLOYED_SMOKE_PATCH_FAILED");
  }
  return patched;
}

export function previewMetaSatisfiesGS01Contract(previewMeta, questionCount, includeAnswerKey) {
  const requiredSegments = [
    `${questionCount} 題`,
    includeAnswerKey ? "含答案頁" : "不含答案頁",
  ];
  const previewSegments = String(previewMeta ?? "")
    .split("｜")
    .map((segment) => segment.trim())
    .filter(Boolean);
  return {
    ok: requiredSegments.every((segment) => previewSegments.includes(segment))
      && !/undefined|null/i.test(String(previewMeta ?? "")),
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
if (invokedPath === import.meta.url) {
  await runGS01DeployedSmoke();
}
