export const G5A_U02_SOURCE_ID = "g5a_u02_5a02";

export const G5A_U02_PUBLIC_CANDIDATE = Object.freeze({
  task: "S95_G5A_U02_ProductionStressHTMLPDFAndD0Closeout",
  status: "public_canonical_static_release",
  sourceId: G5A_U02_SOURCE_ID,
  unitCode: "5A-U02",
  title: "因數與公因數",
  selectorStatus: "public_source_unit",
  publicSelectionMode: "sourceUnit",
  questionCount: 22,
  answerCount: 22,
  questionPageCount: 22,
  answerPageCount: 22,
  patternSpecCount: 22,
  answerModelShapeCount: 16,
  rendererProfileCount: 3,
  canonicalArtifactCommit: "5bd0e6d3aa904768e8436ab19d49e9aa12b4b32a",
  canonicalHtmlUrl: "https://raw.githubusercontent.com/cobelinfuture-Kobel/taiwan-elementary-math-generator/5bd0e6d3aa904768e8436ab19d49e9aa12b4b32a/docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html",
  productionUse: "allowed_canonical_static_release",
  arbitraryRegeneration: false,
  genericFallback: false,
  freeFormAI: false,
});

export function isG5AU02PublicCandidatePlan(plan = {}) {
  return plan.sourceId === G5A_U02_SOURCE_ID;
}

export function buildG5AU02PublicCandidateWorksheet(plan = {}) {
  if (!isG5AU02PublicCandidatePlan(plan)) return null;
  const includeAnswerKey = plan.includeAnswerKey !== false;
  const notice = Object.freeze({
    code: "g5a_u02_public_canonical_static_release",
    message: "此單元使用已完成 production stress 的 22 題 canonical 正式卷；目前不提供瀏覽器重新抽題。",
  });
  const worksheetDocument = Object.freeze({
    schemaName: "G5AU02PublicCanonicalWorksheet",
    schemaVersion: 1,
    worksheetId: `g5a-u02-public-canonical-${includeAnswerKey ? "with-answer" : "questions-only"}`,
    sourceId: G5A_U02_SOURCE_ID,
    title: "5A-U02 因數與公因數｜正式 canonical 練習卷",
    staticHtmlUrl: G5A_U02_PUBLIC_CANDIDATE.canonicalHtmlUrl,
    staticHtmlTransform: Object.freeze({ suppressAnswerKey: !includeAnswerKey }),
    includeAnswerKey,
    answerKeyItems: includeAnswerKey ? Object.freeze(Array.from({ length: 22 }, (_, index) => Object.freeze({ questionNumber: index + 1 }))) : Object.freeze([]),
    questionPages: Object.freeze(Array.from({ length: 22 }, (_, index) => Object.freeze({ pageNumber: index + 1 }))),
    answerKeyPages: includeAnswerKey ? Object.freeze(Array.from({ length: 22 }, (_, index) => Object.freeze({ pageNumber: index + 1 }))) : Object.freeze([]),
    summary: Object.freeze({
      questionCount: 22,
      questionPageCount: 22,
      answerKeyItemCount: includeAnswerKey ? 22 : 0,
      answerKeyPageCount: includeAnswerKey ? 22 : 0,
      publicCanonicalRelease: true,
    }),
    lifecycle: Object.freeze({
      selectorStatus: "public_source_unit",
      browserPipelineStatus: "public_static_canonical_connected",
      printStatus: "public_print_allowed",
      queryStateStatus: "source_unit_round_trip_supported",
      productionUse: "allowed_canonical_static_release",
      arbitraryRegeneration: false,
    }),
  });
  return Object.freeze({
    ok: true,
    stage: "production_canonical_static",
    worksheetDocument,
    validation: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([notice]) }),
    errors: Object.freeze([]),
    warnings: Object.freeze([notice]),
  });
}

export function validateG5AU02PublicCandidateContract() {
  const errors = [];
  if (G5A_U02_PUBLIC_CANDIDATE.questionCount !== 22) errors.push("question_count_mismatch");
  if (G5A_U02_PUBLIC_CANDIDATE.answerCount !== 22) errors.push("answer_count_mismatch");
  if (!G5A_U02_PUBLIC_CANDIDATE.canonicalHtmlUrl.includes(G5A_U02_PUBLIC_CANDIDATE.canonicalArtifactCommit)) errors.push("artifact_not_commit_pinned");
  if (G5A_U02_PUBLIC_CANDIDATE.productionUse !== "allowed_canonical_static_release") errors.push("production_scope_mismatch");
  if (G5A_U02_PUBLIC_CANDIDATE.arbitraryRegeneration) errors.push("arbitrary_regeneration_enabled");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
