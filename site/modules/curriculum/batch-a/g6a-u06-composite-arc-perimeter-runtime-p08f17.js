import {
  G6A_U06_P08F17_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U06_P08F17_FORMAL_MAPPING as MAPPING,
  G6A_U06_P08F17_KP_ID as KP,
  G6A_U06_P08F17_PATTERN_GROUP as GROUP,
  G6A_U06_P08F17_PATTERN_SPECS as SPECS,
  G6A_U06_P08F17_SOURCE_ID as SRC,
  G6A_U06_P08F17_SPEC_IDS as SPEC_IDS,
  P08F17_TASK_ID
} from "../registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js";

export const G6A_U06_P08F17_MAX_QUESTION_COUNT=240;
export const G6A_U06_P08F17_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const ANGLES=Object.freeze([60,90,120]);
const ORIENTATIONS=Object.freeze(["上、右","右、下","下、左","左、上"]);
const mod=(n,m)=>((n%m)+m)%m;
const fmt=n=>Number(Number(n).toFixed(2));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}

function makeDiagram(shapeMode,p){
  return Object.freeze({
    kind:"composite_arc_perimeter_diagram",
    representationVariant:shapeMode,
    semanticRole:"COMPOSITE_ARC_PERIMETER",
    externalBoundaryOnly:true,
    internalSharedEdgesExcluded:true,
    visualContractVersion:"P08F17_R2",
    externalArcCount:(p.boundaryParts??[]).filter(x=>x.kind==="arc").length,
    sharedDiameterCount:(p.omittedInternalParts??[]).length,
    proportionalGeometryRequired:shapeMode==="STADIUM"||shapeMode==="RECT_SEMICIRCLE",
    answerKeyCompact:false,
    radius:p.radius??null,
    diameter:p.diameter??null,
    centralAngleDeg:p.centralAngleDeg??null,
    straightLength:p.straightLength??null,
    height:p.height??null,
    sideLength:p.sideLength??null,
    orientationQuarterTurns:p.orientationQuarterTurns??0,
    orientationLabel:p.orientationLabel??null,
    boundaryParts:Object.freeze((p.boundaryParts??[]).map(x=>Object.freeze({...x}))),
    omittedInternalParts:Object.freeze((p.omittedInternalParts??[]).map(x=>Object.freeze({...x})))
  });
}
function sectorPayload(u){
  const angle=ANGLES[u%ANGLES.length],radius=5+Math.floor(u/ANGLES.length),arcLength=fmt(2*3.14*radius*angle/360),straightTotal=2*radius,totalPerimeter=fmt(arcLength+straightTotal);
  const boundaryParts=[
    {kind:"arc",label:"弧 AB",radius,centralAngleDeg:angle,length:arcLength},
    {kind:"straight",label:"OA",length:radius},
    {kind:"straight",label:"OB",length:radius}
  ];
  const promptText="圖中扇形的外部邊界由弧 AB、OA、OB 組成。半徑是 "+radius+" 公分，圓心角是 "+angle+"°，圓周率取 3.14。只計外部邊界，求周長。";
  return {shapeMode:"SECTOR",radius,diameter:2*radius,centralAngleDeg:angle,arcLength,straightTotal,totalPerimeter,boundaryParts,omittedInternalParts:[],promptText};
}
function stadiumPayload(u){
  const radius=2+(u%30),straightLength=5+Math.floor(u/30),arcLength=fmt(2*3.14*radius),straightTotal=2*straightLength,totalPerimeter=fmt(arcLength+straightTotal);
  const boundaryParts=[
    {kind:"straight",label:"上方直線",length:straightLength},
    {kind:"arc",label:"右半圓弧",radius,centralAngleDeg:180,length:fmt(3.14*radius)},
    {kind:"straight",label:"下方直線",length:straightLength},
    {kind:"arc",label:"左半圓弧",radius,centralAngleDeg:180,length:fmt(3.14*radius)}
  ];
  const promptText="跑道形外框由兩段長 "+straightLength+" 公分的直線和兩個半徑 "+radius+" 公分的半圓弧組成。圓周率取 3.14，只計外部邊界，求周長。";
  return {shapeMode:"STADIUM",radius,diameter:2*radius,centralAngleDeg:180,straightLength,arcLength,straightTotal,totalPerimeter,boundaryParts,omittedInternalParts:[],promptText};
}
function rectSemicirclePayload(u){
  const radius=2+(u%20),height=3+Math.floor(u/20),width=2*radius,arcLength=fmt(3.14*radius),straightTotal=width+2*height,totalPerimeter=fmt(arcLength+straightTotal);
  const boundaryParts=[
    {kind:"straight",label:"底邊",length:width},
    {kind:"straight",label:"左邊",length:height},
    {kind:"arc",label:"上方半圓弧",radius,centralAngleDeg:180,length:arcLength},
    {kind:"straight",label:"右邊",length:height}
  ];
  const omittedInternalParts=[{kind:"straight",label:"半圓直徑與長方形共用邊",length:width}];
  const promptText="一個長方形上方接一個半圓，半圓直徑和長方形上邊重合。半圓半徑是 "+radius+" 公分，長方形高 "+height+" 公分。圓周率取 3.14，共用邊不算外部邊界，求整個圖形的周長。";
  return {shapeMode:"RECT_SEMICIRCLE",radius,diameter:width,height,arcLength,straightTotal,totalPerimeter,boundaryParts,omittedInternalParts,promptText};
}
function doubleBumpPayload(u){
  const sideLength=4+Math.floor(u/4),orientationQuarterTurns=u%4,orientationLabel=ORIENTATIONS[orientationQuarterTurns],radius=sideLength/2,eachArc=fmt(3.14*radius),arcLength=fmt(eachArc*2),straightTotal=2*sideLength,totalPerimeter=fmt(arcLength+straightTotal);
  const boundaryParts=[
    {kind:"arc",label:"外凸半圓弧 1",radius,centralAngleDeg:180,length:eachArc},
    {kind:"arc",label:"外凸半圓弧 2",radius,centralAngleDeg:180,length:eachArc},
    {kind:"straight",label:"保留直邊 1",length:sideLength},
    {kind:"straight",label:"保留直邊 2",length:sideLength}
  ];
  const omittedInternalParts=[
    {kind:"straight",label:"半圓直徑共用邊 1",length:sideLength},
    {kind:"straight",label:"半圓直徑共用邊 2",length:sideLength}
  ];
  const promptText="正方形邊長 "+sideLength+" 公分，在"+orientationLabel+"兩邊各向外接一個直徑等於邊長的半圓。圓周率取 3.14。兩條半圓直徑是共用邊，不列入外部邊界；把外部邊界拆成兩段直線與兩段半圓弧，求總周長。";
  return {shapeMode:"DOUBLE_BUMP",radius,diameter:sideLength,sideLength,orientationQuarterTurns,orientationLabel,arcLength,straightTotal,totalPerimeter,boundaryParts,omittedInternalParts,promptText};
}
function payload(spec,v){
  const u=mod(v,240);
  const base=spec.shapeMode==="SECTOR"?sectorPayload(u):spec.shapeMode==="STADIUM"?stadiumPayload(u):spec.shapeMode==="RECT_SEMICIRCLE"?rectSemicirclePayload(u):doubleBumpPayload(u);
  const geometryDiagram=makeDiagram(spec.shapeMode,base);
  return Object.freeze({
    variant:u,
    promptMode:spec.promptMode,
    shapeMode:spec.shapeMode,
    semanticCore:MAPPING.semanticCore,
    approximatePiValue:3.14,
    externalBoundaryOnly:true,
    internalSharedEdgesExcluded:true,
    radius:base.radius??null,
    diameter:base.diameter??null,
    centralAngleDeg:base.centralAngleDeg??null,
    straightLength:base.straightLength??null,
    height:base.height??null,
    sideLength:base.sideLength??null,
    orientationQuarterTurns:base.orientationQuarterTurns??0,
    orientationLabel:base.orientationLabel??null,
    arcLength:base.arcLength,
    straightTotal:base.straightTotal,
    totalPerimeter:base.totalPerimeter,
    boundaryParts:Object.freeze(base.boundaryParts.map(x=>Object.freeze({...x}))),
    omittedInternalParts:Object.freeze(base.omittedInternalParts.map(x=>Object.freeze({...x}))),
    boundaryReconstructionMatches:true,
    geometryDiagram,
    promptText:base.promptText,
    answer:base.totalPerimeter,
    answerText:String(base.totalPerimeter)+" 公分"
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6AU06P08F17Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p08f17-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p08f17-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,
    sourceNodeId:SRC,
    knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,
    patternSpecId,
    relation:spec.relation,
    questionMode:"diagram",
    mode:"diagram",
    promptText:p.promptText,
    prompt:p.promptText,
    blankedDisplayText:p.promptText,
    displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,
    answerValue:p.answer,
    geometryDiagram:p.geometryDiagram,
    patternRepresentation:p,
    formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p08f17-public",
    metadata:Object.freeze({
      taskId:P08F17_TASK_ID,
      authority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_COMPOSITE_ARC_BOUNDARY_CONTEXT_SECONDARY",
      sourcePages:Object.freeze([1,2]),
      sharedRuntimeScope:G6A_U06_P08F17_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_formula",
      classificationRuleId:"rule_geometry_formula",
      appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,
      geometryDomainValidatorBound:true,
      geometryDiagramRepresentationBound:true,
      geometryPropertyReasoningContractBound:true,
      compositeArcPerimeterOwned:true,
      externalBoundaryOnlyValidated:true,
      internalSharedEdgesExcluded:true,
      q004PiCircumferenceRelationTeachingReowned:false,
      q006CircleCircumferenceFormulaTeachingReowned:false,
      q010SemicirclePerimeterTeachingReowned:false,
      q015SectorArcLengthTeachingReowned:false,
      sectorAreaUsed:false,
      compositeCircleAreaUsed:false,
      genericGeometryFormulaDrillUsed:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q018OrLaterTouched:false,
      r04Reclassified:false,
      r05AssignmentMutated:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}

export function validateG6AU06P08F17Answer(q,submitted){
  const raw=String(submitted).trim().replace("公分","").trim(),n=typeof submitted==="number"?submitted:Number(raw),e=[];
  if(!Number.isFinite(n))e.push("P08F17_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-Number(q?.patternRepresentation?.totalPerimeter))>1e-9)e.push("P08F17_ANSWER_PERIMETER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU06P08F17Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P08F17_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F17_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F17_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F17_MODE_INVALID");
  const p=q?.patternRepresentation,d=q?.geometryDiagram;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F17_REPRESENTATION_INVALID");
  if(!d||d.kind!=="composite_arc_perimeter_diagram"||d.semanticRole!=="COMPOSITE_ARC_PERIMETER"||d.externalBoundaryOnly!==true||d.internalSharedEdgesExcluded!==true||d.representationVariant!==p?.shapeMode||d.visualContractVersion!=="P08F17_R2"||d.externalArcCount!==(p?.boundaryParts??[]).filter(x=>x.kind==="arc").length||d.sharedDiameterCount!==(p?.omittedInternalParts??[]).length)e.push("P08F17_DIAGRAM_INVALID");
  if(spec&&p){
    const x=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(x)||JSON.stringify(d)!==JSON.stringify(x.geometryDiagram))e.push("P08F17_PAYLOAD_INVALID");
    if(q.promptText!==x.promptText||q.answerText!==x.answerText||Number(q.answerValue)!==x.answer||q.questionSignature!==signature(q))e.push("P08F17_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.externalBoundaryOnly!==true||p.internalSharedEdgesExcluded!==true||!(p.totalPerimeter>0)||!(p.arcLength>0)||!(p.straightTotal>0)||Math.abs(fmt(p.arcLength+p.straightTotal)-p.totalPerimeter)>1e-9||p.boundaryReconstructionMatches!==true)e.push("P08F17_BOUNDARY_INVARIANT_INVALID");
    if(!Array.isArray(p.boundaryParts)||!p.boundaryParts.some(x=>x.kind==="arc")||!p.boundaryParts.some(x=>x.kind==="straight"))e.push("P08F17_BOUNDARY_PARTS_INVALID");
    if(spec.shapeMode==="SECTOR"&&![60,90,120].includes(p.centralAngleDeg))e.push("P08F17_SECTOR_VISUAL_ANGLE_INVALID");
    if((spec.shapeMode==="STADIUM"||spec.shapeMode==="RECT_SEMICIRCLE")&&d?.proportionalGeometryRequired!==true)e.push("P08F17_PROPORTIONAL_GEOMETRY_CONTRACT_INVALID");
    if(spec.shapeMode==="RECT_SEMICIRCLE"||spec.shapeMode==="DOUBLE_BUMP"){
      if(!Array.isArray(p.omittedInternalParts)||p.omittedInternalParts.length<1)e.push("P08F17_INTERNAL_EDGE_EXCLUSION_INVALID");
    }
    if(!validateG6AU06P08F17Answer(q,q.answerValue).ok)e.push("P08F17_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.geometryPropertyReasoningContractBound||!m.compositeArcPerimeterOwned||!m.externalBoundaryOnlyValidated||!m.internalSharedEdgesExcluded||m.q004PiCircumferenceRelationTeachingReowned||m.q006CircleCircumferenceFormulaTeachingReowned||m.q010SemicirclePerimeterTeachingReowned||m.q015SectorArcLengthTeachingReowned||m.sectorAreaUsed||m.compositeCircleAreaUsed||m.genericGeometryFormulaDrillUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q018OrLaterTouched||m.r04Reclassified||m.r05AssignmentMutated)e.push("P08F17_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["扇形面積","圓面積","跨單元","應用情境"])if(learner.includes(term))e.push("P08F17_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU06P08F17Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F17_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F17_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F17_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const v=(hash(o.generationSeed??"p08f17-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*61)%240;
    questions.push(buildG6AU06P08F17Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU06P08F17Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F17_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
