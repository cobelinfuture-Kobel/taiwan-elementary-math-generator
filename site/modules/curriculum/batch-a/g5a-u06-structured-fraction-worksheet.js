import {
  buildG5AU06InlineMathModel,
  G5A_U06_STRUCTURED_FRACTION_SOURCE_ID,
} from "./g5a-u06-inline-fraction-display.js";

function enrichQuestionModel(model) {
  if (!model) return model;
  return Object.freeze({
    ...model,
    promptInlineMath:model.promptInlineMath ?? buildG5AU06InlineMathModel({
      sourceId:G5A_U06_STRUCTURED_FRACTION_SOURCE_ID,
      plainText:model.blankedDisplayText ?? model.promptText,
    }),
  });
}

function enrichAnswerItem(item) {
  if (!item) return item;
  return Object.freeze({
    ...item,
    promptInlineMath:item.promptInlineMath ?? buildG5AU06InlineMathModel({
      sourceId:G5A_U06_STRUCTURED_FRACTION_SOURCE_ID,
      plainText:item.promptText,
    }),
    answerInlineMath:item.answerInlineMath ?? buildG5AU06InlineMathModel({
      sourceId:G5A_U06_STRUCTURED_FRACTION_SOURCE_ID,
      plainText:item.answerText,
    }),
  });
}

export function applyG5AU06StructuredFractionDisplay(result) {
  const document = result?.worksheetDocument;
  const sourceId = document?.metadata?.sourceId ?? document?.publicControls?.sourceId ?? document?.batchA?.sourceId;
  if (!result?.ok || !document || sourceId !== G5A_U06_STRUCTURED_FRACTION_SOURCE_ID) return result;
  const questionDisplayModels = Object.freeze((document.questionDisplayModels ?? []).map(enrichQuestionModel));
  const answerKeyItems = Object.freeze((document.answerKeyItems ?? []).map(enrichAnswerItem));
  const questionById = new Map(questionDisplayModels.map((model) => [model.questionId, model]));
  const answerById = new Map(answerKeyItems.map((item) => [item.questionId, item]));
  const questionPages = Object.freeze((document.questionPages ?? []).map((page) => Object.freeze({
    ...page,
    cells:Object.freeze((page.cells ?? []).map((cell) => Object.freeze({
      ...cell,
      displayModel:cell.displayModel ? questionById.get(cell.questionId) ?? enrichQuestionModel(cell.displayModel) : null,
    }))),
  })));
  const answerKeyPages = Object.freeze((document.answerKeyPages ?? []).map((page) => Object.freeze({
    ...page,
    cells:Object.freeze((page.cells ?? []).map((cell) => Object.freeze({
      ...cell,
      answerKeyItem:cell.answerKeyItem ? answerById.get(cell.questionId) ?? enrichAnswerItem(cell.answerKeyItem) : null,
    }))),
  })));
  return Object.freeze({
    ...result,
    worksheetDocument:Object.freeze({
      ...document,
      questionDisplayModels,
      answerKeyItems,
      questionPages,
      answerKeyPages,
      metadata:Object.freeze({ ...(document.metadata ?? {}), structuredFractionDisplay:true }),
    }),
  });
}
