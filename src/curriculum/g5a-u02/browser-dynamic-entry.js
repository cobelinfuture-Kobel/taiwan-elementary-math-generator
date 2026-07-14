import { buildAndRenderG5AU02HiddenWorksheet } from "./hidden-renderer.js";

const SOURCE_ID = "g5a_u02_5a02";

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

export function buildG5AU02BrowserDynamicWorksheet(plan = {}) {
  if (plan?.sourceId !== SOURCE_ID) return null;
  const patternSpecIds = Array.isArray(plan.patternSpecIds) ? [...plan.patternSpecIds] : [];
  if (patternSpecIds.length === 0) return null;

  const input = {
    patternSpecIds,
    questionCount: plan.questionCount ?? 22,
    baseSeed: plan.generationSeed ?? plan.baseSeed ?? 1,
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
      task: "S96D_G5A_U02_ArbitraryRegeneration",
      selectorStatus: "pending_s96e",
      browserResolverStatus: "integrated",
      browserRegenerationStatus: "implemented_pending_selector",
      browserPipelineStatus: "dynamic_canonical_connected",
      productionUse: "forbidden_until_s96g_stress_pass",
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
    generationSeed: 9601,
    includeAnswerKey: true,
  });
  const errors = [];
  if (!sample?.ok) errors.push(...(sample?.errors ?? ["G5AU02_BROWSER_DYNAMIC_SAMPLE_FAILED"]));
  else {
    if (sample.worksheetDocument.questionCount !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_EXACT_COUNT_FAILED");
    if (sample.worksheetDocument.answerKeyItems.length !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_ANSWER_COUNT_FAILED");
    if (!sample.worksheetDocument.dynamicHtml.includes("<!doctype html>")) errors.push("G5AU02_BROWSER_DYNAMIC_HTML_MISSING");
  }
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
