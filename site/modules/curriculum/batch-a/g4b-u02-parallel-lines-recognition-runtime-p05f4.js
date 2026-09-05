import {
  G4B_U02_P05F4_GROUP_ID,
  G4B_U02_P05F4_KP_ID,
  G4B_U02_P05F4_PATTERN_SPECS,
  G4B_U02_P05F4_SOURCE_ID,
  G4B_U02_P05F4_SPEC_IDS,
} from "../registry/g4b-u02-parallel-lines-recognition-selector-projection-p05f4.js";

export const G4B_U02_P05F4_MAX_QUESTION_COUNT = 240;
export const G4B_U02_P05F4_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const ORIENTATIONS = Object.freeze([-45,-30,-15,0,15,30,45,60,75,90]);
const GAPS = Object.freeze([22,26,30,34,38,42,46,50]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const DIAGRAM_MODES = Object.freeze(["PLAIN_PAIR","NONINTERSECTING_PAIR","EXTENSION_GUIDES","DIRECTION_ARROWS"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["垂直","直角","量距離","作圖","四邊形","應用題"]);
const SPEC_BY_ID = new Map(G4B_U02_P05F4_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f4") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*67)%240;
  const variant=(offset+index)%240;
  const orientationIndex=variant%ORIENTATIONS.length;
  const gapIndex=Math.floor(variant/ORIENTATIONS.length)%GAPS.length;
  const shiftIndex=Math.floor(variant/(ORIENTATIONS.length*GAPS.length))%X_SHIFTS.length;
  return Object.freeze({
    variant,
    orientationDeg:ORIENTATIONS[orientationIndex],
    gapPx:GAPS[gapIndex],
    shiftX:X_SHIFTS[shiftIndex],
  });
}
function promptFor(spec) {
  if (spec.relation==="IDENTIFY_PARALLEL_LINE_PAIR") return "觀察圖中的兩條直線，它們是什麼關係？";
  if (spec.relation==="RECOGNIZE_COPLANAR_NONINTERSECTING_LINES") return "圖中的兩條直線在同一平面內且不相交。這種直線叫什麼？";
  if (spec.relation==="RECOGNIZE_PARALLEL_LINES_REMAIN_NONINTERSECTING_WHEN_EXTENDED") return "圖中的兩條平行線向兩端延伸後會相交嗎？";
  return "圖中的兩條平行線方向有什麼共同特徵？";
}
function answerFor(spec) {
  if (spec.relation==="IDENTIFY_PARALLEL_LINE_PAIR"||spec.relation==="RECOGNIZE_COPLANAR_NONINTERSECTING_LINES") return "平行線";
  if (spec.relation==="RECOGNIZE_PARALLEL_LINES_REMAIN_NONINTERSECTING_WHEN_EXTENDED") return "不會相交";
  return "方向一致";
}
function diagramFor(spec, variantRow) {
  return Object.freeze({
    kind:"parallel_lines_recognition_diagram",
    orientationDeg:variantRow.orientationDeg,
    gapPx:variantRow.gapPx,
    shiftX:variantRow.shiftX,
    diagramMode:spec.diagramMode,
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.orientationDeg,d.gapPx,d.shiftX,d.diagramMode].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G4B_U02_P05F4_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G4B_U02_P05F4_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec);
  const answerText=answerFor(spec);
  const question={
    id:`p05f4-q004-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f4-q004-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G4B_U02_P05F4_SOURCE_ID,
    sourceNodeId:G4B_U02_P05F4_SOURCE_ID,
    knowledgePointId:G4B_U02_P05F4_KP_ID,
    patternGroupId:G4B_U02_P05F4_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice004Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F4_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sourcePanel:"PARALLEL_LINE_RECOGNITION",
      sharedRuntimeScope:G4B_U02_P05F4_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      perpendicularRecognitionUsed:false,
      parallelDistanceMeasurementUsed:false,
      parallelLineConstructionUsed:false,
      quadrilateralClassificationUsed:false,
      quadrilateralInclusionUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG4BU02P05F4Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F4_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G4B_U02_P05F4_SOURCE_ID||question?.sourceNodeId!==G4B_U02_P05F4_SOURCE_ID) errors.push("P05F4_SOURCE_INVALID");
  if (question?.knowledgePointId!==G4B_U02_P05F4_KP_ID||question?.patternGroupId!==G4B_U02_P05F4_GROUP_ID) errors.push("P05F4_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F4_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="parallel_lines_recognition_diagram") errors.push("P05F4_DIAGRAM_MISSING");
  else {
    if (!ORIENTATIONS.includes(d.orientationDeg)||!GAPS.includes(d.gapPx)||!X_SHIFTS.includes(d.shiftX)) errors.push("P05F4_DIAGRAM_GEOMETRY_INVALID");
    if (!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode) errors.push("P05F4_DIAGRAM_MODE_INVALID");
    if (spec&&question?.answerText!==answerFor(spec)) errors.push("P05F4_ANSWER_INVALID");
    if (spec&&question?.promptText!==promptFor(spec)) errors.push("P05F4_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F4_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F4_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (!Array.isArray(metadata?.sourcePages)||metadata.sourcePages.join(",")!=="1,2"||metadata?.applicationContextUsed!==false||metadata?.perpendicularRecognitionUsed!==false||metadata?.parallelDistanceMeasurementUsed!==false||metadata?.parallelLineConstructionUsed!==false||metadata?.quadrilateralClassificationUsed!==false||metadata?.quadrilateralInclusionUsed!==false) errors.push("P05F4_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG4BU02P05F4Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G4B_U02_P05F4_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F4_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F4_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f4-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG4BU02P05F4Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F4_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G4B_U02_P05F4_MAX_QUESTION_COUNT});
}
