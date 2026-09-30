import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { G4A_U04_STEP_QUESTION_GROUP_IDS } from "../../site/modules/curriculum/batch-a/g4a-u04-step-understanding-runtime.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const SOURCE_ID = "g4a_u04_4a04";
const TARGETS = [
  ["kp_g4a_u04_4digit_by_1digit_thousands_sufficient", "ps_g4a_u04_4digit_by_1digit_thousands_sufficient_step_understanding"],
  ["kp_g4a_u04_4digit_by_1digit_thousands_insufficient", "ps_g4a_u04_4digit_by_1digit_thousands_insufficient_step_understanding"],
  ["kp_g4a_u04_4digit_by_1digit_thousands_exact", "ps_g4a_u04_4digit_by_1digit_thousands_exact_step_understanding"],
];

const reports = [];
for (const [knowledgePointId, stepPatternSpecId] of TARGETS) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (groups.length !== 1) throw new Error(`G4A_U04_STEP_GROUP_COUNT:${knowledgePointId}:${groups.length}`);
  const patternGroupId = groups[0].patternGroupId;
  if (!groups[0].patternSpecIds.includes(stepPatternSpecId)) throw new Error(`G4A_U04_STEP_SPEC_NOT_EXPOSED:${knowledgePointId}`);
  const plan = {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionCount: 12,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `g4a-u04-step-acceptance:${knowledgePointId}`,
    printLayout: { columns: 1, rowsPerPage: 3 },
  };
  const generated = generateBatchABrowserQuestions(plan);
  if (!generated.ok || generated.questions.length !== 12) throw new Error(`G4A_U04_STEP_GENERATION:${knowledgePointId}:${JSON.stringify(generated.errors)}`);
  const validation = validateBatchABrowserQuestions(generated.questions);
  if (!validation.ok) throw new Error(`G4A_U04_STEP_VALIDATION:${knowledgePointId}:${JSON.stringify(validation.errors)}`);
  const stepQuestions = generated.questions.filter((question) => question.patternSpecId === stepPatternSpecId);
  if (stepQuestions.length !== 6) throw new Error(`G4A_U04_STEP_COUNT:${knowledgePointId}:${stepQuestions.length}`);
  const groupsObserved = stepQuestions.map((question) => question.questionGroupId);
  if (JSON.stringify(groupsObserved) !== JSON.stringify(G4A_U04_STEP_QUESTION_GROUP_IDS)) {
    throw new Error(`G4A_U04_STEP_GROUP_COVERAGE:${knowledgePointId}:${JSON.stringify(groupsObserved)}`);
  }
  const composite = stepQuestions.find((question) => question.questionGroupId === "G5_COMPOSITE_2SUB");
  if (!composite || composite.subitems?.length !== 2 || composite.independentSubitemScoring !== true) {
    throw new Error(`G4A_U04_STEP_COMPOSITE_INVALID:${knowledgePointId}`);
  }
  const fillIn = stepQuestions.find((question) => question.questionGroupId === "G6_FILL_IN_RECONSTRUCTION");
  if (!fillIn || fillIn.responseMode !== "fill_in" || !Array.isArray(fillIn.fillInAnswers) || fillIn.fillInAnswers.length === 0) {
    throw new Error(`G4A_U04_STEP_FILL_IN_INVALID:${knowledgePointId}`);
  }
  const worksheet = buildWorksheetDocumentFromPlan(plan);
  if (!worksheet.ok || worksheet.worksheetDocument?.generatedQuestions?.length !== 12 || worksheet.worksheetDocument?.answerKeyItems?.length !== 12) {
    throw new Error(`G4A_U04_STEP_WORKSHEET_INVALID:${knowledgePointId}:${JSON.stringify(worksheet.errors)}`);
  }
  const html = renderWorksheetDocumentToHtml(worksheet.worksheetDocument, { stylesheetHref: "", debugDataAttributes: false });
  if (!html.includes("(1)") || !html.includes("(2)") || !html.includes("直式") || html.includes(stepPatternSpecId)) {
    throw new Error(`G4A_U04_STEP_HTML_INVALID:${knowledgePointId}`);
  }
  reports.push({
    knowledgePointId,
    patternGroupId,
    stepPatternSpecId,
    questionCount: generated.questions.length,
    stepQuestionCount: stepQuestions.length,
    questionGroups: groupsObserved,
    answerKeyCount: worksheet.worksheetDocument.answerKeyItems.length,
    questionPageCount: worksheet.worksheetDocument.questionPages.length,
    answerKeyPageCount: worksheet.worksheetDocument.answerKeyPages.length,
    compositeSubitemCount: composite.subitems.length,
    fillInTarget: fillIn.fillInTarget,
  });
}

const report = {
  schemaName: "G4AU04LongDivisionStepUnderstandingAcceptanceV1",
  taskId: "G4A_U04_LongDivisionStepReconstruction_G1ToG6_RuntimeImplementation",
  status: "PASS",
  sourceId: SOURCE_ID,
  knowledgePointCount: TARGETS.length,
  questionGroupCount: G4A_U04_STEP_QUESTION_GROUP_IDS.length,
  newCanonicalKnowledgePointCount: 0,
  reports,
};
process.stdout.write(`G4A_U04_STEP_UNDERSTANDING_ACCEPTANCE=${JSON.stringify(report)}\n`);
