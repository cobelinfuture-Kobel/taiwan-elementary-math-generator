import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(HERE, "run-pgc-r07-a03-chromium-print-answer-matrix.mjs");

const LEGACY_FRAME_READY = `  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return frame;`;

const R1_FRAME_READY = `  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  await frame.locator(
    ".g5a-u08-cell--question, .worksheet-cell--question, .g4b-u04-cell--question",
  ).first().waitFor({ state: "visible", timeout: 120000 });
  return frame;`;

const LEGACY_PREVIEW_SELECTORS = `  const questionCells = frame.locator(".g5a-u08-cell--question");
  const answerCells = frame.locator(".g5a-u08-cell--answer");
  const questionTexts = (await questionCells.allInnerTexts()).map(normalizeText);
  const answerTexts = (await answerCells.allInnerTexts()).map(normalizeText);
  const questionNumbers = (await frame.locator(
    ".g5a-u08-cell--question .g5a-u08-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const answerNumbers = (await frame.locator(
    ".g5a-u08-cell--answer .g5a-u08-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const questionPageCount = await frame.locator(".g5a-u08-page--questions").count();
  const answerPageCount = await frame.locator(".g5a-u08-page--answers").count();`;

const R1_PREVIEW_SELECTORS = `  const questionCells = frame.locator(
    ".g5a-u08-cell--question, .worksheet-cell--question, .g4b-u04-cell--question",
  );
  const answerCells = frame.locator(
    ".g5a-u08-cell--answer, .worksheet-cell--answer-key, .g4b-u04-cell--answer",
  );
  const questionTexts = (await questionCells.allInnerTexts()).map(normalizeText);
  const answerTexts = (await answerCells.allInnerTexts()).map(normalizeText);
  const questionNumbers = (await frame.locator(
    ".g5a-u08-cell--question .g5a-u08-cell__number, .worksheet-cell--question .worksheet-cell__number, .g4b-u04-cell--question .g4b-u04-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const answerNumbers = (await frame.locator(
    ".g5a-u08-cell--answer .g5a-u08-cell__number, .worksheet-cell--answer-key .worksheet-cell__number, .g4b-u04-cell--answer .g4b-u04-cell__number",
  ).allTextContents()).map(normalizeNumberText);
  const questionPageCount = await frame.locator(
    ".g5a-u08-page--questions, .worksheet-page[data-page-type='questions'], .worksheet-page[data-page-type='question'], .g4b-u04-page--questions",
  ).count();
  const answerPageCount = await frame.locator(
    ".g5a-u08-page--answers, .worksheet-page[data-page-type='answerKey'], .worksheet-page[data-page-type='answer'], .g4b-u04-page--answers",
  ).count();`;

function replaceExactlyOnce(source, target, replacement, code) {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`${code}_TARGET_COUNT_INVALID:${count}`);
  return source.replace(target, replacement);
}

export function patchPGCR07A03Runner(source) {
  let patched = replaceExactlyOnce(
    source,
    LEGACY_FRAME_READY,
    R1_FRAME_READY,
    "PGC_R07_A03_R1_FRAME_READY",
  );
  patched = replaceExactlyOnce(
    patched,
    LEGACY_PREVIEW_SELECTORS,
    R1_PREVIEW_SELECTORS,
    "PGC_R07_A03_R1_PREVIEW_SELECTORS",
  );
  if (
    !patched.includes(".worksheet-cell--question")
    || !patched.includes(".worksheet-cell--answer-key")
    || !patched.includes(".g4b-u04-cell--question")
    || patched.includes(LEGACY_PREVIEW_SELECTORS)
  ) {
    throw new Error("PGC_R07_A03_R1_PATCH_FAILED");
  }
  return patched;
}

export async function runPGCR07A03R1() {
  const source = await readFile(SOURCE_PATH, "utf8");
  const patched = patchPGCR07A03Runner(source);
  const temporaryPath = path.join(HERE, `.pgc-r07-a03-r1-${process.pid}.mjs`);
  await writeFile(temporaryPath, patched, "utf8");
  try {
    await import(`${pathToFileURL(temporaryPath).href}?r1=${Date.now()}`);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  await runPGCR07A03R1();
}
