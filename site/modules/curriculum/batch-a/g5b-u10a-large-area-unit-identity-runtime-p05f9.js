import {
  G5B_U10A_P05F9_GROUP_ID,
  G5B_U10A_P05F9_KP_ID,
  G5B_U10A_P05F9_PATTERN_SPECS,
  G5B_U10A_P05F9_SOURCE_ID,
  G5B_U10A_P05F9_SPEC_IDS,
} from "../registry/g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js";

export const G5B_U10A_P05F9_MAX_QUESTION_COUNT = 240;
export const G5B_U10A_P05F9_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const PROFILE_INDEXES = Object.freeze([0,1,2,3,4,5,6,7,8,9]);
const SCALES = Object.freeze([0.78,0.82,0.86,0.90,0.94,0.98,1.02,1.06]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const AREA_UNITS = Object.freeze(["公畝","公頃","平方公里"]);
const LENGTH_UNITS = Object.freeze(["公尺","公里","公分"]);
const SCALE_CLASSES = Object.freeze(["SMALL_LAND","LARGE_LAND","REGION"]);
const DIAGRAM_MODES = Object.freeze(["RECOGNIZE_AREA_UNIT","SELECT_UNIT_BY_SCALE","DISTINGUISH_AREA_LENGTH_UNIT"]);
const SCALE_LABELS = Object.freeze({SMALL_LAND:"較小土地尺度",LARGE_LAND:"大片土地尺度",REGION:"地區範圍尺度"});
const SCALE_ANSWERS = Object.freeze({SMALL_LAND:"公畝",LARGE_LAND:"公頃",REGION:"平方公里"});
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["平方公尺換算","公頃換算","平方公里換算","公噸","公斤","估測應用","面積公式","應用題"]);
const SPEC_BY_ID = new Map(G5B_U10A_P05F9_PATTERN_SPECS.map((row)=>[row.patternSpecId,row]));

