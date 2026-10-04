import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/worksheet-pagination.js";
import {
  generateG3AU01VisualRank04Questions,
  G3A_U01_VISUAL_RANK04_KP_ID,
  G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID,
  G3A_U01_VISUAL_RANK04_SOURCE_ID,
  validateG3AU01VisualRank04Question,
} from "./g3a-u01-visual-rank04-runtime.js";

function layout(options={}){
  const p=options.printLayout??{};
  return Object.freeze({
    paperSize:p.paperSize??"A4",
    columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
    rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),4):3,
    showQuestionNumbers:p.showQuestionNumbers!==false,
    showAnswerKeyPage:options.includeAnswerKey!==false&&p.showAnswerKeyPage!==false,
  });
}

function displayModels(questions,l){
  return questions.map((q,i)=>Object.freeze({
    questionId:q.id,
    questionNumber:i+1,
    patternId:q.patternSpecId,
    knowledgePointId:q.knowledgePointId,
    patternGroupId:q.patternGroupId,
    promptText:q.blankedDisplayText,
    displayText:q.displayText,
    blankedDisplayText:q.blankedDisplayText,
    answerText:q.answerText,
    questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,
    numberLine:q.questionNumberLine,
    metadataSnapshot:Object.freeze({
      ...q.metadata,
      questionSignature:q.questionSignature,
      promptVariant:q.promptVariant,
      missingTickIndices:q.missingTickIndices,
      missingValues:q.answerModel.missingValues,
    }),
    layoutHints:Object.freeze({
      estimatedTextLength:q.blankedDisplayText.length,
      hasGrouping:false,
      avoidPageBreakInside:true,
      representation:"integer-number-line",
      tickCount:q.questionNumberLine.tickCount,
      missingLabelCount:q.missingTickIndices.length,
      layoutTuningStatus:"pending_actual_a4_review",
      markerPolicy:"forbidden",
    }),
  }));
}

function answerItems(questions,models){
  return questions.map((q,i)=>Object.freeze({
    questionId:q.id,
    questionNumber:i+1,
    patternId:q.patternSpecId,
    promptText:q.blankedDisplayText,
    answerText:q.answerText,
    numberLine:q.answerNumberLine,
    metadataSnapshot:models[i].metadataSnapshot,
    layoutHints:Object.freeze({
      avoidPageBreakInside:true,
      representation:"integer-number-line",
      tickCount:q.answerNumberLine.tickCount,
      missingLabelCount:q.missingTickIndices.length,
      layoutTuningStatus:"pending_actual_a4_review",
      markerPolicy:"forbidden",
    }),
  }));
}

export function buildG3AU01VisualRank04WorksheetDocument(options={}){
  const publicAdmission=options.publicAdmission===true;
  const generation=generateG3AU01VisualRank04Questions({...options,publicAdmission});
  if(!generation.ok){
    return Object.freeze({
      ok:false,
      errors:generation.errors,
      warnings:generation.warnings,
      worksheetDocument:null,
      generation,
    });
  }
  const validationErrors=generation.questions.flatMap(
    (question)=>validateG3AU01VisualRank04Question(question).errors
  );
  if(validationErrors.length){
    return Object.freeze({
      ok:false,
      errors:Object.freeze(validationErrors),
      warnings:Object.freeze([]),
      worksheetDocument:null,
      generation,
    });
  }

  const l=layout(options);
  const models=displayModels(generation.questions,l);
  const answers=l.showAnswerKeyPage?answerItems(generation.questions,models):[];
  const questionPages=paginateQuestionDisplayModels(models,l);
  const answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(answers,l):[];

  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"g3a-u01-rank04-"+(options.generationSeed??(publicAdmission?"public":"hidden")),
    title:"10000以內的數｜整數數線補刻度／填數",
    generatedQuestions:generation.questions,
    questions:generation.questions,
    questionDisplayModels:Object.freeze(models),
    answerKeyItems:Object.freeze(answers),
    questionPages:Object.freeze(questionPages),
    answerKeyPages:Object.freeze(answerKeyPages),
    questionCount:generation.questions.length,
    printOptions:Object.freeze({
      ...l,
      showAnswerKey:l.showAnswerKeyPage,
      answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none",
    }),
    publicControls:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK04_SOURCE_ID,
      selectorVisible:publicAdmission,
    }),
    configSnapshot:Object.freeze({
      questionMode:"visual_reading",
      printLayout:l,
    }),
    batchA:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK04_SOURCE_ID,
      selectionMode:publicAdmission?(options.selectionMode??"singleKnowledgePoint"):"hiddenPatternSpec",
    }),
    metadata:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK04_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK04_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID,
      patternSpecId:G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID,
      sourceSemanticCore:"COMPLETE_MISSING_TICK_VALUES",
      rendererPath:"site/modules/renderer/fraction-number-line.js",
      representation:"integer-number-line",
      hiddenRuntime:!publicAdmission,
      selectorVisible:publicAdmission,
      productionUse:publicAdmission?"public_review":"forbidden",
      questionMarkerPolicy:"forbidden",
      answerMarkerPolicy:"forbidden",
      layoutTuningStatus:"PENDING_ACTUAL_A4_REVIEW",
      layoutTuningBoundary:"A4 2x3 hidden Rank04 worksheet must preserve readable sparse question labels and fully restored answer labels with no overflow.",
    }),
  });

  return Object.freeze({
    ok:true,
    errors:Object.freeze([]),
    warnings:Object.freeze([]),
    worksheetDocument,
    generation,
  });
}
