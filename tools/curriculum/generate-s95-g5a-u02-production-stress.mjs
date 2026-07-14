import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

import { buildAndRenderG5AU02HiddenWorksheet } from "../../src/curriculum/g5a-u02/hidden-renderer.js";
import { runG5AU02ProductionStressAudit } from "../../src/curriculum/g5a-u02/production-stress.js";

const outputDir = resolve("docs/curriculum/output/stress");
const htmlPath = resolve(outputDir, "S95_G5A_U02_ProductionStress200.html");
const manifestPath = resolve(outputDir, "S95_G5A_U02_ProductionStress.manifest.json");
await mkdir(outputDir, { recursive: true });

const audit = runG5AU02ProductionStressAudit();
if (!audit.ok) throw new Error(audit.errors.join("\n"));

const rendered = buildAndRenderG5AU02HiddenWorksheet({
  questionCount: 200,
  baseSeed: 9500,
  includeAnswerKey: true,
  questionRowsPerPage: 10,
  answerRowsPerPage: 20,
}, {
  title: "五上因數與公因數｜S95 Production Stress",
  subtitle: "200 題 production stress canonical worksheet",
});
if (!rendered.ok) throw new Error(rendered.errors.join("\n"));

const html = rendered.renderedWorksheet.html
  .replace('<body class="g5a-u02-renderer">', '<body class="g5a-u02-renderer" data-s95-production-stress="true">');
await writeFile(htmlPath, html, "utf8");

const manifest = {
  task: "S95_G5A_U02_ProductionStressHTMLPDFAndD0Closeout",
  status: "generated_pending_chromium_verification",
  scenarioCount: audit.scenarioCount,
  deterministicReplayCount: audit.deterministicReplayCount,
  totalQuestionsAcrossAudit: audit.totalQuestions,
  totalAnswersAcrossAudit: audit.totalAnswers,
  stressQuestionCount: 200,
  stressAnswerCount: 200,
  expectedPdfPageCount: rendered.renderedWorksheet.questionPageCount + rendered.renderedWorksheet.answerPageCount,
  questionPageCount: rendered.renderedWorksheet.questionPageCount,
  answerPageCount: rendered.renderedWorksheet.answerPageCount,
  profileIds: rendered.renderedWorksheet.profileIds,
  patternSpecCount: audit.patternSpecCount,
  answerModelShapeCount: audit.answerModelShapeCount,
  productionUse: "allowed_canonical_static_release",
  arbitraryBrowserRegeneration: false,
  htmlSha256: createHash("sha256").update(html).digest("hex"),
  htmlBytes: Buffer.byteLength(html, "utf8"),
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
