import { buildAndRenderG5AU02HiddenWorksheet } from "./hidden-renderer.js";

const SOURCE_ID = "g5a_u02_5a02";
const MAX_SEED = 0x7fffffff;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function blocked(errors, plan = null) {
  return freeze({
    ok: false,
    errors: [...new Set(errors)],
    plan,
    worksheetDocument: null,
  });
}

export function normalizeG5AU02BrowserSeed(value) {
  if (Number.isInteger(value) && value >= 1 && value <= MAX_SEED) return value;

  const text = String(value ?? "").trim();
  if (/^\d+$/.test(text)) {
    const parsed = Number(text);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_SEED) return parsed;
  }
  if (!text) return 1;

  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % (MAX_SEED - 1)) + 1;
}

export function buildG5AU02BrowserDynamicWorksheet(plan = {}) {
  if (plan?.sourceId !== SOURCE_ID) return null;
  const patternSpecIds = Array.isArray(plan.patternSpecIds) ? [...plan.patternSpecIds] : [];
  if (patternSpecIds.length === 0) return null;

  const input = {
    patternSpecIds,
    questionCount: plan.questionCount ?? 22,
    baseSeed: normalizeG5AU02BrowserSeed(plan.generationSeed ?? plan.baseSeed ?? 1),
    includeAnswerKey: plan.includeAnswerKey !== false,
    questionRowsPerPage: plan.rowsPerPage ?? plan.questionRowsPerPage ?? 8,
    answerRowsPerPage: plan.answerRowsPerPage ?? 12,
  };
  const rendered = buildAndRenderG5AU02HiddenWorksheet(input, {
    title: "五上因數與公因數",
    subtitle: "依知識點動態產生",
  });
  if (!rendered.ok) return blocked(rendered.errors, plan);

  const source = rendered.worksheetDocument;
  const worksheetDocument = freeze({
    schemaName: "G5AU02PublicDynamicWorksheet",
    schemaVersion: 1,
    worksheetDocumentId: source.worksheetDocumentId.replace("g5a_u02_hidden_", "g5a_u02_public_dynamic_"),
    sourceId: SOURCE_ID,
    unitId: "g5a_u02",
    unitTitle: "因數與公因數",
    selectionMode: patternSpecIds.length === 22 ? "sourceUnitDynamic" : "knowledgePointDynamic",
    patternSpecIds,
    questionCount: source.questionCount,
    questionItems: source.questionRecords,
    questionPages: source.questionPages,
    answerKeyEnabled: source.answerKeyEnabled,
    answerKeyItems: source.answerKeyRecords,
    answerKeyPages: source.answerKeyPages,
    dynamicHtml: rendered.renderedWorksheet.html,
    generationSeed: input.baseSeed,
    lifecycle: freeze({
      task: "S96I_G5A_U02_PublicTextSeedAndLiveClickPathFix",
      selectorStatus: "public_knowledge_point_selection",
      browserResolverStatus: "production_integrated",
      browserRegenerationStatus: "production_allowed",
      browserPipelineStatus: "public_dynamic_canonical_connected",
      htmlPdfStressStatus: "s96g_passed",
      productionUse: "allowed_dynamic_knowledge_point_release",
      genericFallback: false,
      freeFormAI: false,
    }),
  });
  return freeze({ ok: true, errors: [], plan: freeze({ ...plan, ...input }), worksheetDocument });
}

export function auditG5AU02BrowserDynamicRuntime() {
  const sample = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: ["ps_g5a_u02_greatest_common_factor"],
    questionCount: 3,
    generationSeed: "batch-a-browser",
    includeAnswerKey: true,
  });
  const errors = [];
  if (!sample?.ok) errors.push(...(sample?.errors ?? ["G5AU02_BROWSER_DYNAMIC_SAMPLE_FAILED"]));
  else {
    if (sample.worksheetDocument.questionCount !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_EXACT_COUNT_FAILED");
    if (sample.worksheetDocument.answerKeyItems.length !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_ANSWER_COUNT_FAILED");
    if (!sample.worksheetDocument.dynamicHtml.includes("<!doctype html>")) errors.push("G5AU02_BROWSER_DYNAMIC_HTML_MISSING");
    if (sample.worksheetDocument.lifecycle.productionUse !== "allowed_dynamic_knowledge_point_release") errors.push("G5AU02_BROWSER_DYNAMIC_PRODUCTION_NOT_PROMOTED");
    if (!Number.isInteger(sample.worksheetDocument.generationSeed)) errors.push("G5AU02_BROWSER_DYNAMIC_TEXT_SEED_NOT_NORMALIZED");
  }
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
