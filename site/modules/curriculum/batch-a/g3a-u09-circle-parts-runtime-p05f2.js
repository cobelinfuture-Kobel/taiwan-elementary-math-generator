import {
  G3A_U09_P05F2_GROUP_ID,
  G3A_U09_P05F2_KP_ID,
  G3A_U09_P05F2_PATTERN_SPECS,
  G3A_U09_P05F2_SOURCE_ID,
  G3A_U09_P05F2_SPEC_IDS,
} from "../registry/g3a-u09-circle-parts-selector-projection-p05f2.js";

export const G3A_U09_P05F2_MAX_QUESTION_COUNT = 240;
export const G3A_U09_P05F2_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const ROTATIONS = Object.freeze(Array.from({ length: 24 }, (_, index) => index * 15));
const RADII = Object.freeze([32,34,36,38,40,42,44,46,48,50]);
const LABELS = Object.freeze(["A","B","C","D"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["圓周","圓規","弦","相切","外切","內切","應用題"]);
const ANSWER_BY_PART = Object.freeze({CENTER:"圓心",RADIUS:"半徑",DIAMETER:"直徑"});
const SPEC_BY_ID = new Map(G3A_U09_P05F2_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f2") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*53)%240;
  const variant=(offset+index)%240;
  return Object.freeze({
    variant,
    radius:RADII[variant%RADII.length],
    rotationDeg:ROTATIONS[Math.floor(variant/RADII.length)%ROTATIONS.length],
  });
}
function targetFor(spec, variant) {
  if (spec.targetPart!=="VARIABLE") return spec.targetPart;
  return ["CENTER","RADIUS","DIAMETER"][variant%3];
}
function promptFor(spec, diagram) {
  if (spec.relation==="IDENTIFY_CIRCLE_CENTER") return "圖中圓點標示的是圓的哪一部分？";
  if (spec.relation==="IDENTIFY_RADIUS") return "圖中從圓心連到圓上的加粗線段是圓的哪一部分？";
  if (spec.relation==="IDENTIFY_DIAMETER") return "圖中通過圓心的加粗線段是圓的哪一部分？";
  if (spec.relation==="MATCH_CIRCLE_PART_LABEL_TO_DIAGRAM") return `圖中 ${diagram.markerLabel} 所在的位置是圓的哪一部分？`;
  return "圖中加粗的線段是直徑嗎？";
}
function answerFor(diagram) {
  if (diagram.targetPart==="DIAMETER_TEST") return diagram.isDiameter ? "是直徑" : "不是直徑";
  return ANSWER_BY_PART[diagram.targetPart];
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.radius,d.rotationDeg,d.targetPart,d.markerMode,d.markerLabel??"",d.isDiameter===null?"":String(d.isDiameter)].join("|");
}
function diagramFor(spec, variantRow) {
  const targetPart=targetFor(spec,variantRow.variant);
  return Object.freeze({
    kind:"circle_parts_diagram",
    radius:variantRow.radius,
    rotationDeg:variantRow.rotationDeg,
    targetPart,
    markerMode:spec.markerMode,
    markerLabel:spec.markerMode==="LABEL"?LABELS[variantRow.variant%LABELS.length]:null,
    isDiameter:targetPart==="DIAMETER_TEST"?variantRow.variant%2===0:null,
  });
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G3A_U09_P05F2_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G3A_U09_P05F2_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec,geometryDiagram);
  const answerText=answerFor(geometryDiagram);
  const question={
    id:`p05f2-q002-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f2-q002-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G3A_U09_P05F2_SOURCE_ID,
    sourceNodeId:G3A_U09_P05F2_SOURCE_ID,
    knowledgePointId:G3A_U09_P05F2_KP_ID,
    patternGroupId:G3A_U09_P05F2_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice002Implementation",
      authority:"R02_FULL_PAGE_REVIEWED_PLUS_P05F2_DIRECT_PAGES_1_2_VISUAL_READBACK",
      sourcePage:1,
      sourcePanel:"TOP_LEFT_CIRCLE_PART_NAMES",
      sharedRuntimeScope:G3A_U09_P05F2_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      numericRadiusDiameterSolveUsed:false,
      constructionUsed:false,
      circumferenceTargetUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG3AU09P05F2Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F2_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G3A_U09_P05F2_SOURCE_ID||question?.sourceNodeId!==G3A_U09_P05F2_SOURCE_ID) errors.push("P05F2_SOURCE_INVALID");
  if (question?.knowledgePointId!==G3A_U09_P05F2_KP_ID||question?.patternGroupId!==G3A_U09_P05F2_GROUP_ID) errors.push("P05F2_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F2_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="circle_parts_diagram") errors.push("P05F2_DIAGRAM_MISSING");
  else {
    if (!RADII.includes(d.radius)||!ROTATIONS.includes(d.rotationDeg)) errors.push("P05F2_DIAGRAM_GEOMETRY_INVALID");
    if (!["CENTER","RADIUS","DIAMETER","DIAMETER_TEST"].includes(d.targetPart)) errors.push("P05F2_TARGET_PART_INVALID");
    if (spec&&spec.markerMode!==d.markerMode) errors.push("P05F2_MARKER_MODE_INVALID");
    if (d.markerMode==="LABEL"&&!LABELS.includes(d.markerLabel)) errors.push("P05F2_MARKER_LABEL_INVALID");
    if (d.markerMode!=="LABEL"&&d.markerLabel!==null) errors.push("P05F2_MARKER_LABEL_LEAK");
    if (d.targetPart==="DIAMETER_TEST"&&typeof d.isDiameter!=="boolean") errors.push("P05F2_DIAMETER_TEST_FLAG_INVALID");
    if (d.targetPart!=="DIAMETER_TEST"&&d.isDiameter!==null) errors.push("P05F2_DIAMETER_TEST_FLAG_LEAK");
    if (spec&&spec.targetPart!=="VARIABLE"&&d.targetPart!==spec.targetPart) errors.push("P05F2_SPEC_TARGET_INVALID");
    if (question?.answerText!==answerFor(d)) errors.push("P05F2_ANSWER_INVALID");
    if (spec&&question?.promptText!==promptFor(spec,d)) errors.push("P05F2_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F2_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F2_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (metadata?.sourcePage!==1||metadata?.applicationContextUsed!==false||metadata?.numericRadiusDiameterSolveUsed!==false||metadata?.constructionUsed!==false||metadata?.circumferenceTargetUsed!==false) errors.push("P05F2_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG3AU09P05F2Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G3A_U09_P05F2_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F2_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F2_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f2-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG3AU09P05F2Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F2_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G3A_U09_P05F2_MAX_QUESTION_COUNT});
}
