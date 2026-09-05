import {
  G4B_U10_P05F5_GROUP_ID,
  G4B_U10_P05F5_KP_ID,
  G4B_U10_P05F5_PATTERN_SPECS,
  G4B_U10_P05F5_SOURCE_ID,
  G4B_U10_P05F5_SPEC_IDS,
} from "../registry/g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js";

export const G4B_U10_P05F5_MAX_QUESTION_COUNT = 240;
export const G4B_U10_P05F5_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const EDGE_SIZES = Object.freeze([34,36,38,40,42,44,46,48,50,52]);
const DEPTHS = Object.freeze([10,12,14,16,18,20,22,24]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const DIAGRAM_MODES = Object.freeze(["UNIT_CUBE_VOLUME","EDGE_LABELS","CM3_UNIT","DIMENSION_CUE"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["數方塊","幾個方塊","每層","層數","重組","長乘寬乘高","長×寬×高","應用題"]);
const SPEC_BY_ID = new Map(G4B_U10_P05F5_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f5") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*71)%240;
  const variant=(offset+index)%240;
  const edgeIndex=variant%EDGE_SIZES.length;
  const depthIndex=Math.floor(variant/EDGE_SIZES.length)%DEPTHS.length;
  const shiftIndex=Math.floor(variant/(EDGE_SIZES.length*DEPTHS.length))%X_SHIFTS.length;
  return Object.freeze({variant,edgePx:EDGE_SIZES[edgeIndex],depthPx:DEPTHS[depthIndex],shiftX:X_SHIFTS[shiftIndex]});
}
function promptFor(spec) {
  if (spec.relation==="IDENTIFY_ONE_CUBIC_CENTIMETER") return "圖中是一個邊長 1 公分的正方體，它的體積是多少？";
  if (spec.relation==="MATCH_ONE_CM_EDGE_CUBE_TO_ONE_CM3") return "邊長都是 1 公分的正方體，體積是多少？";
  if (spec.relation==="RECOGNIZE_CM3_AS_VOLUME_UNIT") return "邊長 1 公分正方體的體積單位叫什麼？";
  return "立方公分是長度單位、面積單位，還是體積單位？";
}
function answerFor(spec) {
  if (spec.relation==="IDENTIFY_ONE_CUBIC_CENTIMETER"||spec.relation==="MATCH_ONE_CM_EDGE_CUBE_TO_ONE_CM3") return "1 立方公分";
  if (spec.relation==="RECOGNIZE_CM3_AS_VOLUME_UNIT") return "立方公分";
  return "體積單位";
}
function diagramFor(spec, variantRow) {
  return Object.freeze({
    kind:"cubic_centimeter_unit_diagram",
    edgePx:variantRow.edgePx,
    depthPx:variantRow.depthPx,
    shiftX:variantRow.shiftX,
    diagramMode:spec.diagramMode,
    cubeCount:1,
    edgeCentimeters:1,
    volumeCubicCentimeters:1,
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.edgePx,d.depthPx,d.shiftX,d.diagramMode,d.cubeCount,d.edgeCentimeters].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G4B_U10_P05F5_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G4B_U10_P05F5_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec);
  const answerText=answerFor(spec);
  const question={
    id:`p05f5-q005-${canonicalSpecIndex+1}-${variant.variant+1}`,
    generatedItemId:`p05f5-q005-${canonicalSpecIndex+1}-${variant.variant+1}`,
    sourceId:G4B_U10_P05F5_SOURCE_ID,
    sourceNodeId:G4B_U10_P05F5_SOURCE_ID,
    knowledgePointId:G4B_U10_P05F5_KP_ID,
    patternGroupId:G4B_U10_P05F5_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice005Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F5_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sourcePanel:"CUBIC_CENTIMETER_UNIT",
      sharedRuntimeScope:G4B_U10_P05F5_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      unitCubeCountingUsed:false,
      layeredCubeCountingUsed:false,
      volumeConservationRearrangementUsed:false,
      rectangularPrismVolumeStructureUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG4BU10P05F5Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F5_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G4B_U10_P05F5_SOURCE_ID||question?.sourceNodeId!==G4B_U10_P05F5_SOURCE_ID) errors.push("P05F5_SOURCE_INVALID");
  if (question?.knowledgePointId!==G4B_U10_P05F5_KP_ID||question?.patternGroupId!==G4B_U10_P05F5_GROUP_ID) errors.push("P05F5_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F5_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="cubic_centimeter_unit_diagram") errors.push("P05F5_DIAGRAM_MISSING");
  else {
    if (!EDGE_SIZES.includes(d.edgePx)||!DEPTHS.includes(d.depthPx)||!X_SHIFTS.includes(d.shiftX)) errors.push("P05F5_DIAGRAM_GEOMETRY_INVALID");
    if (!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode) errors.push("P05F5_DIAGRAM_MODE_INVALID");
    if (d.cubeCount!==1||d.edgeCentimeters!==1||d.volumeCubicCentimeters!==1) errors.push("P05F5_UNIT_CUBE_INVARIANT_INVALID");
    if (spec&&question?.answerText!==answerFor(spec)) errors.push("P05F5_ANSWER_INVALID");
    if (spec&&question?.promptText!==promptFor(spec)) errors.push("P05F5_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F5_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F5_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (!Array.isArray(metadata?.sourcePages)||metadata.sourcePages.join(",")!=="1,2"||metadata?.applicationContextUsed!==false||metadata?.unitCubeCountingUsed!==false||metadata?.layeredCubeCountingUsed!==false||metadata?.volumeConservationRearrangementUsed!==false||metadata?.rectangularPrismVolumeStructureUsed!==false) errors.push("P05F5_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG4BU10P05F5Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G4B_U10_P05F5_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F5_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F5_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f5-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG4BU10P05F5Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F5_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G4B_U10_P05F5_MAX_QUESTION_COUNT});
}
