import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/index.js";
import {
  generateG4AU09HundredthDecimalQuestions,
  validateG4AU09HundredthDecimalQuestion,
} from "./hundredth-decimal-runtime.js";
import {
  generateG4AU09DecimalComposeSlice018Questions,
  validateG4AU09DecimalComposeSlice018Question,
} from "./decimal-compose-decompose-runtime-p03f18.js";
import {
  generateG4AU09P03F26Questions,
  validateG4AU09P03F26Question,
} from "./g4a-u09-rank8-decimal-runtime-p03f26.js";
import {
  generateG4AU09P03F34Questions,
  validateG4AU09P03F34Question,
} from "./g4a-u09-rank9-missing-digit-inequality-runtime-p03f34.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";
import {
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-decimal-compose-decompose-selector-projection.js";
import {
  G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F26_PATTERN_GROUPS,
  resolveG4AU09P03F26PatternSpecIds,
} from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_PATTERN_GROUP_ID,
  G4A_U09_P03F34_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";

export { G4A_U09_SOURCE_ID };

export const G4A_U09_CURRENT_PUBLIC_KP_IDS = Object.freeze([
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  ...G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F34_KP_ID,
]);
export const G4A_U09_HIDDEN_PENDING_KP_IDS = Object.freeze([
  "kp_g4a_u09_decimal_length_conversion",
]);

const SPEC_IDS_BY_KP = Object.freeze({
  [G4A_U09_HUNDREDTH_DECIMAL_KP_ID]: Object.freeze([G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID]),
  [G4A_U09_DECIMAL_COMPOSE_KP_ID]: Object.freeze([G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]),
  ...Object.fromEntries(G4A_U09_P03F26_KP_IDS.map((id) => [id, Object.freeze(resolveG4AU09P03F26PatternSpecIds(id))])),
  [G4A_U09_P03F34_KP_ID]: Object.freeze([G4A_U09_P03F34_PATTERN_SPEC_ID]),
});
const GROUP_ID_BY_KP = Object.freeze({
  [G4A_U09_HUNDREDTH_DECIMAL_KP_ID]: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  [G4A_U09_DECIMAL_COMPOSE_KP_ID]: G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  ...Object.fromEntries(G4A_U09_P03F26_PATTERN_GROUPS.map((row) => [row.primaryKnowledgePointId, row.patternGroupId])),
  [G4A_U09_P03F34_KP_ID]: G4A_U09_P03F34_PATTERN_GROUP_ID,
});
const KP_BY_GROUP_ID = new Map(Object.entries(GROUP_ID_BY_KP).map(([kp, group]) => [group, kp]));
const PUBLIC_KP_SET = new Set(G4A_U09_CURRENT_PUBLIC_KP_IDS);

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const unique = (values = []) => [...new Set(values.filter(Boolean))];
function hashSeed(seed) {
  let value = 2166136261;
  for (const char of String(seed ?? "g4a-u09")) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619) >>> 0;
  }
  return value || 1;
}
function randomForSeed(seed) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(values, seed) {
  const output = [...values];
  const random = randomForSeed(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}
function selectedKnowledgePointIds(options = {}) {
  const requested = unique(options.selectedKnowledgePointIds ?? []);
  const groupRequested = unique(options.selectedPatternGroupIds ?? []).map((id) => KP_BY_GROUP_ID.get(id)).filter(Boolean);
  const selected = unique([...requested, ...groupRequested]);
  if ((options.selectionMode ?? "sourceUnit") === "sourceUnit" || selected.length === 0) return [...G4A_U09_CURRENT_PUBLIC_KP_IDS];
  return selected;
}
function allocationFor(ids, questionCount) {
  const base = Math.floor(questionCount / ids.length);
  const remainder = questionCount % ids.length;
  return ids.map((knowledgePointId, index) => Object.freeze({ knowledgePointId, questionCount: base + (index < remainder ? 1 : 0) }));
}
function generateForKnowledgePoint(knowledgePointId, questionCount, generationSeed) {
  const patternSpecIds = SPEC_IDS_BY_KP[knowledgePointId];
  const common = { sourceId: G4A_U09_SOURCE_ID, patternSpecIds, questionMode: "numeric", questionCount, generationSeed };
  if (knowledgePointId === G4A_U09_HUNDREDTH_DECIMAL_KP_ID) {
    return generateG4AU09HundredthDecimalQuestions({ ...common, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [knowledgePointId] });
  }
  if (knowledgePointId === G4A_U09_DECIMAL_COMPOSE_KP_ID) {
    return generateG4AU09DecimalComposeSlice018Questions({ ...common, plan: common });
  }
  if (knowledgePointId === G4A_U09_P03F34_KP_ID) {
    return generateG4AU09P03F34Questions({ ...common, plan: common });
  }
  return generateG4AU09P03F26Questions({ ...common, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [knowledgePointId] });
}
function validateQuestion(question) {
  const kp = question.metadata?.knowledgePointId;
  if (kp === G4A_U09_HUNDREDTH_DECIMAL_KP_ID) return validateG4AU09HundredthDecimalQuestion(question);
  if (kp === G4A_U09_DECIMAL_COMPOSE_KP_ID) return validateG4AU09DecimalComposeSlice018Question(question);
  if (kp === G4A_U09_P03F34_KP_ID) return validateG4AU09P03F34Question(question);
  return validateG4AU09P03F26Question(question);
}

export function generateG4AU09CurrentQuestions(options = {}) {
  const questionCount = Number(options.questionCount ?? 20);
  const generationSeed = String(options.generationSeed ?? "g4a-u09-current");
  const ordering = options.ordering ?? "groupedByPattern";
  const selectedIds = selectedKnowledgePointIds(options);
  const invalidIds = selectedIds.filter((id) => !PUBLIC_KP_SET.has(id));
  const errors = [];
  if (options.sourceId !== G4A_U09_SOURCE_ID) errors.push(issue("g4a_u09_source_invalid", "sourceId"));
  if (!Number.isInteger(questionCount) || questionCount <= 0 || questionCount > 240) errors.push(issue("g4a_u09_question_count_invalid", "questionCount"));
  if (!new Set(["groupedByPattern", "shuffleAcrossPatterns"]).has(ordering)) errors.push(issue("g4a_u09_ordering_invalid", "ordering"));
  if (invalidIds.length > 0) errors.push(issue("g4a_u09_non_public_kp_rejected", "selectedKnowledgePointIds"));
  if (errors.length > 0) return { ok: false, errors, warnings: [], questions: [], allocation: [] };

  const allocation = allocationFor(selectedIds, questionCount);
  const questions = [];
  for (const row of allocation) {
    if (row.questionCount === 0) continue;
    const result = generateForKnowledgePoint(row.knowledgePointId, row.questionCount, `${generationSeed}-${row.knowledgePointId}`);
    if (!result.ok || result.questions?.length !== row.questionCount) {
      errors.push(...(result.errors ?? [issue("g4a_u09_kp_generation_failed", row.knowledgePointId)]));
      continue;
    }
    questions.push(...result.questions);
  }
  questions.forEach((question, index) => {
    errors.push(...validateQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  });
  if (questions.length !== questionCount) errors.push(issue("g4a_u09_question_count_mismatch", "questions"));
  const patternOrder = unique(selectedIds.flatMap((id) => SPEC_IDS_BY_KP[id]));
  const grouped = [...questions].sort((left, right) => patternOrder.indexOf(left.patternSpecId) - patternOrder.indexOf(right.patternSpecId));
  const ordered = ordering === "shuffleAcrossPatterns" ? seededShuffle(grouped, `${generationSeed}-ordering`) : grouped;
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]), questions: Object.freeze(ordered), allocation: Object.freeze(allocation), selectedKnowledgePointIds: Object.freeze(selectedIds), ordering, generationSeed });
}

