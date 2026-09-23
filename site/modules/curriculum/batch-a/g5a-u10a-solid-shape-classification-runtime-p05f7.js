import {
  G5A_U10A_P05F7_GROUP_ID,
  G5A_U10A_P05F7_KP_ID,
  G5A_U10A_P05F7_PATTERN_SPECS,
  G5A_U10A_P05F7_SOURCE_ID,
  G5A_U10A_P05F7_SPEC_IDS,
} from "../registry/g5a-u10a-solid-shape-classification-selector-projection-p05f7.js";

export const G5A_U10A_P05F7_MAX_QUESTION_COUNT = 240;
export const G5A_U10A_P05F7_SHARED_RUNTIME_SCOPE = "SHARED_RUNTIME_BOUNDED";
const PROFILE_INDEXES = Object.freeze([0,1,2,3,4,5,6,7,8,9]);
const SCALES = Object.freeze([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const X_SHIFTS = Object.freeze([-12,0,12]);
const SOLID_FAMILIES = Object.freeze(["COLUMN","CONE","SPHERE"]);
const DIAGRAM_MODES = Object.freeze(["CLASSIFY_BY_FEATURES","COLUMN_CONE_SPHERE_CHOICE","DEFINING_FEATURES"]);
const FORBIDDEN_LEARNER_TERMS = Object.freeze(["幾個面","幾條稜","幾個頂點","展開圖","截面","視圖","正方體","長方體","體積","表面積","公式","應用題"]);
const SPEC_BY_ID = new Map(G5A_U10A_P05F7_PATTERN_SPECS.map((row) => [row.patternSpecId,row]));

function hashSeed(seed="p05f7") { let hash=2166136261; for (const ch of String(seed)) { hash^=ch.codePointAt(0); hash=Math.imul(hash,16777619); } return hash>>>0; }
function variantFromIndex(index, canonicalSpecIndex, seed) {
  const offset=(hashSeed(seed)+canonicalSpecIndex*79)%240;
  const variant=(offset+index)%240;
  const profileIndex=PROFILE_INDEXES[variant%PROFILE_INDEXES.length];
  const scaleIndex=Math.floor(variant/PROFILE_INDEXES.length)%SCALES.length;
  const shiftIndex=Math.floor(variant/(PROFILE_INDEXES.length*SCALES.length))%X_SHIFTS.length;
  const solidFamily=SOLID_FAMILIES[(index+canonicalSpecIndex)%SOLID_FAMILIES.length];
  return Object.freeze({variant,profileIndex,scale:SCALES[scaleIndex],shiftX:X_SHIFTS[shiftIndex],solidFamily});
}
function promptFor(spec) {
  if (spec.relation==="CLASSIFY_SOLIDS_BY_BASE_SIDE_VERTEX_FEATURES") return "觀察立體圖形，依底面、側面與頂點特徵判斷，它屬於哪一類？";
  if (spec.relation==="DISTINGUISH_COLUMN_CONE_SPHERE") return "觀察立體圖形，它是柱體、錐體還是球？";
  return "觀察圖中的底面、側面與頂點特徵，最符合哪一類立體？";
}
function answerForFamily(solidFamily) {
  if (solidFamily==="COLUMN") return "柱體";
  if (solidFamily==="CONE") return "錐體";
  return "球";
}
function featuresForFamily(solidFamily) {
  if (solidFamily==="COLUMN") return Object.freeze({hasTwoCongruentParallelBases:true,convergesToSingleApex:false,hasPlaneBase:true});
  if (solidFamily==="CONE") return Object.freeze({hasTwoCongruentParallelBases:false,convergesToSingleApex:true,hasPlaneBase:true});
  return Object.freeze({hasTwoCongruentParallelBases:false,convergesToSingleApex:false,hasPlaneBase:false});
}
function diagramFor(spec, variantRow) {
  return Object.freeze({
    kind:"solid_shape_classification_diagram",
    profileIndex:variantRow.profileIndex,
    scale:variantRow.scale,
    shiftX:variantRow.shiftX,
    diagramMode:spec.diagramMode,
    solidFamily:variantRow.solidFamily,
    ...featuresForFamily(variantRow.solidFamily),
  });
}
function signatureFor(question) {
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.profileIndex,d.scale,d.shiftX,d.diagramMode,d.solidFamily,d.hasTwoCongruentParallelBases,d.convergesToSingleApex,d.hasPlaneBase].join("|");
}
function selectedSpecs(patternSpecIds) {
  if (!Array.isArray(patternSpecIds)||patternSpecIds.length===0) return [...G5A_U10A_P05F7_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if (unique.some((id)=>!SPEC_BY_ID.has(id))) return null;
  return unique.map((id)=>SPEC_BY_ID.get(id));
}
function questionFor(spec, sequenceIndex, generationSeed) {
  const canonicalSpecIndex=G5A_U10A_P05F7_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec);
  const answerText=answerForFamily(variant.solidFamily);
  const question={
    id:`p05f7-q007-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidFamily.toLowerCase()}`,
    generatedItemId:`p05f7-q007-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidFamily.toLowerCase()}`,
    sourceId:G5A_U10A_P05F7_SOURCE_ID,
    sourceNodeId:G5A_U10A_P05F7_SOURCE_ID,
    knowledgePointId:G5A_U10A_P05F7_KP_ID,
    patternGroupId:G5A_U10A_P05F7_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice007Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F7_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sourcePanel:"SOLID_SHAPE_CLASSIFICATION",
      sharedRuntimeScope:G5A_U10A_P05F7_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      applicationContextUsed:false,
      solidElementsNamingOrCountUsed:false,
      solidNetCorrespondenceUsed:false,
      solidCrossSectionUsed:false,
      solidViewpointRepresentationUsed:false,
      cubeCuboidSpecialCaseReasoningUsed:false,
      solidMeasurementOrFormulaUsed:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG5AU10AP05F7Question(question) {
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F7_PATTERN_SPEC_INVALID");
  if (question?.sourceId!==G5A_U10A_P05F7_SOURCE_ID||question?.sourceNodeId!==G5A_U10A_P05F7_SOURCE_ID) errors.push("P05F7_SOURCE_INVALID");
  if (question?.knowledgePointId!==G5A_U10A_P05F7_KP_ID||question?.patternGroupId!==G5A_U10A_P05F7_GROUP_ID) errors.push("P05F7_KP_OR_GROUP_INVALID");
  if (question?.questionMode!=="diagram"||question?.mode!=="diagram") errors.push("P05F7_MODE_INVALID");
  const d=question?.geometryDiagram;
  if (!d||d.kind!=="solid_shape_classification_diagram") errors.push("P05F7_DIAGRAM_MISSING");
  else {
    if (!PROFILE_INDEXES.includes(d.profileIndex)||!SCALES.includes(d.scale)||!X_SHIFTS.includes(d.shiftX)) errors.push("P05F7_DIAGRAM_GEOMETRY_INVALID");
    if (!DIAGRAM_MODES.includes(d.diagramMode)||spec?.diagramMode!==d.diagramMode) errors.push("P05F7_DIAGRAM_MODE_INVALID");
    if (!SOLID_FAMILIES.includes(d.solidFamily)) errors.push("P05F7_SOLID_FAMILY_INVALID");
    else {
      const expected=featuresForFamily(d.solidFamily);
      if (d.hasTwoCongruentParallelBases!==expected.hasTwoCongruentParallelBases||d.convergesToSingleApex!==expected.convergesToSingleApex||d.hasPlaneBase!==expected.hasPlaneBase) errors.push("P05F7_SOLID_FEATURE_INVARIANT_INVALID");
      if (question?.answerText!==answerForFamily(d.solidFamily)) errors.push("P05F7_ANSWER_INVALID");
    }
    if (spec&&question?.promptText!==promptFor(spec)) errors.push("P05F7_PROMPT_INVALID");
    if (question?.questionSignature!==signatureFor(question)) errors.push("P05F7_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for (const term of FORBIDDEN_LEARNER_TERMS) if (learnerText.includes(term)) errors.push(`P05F7_FORBIDDEN_LEARNER_TERM:${term}`);
  const metadata=question?.metadata;
  if (!Array.isArray(metadata?.sourcePages)||metadata.sourcePages.join(",")!=="1,2"||metadata?.applicationContextUsed!==false||metadata?.solidElementsNamingOrCountUsed!==false||metadata?.solidNetCorrespondenceUsed!==false||metadata?.solidCrossSectionUsed!==false||metadata?.solidViewpointRepresentationUsed!==false||metadata?.cubeCuboidSpecialCaseReasoningUsed!==false||metadata?.solidMeasurementOrFormulaUsed!==false) errors.push("P05F7_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function generateG5AU10AP05F7Questions(options={}) {
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if (count<1||count>G5A_U10A_P05F7_MAX_QUESTION_COUNT) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F7_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if (!specs||specs.length===0) return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F7_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map((row)=>[row.patternSpecId,0]));
  const questions=[];
  for (let index=0;index<count;index+=1) {
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpecSequence.get(spec.patternSpecId);
    perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f7-public"));
  }
  const validationErrors=questions.flatMap((question)=>validateG5AU10AP05F7Question(question).errors);
  const signatures=questions.map((question)=>question.questionSignature);
  if (new Set(signatures).size!==signatures.length) validationErrors.push("P05F7_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map((spec)=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter((q)=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G5A_U10A_P05F7_MAX_QUESTION_COUNT});
}
