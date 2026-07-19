import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const liveDir = process.env.LIVE_EVIDENCE_DIR ?? "docs/curriculum/output/gctx/p14-live";
const livePath = join(liveDir, "GCTX_P14_LIVE_PUBLIC_UI.json");
const previewHtmlPath = join(liveDir, "GCTX_P14_LIVE_PUBLIC_PREVIEW.html");
const pageScreenshotPath = join(liveDir, "GCTX_P14_LIVE_PUBLIC_UI.png");
const previewScreenshotPath = join(liveDir, "GCTX_P14_LIVE_PUBLIC_PREVIEW.png");
const claimPath = "data/project/milestones/GCTX-P14.claim.json";

const live = JSON.parse(readFileSync(livePath, "utf8"));
const claim = JSON.parse(readFileSync(claimPath, "utf8"));
const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const failures = [];
const check = (condition, label, actual) => {
  if (!condition) failures.push({ label, actual });
};

check(live.status === "live_public_ui_production_regression_pass", "live.status", live.status);
check(live.evidenceLevel === "E6_D0_COMPLETE", "live.evidenceLevel", live.evidenceLevel);
check(live.deployedAssetIdentityVerified === true, "deployedAssetIdentityVerified", live.deployedAssetIdentityVerified);
check(Array.isArray(live.deployedAssets) && live.deployedAssets.length === 4, "deployedAssets.length", live.deployedAssets?.length);
check(live.deployedAssets?.every((row) => row.expectedSha256 === row.liveSha256 && row.missingTokenCount === 0), "deployedAssets.identity", live.deployedAssets);
check(live.selectorState?.sourceId === "g3b_u04_3b04", "selector.sourceId", live.selectorState?.sourceId);
check(live.selectorState?.selectionMode === "singleKnowledgePoint", "selector.selectionMode", live.selectorState?.selectionMode);
check(live.selectorState?.selectedKnowledgePoint === "true", "selector.selectedKnowledgePoint", live.selectorState?.selectedKnowledgePoint);
check(live.selectorState?.selectedPatternGroup === "true", "selector.selectedPatternGroup", live.selectorState?.selectedPatternGroup);
check(live.output?.questionCount === 25, "output.questionCount", live.output?.questionCount);
check(live.output?.answerCount === 25, "output.answerCount", live.output?.answerCount);
check(live.output?.questionPageCount === 4, "output.questionPageCount", live.output?.questionPageCount);
check(live.output?.answerPageCount === 4, "output.answerPageCount", live.output?.answerPageCount);
check(live.output?.targetQuestionCount === 5, "output.targetQuestionCount", live.output?.targetQuestionCount);
check(live.output?.targetAnswerCount === 5, "output.targetAnswerCount", live.output?.targetAnswerCount);
check(live.output?.uniqueRequiredPhraseCount === 5, "output.uniqueRequiredPhraseCount", live.output?.uniqueRequiredPhraseCount);
check(live.output?.targetAnswersWithEquationAndAnswer === 5, "output.targetAnswersWithEquationAndAnswer", live.output?.targetAnswersWithEquationAndAnswer);
check(live.output?.missingRequiredPhrases?.length === 0, "output.missingRequiredPhrases", live.output?.missingRequiredPhrases);
check(live.output?.leakedLegacyTargetPhrases?.length === 0, "output.leakedLegacyTargetPhrases", live.output?.leakedLegacyTargetPhrases);
check(live.output?.internalIdLeakage?.length === 0, "output.internalIdLeakage", live.output?.internalIdLeakage);
check(live.shellState?.statusTone === "success", "shell.statusTone", live.shellState?.statusTone);
check(live.shellState?.validationHasErrors === "false", "shell.validationHasErrors", live.shellState?.validationHasErrors);
check(live.shellState?.printButtonDisabled === false, "shell.printButtonDisabled", live.shellState?.printButtonDisabled);
check(live.consoleErrors?.length === 0, "consoleErrors", live.consoleErrors);
check(live.pageErrors?.length === 0, "pageErrors", live.pageErrors);
check(live.requestFailures?.length === 0, "requestFailures", live.requestFailures);
check(live.forbiddenQueryKeys?.length === 0, "forbiddenQueryKeys", live.forbiddenQueryKeys);
check(live.pageScreenshotSha256 === sha256(pageScreenshotPath), "pageScreenshotSha256", {
  expected: live.pageScreenshotSha256,
  actual: sha256(pageScreenshotPath)
});
check(live.previewScreenshotSha256 === sha256(previewScreenshotPath), "previewScreenshotSha256", {
  expected: live.previewScreenshotSha256,
  actual: sha256(previewScreenshotPath)
});
check(live.previewHtmlSha256 === sha256(previewHtmlPath), "previewHtmlSha256", {
  expected: live.previewHtmlSha256,
  actual: sha256(previewHtmlPath)
});
check(claim.actualEvidenceLevel === "E6_D0_COMPLETE", "claim.actualEvidenceLevel", claim.actualEvidenceLevel);
check(claim.claims?.productionAdmitted === true, "claim.productionAdmitted", claim.claims?.productionAdmitted);
check(claim.claims?.d0Complete === true, "claim.d0Complete", claim.claims?.d0Complete);
check(claim.distance?.after === "D0", "claim.distance.after", claim.distance?.after);

const result = {
  ok: failures.length === 0,
  liveEvidenceDir: liveDir,
  questionCount: live.output?.questionCount,
  answerCount: live.output?.answerCount,
  targetQuestionCount: live.output?.targetQuestionCount,
  targetAnswerCount: live.output?.targetAnswerCount,
  warningTextPresent: Boolean(live.shellState?.validationText),
  blockingValidationErrors: live.shellState?.validationHasErrors,
  failures
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
