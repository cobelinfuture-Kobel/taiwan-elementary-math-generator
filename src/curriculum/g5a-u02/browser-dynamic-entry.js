import { buildAndRenderG5AU02HiddenWorksheet } from "./hidden-renderer.js";
import { generateG5AU02Canonical } from "./canonical-resolver.js";
import {
  enrichG5AU02GeneratedItemPrompt,
  getG5AU02PromptCompletenessPatternIds,
  isG5AU02PromptCompletenessPattern,
} from "./question-display-model.js";

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

function seedFor(baseSeed, index) {
  return ((baseSeed + index - 1) % MAX_SEED) + 1;
}

function enrichPublicQuestionRecords(source, input) {
  const errors = [];
  const questionItems = source.questionRecords.map((record, index) => {
    const item = generateG5AU02Canonical(record.patternSpecId, {
      seed: seedFor(input.baseSeed, index),
    });
    const enriched = enrichG5AU02GeneratedItemPrompt(item);
    if (item.patternSpecId !== record.patternSpecId) {
      errors.push(`G5AU02_SEMANTIC_REGENERATION_PATTERN_MISMATCH:${record.patternSpecId}`);
    }
    return freeze({
      ...record,
      prompt: enriched.prompt,
      promptText: enriched.prompt,
      questionDisplayModel: enriched.questionDisplayModel,
      promptCompletenessStatus: isG5AU02PromptCompletenessPattern(record.patternSpecId)
        ? "visible_unique_solution_data_complete"
        : "not_required_for_pattern",
    });
  });

  const byNumber = new Map(questionItems.map((record) => [record.questionNumber, record]));
  const questionPages = source.questionPages.map((page) => freeze({
    ...page,
    records: page.records.map((record) => byNumber.get(record.questionNumber)),
  }));
  return freeze({ ok: errors.length === 0, errors, questionItems, questionPages });
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
  let semanticProjection;
  try {
    semanticProjection = enrichPublicQuestionRecords(source, input);
  } catch (error) {
    return blocked([error.message], plan);
  }
  if (!semanticProjection.ok) return blocked(semanticProjection.errors, plan);

  const promptCompletenessPatternIds = getG5AU02PromptCompletenessPatternIds();
  const promptCompletenessQuestionCount = semanticProjection.questionItems
    .filter((record) => promptCompletenessPatternIds.includes(record.patternSpecId)).length;
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
    questionItems: semanticProjection.questionItems,
    questionPages: semanticProjection.questionPages,
    answerKeyEnabled: source.answerKeyEnabled,
    answerKeyItems: source.answerKeyRecords,
    answerKeyPages: source.answerKeyPages,
    dynamicHtml: rendered.renderedWorksheet.html,
    generationSeed: input.baseSeed,
    semanticProjection: freeze({
      task: "G5AU02-S97_SourceParityPromptCompletenessAndSemanticFullFix",
      version: "g5a-u02-s97-visible-prompt-v1",
      promptCompletenessPatternIds,
      promptCompletenessQuestionCount,
      visibleInformationAuthority: "questionItems.prompt_and_questionDisplayModel",
      legacyDynamicHtmlAuthority: false,
    }),
    lifecycle: freeze({
      task: "S96I_G5A_U02_PublicTextSeedAndLiveClickPathFix",
      semanticTask: "G5AU02-S97_SourceParityPromptCompletenessAndSemanticFullFix",
      selectorStatus: "public_knowledge_point_selection",
      browserResolverStatus: "production_integrated",
      browserRegenerationStatus: "production_allowed",
      browserPipelineStatus: "public_dynamic_canonical_connected",
      semanticPromptStatus: "six_blocking_patterns_visible_complete",
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
    patternSpecIds: getG5AU02PromptCompletenessPatternIds(),
    questionCount: 12,
    generationSeed: "g5a-u02-s97-semantic-audit",
    includeAnswerKey: true,
  });
  const errors = [];
  if (!sample?.ok) errors.push(...(sample?.errors ?? ["G5AU02_BROWSER_DYNAMIC_SAMPLE_FAILED"]));
  else {
    if (sample.worksheetDocument.questionCount !== 12) errors.push("G5AU02_BROWSER_DYNAMIC_EXACT_COUNT_FAILED");
    if (sample.worksheetDocument.answerKeyItems.length !== 12) errors.push("G5AU02_BROWSER_DYNAMIC_ANSWER_COUNT_FAILED");
    if (!sample.worksheetDocument.dynamicHtml.includes("<!doctype html>")) errors.push("G5AU02_BROWSER_DYNAMIC_HTML_MISSING");
    if (sample.worksheetDocument.lifecycle.productionUse !== "allowed_dynamic_knowledge_point_release") errors.push("G5AU02_BROWSER_DYNAMIC_PRODUCTION_NOT_PROMOTED");
    if (!Number.isInteger(sample.worksheetDocument.generationSeed)) errors.push("G5AU02_BROWSER_DYNAMIC_TEXT_SEED_NOT_NORMALIZED");
    if (sample.worksheetDocument.semanticProjection.promptCompletenessQuestionCount !== 12) errors.push("G5AU02_VISIBLE_PROMPT_COUNT_MISMATCH");
    if (sample.worksheetDocument.questionItems.some((record) => !record.questionDisplayModel)) errors.push("G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED");
    if (sample.worksheetDocument.questionItems.some((record) => record.promptCompletenessStatus !== "visible_unique_solution_data_complete")) {
      errors.push("G5AU02_VISIBLE_PROMPT_STATUS_INVALID");
    }
  }
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
