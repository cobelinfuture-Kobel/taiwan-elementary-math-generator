import {
  G3B_U05_P05F3_GROUP_ID,
  G3B_U05_P05F3_KP_ID,
  G3B_U05_P05F3_PATTERN_SPECS,
  G3B_U05_P05F3_SOURCE_ID,
  G3B_U05_P05F3_SPEC_IDS,
} from "../registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";

export const G3B_U05_P05F3_MAX_QUESTION_COUNT = 240;
export const G3B_U05_P05F3_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const SIDE_SIZES = Object.freeze([32,34,36,38,40,42,44,46,48,50]);
const X_SHIFTS = Object.freeze([-21,-15,-9,-3,3,9,15,21]);
const Y_SHIFTS = Object.freeze([-8,0,8]);
const MARKER_MODES = Object.freeze(["UNIT_SQUARE","SHADED_UNIT_SQUARE","AREA_UNIT_BADGE","CM2_SYMBOL"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["長×寬","周長公式","數格子","剪拼","不規則圖形","應用題"]);
const SPEC_BY_ID = new Map(G3B_U05_P05F3_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f3") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*61)%240;
  const variant=(offset+index)%240;
  const sideIndex=variant%SIDE_SIZES.length;
  const positionIndex=Math.floor(variant/SIDE_SIZES.length)%24;
  return Object.freeze({
    variant,
    sidePx:SIDE_SIZES[sideIndex],
    shiftX:X_SHIFTS[positionIndex%X_SHIFTS.length],
    shiftY:Y_SHIFTS[Math.floor(positionIndex/X_SHIFTS.length)%Y_SHIFTS.length],
  });
}
function promptFor(spec) {
  if (spec.relation==="IDENTIFY_ONE_SQUARE_CENTIMETER") return "圖中的正方形每一邊都是 1 公分。這個正方形的面積是多少？";
  if (spec.relation==="MATCH_ONE_CM_BY_ONE_CM_SQUARE_TO_ONE_CM2") return "邊長 1 公分的正方形代表哪一個面積單位？";
  if (spec.relation==="DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT") return "圖中的 1 公分 × 1 公分正方形表示的是長度單位還是面積單位？";
  return "圖中的 cm² 中文名稱是什麼？";
}
function answerFor(spec) {
  if (spec.relation==="IDENTIFY_ONE_SQUARE_CENTIMETER"||spec.relation==="MATCH_ONE_CM_BY_ONE_CM_SQUARE_TO_ONE_CM2") return "1 平方公分";
  if (spec.relation==="DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT") return "面積單位";
  return "平方公分";
}
function diagramFor(spec, variantRow) {
  return Object.freeze({
    kind:"square_centimeter_unit_diagram",
    sidePx:variantRow.sidePx,
    shiftX:variantRow.shiftX,
    shiftY:variantRow.shiftY,
    markerMode:spec.markerMode,
    sideLengthCm:1,
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.sidePx,d.shiftX,d.shiftY,d.markerMode,d.sideLengthCm].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G3B_U05_P05F3_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G3B_U05_P05F3_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec);
  const answerText=answerFor(spec);
  const question={
    id:`p05f3-q003-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f3-q003-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G3B_U05_P05F3_SOURCE_ID,
    sourceNodeId:G3B_U05_P05F3_SOURCE_ID,
    knowledgePointId:G3B_U05_P05F3_KP_ID,
    patternGroupId:G3B_U05_P05F3_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice003Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F3_PREFLIGHT",
      sourcePage:1,
      sourcePanel:"ONE_SQUARE_CENTIMETER_AREA_UNIT",
      sharedRuntimeScope:G3B_U05_P05F3_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      gridCountingUsed:false,
      irregularAreaUsed:false,
      cutRearrangeUsed:false,
      samePerimeterComparisonUsed:false,
      rectangleSquareFormulaUsed:false,
      perimeterComputationUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG3BU05P05F3Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F3_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G3B_U05_P05F3_SOURCE_ID||question?.sourceNodeId!==G3B_U05_P05F3_SOURCE_ID) errors.push("P05F3_SOURCE_INVALID");
  if (question?.knowledgePointId!==G3B_U05_P05F3_KP_ID||question?.patternGroupId!==G3B_U05_P05F3_GROUP_ID) errors.push("P05F3_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F3_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="square_centimeter_unit_diagram") errors.push("P05F3_DIAGRAM_MISSING");
  else {
    if (!SIDE_SIZES.includes(d.sidePx)||!X_SHIFTS.includes(d.shiftX)||!Y_SHIFTS.includes(d.shiftY)) errors.push("P05F3_DIAGRAM_GEOMETRY_INVALID");
    if (!MARKER_MODES.includes(d.markerMode)||spec?.markerMode!==d.markerMode) errors.push("P05F3_MARKER_MODE_INVALID");
    if (d.sideLengthCm!==1) errors.push("P05F3_SIDE_LENGTH_INVALID");
    if (question?.answerText!==answerFor(spec)) errors.push("P05F3_ANSWER_INVALID");
    if (question?.promptText!==promptFor(spec)) errors.push("P05F3_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F3_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F3_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (metadata?.sourcePage!==1||metadata?.applicationContextUsed!==false||metadata?.gridCountingUsed!==false||metadata?.irregularAreaUsed!==false||metadata?.cutRearrangeUsed!==false||metadata?.samePerimeterComparisonUsed!==false||metadata?.rectangleSquareFormulaUsed!==false||metadata?.perimeterComputationUsed!==false) errors.push("P05F3_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG3BU05P05F3Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G3B_U05_P05F3_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F3_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F3_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f3-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG3BU05P05F3Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F3_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G3B_U05_P05F3_MAX_QUESTION_COUNT});
}
