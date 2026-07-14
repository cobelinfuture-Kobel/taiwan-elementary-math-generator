import test from "node:test";
import assert from "node:assert/strict";

import {
  attachPublicControlOutputMetadata,
  buildPublicControlOutputMetadata,
  publicControlPreviewLabel,
} from "../../site/assets/browser/pipeline/public-control-output-metadata.js";
import { renderPreviewFrame } from "../../site/assets/browser/pipeline/render-preview-frame.js";

test("S96P attaches one immutable control scope to worksheet and answer-key output", () => {
  const plan = {
    sourceId: "g5a_u02_5a02",
    questionMode: "reasoning",
    depthMode: "extended",
    contextMode: "abstract_math",
  };
  const metadata = buildPublicControlOutputMetadata(plan);
  assert.deepEqual(metadata, {
    sourceId: "g5a_u02_5a02",
    questionMode: "reasoning",
    depthMode: "extended",
    contextMode: "abstract_math",
    genericFallback: false,
    freeFormAI: false,
    printScope: "student_and_answer_key_same_control_scope",
  });
  const result = attachPublicControlOutputMetadata({
    ok: true,
    worksheetDocument: { title: "S96P", dynamicHtml: "<!doctype html><html><head></head><body><main>題目與答案</main></body></html>" },
  }, plan);
  assert.equal(result.worksheetDocument.publicControls, result.worksheetDocument.metadata.publicControls);
  assert.equal(Object.isFrozen(result.worksheetDocument.publicControls), true);
  assert.equal(publicControlPreviewLabel(metadata), "題型 reasoning｜深度 extended｜情境 abstract_math");
});

test("S96P stamps the same control contract into preview and print HTML", () => {
  const previewFrame = { dataset: {}, srcdoc: "" };
  const worksheetDocument = {
    dynamicHtml: "<!doctype html><html><head></head><body><main>題目與答案</main></body></html>",
    publicControls: {
      questionMode: "application",
      depthMode: "basic",
      contextMode: "daily_life",
      genericFallback: false,
    },
  };
  const rendered = renderPreviewFrame(previewFrame, worksheetDocument);
  assert.equal(rendered.dynamic, true);
  assert.match(rendered.html, /name="worksheet-public-controls" content="application\|basic\|daily_life"/);
  assert.match(rendered.html, /data-public-question-mode="application"/);
  assert.match(rendered.html, /data-public-depth-mode="basic"/);
  assert.match(rendered.html, /data-public-context-mode="daily_life"/);
  assert.match(rendered.html, /data-public-generic-fallback="false"/);
});