function displayModels(questions, showQuestionNumbers) {
  return questions.map((question, index) => Object.freeze({
    questionId: question.id,
    questionNumber: index + 1,
    patternId: question.patternSpecId,
    knowledgePointId: question.metadata?.knowledgePointId,
    patternGroupId: question.metadata?.patternGroupId,
    questionNumberText: showQuestionNumbers ? `${index + 1}.` : null,
    promptText: question.blankedDisplayText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: question.metadata,
    layoutHints: Object.freeze({ estimatedTextLength: question.blankedDisplayText.length, hasGrouping: false, avoidPageBreakInside: true, representation: "g4a_u09_two_decimal" }),
  }));
}
function answerItems(questions) {
  return questions.map((question, index) => Object.freeze({ questionId: question.id, questionNumber: index + 1, patternId: question.patternSpecId, knowledgePointId: question.metadata?.knowledgePointId, patternGroupId: question.metadata?.patternGroupId, promptText: question.blankedDisplayText, answerText: question.answerText, metadataSnapshot: question.metadata, layoutHints: Object.freeze({ avoidPageBreakInside: true }) }));
}

export function buildG4AU09CurrentWorksheetDocument(options = {}) {
  const generation = generateG4AU09CurrentQuestions(options);
  if (!generation.ok) return Object.freeze({ ok: false, errors: generation.errors, warnings: generation.warnings, worksheetDocument: null, generation });
  const layout = Object.freeze({ paperSize: options.printLayout?.paperSize ?? "A4", columns: Math.min(options.printLayout?.columns ?? 2, 2), rowsPerPage: Math.min(options.printLayout?.rowsPerPage ?? 6, 6), showQuestionNumbers: options.printLayout?.showQuestionNumbers !== false, showAnswerKeyPage: options.includeAnswerKey !== false && options.printLayout?.showAnswerKeyPage !== false, longTextCardPolicy: "avoidSplit", questionMode: "numeric" });
  const models = displayModels(generation.questions, layout.showQuestionNumbers);
  const answers = layout.showAnswerKeyPage ? answerItems(generation.questions) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 6 }) : [];
  const plan = Object.freeze({ ...options, sourceId: G4A_U09_SOURCE_ID, sourceUnit: Object.freeze({ sourceId: G4A_U09_SOURCE_ID, grade: 4, semester: "upper", unitCode: "4A-U09", title: "2位小數", domain: "decimal_hundredths" }), questionCount: generation.questions.length, questionMode: "numeric", ordering: generation.ordering, generationSeed: generation.generationSeed, requestedKnowledgePointIds: generation.selectedKnowledgePointIds, patternSpecIds: Object.freeze(unique(generation.questions.map((row) => row.patternSpecId))), allocation: generation.allocation, genericFallbackAllowed: false });
  const document = Object.freeze({ schemaVersion: "worksheet-document-v1", version: "1", worksheetId: `g4a-u09-current-${generation.questions.length}-${generation.generationSeed}`, worksheetKind: "batchAWorksheet", title: options.title ?? "四年級上｜2位小數", subtitle: "百分位、二位小數組成、比較與推理", generatedAt: "DETERMINISTIC", configSnapshot: Object.freeze({ ...plan, printLayout: layout }), orderingMode: generation.ordering, questionCount: generation.questions.length, questionPages: Object.freeze(questionPages), answerKeyPages: Object.freeze(answerKeyPages), sections: Object.freeze([]), generatedQuestions: generation.questions, questions: generation.questions, questionDisplayModels: Object.freeze(models), answerKeyItems: Object.freeze(answers), printOptions: Object.freeze({ ...layout, answerKeyColumns: 2, answerKeyRowsPerPage: 6, showAnswerKey: layout.showAnswerKeyPage, answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none" }), publicControls: Object.freeze({ sourceId: G4A_U09_SOURCE_ID, questionMode: "numeric", productAdmissionTask: "G4A_U09_CURRENT_CAPACITY_ORDERING", globalContextRegistry: null }), metadata: Object.freeze({ sourceId: G4A_U09_SOURCE_ID, knowledgePointIds: generation.selectedKnowledgePointIds, hiddenPendingKnowledgePointIds: G4A_U09_HIDDEN_PENDING_KP_IDS, applicationExpansion: false, worksheetAdapter: "G4A_U09_CURRENT_COORDINATOR" }), batchA: Object.freeze({ sourceId: G4A_U09_SOURCE_ID, questionMode: "numeric", selectionMode: options.selectionMode ?? "sourceUnit" }), report: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length }) }), summary: Object.freeze({ questionCount: generation.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, numericQuestionCount: generation.questions.length, applicationQuestionCount: 0 }) });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), worksheetDocument: document, plan, generation, validation: Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]) }), g4aU09CurrentCoordinator: true });
}
