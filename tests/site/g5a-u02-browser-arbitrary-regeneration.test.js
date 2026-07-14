import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  auditG5AU02BrowserDynamicRuntime,
  buildG5AU02BrowserDynamicWorksheet,
} from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";

const SOURCE_ID = "g5a_u02_5a02";
const GCF_KP = "kp_g5a_u02_greatest_common_factor";
const COMMON_FACTOR_KP = "kp_g5a_u02_common_factor_enumeration";

function resolve(knowledgePointIds) {
  const result = resolveG5AU02BrowserPlan({
    sourceId: SOURCE_ID,
    knowledgePointIds,
    questionCount: 12,
    generationSeed: 9604,
    includeAnswerKey: true,
    rowsPerPage: 6,
  });
  assert.equal(result.ok, true);
  return result;
}

test("S96D generated browser runtime passes canonical self-audit", () => {
  assert.deepEqual(auditG5AU02BrowserDynamicRuntime(), { ok: true, errors: [] });
});

test("S96D single-KP regeneration produces exact-count validated HTML", () => {
  const resolution = resolve([GCF_KP]);
  assert.deepEqual(resolution.patternSpecIds, ["ps_g5a_u02_greatest_common_factor"]);
  const result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.questionCount, 12);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(result.worksheetDocument.patternSpecIds.length, 1);
  assert.match(result.worksheetDocument.dynamicHtml, /^<!doctype html>/);
  assert.equal(result.worksheetDocument.lifecycle.browserRegenerationStatus, "implemented_pending_selector");
  assert.equal(result.worksheetDocument.lifecycle.genericFallback, false);
  assert.equal(result.worksheetDocument.lifecycle.freeFormAI, false);
});

test("S96D multi-KP regeneration allocates only resolved canonical patterns", () => {
  const resolution = resolve([GCF_KP, COMMON_FACTOR_KP]);
  assert.deepEqual(resolution.patternSpecIds, [
    "ps_g5a_u02_greatest_common_factor",
    "ps_g5a_u02_common_factor_enumeration",
  ]);
  const result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.questionCount, 12);
  assert.deepEqual(new Set(result.worksheetDocument.questionItems.map((row) => row.patternSpecId)), new Set(resolution.patternSpecIds));
});

test("S96D same seed is deterministic and different seeds vary", () => {
  const resolution = resolve([GCF_KP]);
  const first = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  const replay = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  const varied = buildG5AU02BrowserDynamicWorksheet({ ...resolution.plan, generationSeed: 9605 });
  assert.deepEqual(first, replay);
  assert.notDeepEqual(first.worksheetDocument.questionItems, varied.worksheetDocument.questionItems);
});

test("S96D answer suppression removes answer records and answer HTML section", () => {
  const resolution = resolve([COMMON_FACTOR_KP]);
  const result = buildG5AU02BrowserDynamicWorksheet({ ...resolution.plan, includeAnswerKey: false });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyEnabled, false);
  assert.deepEqual(result.worksheetDocument.answerKeyItems, []);
  assert.deepEqual(result.worksheetDocument.answerKeyPages, []);
  assert.doesNotMatch(result.worksheetDocument.dynamicHtml, /g5a-u02-section--answer-key/);
});

test("S96D does not claim dynamic generation for source-unit plans without resolved patterns", () => {
  assert.equal(buildG5AU02BrowserDynamicWorksheet({ sourceId: SOURCE_ID }), null);
  assert.equal(buildG5AU02BrowserDynamicWorksheet({ sourceId: "other", patternSpecIds: ["x"] }), null);
});

test("S96D bundle is generated from canonical source and deployed under site", async () => {
  const bundle = await readFile("site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js", "utf8");
  assert.match(bundle, /^\/\* GENERATED CANONICAL G5A-U02 RUNTIME — DO NOT EDIT \*\//);
  assert.doesNotMatch(bundle, /src\//);
  assert.match(bundle, /buildG5AU02BrowserDynamicWorksheet/);
  const workflow = await readFile(".github/workflows/s96d-g5a-u02-browser-bundle.yml", "utf8");
  assert.match(workflow, /src\/curriculum\/g5a-u02\/browser-dynamic-entry\.js/);
  const pagesWorkflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.match(pagesWorkflow, /path: site/);
});
