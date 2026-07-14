import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  G5A_U02_PUBLIC_CANDIDATE,
  G5A_U02_SOURCE_ID,
  buildG5AU02PublicCandidateWorksheet,
  validateG5AU02PublicCandidateContract,
} from "../../site/modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import {
  getBatchASourceUnit,
  listBatchASourceUnits,
} from "../../site/modules/curriculum/batch-a/source-units.js";

const ROOT = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, ROOT), "utf8");

test("S94 exposes G5A-U02 through a public projection while preserving the Batch A 13-unit authority", () => {
  const unit = getBatchASourceUnit(G5A_U02_SOURCE_ID);
  assert.equal(unit?.unitCode, "5A-U02");
  assert.equal(unit?.title, "因數與公因數");
  assert.equal(unit?.lifecycle, "public_preview_candidate");
  assert.equal(listBatchASourceUnits().length, 13);
  assert.equal(listBatchASourceUnits().some((row) => row.sourceId === G5A_U02_SOURCE_ID), false);
  assert.equal(listBatchASourceUnits({ includePublicCandidates: true }).filter((row) => row.sourceId === G5A_U02_SOURCE_ID).length, 1);
});

test("S94 candidate is pinned to the closed S93 artifact and remains preview-only", () => {
  assert.deepEqual(validateG5AU02PublicCandidateContract(), { ok: true, errors: [] });
  assert.match(G5A_U02_PUBLIC_CANDIDATE.canonicalHtmlUrl, /5bd0e6d3aa904768e8436ab19d49e9aa12b4b32a/);
  assert.equal(G5A_U02_PUBLIC_CANDIDATE.questionCount, 22);
  assert.equal(G5A_U02_PUBLIC_CANDIDATE.productionUse, "preview_only_pending_s95");
  assert.equal(G5A_U02_PUBLIC_CANDIDATE.arbitraryRegeneration, false);
});

test("S94 produces stable public worksheet metadata with optional answer suppression", () => {
  const full = buildG5AU02PublicCandidateWorksheet({ sourceId: G5A_U02_SOURCE_ID, includeAnswerKey: true, questionCount: 200 });
  assert.equal(full.ok, true);
  assert.equal(full.worksheetDocument.summary.questionCount, 22);
  assert.equal(full.worksheetDocument.summary.answerKeyItemCount, 22);
  assert.equal(full.worksheetDocument.answerKeyPages.length, 22);
  assert.equal(full.worksheetDocument.lifecycle.selectorStatus, "public_source_unit_candidate");
  assert.equal(full.worksheetDocument.lifecycle.productionUse, "preview_only_pending_s95");

  const questionsOnly = buildG5AU02PublicCandidateWorksheet({ sourceId: G5A_U02_SOURCE_ID, includeAnswerKey: false });
  assert.equal(questionsOnly.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(questionsOnly.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(questionsOnly.worksheetDocument.staticHtmlTransform.suppressAnswerKey, true);
});

test("S94 browser pipeline and renderer contain explicit candidate routing", async () => {
  const buildSource = await read("site/assets/browser/pipeline/build-worksheet-document.js");
  const renderSource = await read("site/assets/browser/pipeline/render-preview-frame.js");
  assert.match(buildSource, /buildG5AU02PublicCandidateWorksheet/);
  assert.match(renderSource, /worksheetDocument\?\.staticHtmlUrl/);
  assert.match(renderSource, /data-s94-public-preview-candidate/);
  assert.match(renderSource, /suppressAnswerKey/);
  assert.match(renderSource, /previewWindow\.print\(\)/);
});

test("S94 query-state keeps generic source, count, answer, seed and layout fields", async () => {
  const queryState = await read("site/assets/browser/state/query-state.js");
  for (const token of ["sourceId", "questionCount", "answerKey", "generationSeed", "columns", "rowsPerPage"]) {
    assert.match(queryState, new RegExp(token));
  }
  assert.match(queryState, /nextUrl\.searchParams\.set\("sourceId"/);
  assert.match(queryState, /params\.get\("sourceId"\)/);
});

test("S94 does not modify public controls to claim production or arbitrary generation", async () => {
  const source = await read("site/modules/curriculum/batch-a/g5a-u02-public-candidate.js");
  assert.doesNotMatch(source, /productionUse:\s*"allowed"/);
  assert.doesNotMatch(source, /arbitraryRegeneration:\s*true/);
  assert.match(source, /genericFallback:\s*false/);
  assert.match(source, /freeFormAI:\s*false/);
});
