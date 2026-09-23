import {
  G5A_U10A_P05F17_GROUP_ID,
  G5A_U10A_P05F17_KP_ID,
  G5A_U10A_P05F17_PATTERN_SPECS,
  G5A_U10A_P05F17_SOURCE_ID,
  G5A_U10A_P05F17_SPEC_IDS,
} from "../registry/g5a-u10a-prism-pyramid-elements-selector-projection-p05f17.js";

export const G5A_U10A_P05F17_MAX_QUESTION_COUNT=240;
export const G5A_U10A_P05F17_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const SOLID_KINDS=Object.freeze(["PRISM","PYRAMID"]);
const BASE_SIDES=Object.freeze([3,4,5,6,7,8,9,10]);
const DEPTHS=Object.freeze([20,22,24,26,28]);
const X_SHIFTS=Object.freeze([-10,0,10]);
const TASK_MODES=Object.freeze(["IDENTIFY_BASE","IDENTIFY_SIDE_FACE","IDENTIFY_EDGE","IDENTIFY_VERTEX","COUNT_FACES","COUNT_EDGES","COUNT_VERTICES"]);
const FOCUS_ELEMENTS=Object.freeze(["BASE_FACE","SIDE_FACE","EDGE","VERTEX","NONE"]);
const FORBIDDEN_LEARNER_TERMS=Object.freeze(["展開圖","截面","視圖","體積","表面積","應用題","圓柱","圓錐","球"]);
const SPEC_BY_ID=new Map(G5A_U10A_P05F17_PATTERN_SPECS.map(row=>[row.patternSpecId,row]));

