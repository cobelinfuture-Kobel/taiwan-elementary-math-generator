import {
  G5A_U07_P05F6_GROUP_ID,
  G5A_U07_P05F6_KP_ID,
  G5A_U07_P05F6_PATTERN_SPECS,
  G5A_U07_P05F6_SOURCE_ID,
  G5A_U07_P05F6_SPEC_IDS,
} from "../registry/g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js";

export const G5A_U07_P05F6_MAX_QUESTION_COUNT = 240;
export const G5A_U07_P05F6_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const PROFILE_INDEXES = Object.freeze([0,1,2,3,4,5,6,7,8,9]);
const SCALES = Object.freeze([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const DIAGRAM_MODES = Object.freeze(["SYMMETRIC_CLASSIFICATION","NON_SYMMETRIC_CLASSIFICATION","FOLD_OVERLAP_CUE"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["幾條對稱軸","對稱軸位置","對稱點距離","補完圖形","完成圖形","座標","反射","畫出","作圖","應用題"]);
const SPEC_BY_ID = new Map(G5A_U07_P05F6_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f6") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*73)%240;
  const variant=(offset+index)%240;
  const profileIndex=PROFILE_INDEXES[variant%PROFILE_INDEXES.length];
  const scaleIndex=Math.floor(variant/PROFILE_INDEXES.length)%SCALES.length;
  const shiftIndex=Math.floor(variant/(PROFILE_INDEXES.length*SCALES.length))%X_SHIFTS.length;
  return Object.freeze({variant,profileIndex,scale:SCALES[scaleIndex],shiftX:X_SHIFTS[shiftIndex]});
}
function promptFor(spec) {
  if (spec.relation==="IDENTIFY_LINE_SYMMETRIC_FIGURE") return "觀察圖形，它是不是線對稱圖形？";
  if (spec.relation==="DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE") return "觀察圖形，它是不是線對稱圖形？";
  return "沿圖中的虛線摺疊，兩側可以完全重疊嗎？";
}
function answerFor(spec) {
  if (spec.relation==="IDENTIFY_LINE_SYMMETRIC_FIGURE") return "是";
  if (spec.relation==="DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE") return "不是";
  return "可以";
}
function expectedSymmetryFor(spec) { return spec.relation!=="DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE"; }
function diagramFor(spec, variantRow) {
  return Object.freeze({
    kind:"line_symmetry_recognition_diagram",
    profileIndex:variantRow.profileIndex,
    scale:variantRow.scale,
    shiftX:variantRow.shiftX,
    diagramMode:spec.diagramMode,
    isLineSymmetric:expectedSymmetryFor(spec),
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.profileIndex,d.scale,d.shiftX,d.diagramMode,d.isLineSymmetric].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G5A_U07_P05F6_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G5A_U07_P05F6_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec);
  const answerText=answerFor(spec);
  const question={
    id:`p05f6-q006-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f6-q006-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G5A_U07_P05F6_SOURCE_ID,
    sourceNodeId:G5A_U07_P05F6_SOURCE_ID,
    knowledgePointId:G5A_U07_P05F6_KP_ID,
    patternGroupId:G5A_U07_P05F6_GROUP_ID,
    patternSpecId:spec.patternSpecId,
    relation:spec.relation,
    questionMode:"diagram",
    mode:"diagram",
    promptText,
    prompt:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} ${answerText}`,
    answerText,
    geometryDiagram,
    metadata:Object.freeze({
      taskId:"P05F_W5DirectProductVerticalSlice006Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F6_PREFLIGHT",
      sourcePages:Object.freeze([1]),
      sourcePanel:"LINE_SYMMETRY_RECOGNITION",
      sharedRuntimeScope:G5A_U07_P05F6_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      symmetryAxisCountUsed:false,
      symmetryAxisLocationOrConstructionUsed:false,
      symmetricPointDistanceUsed:false,
      completeSymmetricFigureUsed:false,
      coordinateReflectionUsed:false,
      geometryFormulaOrMeasurementUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG5AU07P05F6Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F6_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G5A_U07_P05F6_SOURCE_ID||question?.sourceNodeId!==G5A_U07_P05F6_SOURCE_ID) errors.push("P05F6_SOURCE_INVALID");
  if (question?.knowledgePointId!==G5A_U07_P05F6_KP_ID||question?.patternGroupId!==G5A_U07_P05F6_GROUP_ID) errors.push("P05F6_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F6_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="line_symmetry_recognition_diagram") errors.push("P05F6_DIAGRAM_MISSING");
  else {
    if (!PROFILE_INDEXES.includes(d.profileIndex)||!SCALES.includes(d.scale)||!X_SHIFTS.includes(d.shiftX)) errors.push("P05F6_DIAGRAM_GEOMETRY_INVALID");
    if (!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode) errors.push("P05F6_DIAGRAM_MODE_INVALID");
    if (spec&&d.isLineSymmetric!==expectedSymmetryFor(spec)) errors.push("P05F6_SYMMETRY_INVARIANT_INVALID");
    if (spec&&question?.answerText!==answerFor(spec)) errors.push("P05F6_ANSWER_INVALID");
    if (spec&&question?.promptText!==promptFor(spec)) errors.push("P05F6_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F6_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F6_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (!Array.isArray(metadata?.sourcePages)||metadata.sourcePages.join(",")!=="1"||metadata?.applicationContextUsed!==false||metadata?.symmetryAxisCountUsed!==false||metadata?.symmetryAxisLocationOrConstructionUsed!==false||metadata?.symmetricPointDistanceUsed!==false||metadata?.completeSymmetricFigureUsed!==false||metadata?.coordinateReflectionUsed!==false||metadata?.geometryFormulaOrMeasurementUsed!==false) errors.push("P05F6_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG5AU07P05F6Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G5A_U07_P05F6_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F6_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F6_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f6-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG5AU07P05F6Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F6_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G5A_U07_P05F6_MAX_QUESTION_COUNT});
}
