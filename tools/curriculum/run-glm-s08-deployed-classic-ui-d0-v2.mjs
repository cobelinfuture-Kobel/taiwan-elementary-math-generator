import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(directory, "run-glm-s08-deployed-classic-ui-d0.mjs");
const runtimePath = resolve(directory, ".run-glm-s08-deployed-classic-ui-d0-runtime.mjs");

function replaceFunctionBlock(source, startToken, endToken, replacement, errorCode) {
  const firstStart = source.indexOf(startToken);
  if (firstStart < 0) throw new Error(`${errorCode}_START_MISSING`);
  if (source.indexOf(startToken, firstStart + startToken.length) >= 0) {
    throw new Error(`${errorCode}_START_AMBIGUOUS`);
  }
  const endIndex = source.indexOf(endToken, firstStart + startToken.length);
  if (endIndex < 0) throw new Error(`${errorCode}_END_MISSING`);
  return `${source.slice(0, firstStart)}${replacement}\n\n${source.slice(endIndex)}`;
}

const hydrationReplacement = `const glmS08UnitBySourceId = new Map(contract.publicUnits.map((unit) => [unit.sourceId, unit]));

function selectorCoordinates(unit) {
  const match = String(unit?.unitCode ?? "").match(/^(\\d)([AB])-U\\d+$/i);
  if (!match) fail("GLM_S08_SELECTOR_COORDINATE_INVALID", { unit });
  return {
    grade: String(Number(match[1])),
    semester: match[2].toUpperCase() === "A" ? "upper" : "lower",
  };
}

function expectedUnitsForCoordinates(grade, semester) {
  return contract.publicUnits.filter((unit) => {
    const coordinates = selectorCoordinates(unit);
    return coordinates.grade === String(grade) && coordinates.semester === semester;
  });
}

async function selectSourceViaHierarchy(page, unit) {
  const { grade, semester } = selectorCoordinates(unit);
  await page.selectOption("#batch-a-grade-select", grade);
  await page.waitForFunction(
    ({ grade, semester }) => {
      const gradeSelect = document.querySelector("#batch-a-grade-select");
      const semesterSelect = document.querySelector("#batch-a-semester-select");
      return gradeSelect?.value === grade
        && [...(semesterSelect?.options ?? [])].some((option) => option.value === semester);
    },
    { grade, semester },
    { timeout: 120000 },
  );
  await page.selectOption("#batch-a-semester-select", semester);
  await page.waitForFunction(
    ({ semester, sourceId }) => {
      const semesterSelect = document.querySelector("#batch-a-semester-select");
      const sourceSelect = document.querySelector("#batch-a-source-select");
      return semesterSelect?.value === semester
        && [...(sourceSelect?.options ?? [])].some((option) => option.value === sourceId);
    },
    { semester, sourceId: unit.sourceId },
    { timeout: 120000 },
  );
  await page.selectOption("#batch-a-source-select", unit.sourceId);
  await page.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId
      && new URL(window.location.href).searchParams.get("sourceId") === sourceId,
    unit.sourceId,
    { timeout: 120000 },
  );
}

async function waitForHydration(page, scenario) {
  const unit = glmS08UnitBySourceId.get(scenario.sourceId);
  if (!unit) fail("GLM_S08_SCENARIO_SOURCE_NOT_IN_CONTRACT", { sourceId: scenario.sourceId });
  const { grade, semester } = selectorCoordinates(unit);
  await page.waitForFunction(
    ({ sourceId, grade, semester, questionCount, includeAnswerKey, columns, rowsPerPage }) => {
      const gradeSelect = document.querySelector("#batch-a-grade-select");
      const semesterSelect = document.querySelector("#batch-a-semester-select");
      const source = document.querySelector("#batch-a-source-select");
      const mode = document.querySelector("#batch-a-selection-mode-select");
      const count = document.querySelector("#batch-a-question-count-input");
      const answer = document.querySelector("#batch-a-answer-key-input");
      const columnsInput = document.querySelector("#columns-input");
      const rowsInput = document.querySelector("#rows-per-page-input");
      const params = new URL(window.location.href).searchParams;
      return gradeSelect?.value === grade
        && semesterSelect?.value === semester
        && source?.value === sourceId
        && mode?.value === "sourceUnit"
        && count?.value === String(questionCount)
        && answer?.checked === includeAnswerKey
        && columnsInput?.value === String(columns)
        && rowsInput?.value === String(rowsPerPage)
        && params.get("sourceId") === sourceId
        && params.get("questionCount") === String(questionCount)
        && params.get("answerKey") === (includeAnswerKey ? "1" : "0")
        && params.get("columns") === String(columns)
        && params.get("rowsPerPage") === String(rowsPerPage);
    },
    { ...scenario, grade, semester },
    { timeout: 120000 },
  );
}`;