function hashSeed(seed="p05f17"){let hash=2166136261;for(const ch of String(seed)){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function variantFromIndex(index,canonicalSpecIndex,seed){
  const offset=(hashSeed(seed)+canonicalSpecIndex*53)%240;
  const variant=(offset+index)%240;
  return Object.freeze({
    variant,
    solidKind:SOLID_KINDS[Math.floor(variant/8)%SOLID_KINDS.length],
    baseSides:BASE_SIDES[variant%BASE_SIDES.length],
    rotationDeg:(variant*17)%360,
    depth:DEPTHS[Math.floor(variant/16)%DEPTHS.length],
    shiftX:X_SHIFTS[Math.floor(variant/80)%X_SHIFTS.length],
  });
}
function countsFor(solidKind,baseSides){
  if(solidKind==="PRISM")return Object.freeze({faceCount:baseSides+2,edgeCount:baseSides*3,vertexCount:baseSides*2});
  return Object.freeze({faceCount:baseSides+1,edgeCount:baseSides*2,vertexCount:baseSides+1});
}
function solidLabel(solidKind,baseSides){return `${baseSides}角${solidKind==="PRISM"?"柱":"錐"}`;}
function promptFor(spec,variant){
  const label=solidLabel(variant.solidKind,variant.baseSides);
  if(spec.taskMode==="IDENTIFY_BASE")return `觀察圖形。圖中著色的面是這個${label}的哪一種面？`;
  if(spec.taskMode==="IDENTIFY_SIDE_FACE")return `觀察圖形。圖中著色的面是這個${label}的哪一種面？`;
  if(spec.taskMode==="IDENTIFY_EDGE")return `觀察圖形。圖中加粗的線段是這個${label}的哪一種構成要素？`;
  if(spec.taskMode==="IDENTIFY_VERTEX")return `觀察圖形。圖中標記的點是這個${label}的哪一種構成要素？`;
  if(spec.taskMode==="COUNT_FACES")return `觀察圖形。這個${label}共有幾個面？`;
  if(spec.taskMode==="COUNT_EDGES")return `觀察圖形。這個${label}共有幾條稜？`;
  return `觀察圖形。這個${label}共有幾個頂點？`;
}
function answerFor(spec,counts){
  if(spec.taskMode==="IDENTIFY_BASE")return "底面";
  if(spec.taskMode==="IDENTIFY_SIDE_FACE")return "側面";
  if(spec.taskMode==="IDENTIFY_EDGE")return "稜";
  if(spec.taskMode==="IDENTIFY_VERTEX")return "頂點";
  if(spec.taskMode==="COUNT_FACES")return `${counts.faceCount} 個`;
  if(spec.taskMode==="COUNT_EDGES")return `${counts.edgeCount} 條`;
  return `${counts.vertexCount} 個`;
}
function diagramFor(spec,variant,counts){
  return Object.freeze({
    kind:"prism_pyramid_elements_diagram",
    variant:variant.variant,
    solidKind:variant.solidKind,
    baseSides:variant.baseSides,
    rotationDeg:variant.rotationDeg,
    depth:variant.depth,
    shiftX:variant.shiftX,
    taskMode:spec.taskMode,
    focusElement:spec.focusElement,
    faceCount:counts.faceCount,
    edgeCount:counts.edgeCount,
    vertexCount:counts.vertexCount,
  });
}
function signatureFor(question){
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.variant,d.solidKind,d.baseSides,d.rotationDeg,d.depth,d.shiftX,d.taskMode,d.focusElement,d.faceCount,d.edgeCount,d.vertexCount].join("|");
}
function selectedSpecs(patternSpecIds){
  if(!Array.isArray(patternSpecIds)||patternSpecIds.length===0)return [...G5A_U10A_P05F17_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if(unique.some(id=>!SPEC_BY_ID.has(id)))return null;
  return unique.map(id=>SPEC_BY_ID.get(id));
}
function questionFor(spec,sequenceIndex,generationSeed){
  const canonicalSpecIndex=G5A_U10A_P05F17_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantFromIndex(sequenceIndex,canonicalSpecIndex,generationSeed);
  const counts=countsFor(variant.solidKind,variant.baseSides);
  const geometryDiagram=diagramFor(spec,variant,counts);
  const promptText=promptFor(spec,variant),answerText=answerFor(spec,counts);
  const question={
    id:`p05f17-q017-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidKind.toLowerCase()}-${variant.baseSides}`,
    generatedItemId:`p05f17-q017-${canonicalSpecIndex+1}-${variant.variant+1}-${variant.solidKind.toLowerCase()}-${variant.baseSides}`,
    sourceId:G5A_U10A_P05F17_SOURCE_ID,
    sourceNodeId:G5A_U10A_P05F17_SOURCE_ID,
    knowledgePointId:G5A_U10A_P05F17_KP_ID,
    patternGroupId:G5A_U10A_P05F17_GROUP_ID,
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
      taskId:"P05F_W5DirectProductVerticalSlice017Implementation",
      authority:"R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_P05F17_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sourcePanel:"PRISM_PYRAMID_POINT_LINE_FACE_AND_COUNT_FORMULA",
      sharedRuntimeScope:G5A_U10A_P05F17_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant.variant,
      basePolygonSides:variant.baseSides,
      prismPyramidElementSemanticsUsed:true,
      structuralElementCountUsed:spec.relation==="RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON",
      q007SourceUnitOwnershipTouched:false,
      solidShapeClassificationUsed:false,
      solidNetCorrespondenceUsed:false,
      solidCrossSectionUsed:false,
      solidViewpointRepresentationUsed:false,
      applicationContextUsed:false,
      geometryFormulaOrMeasurementUsed:false,
      q018OrLaterTouched:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}

export function validateG5AU10AP05F17Question(question){
  const errors=[],spec=SPEC_BY_ID.get(question?.patternSpecId);
  if(!spec)errors.push("P05F17_PATTERN_SPEC_INVALID");
  if(question?.sourceId!==G5A_U10A_P05F17_SOURCE_ID||question?.sourceNodeId!==G5A_U10A_P05F17_SOURCE_ID)errors.push("P05F17_SOURCE_INVALID");
  if(question?.knowledgePointId!==G5A_U10A_P05F17_KP_ID||question?.patternGroupId!==G5A_U10A_P05F17_GROUP_ID)errors.push("P05F17_KP_OR_GROUP_INVALID");
  if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F17_MODE_INVALID");
  const d=question?.geometryDiagram;
  if(!d||d.kind!=="prism_pyramid_elements_diagram")errors.push("P05F17_DIAGRAM_MISSING");
  else{
    if(!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!SOLID_KINDS.includes(d.solidKind)||!BASE_SIDES.includes(d.baseSides)||!Number.isFinite(d.rotationDeg)||d.rotationDeg<0||d.rotationDeg>=360||!DEPTHS.includes(d.depth)||!X_SHIFTS.includes(d.shiftX))errors.push("P05F17_DIAGRAM_GEOMETRY_INVALID");
    if(!TASK_MODES.includes(d.taskMode)||!FOCUS_ELEMENTS.includes(d.focusElement)||spec?.taskMode!==d.taskMode||spec?.focusElement!==d.focusElement)errors.push("P05F17_DIAGRAM_TASK_INVALID");
    if(SOLID_KINDS.includes(d.solidKind)&&BASE_SIDES.includes(d.baseSides)){
      const counts=countsFor(d.solidKind,d.baseSides);
      if(d.faceCount!==counts.faceCount||d.edgeCount!==counts.edgeCount||d.vertexCount!==counts.vertexCount)errors.push("P05F17_ELEMENT_COUNT_INVARIANT_INVALID");
      if(spec&&question?.answerText!==answerFor(spec,counts))errors.push("P05F17_ANSWER_INVALID");
      const expectedVariant={solidKind:d.solidKind,baseSides:d.baseSides};
      if(spec&&question?.promptText!==promptFor(spec,expectedVariant))errors.push("P05F17_PROMPT_INVALID");
    }
    if(question?.questionSignature!==signatureFor(question))errors.push("P05F17_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for(const term of FORBIDDEN_LEARNER_TERMS)if(learnerText.includes(term))errors.push(`P05F17_FORBIDDEN_LEARNER_TERM:${term}`);
  const m=question?.metadata;
  if(!Array.isArray(m?.sourcePages)||m.sourcePages.join(",")!=="1,2"||m?.prismPyramidElementSemanticsUsed!==true||m?.q007SourceUnitOwnershipTouched!==false||m?.solidShapeClassificationUsed!==false||m?.solidNetCorrespondenceUsed!==false||m?.solidCrossSectionUsed!==false||m?.solidViewpointRepresentationUsed!==false||m?.applicationContextUsed!==false||m?.geometryFormulaOrMeasurementUsed!==false||m?.q018OrLaterTouched!==false)errors.push("P05F17_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
export function generateG5AU10AP05F17Questions(options={}){
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if(count<1||count>G5A_U10A_P05F17_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F17_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if(!specs||specs.length===0)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F17_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpecSequence=new Map(specs.map(row=>[row.patternSpecId,0])),questions=[];
  for(let index=0;index<count;index+=1){const spec=specs[index%specs.length],sequenceIndex=perSpecSequence.get(spec.patternSpecId);perSpecSequence.set(spec.patternSpecId,sequenceIndex+1);questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f17-public"));}
  const validationErrors=questions.flatMap(q=>validateG5AU10AP05F17Question(q).errors),signatures=questions.map(q=>q.questionSignature);
  if(new Set(signatures).size!==signatures.length)validationErrors.push("P05F17_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=specs.map(spec=>Object.freeze({patternSpecId:spec.patternSpecId,count:questions.filter(q=>q.patternSpecId===spec.patternSpecId).length}));
  return Object.freeze({ok:validationErrors.length===0,questions:Object.freeze(questions),errors:Object.freeze(validationErrors),warnings:Object.freeze([]),allocation:Object.freeze(allocation),maxQuestionCount:G5A_U10A_P05F17_MAX_QUESTION_COUNT});
}
