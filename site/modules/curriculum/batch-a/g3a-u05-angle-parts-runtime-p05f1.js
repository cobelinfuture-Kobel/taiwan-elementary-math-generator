import {
  G3A_U05_P05F1_GROUP_ID,
  G3A_U05_P05F1_KP_ID,
  G3A_U05_P05F1_PATTERN_SPECS,
  G3A_U05_P05F1_SOURCE_ID,
  G3A_U05_P05F1_SPEC_IDS,
} from "../registry/g3a-u05-angle-parts-selector-projection-p05f1.js";

export const G3A_U05_P05F1_MAX_QUESTION_COUNT = 240;
export const G3A_U05_P05F1_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const ROTATIONS = Object.freeze([0,30,60,90,120,150,180,210,240,270,300,330]);
const OPENINGS = Object.freeze([28,36,44,52,60,68,76,104,116,128]);
const SIDE_LENGTHS = Object.freeze([44,52]);
const LABELS = Object.freeze(["A","B","C","D"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["射線","直角","銳角","鈍角","度角","量角","應用題"]);
const ANSWER_BY_PART = Object.freeze({VERTEX:"頂點",SIDE:"邊",ANGLE:"角"});
const SPEC_BY_ID = new Map(G3A_U05_P05F1_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f1") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*47)%240;
  const variant=(offset+index)%240;
  return Object.freeze({
    variant,
    rotationDeg:ROTATIONS[variant%ROTATIONS.length],
    openingDeg:OPENINGS[Math.floor(variant/ROTATIONS.length)%OPENINGS.length],
    sideLength:SIDE_LENGTHS[Math.floor(variant/(ROTATIONS.length*OPENINGS.length))%SIDE_LENGTHS.length],
  });
}
function targetFor(spec, variant) {
  if (spec.targetPart!=="VARIABLE") return spec.targetPart;
  return ["VERTEX","SIDE","ANGLE"][variant%3];
}
function markerModeFor(spec) { return spec.markerMode; }
function promptFor(spec, diagram) {
  if (spec.relation==="IDENTIFY_VERTEX") return "圖中圓點標示的是角的哪一部分？";
  if (spec.relation==="IDENTIFY_SIDE") return "圖中加粗的線是角的哪一部分？";
  if (spec.relation==="IDENTIFY_ANGLE_MARKER") return "圖中的弧線標示的是什麼？";
  return `圖中 ${diagram.markerLabel} 所在的位置是角的哪一部分？`;
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.rotationDeg,d.openingDeg,d.sideLength,d.targetPart,d.targetSideIndex??0,d.markerMode,d.markerLabel??""].join("|");
}
function diagramFor(spec, variantRow) {
  const targetPart=targetFor(spec,variantRow.variant);
  return Object.freeze({
    kind:"angle_parts_diagram",
    rotationDeg:variantRow.rotationDeg,
    openingDeg:variantRow.openingDeg,
    sideLength:variantRow.sideLength,
    targetPart,
    targetSideIndex:targetPart==="SIDE"?(variantRow.variant%2)+1:null,
    markerMode:markerModeFor(spec),
    markerLabel:spec.markerMode==="LABEL"?LABELS[variantRow.variant%LABELS.length]:null,
  });
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G3A_U05_P05F1_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G3A_U05_P05F1_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec,geometryDiagram);
  const answerText=ANSWER_BY_PART[geometryDiagram.targetPart];
  const question={
    id:`p05f1-q001-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f1-q001-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G3A_U05_P05F1_SOURCE_ID,
    sourceNodeId:G3A_U05_P05F1_SOURCE_ID,
    knowledgePointId:G3A_U05_P05F1_KP_ID,
    patternGroupId:G3A_U05_P05F1_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice001Implementation",
      authority:"R02_FULL_PAGE_REVIEWED_PLUS_P05F1_DIRECT_PAGE1_VISUAL_READBACK",
      sourcePage:1,
      sourcePanel:"TOP_LEFT_ANGLE_COMPOSITION",
      sharedRuntimeScope:G3A_U05_P05F1_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      learnerRayVocabularyUsed:false,
      applicationContextUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG3AU05P05F1Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F1_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G3A_U05_P05F1_SOURCE_ID||question?.sourceNodeId!==G3A_U05_P05F1_SOURCE_ID) errors.push("P05F1_SOURCE_INVALID");
  if (question?.knowledgePointId!==G3A_U05_P05F1_KP_ID||question?.patternGroupId!==G3A_U05_P05F1_GROUP_ID) errors.push("P05F1_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F1_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="angle_parts_diagram") errors.push("P05F1_DIAGRAM_MISSING");
  else {
    if (!ROTATIONS.includes(d.rotationDeg)||!OPENINGS.includes(d.openingDeg)||!SIDE_LENGTHS.includes(d.sideLength)) errors.push("P05F1_DIAGRAM_GEOMETRY_INVALID");
    if (!Object.hasOwn(ANSWER_BY_PART,d.targetPart)) errors.push("P05F1_TARGET_PART_INVALID");
    if (d.targetPart==="SIDE"&&![1,2].includes(d.targetSideIndex)) errors.push("P05F1_TARGET_SIDE_INVALID");
    if (d.targetPart!=="SIDE"&&d.targetSideIndex!==null) errors.push("P05F1_TARGET_SIDE_LEAK");
    if (spec&&spec.markerMode!==d.markerMode) errors.push("P05F1_MARKER_MODE_INVALID");
    if (d.markerMode==="LABEL"&&!LABELS.includes(d.markerLabel)) errors.push("P05F1_MARKER_LABEL_INVALID");
    if (d.markerMode!=="LABEL"&&d.markerLabel!==null) errors.push("P05F1_MARKER_LABEL_LEAK");
    if (spec&&spec.targetPart!=="VARIABLE"&&d.targetPart!==spec.targetPart) errors.push("P05F1_SPEC_TARGET_INVALID");
    if (question?.answerText!==ANSWER_BY_PART[d.targetPart]) errors.push("P05F1_ANSWER_INVALID");
    if (spec&&question?.promptText!==promptFor(spec,d)) errors.push("P05F1_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F1_SIGNATURE_INVALID");
  }
  const learnerText=String(question?.promptText??"");
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F1_FORBIDDEN_LEARNER_TERM:${term}`);
  if (question?.metadata?.sourcePage!==1||question?.metadata?.learnerRayVocabularyUsed!==false||question?.metadata?.applicationContextUsed!==false) errors.push("P05F1_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG3AU05P05F1Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G3A_U05_P05F1_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F1_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F1_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f1-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG3AU05P05F1Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F1_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G3A_U05_P05F1_MAX_QUESTION_COUNT});
}
