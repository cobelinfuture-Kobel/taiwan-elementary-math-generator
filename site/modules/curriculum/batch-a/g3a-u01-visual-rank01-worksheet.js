import {paginateAnswerKeyItems,paginateQuestionDisplayModels} from "../../core/worksheet-pagination.js";
import {
  generateG3AU01VisualRank01Questions,
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID,
  G3A_U01_VISUAL_RANK01_SOURCE_ID,
  validateG3AU01VisualRank01Question
} from "./g3a-u01-visual-rank01-runtime.js";
import {normalizeG3AU01VisualRank01PublicLayout} from "./g3a-u01-visual-rank01-layout.js";

function layout(options={}){
  const p=options.printLayout??{};
  const publicAdmission=options.publicAdmission===true;
  if(publicAdmission){
    const safe=normalizeG3AU01VisualRank01PublicLayout(p);
    return Object.freeze({
      paperSize:safe.paperSize,
      columns:safe.columns,
      rowsPerPage:safe.rowsPerPage,
      showQuestionNumbers:p.showQuestionNumbers!==false,
      showAnswerKeyPage:options.includeAnswerKey!==false&&p.showAnswerKeyPage!==false
    });
  }
  return Object.freeze({
    paperSize:p.paperSize??"A4",
    columns:Number.isInteger(p.columns)?Math.min(Math.max(p.columns,1),2):2,
    rowsPerPage:Number.isInteger(p.rowsPerPage)?Math.min(Math.max(p.rowsPerPage,1),4):3,
    showQuestionNumbers:p.showQuestionNumbers!==false,
    showAnswerKeyPage:options.includeAnswerKey!==false&&p.showAnswerKeyPage!==false
  });
}

function displayModels(questions,l,publicAdmission=false){
  return questions.map((q,i)=>Object.freeze({
    questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,
    knowledgePointId:q.knowledgePointId,patternGroupId:q.patternGroupId,
    promptText:q.blankedDisplayText,displayText:q.displayText,blankedDisplayText:q.blankedDisplayText,
    answerText:q.answerText,questionNumberText:l.showQuestionNumbers?String(i+1)+".":null,
    tableData:q.tableData,
    metadataSnapshot:Object.freeze({...q.metadata,questionSignature:q.questionSignature,promptVariant:q.promptVariant}),
    layoutHints:Object.freeze({
      estimatedTextLength:q.blankedDisplayText.length,
      hasGrouping:false,
      avoidPageBreakInside:true,
      representation:"one-way-statistics-table",
      rowCount:q.tableData.rows.length,
      layoutTuningStatus:publicAdmission?"public_layout_safe_cap_enforced_operator_recheck_pending":"accepted_actual_a4_2x3_no_size_change"
    })
  }));
}

function answerItems(questions,models,publicAdmission=false){
  return questions.map((q,i)=>Object.freeze({
    questionId:q.id,questionNumber:i+1,patternId:q.patternSpecId,promptText:q.blankedDisplayText,
    answerText:q.answerText,tableData:q.tableData,metadataSnapshot:models[i].metadataSnapshot,
    layoutHints:Object.freeze({
      avoidPageBreakInside:true,
      representation:"one-way-statistics-table",
      rowCount:q.tableData.rows.length,
      layoutTuningStatus:publicAdmission?"public_layout_safe_cap_enforced_operator_recheck_pending":"accepted_actual_a4_2x3_no_size_change"
    })
  }));
}

export function buildG3AU01VisualRank01WorksheetDocument(options={}){
  const publicAdmission=options.publicAdmission===true;
  const generation=generateG3AU01VisualRank01Questions({...options,publicAdmission});
  if(!generation.ok) return Object.freeze({ok:false,errors:generation.errors,warnings:generation.warnings,worksheetDocument:null,generation});
  const validationErrors=generation.questions.flatMap(q=>validateG3AU01VisualRank01Question(q).errors);
  if(validationErrors.length) return Object.freeze({ok:false,errors:Object.freeze(validationErrors),warnings:Object.freeze([]),worksheetDocument:null,generation});
  const layoutReview=publicAdmission?normalizeG3AU01VisualRank01PublicLayout(options.printLayout??{}):null;
  const l=layout({...options,publicAdmission});
  const layoutWarnings=layoutReview?.adjusted
    ? [Object.freeze({
        code:"G3A_U01_RANK01_LAYOUT_SAFETY_ADJUSTED",
        severity:"warning",
        message:`一維資料表題型已將每頁版面調整為 ${l.columns} 欄 × ${l.rowsPerPage} 列，以避免 8 列資料表超出 A4 列印範圍。`
      })]
    : [];
  const models=displayModels(generation.questions,l,publicAdmission);
  const answers=l.showAnswerKeyPage?answerItems(generation.questions,models,publicAdmission):[];
  const questionPages=paginateQuestionDisplayModels(models,l);
  const answerKeyPages=l.showAnswerKeyPage?paginateAnswerKeyItems(answers,l):[];
  const worksheetDocument=Object.freeze({
    worksheetKind:"batch_a",
    worksheetId:"g3a-u01-rank01-"+(options.generationSeed??(publicAdmission?"public":"hidden")),
    title:"10000以內的數｜一維資料表四位數比較",
    generatedQuestions:generation.questions,questions:generation.questions,
    questionDisplayModels:Object.freeze(models),answerKeyItems:Object.freeze(answers),
    questionPages:Object.freeze(questionPages),answerKeyPages:Object.freeze(answerKeyPages),
    questionCount:generation.questions.length,
    printOptions:Object.freeze({...l,showAnswerKey:l.showAnswerKeyPage,answerKeyPlacement:l.showAnswerKeyPage?"afterQuestions":"none"}),
    publicControls:Object.freeze({sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,selectorVisible:publicAdmission}),
    configSnapshot:Object.freeze({questionMode:"visual_reading",printLayout:l}),
    batchA:Object.freeze({sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,selectionMode:publicAdmission?(options.selectionMode??"singleKnowledgePoint"):"hiddenPatternSpec"}),
    metadata:Object.freeze({
      sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,knowledgePointId:G3A_U01_VISUAL_RANK01_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,patternSpecId:G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID,
      sourceSemanticCore:"TABLE_DATA_COMPARISON",nativeRendererPath:"site/modules/renderer/one-way-statistics-table.js",
      chartRepresentationRendered:false,hiddenRuntime:!publicAdmission,selectorVisible:publicAdmission,productionUse:publicAdmission?"public_review":"forbidden",
      layoutTuningStatus:publicAdmission?"PUBLIC_LAYOUT_SAFE_CAP_ENFORCED_OPERATOR_RECHECK_PENDING":"accepted_actual_a4_2x3_no_size_change",
      layoutTuningBoundary:publicAdmission
        ?"Rank01 uses source-backed 3-to-8-row tables; safe public caps are 1 column <= 4 rows, 2 columns <= 3 rows, 3 columns <= 2 rows until deployed recheck completes"
        :"A4 2x3 accepted at native table size; any future size increase requires renewed actual-page overflow review",
      requestedPrintLayout:publicAdmission?layoutReview?.requested:null,
      publicLayoutSafetyAdjusted:publicAdmission?Boolean(layoutReview?.adjusted):false
    }),
    summary:Object.freeze({questionCount:generation.questions.length,questionPageCount:questionPages.length,answerKeyPageCount:answerKeyPages.length,tableQuestionCount:generation.questions.length,chartQuestionCount:0})
  });
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze(layoutWarnings),worksheetDocument,generation});
}