const readbackReplacement = `async function controlReadback(page) {
  return page.evaluate(() => ({
    grade: document.querySelector("#batch-a-grade-select")?.value ?? null,
    semester: document.querySelector("#batch-a-semester-select")?.value ?? null,
    sourceId: document.querySelector("#batch-a-source-select")?.value ?? null,
    sourceIds: [...(document.querySelector("#batch-a-source-select")?.options ?? [])].map((option) => option.value),
    sourceLabels: [...(document.querySelector("#batch-a-source-select")?.options ?? [])].map((option) => option.textContent?.trim() ?? ""),
    selectionMode: document.querySelector("#batch-a-selection-mode-select")?.value ?? null,
    questionCount: Number(document.querySelector("#batch-a-question-count-input")?.value),
    answerKey: Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
    columns: Number(document.querySelector("#columns-input")?.value),
    rowsPerPage: Number(document.querySelector("#rows-per-page-input")?.value),
    rowsMax: Number(document.querySelector("#rows-per-page-input")?.max),
    layoutHelp: document.querySelector("#global-layout-help")?.textContent?.trim() ?? "",
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
    query: Object.fromEntries(new URL(window.location.href).searchParams.entries()),
  }));
}`;

const inventoryReplacement = `async function auditInventoryAndSourceSwitch(browser, consoleErrors, pageErrors) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  attachBrowserErrorCapture(page, "inventory", consoleErrors, pageErrors);
  const first = scenarios[0];
  const response = await page.goto(scenarioUrl(first, "inventory"), { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("GLM_S08_DEPLOYED_INDEX_HTTP_FAILED", { status: response?.status() });
  await waitForHydration(page, first);
  const initial = await controlReadback(page);

  const selectorBuckets = [];
  const visitedCoordinateKeys = new Set();
  const discoveredExpectedSourceIds = [];
  const discoveredExpectedSourceLabels = [];
  for (const unit of contract.publicUnits) {
    const { grade, semester } = selectorCoordinates(unit);
    const coordinateKey = grade + ":" + semester;
    if (visitedCoordinateKeys.has(coordinateKey)) continue;
    visitedCoordinateKeys.add(coordinateKey);

    await page.selectOption("#batch-a-grade-select", grade);
    await page.waitForFunction(
      ({ grade, semester }) => document.querySelector("#batch-a-grade-select")?.value === grade
        && [...(document.querySelector("#batch-a-semester-select")?.options ?? [])].some((option) => option.value === semester),
      { grade, semester },
      { timeout: 120000 },
    );
    await page.selectOption("#batch-a-semester-select", semester);

    const expectedUnits = expectedUnitsForCoordinates(grade, semester);
    const expectedIds = expectedUnits.map((entry) => entry.sourceId);
    const expectedLabels = expectedUnits.map((entry) => entry.unitCode + " " + entry.title);
    await page.waitForFunction(
      ({ semester, expectedIds }) => {
        const semesterSelect = document.querySelector("#batch-a-semester-select");
        const actualIds = [...(document.querySelector("#batch-a-source-select")?.options ?? [])].map((option) => option.value);
        return semesterSelect?.value === semester && expectedIds.every((sourceId) => actualIds.includes(sourceId));
      },
      { semester, expectedIds },
      { timeout: 120000 },
    );

    const readback = await controlReadback(page);
    const labelBySourceId = new Map(readback.sourceIds.map((sourceId, index) => [sourceId, readback.sourceLabels[index]]));
    const missingSourceIds = expectedIds.filter((sourceId) => !readback.sourceIds.includes(sourceId));
    const mismatchedLabels = expectedIds
      .map((sourceId, index) => ({ sourceId, expected: expectedLabels[index], actual: labelBySourceId.get(sourceId) ?? null }))
      .filter((row) => row.actual !== row.expected);
    if (missingSourceIds.length > 0) {
      fail("GLM_S08_DEPLOYED_SOURCE_BUCKET_ID_MISMATCH", { grade, semester, expectedIds, actual: readback.sourceIds, missingSourceIds });
    }
    if (mismatchedLabels.length > 0) {
      fail("GLM_S08_DEPLOYED_SOURCE_BUCKET_LABEL_MISMATCH", { grade, semester, mismatchedLabels });
    }
    discoveredExpectedSourceIds.push(...expectedIds);
    discoveredExpectedSourceLabels.push(...expectedLabels);
    selectorBuckets.push({
      grade,
      semester,
      expectedSourceIds: expectedIds,
      visibleSourceIds: readback.sourceIds,
      extraVisibleSourceIds: readback.sourceIds.filter((sourceId) => !expectedIds.includes(sourceId)),
    });
  }
  if (JSON.stringify(discoveredExpectedSourceIds) !== JSON.stringify(expectedSourceIds)) {
    fail("GLM_S08_DEPLOYED_SOURCE_INVENTORY_ID_MISMATCH", { expectedSourceIds, actual: discoveredExpectedSourceIds });
  }
  if (JSON.stringify(discoveredExpectedSourceLabels) !== JSON.stringify(expectedSourceLabels)) {
    fail("GLM_S08_DEPLOYED_SOURCE_INVENTORY_LABEL_MISMATCH", { expectedSourceLabels, actual: discoveredExpectedSourceLabels });
  }

  const dependentRows = [];
  for (const columns of [3, 2, 1]) {
    await page.locator("#columns-input").evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, columns);
    await page.waitForFunction(
      ({ columns, maximum }) => document.querySelector("#columns-input")?.value === String(columns)
        && document.querySelector("#rows-per-page-input")?.max === String(maximum)
        && document.querySelector("#global-layout-help")?.textContent?.includes("1～" + maximum + " 列"),
      { columns, maximum: columnMaximumRows[columns] },
      { timeout: 120000 },
    );
    dependentRows.push({ columns, maximum: Number(await page.locator("#rows-per-page-input").getAttribute("max")) });
  }

  const sourceSwitchResults = [];
  for (const unit of contract.publicUnits) {
    await selectSourceViaHierarchy(page, unit);
    const readback = await controlReadback(page);
    const { grade, semester } = selectorCoordinates(unit);
    sourceSwitchResults.push({
      sourceId: unit.sourceId,
      grade,
      semester,
      gradeValue: readback.grade,
      semesterValue: readback.semester,
      controlValue: readback.sourceId,
      queryValue: new URL(page.url()).searchParams.get("sourceId"),
    });
  }
  await page.close();
  return { initial, selectorBuckets, dependentRows, sourceSwitchResults };
}`;

let source = await readFile(sourcePath, "utf8");
source = replaceFunctionBlock(
  source,
  "async function waitForHydration(page, scenario) {",
  "async function controlReadback(page) {",
  hydrationReplacement,
  "GLM_S08_V2_HYDRATION_PATCH",
);
source = replaceFunctionBlock(
  source,
  "async function controlReadback(page) {",
  "async function regenerate(page, scenario) {",
  readbackReplacement,
  "GLM_S08_V2_READBACK_PATCH",
);
source = replaceFunctionBlock(
  source,
  "async function auditInventoryAndSourceSwitch(browser, consoleErrors, pageErrors) {",
  "async function runScenario(browser, scenario, index, consoleErrors, pageErrors) {",
  inventoryReplacement,
  "GLM_S08_V2_INVENTORY_PATCH",
);

await writeFile(runtimePath, source, "utf8");

try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
} finally {
  await rm(runtimePath, { force: true });
}
