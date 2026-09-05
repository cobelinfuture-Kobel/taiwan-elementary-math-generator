import {
  G5A_U10A1_P05F8_GROUP_ID,
  G5A_U10A1_P05F8_KP_ID,
  G5A_U10A1_P05F8_PATTERN_SPECS,
  G5A_U10A1_P05F8_SOURCE_ID,
  G5A_U10A1_P05F8_SPEC_IDS,
} from "../registry/g5a-u10a1-cube-cuboid-elements-selector-projection-p05f8.js";

export const G5A_U10A1_P05F8_MAX_QUESTION_COUNT = 240;
export const G5A_U10A1_P05F8_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const PROFILE_INDEXES = Object.freeze([0,1,2,3,4,5,6,7,8,9]);
const SCALES = Object.freeze([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const SOLID_TYPES = Object.freeze(["CUBE","CUBOID"]);
const ELEMENT_TYPES = Object.freeze(["FACE","EDGE","VERTEX"]);
const DIAGRAM_MODES = Object.freeze(["IDENTIFY_ELEMENT","FIXED_ELEMENT_COUNTS","DISTINGUISH_CUBE_CUBOID"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["相對面","相鄰面","垂直關係","展開圖","稜長關係","長寬高","缺面","塗色","切割","體積","表面積","公式","應用題"]);
const SPEC_BY_ID = new Map(G5A_U10A1_P05F8_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f8") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*83)%240;
  const variant=(offset+index)%240;
  const profileIndex=PROFILE_INDEXES[variant%PROFILE_INDEXES.length];
  const scaleIndex=Math.floor(variant/PROFILE_INDEXES.length)%SCALES.length;
  const shiftIndex=Math.floor(variant/(PROFILE_INDEXES.length*SCALES.length))%X_SHIFTS.length;
  const solidType=SOLID_TYPES[(index+canonicalSpecIndex)%SOLID_TYPES.length];
  const targetElement=ELEMENT_TYPES[(index+canonicalSpecIndex)%ELEMENT_TYPES.length];
  return Object.freeze({variant,profileIndex,scale:SCALES[scaleIndex],shiftX:X_SHIFTS[shiftIndex],solidType,targetElement,highlightIndex:variant%8});
}
function solidLabel(solidType) { return solidType==="CUBE"?"正方體":"長方體"; }
function elementLabel(targetElement) { return targetElement==="FACE"?"面":targetElement==="EDGE"?"稜":"頂點"; }
function countAnswer(targetElement) { return targetElement==="FACE"?"6個面":targetElement==="EDGE"?"12條稜":"8個頂點"; }
function countPrompt(targetElement) { return targetElement==="FACE"?"幾個面":targetElement==="EDGE"?"幾條稜":"幾個頂點"; }
function promptFor(spec, row) {
  if (spec.relation==="IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES") return "觀察圖中加粗標示的部分，它是面、稜還是頂點？";
  if (spec.relation==="RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS") return `這個${solidLabel(row.solidType)}共有${countPrompt(row.targetElement)}？`;
  return "觀察圖中面與稜的形狀、長度條件，它是正方體還是長方體？";
}
function answerFor(spec, row) {
  if (spec.relation==="IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES") return elementLabel(row.targetElement);
  if (spec.relation==="RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS") return countAnswer(row.targetElement);
  return solidLabel(row.solidType);
}
function diagramFor(spec, row) {
  return Object.freeze({
    kind:"cube_cuboid_elements_diagram",
    profileIndex:row.profileIndex,
    scale:row.scale,
    shiftX:row.shiftX,
    diagramMode:spec.diagramMode,
    solidType:row.solidType,
    targetElement:row.targetElement,
    highlightIndex:row.highlightIndex,
    faceCount:6,
    edgeCount:12,
    vertexCount:8,
    allEdgesEqual:row.solidType==="CUBE",
    allFacesSquares:row.solidType==="CUBE",
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.profileIndex,d.scale,d.shiftX,d.diagramMode,d.solidType,d.targetElement,d.highlightIndex,d.faceCount,d.edgeCount,d.vertexCount,d.allEdgesEqual,d.allFacesSquares].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G5A_U10A1_P05F8_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G5A_U10A1_P05F8_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec,variant);
  const answerText=answerFor(spec,variant);
  const question={
    id:`p05f8-q008-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidType.toLowerCase()}-${variant.targetElement.toLowerCase()}`,
    generatedItemId:`p05f8-q008-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidType.toLowerCase()}-${variant.targetElement.toLowerCase()}`,
    sourceId:G5A_U10A1_P05F8_SOURCE_ID,
    sourceNodeId:G5A_U10A1_P05F8_SOURCE_ID,
    knowledgePointId:G5A_U10A1_P05F8_KP_ID,
    patternGroupId:G5A_U10A1_P05F8_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice008Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F8_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sourcePanel:"CUBE_CUBOID_FACES_EDGES_VERTICES",
      sharedRuntimeScope:G5A_U10A1_P05F8_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      faceRelationshipUsed:false,
      netUsed:false,
      edgeLengthRelationUsed:false,
      broaderSpatialReasoningUsed:false,
      solidMeasurementOrFormulaUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG5AU10A1P05F8Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F8_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G5A_U10A1_P05F8_SOURCE_ID||question?.sourceNodeId!==G5A_U10A1_P05F8_SOURCE_ID) errors.push("P05F8_SOURCE_INVALID");
  if (question?.knowledgePointId!==G5A_U10A1_P05F8_KP_ID||question?.patternGroupId!==G5A_U10A1_P05F8_GROUP_ID) errors.push("P05F8_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F8_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="cube_cuboid_elements_diagram") errors.push("P05F8_DIAGRAM_MISSING");
  else {
    if (!PROFILE_INDEXES.includes(d.profileIndex)||!SCALES.includes(d.scale)||!X_SHIFTS.includes(d.shiftX)||!Number.isInteger(d.highlightIndex)||d.highlightIndex<0||d.highlightIndex>7) errors.push("P05F8_DIAGRAM_GEOMETRY_INVALID");
    if (!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode) errors.push("P05F8_DIAGRAM_MODE_INVALID");
    if (!SOLID_TYPES.includes(d.solidType)) errors.push("P05F8_SOLID_TYPE_INVALID");
    if (!ELEMENT_TYPES.includes(d.targetElement)) errors.push("P05F8_TARGET_ELEMENT_INVALID");
    if (d.faceCount!==6||d.edgeCount!==12||d.vertexCount!==8) errors.push("P05F8_FIXED_ELEMENT_COUNT_INVALID");
    if (SOLID_TYPES.includes(d.solidType) && (d.allEdgesEqual!==(d.solidType==="CUBE")||d.allFacesSquares!==(d.solidType==="CUBE"))) errors.push("P05F8_CUBE_CUBOID_STRUCTURE_INVALID");
    if (spec) {
      const expectedRow={solidType:d.solidType,targetElement:d.targetElement};
      if (question?.promptText!==promptFor(spec,expectedRow)) errors.push("P05F8_PROMPT_INVALID");
      if (question?.answerText!==answerFor(spec,expectedRow)) errors.push("P05F8_ANSWER_INVALID");
    }
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F8_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F8_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (!Array.isArray(metadata?.sourcePages)||metadata.sourcePages.join(",")!=="1,2"||metadata?.applicationContextUsed!==false||metadata?.faceRelationshipUsed!==false||metadata?.netUsed!==false||metadata?.edgeLengthRelationUsed!==false||metadata?.broaderSpatialReasoningUsed!==false||metadata?.solidMeasurementOrFormulaUsed!==false) errors.push("P05F8_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG5AU10A1P05F8Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G5A_U10A1_P05F8_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F8_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F8_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f8-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG5AU10A1P05F8Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F8_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G5A_U10A1_P05F8_MAX_QUESTION_COUNT});
}
