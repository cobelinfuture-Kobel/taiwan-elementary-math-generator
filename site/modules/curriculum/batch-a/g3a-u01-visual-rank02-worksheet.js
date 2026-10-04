import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/worksheet-pagination.js";
import {
  generateG3AU01VisualRank02Questions,
  G3A_U01_VISUAL_RANK02_KP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID,
  G3A_U01_VISUAL_RANK02_SOURCE_ID,
  validateG3AU01VisualRank02Question,
} from "./g3a-u01-visual-rank02-runtime.js";

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
    numberLine:q.numberLine,
    metadataSnapshot:Object.freeze({
      ...q.metadata,
      questionSignature:q.questionSignature,
      promptVariant:q.promptVariant,
    }),
    layoutHints:Object.freeze({
      estimatedTextLength:q.blankedDisplayText.length,
      hasGrouping:false,
      avoidPageBreakInside:true,
      representation:"integer-number-line",
      tickCount:q.numberLine.tickCount,
      layoutTuningStatus:"pending_actual_a4_review",
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
    numberLine:q.numberLine,
    metadataSnapshot:models[i].metadataSnapshot,
    layoutHints:Object.freeze({
      avoidPageBreakInside:true,
      representation:"integer-number-line",
      tickCount:q.numberLine.tickCount,
      layoutTuningStatus:"pending_actual_a4_review",
    }),
  }));
}

export function buildG3AU01VisualRank02WorksheetDocument(options={}){
  const publicAdmission=options.publicAdmission===true;
  const generation=generateG3AU01VisualRank02Questions({...options,publicAdmission});
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
    question=>validateG3AU01VisualRank02Question(question).errors
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
    worksheetId:"g3a-u01-rank02-"+(options.generationSeed??(publicAdmission?"public":"hidden")),
    title:"10000以內的數｜整數數線讀值",
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
      sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
      selectorVisible:publicAdmission,
    }),
    configSnapshot:Object.freeze({
      questionMode:"visual_reading",
      printLayout:l,
    }),
    batchA:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
      selectionMode:publicAdmission?(options.selectionMode??"singleKnowledgePoint"):"hiddenPatternSpec",
    }),
    metadata:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK02_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
      patternSpecId:G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID,
      sourceSemanticCore:"READ_MARKER_VALUE",
      rendererPath:"site/modules/renderer/fraction-number-line.js",
      representation:"integer-number-line",
      hiddenRuntime:!publicAdmission,
      selectorVisible:publicAdmission,
      productionUse:publicAdmission?"public_review":"forbidden",
      layoutTuningStatus:"PENDING_ACTUAL_A4_REVIEW",
      layoutTuningBoundary:"A4 2x3 is the initial Rank02 pilot; public admission requires actual page overflow review.",
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