function hashSeed(seed="p05f9"){let hash=2166136261;for(const ch of String(seed)){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function variantFromIndex(index,canonicalSpecIndex,seed){
  const offset=(hashSeed(seed)+canonicalSpecIndex*97)%240;
  const variant=(offset+index)%240;
  const profileIndex=PROFILE_INDEXES[variant%PROFILE_INDEXES.length];
  const scale=SCALES[Math.floor(variant/PROFILE_INDEXES.length)%SCALES.length];
  const shiftX=X_SHIFTS[Math.floor(variant/(PROFILE_INDEXES.length*SCALES.length))%X_SHIFTS.length];
  const targetUnit=AREA_UNITS[(variant+canonicalSpecIndex)%AREA_UNITS.length];
  const scaleClass=SCALE_CLASSES[(variant+canonicalSpecIndex)%SCALE_CLASSES.length];
  const distractorUnit=LENGTH_UNITS[(variant+canonicalSpecIndex)%LENGTH_UNITS.length];
  const badgeOrder=(variant+canonicalSpecIndex)%2;
  return Object.freeze({variant,profileIndex,scale,shiftX,targetUnit,scaleClass,distractorUnit,badgeOrder});
}
function promptFor(spec){
  if(spec.relation==="RECOGNIZE_ARE_HECTARE_SQUARE_KILOMETER_AS_AREA_UNITS")return "觀察圖中標示的單位，它是哪一個大面積單位？";
  if(spec.relation==="SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE")return "依圖示的面積尺度，應選用哪一個大面積單位表示？";
  return "圖中的兩個單位，哪一個是面積單位？";
}
function answerFor(spec,row){
  if(spec.relation==="SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE")return SCALE_ANSWERS[row.scaleClass];
  return row.targetUnit;
}
function diagramFor(spec,row){return Object.freeze({kind:"large_area_unit_scale_diagram",profileIndex:row.profileIndex,scale:row.scale,shiftX:row.shiftX,diagramMode:spec.diagramMode,targetUnit:row.targetUnit,scaleClass:row.scaleClass,scaleLabel:SCALE_LABELS[row.scaleClass],distractorUnit:row.distractorUnit,badgeOrder:row.badgeOrder});}
function signatureFor(question){const d=question.geometryDiagram;return [question.patternSpecId,d.profileIndex,d.scale,d.shiftX,d.diagramMode,d.targetUnit,d.scaleClass,d.distractorUnit,d.badgeOrder].join("|");}
function selectedSpecs(patternSpecIds){if(!Array.isArray(patternSpecIds)||patternSpecIds.length===0)return[...G5B_U10A_P05F9_PATTERN_SPECS];const unique=[...new Set(patternSpecIds)];if(unique.some((id)=>!SPEC_BY_ID.has(id)))return null;return unique.map((id)=>SPEC_BY_ID.get(id));}
function questionFor(spec,sequenceIndex,generationSeed){
  const canonicalSpecIndex=G5B_U10A_P05F9_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant),promptText=promptFor(spec),answerText=answerFor(spec,variant);
  const question={id:`p05f9-q009-${canonicalSpecIndex+1}-${variant.variant+1}`,generatedItemId:`p05f9-q009-${canonicalSpecIndex+1}-${variant.variant+1}`,sourceId:G5B_U10A_P05F9_SOURCE_ID,sourceNodeId:G5B_U10A_P05F9_SOURCE_ID,knowledgePointId:G5B_U10A_P05F9_KP_ID,patternGroupId:G5B_U10A_P05F9_GROUP_ID,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,geometryDiagram,metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice009Implementation",authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F9_PREFLIGHT",sourcePages:Object.freeze([1]),sourcePanel:"LARGE_AREA_UNIT_IDENTITY",sharedRuntimeScope:G5B_U10A_P05F9_SHARED_RUNTIME_SCOPE,diagramVariant:variant.variant,applicationContextUsed:false,hectareSquareMeterConversionUsed:false,squareKilometerHectareConversionUsed:false,metricTonKilogramConversionUsed:false,estimationApplicationUsed:false,areaUnitConversionArithmeticUsed:false,areaFormulaCalculationUsed:false,frozenProfileCategoryMismatchAcknowledged:true})};
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG5BU10AP05F9Question(question){
  const errors=[],spec=SPEC_BY_ID.get(question?.patternSpecId);
  if(!spec)errors.push("P05F9_PATTERN_SPEC_INVALID");
  if(question?.sourceId!==G5B_U10A_P05F9_SOURCE_ID||question?.sourceNodeId!==G5B_U10A_P05F9_SOURCE_ID)errors.push("P05F9_SOURCE_INVALID");
  if(question?.knowledgePointId!==G5B_U10A_P05F9_KP_ID||question?.patternGroupId!==G5B_U10A_P05F9_GROUP_ID)errors.push("P05F9_KP_OR_GROUP_INVALID");
  if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F9_MODE_INVALID");
  const d=question?.geometryDiagram;
  if(!d||d.kind!=="large_area_unit_scale_diagram")errors.push("P05F9_DIAGRAM_MISSING");
  else{
    if(!PROFILE_INDEXES.includes(d.profileIndex)||!SCALES.includes(d.scale)||!X_SHIFTS.includes(d.shiftX)||![0,1].includes(d.badgeOrder))errors.push("P05F9_DIAGRAM_GEOMETRY_INVALID");
    if(!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode)errors.push("P05F9_DIAGRAM_MODE_INVALID");
    if(!AREA_UNITS.includes(d.targetUnit)||!SCALE_CLASSES.includes(d.scaleClass)||!LENGTH_UNITS.includes(d.distractorUnit)||d.scaleLabel!==SCALE_LABELS[d.scaleClass])errors.push("P05F9_DIAGRAM_SEMANTICS_INVALID");
    if(spec&&question?.promptText!==promptFor(spec))errors.push("P05F9_PROMPT_INVALID");
    if(spec&&question?.answerText!==answerFor(spec,d))errors.push("P05F9_ANSWER_INVALID");
    if(question?.questionSignature!==signatureFor(question))errors.push("P05F9_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;for(const term of FORBIDDEN_LEARNER_TERMS)if(learnerText.includes(term))errors.push(`P05F9_FORBIDDEN_LEARNER_TERM:${term}`);
  const m=question?.metadata;if(!Array.isArray(m?.sourcePages)||m.sourcePages.join(",")!=="1"||m?.applicationContextUsed!==false||m?.hectareSquareMeterConversionUsed!==false||m?.squareKilometerHectareConversionUsed!==false||m?.metricTonKilogramConversionUsed!==false||m?.estimationApplicationUsed!==false||m?.areaUnitConversionArithmeticUsed!==false||m?.areaFormulaCalculationUsed!==false||m?.frozenProfileCategoryMismatchAcknowledged!==true)errors.push("P05F9_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG5BU10AP05F9Questions(options={}){
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if(count<1||count>G5B_U10A_P05F9_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F9_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);if(!specs||specs.length===0)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F9_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0])),questions=[];
  for(let index=0;index<count;index+=1){const spec=specs[index%specs.length],sequenceIndex=perSpecSequence.get(spec.patternSpecId);perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f9-public"));}
  const validationErrors=questions.flatMap((question)=>validateG5BU10AP05F9Question(question).errors),signatures=questions.map((question)=>question.questionSignature);if(new Set(signatures).size!==signatures.length)validationErrors.push("P05F9_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G5B_U10A_P05F9_MAX_QUESTION_COUNT});
}
