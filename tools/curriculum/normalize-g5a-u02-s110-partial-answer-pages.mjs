import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = path.join(root, "docs/curriculum/output/g5a-u02-s110/answer-boundary-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function normalizeAnswerPage(page) {
  const occupiedRows = Math.min(page.rows, page.cardCount);
  const rowSemanticsValid = page.computedGridRowCount === page.rows
    || page.computedGridRowCount === occupiedRows;
  const pass = page.cardCount > 0
    && page.actualColumnCount === page.columns
    && page.computedGridColumnCount === page.columns
    && rowSemanticsValid
    && page.cardOverflowCount === 0
    && page.pageOverflow === false
    && page.overlapCount === 0;
  return {
    ...page,
    occupiedRowCount: occupiedRows,
    rowSemantics: page.computedGridRowCount === page.rows ? "capacity_rows" : "occupied_rows",
    pass,
  };
}

const results = manifest.results.map((row) => {
  const answerPages = row.answerPages.map(normalizeAnswerPage);
  const boundaryPass = row.answerSectionPresent === row.includeAnswerKey
    && row.answerNodeInQuestionSectionCount === 0
    && row.internalIdLeakCount === 0
    && answerPages.every((page) => page.pass);
  const status = row.question.pass && boundaryPass && row.pdf.pass ? "PASS" : "FAIL";
  return { ...row, answerPages, status };
});

const normalized = {
  ...manifest,
  partialAnswerPagePolicy: {
    capacityRowsAccepted: true,
    occupiedRowsAcceptedOnPartialFinalPage: true,
    columnsOverflowOverlapPdfAndLeakageRemainBlocking: true,
  },
  passCount: results.filter((row) => row.status === "PASS").length,
  failureCount: results.filter((row) => row.status !== "PASS").length,
  status: results.length === 132 && results.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
  results,
};

writeFileSync(manifestPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  scenarioCount: normalized.scenarioCount,
  passCount: normalized.passCount,
  failureCount: normalized.failureCount,
  status: normalized.status,
}, null, 2));
if (normalized.status !== "PASS") process.exitCode = 1;
