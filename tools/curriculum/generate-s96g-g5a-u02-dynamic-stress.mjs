import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";

const outputDir = resolve("docs/curriculum/output/stress");
const htmlPath = resolve(outputDir, "S96G_G5A_U02_DynamicStress200.html");
const manifestPath = resolve(outputDir, "S96G_G5A_U02_DynamicStress.manifest.json");
await mkdir(outputDir, { recursive: true });

const rows = listG5AU02PublicKnowledgePoints();
const single = [rows[12].knowledgePointId];
const mixed = [rows[1].knowledgePointId, rows[6].knowledgePointId, rows[12].knowledgePointId, rows[15].knowledgePointId];
const selections = [single, mixed];
const counts = [1, 23, 100];
const seeds = [96001, 96002, 96003];
const answerModes = [true, false];
const errors = [];
let scenarioCount = 0;

for (const knowledgePointIds of selections) {
  for (const questionCount of counts) {
    for (const generationSeed of seeds) {
      for (const includeAnswerKey of answerModes) {
        scenarioCount += 1;
        const resolution = resolveG5AU02BrowserPlan({
          sourceId: "g5a_u02_5a02",
          selectedKnowledgePointIds: knowledgePointIds,
          questionCount,
          generationSeed,
          includeAnswerKey,
          rowsPerPage: 10,
        });
        if (!resolution?.ok) {
          errors.push(...(resolution?.errors ?? ["S96G_RESOLUTION_FAILED"]));
          continue;
        }
        const result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
        if (!result?.ok) {
          errors.push(...(result?.errors ?? ["S96G_BUILD_FAILED"]));
          continue;
        }
        const document = result.worksheetDocument;
        if (document.questionCount !== questionCount) errors.push("S96G_EXACT_COUNT_FAILED");
        if (document.answerKeyItems.length !== (includeAnswerKey ? questionCount : 0)) errors.push("S96G_ANSWER_COUNT_FAILED");
        if (!includeAnswerKey && document.dynamicHtml.includes("g5a-u02-section--answer-key")) errors.push("S96G_ANSWER_SUPPRESSION_FAILED");
        const allowed = new Set(resolution.patternSpecIds);
        if (document.questionItems.some((item) => !allowed.has(item.patternSpecId))) errors.push("S96G_PATTERN_SCOPE_FAILED");
        const replay = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
        if (JSON.stringify(result) !== JSON.stringify(replay)) errors.push("S96G_DETERMINISM_FAILED");
      }
    }
  }
}
if (errors.length > 0) throw new Error([...new Set(errors)].join("\n"));

const stressResolution = resolveG5AU02BrowserPlan({
  sourceId: "g5a_u02_5a02",
  selectedKnowledgePointIds: mixed,
  questionCount: 200,
  generationSeed: 96200,
  includeAnswerKey: true,
  rowsPerPage: 10,
});
if (!stressResolution?.ok) throw new Error(stressResolution.errors.join("\n"));
const stress = buildG5AU02BrowserDynamicWorksheet(stressResolution.plan);
if (!stress?.ok) throw new Error(stress.errors.join("\n"));
const html = stress.worksheetDocument.dynamicHtml
  .replace('<body class="g5a-u02-renderer">', '<body class="g5a-u02-renderer" data-s96g-dynamic-stress="true">');
await writeFile(htmlPath, html, "utf8");

const manifest = {
  task: "S96G_G5A_U02_DynamicHTMLPDFStress",
  status: "generated_pending_chromium_verification",
  scenarioCount,
  selectionTypes: ["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"],
  questionCounts: counts,
  seedCount: seeds.length,
  answerKeyModes: answerModes,
  publicKnowledgePointCount: rows.length,
  stressKnowledgePointIds: mixed,
  stressPatternSpecIds: stressResolution.patternSpecIds,
  stressQuestionCount: stress.worksheetDocument.questionCount,
  stressAnswerCount: stress.worksheetDocument.answerKeyItems.length,
  questionPageCount: stress.worksheetDocument.questionPages.length,
  answerPageCount: stress.worksheetDocument.answerKeyPages.length,
  expectedPdfPageCount: stress.worksheetDocument.questionPages.length + stress.worksheetDocument.answerKeyPages.length,
  browserRegenerationStatus: "dynamic_canonical_connected",
  productionUse: "forbidden_until_s96g_chromium_pass",
  htmlSha256: createHash("sha256").update(html).digest("hex"),
  htmlBytes: Buffer.byteLength(html, "utf8"),
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
