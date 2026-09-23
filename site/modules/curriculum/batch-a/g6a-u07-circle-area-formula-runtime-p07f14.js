import {
  G6A_U07_P07F14_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P07F14_FORMAL_MAPPING as MAPPING,
  G6A_U07_P07F14_KP_ID as KP,
  G6A_U07_P07F14_PATTERN_GROUP as GROUP,
  G6A_U07_P07F14_PATTERN_SPECS as SPECS,
  G6A_U07_P07F14_SOURCE_ID as SRC,
  G6A_U07_P07F14_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u07-circle-area-formula-selector-projection-p07f14.js";

export const G6A_U07_P07F14_MAX_QUESTION_COUNT=240;
export const G6A_U07_P07F14_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const VISUAL_RADII=Object.freeze([32,34,36,38,40,42,44,46,48,50]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(Number(n).toFixed(2));
function radiusForVariant(u){if(u===0)return 18;if(u<=17)return u;return u+1;}
function geometry(u,targetPart){return Object.freeze({kind:"circle_parts_diagram",radius:VISUAL_RADII[u%VISUAL_RADII.length],rotationDeg:ROTATIONS[Math.floor(u/VISUAL_RADII.length)%ROTATIONS.length],targetPart,markerMode:targetPart==="DIAMETER"?"HIGHLIGHT_DIAMETER":"HIGHLIGHT_RADIUS",markerLabel:null,isDiameter:null});}
function payload(spec,v){
  const u=mod(v,240),radius=radiusForVariant(u),diameter=radius*2,area=fmt(3.14*radius*radius);
  if(spec.targetKind==="FROM_RADIUS"){
    return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,radius,diameter,approximatePiValue:3.14,area,formula:"A = π × r²",radiusSquared:radius*radius,diameterNormalizedToRadius:false,positiveRadius:radius>0,sourceParameterCarrier:radius===18?"SOURCE_PAGE1_RADIUS_18_PARAMETER_ONLY":"CONTROLLED_FORMULA_VARIANT",geometryDiagram:geometry(u,"RADIUS"),promptText:"圖中圓的半徑是 "+radius+" 公分。取圓周率 3.14，用 A = π × r² 求圓面積。",answer:area,answerText:String(area)});
  }
  if(spec.targetKind==="FROM_DIAMETER"){
    return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,radius,diameter,approximatePiValue:3.14,area,formula:"A = π × r²",radiusSquared:radius*radius,diameterNormalizedToRadius:true,positiveRadius:radius>0,sourceParameterCarrier:diameter===4?"SOURCE_PAGE1_DIAMETER_4_PARAMETER_ONLY":"CONTROLLED_FORMULA_VARIANT",geometryDiagram:geometry(u,"DIAMETER"),promptText:"圖中圓的直徑是 "+diameter+" 公分。先把直徑除以 2 求半徑，再取圓周率 3.14，用 A = π × r² 求圓面積。",answer:area,answerText:String(area)});
  }
  const factor=2+(u%8),areaFactor=factor*factor;
  return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,radius,diameter,approximatePiValue:3.14,area,formula:"A = π × r²",radiusSquared:radius*radius,scaleFactor:factor,areaScaleFactor:areaFactor,diameterNormalizedToRadius:false,positiveRadius:radius>0,sourceParameterCarrier:"CONTROLLED_FORMULA_VARIANT",geometryDiagram:geometry(u,"RADIUS"),promptText:"一個圓的半徑是 "+radius+" 公分。若半徑變成原來的 "+factor+" 倍，根據 A = π × r²，圓面積會變成原來的幾倍？",answer:areaFactor,answerText:String(areaFactor)});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6AU07P07F14Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f14-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p07f14-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,
    questionMode:"diagram",mode:"diagram",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,answerValue:p.answer,geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f14-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice014Implementation",
      authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,
      sharedRuntimeScope:G6A_U07_P07F14_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,
      q011CircleAreaDerivationPrerequisiteRequired:true,circleAreaFormulaOwned:true,radiusSquaredValidated:true,positiveRadiusValidated:true,
      diameterToRadiusNormalizationUsed:spec.targetKind==="FROM_DIAMETER",radiusSquaredScalingUsed:spec.targetKind==="RADIUS_SQUARED_SCALING",
      q011DerivationTeachingReowned:false,sectorAreaReowned:false,annulusAreaReowned:false,compositeCircleAreaReowned:false,circularSegmentAreaReowned:false,
      cowGrazingApplicationUsed:false,semicirclePerimeterTeachingReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q015OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}

export function validateG6AU07P07F14Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isFinite(n))e.push("P07F14_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-Number(q?.patternRepresentation?.answer))>1e-9)e.push("P07F14_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}

export function validateG6AU07P07F14Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F14_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F14_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F14_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F14_MODE_INVALID");
  const p=q?.patternRepresentation,d=q?.geometryDiagram;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F14_REPRESENTATION_INVALID");
  if(!d||d.kind!=="circle_parts_diagram"||!["RADIUS","DIAMETER"].includes(d.targetPart)||!["HIGHLIGHT_RADIUS","HIGHLIGHT_DIAMETER"].includes(d.markerMode)||d.markerLabel!==null||d.isDiameter!==null||!VISUAL_RADII.includes(d.radius)||!ROTATIONS.includes(d.rotationDeg))e.push("P07F14_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F14_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==Number(expected.answer)||q.questionSignature!==signature(q))e.push("P07F14_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.radius)||p.radius<=0||p.diameter!==2*p.radius||!p.positiveRadius||p.radiusSquared!==p.radius*p.radius||p.approximatePiValue!==3.14||p.formula!=="A = π × r²")e.push("P07F14_RADIUS_FORMULA_INVARIANT_INVALID");
    if(p.targetKind==="FROM_RADIUS"&&Math.abs(p.area-3.14*p.radius*p.radius)>1e-9)e.push("P07F14_RADIUS_AREA_INVALID");
    if(p.targetKind==="FROM_DIAMETER"&&(!p.diameterNormalizedToRadius||Math.abs(p.area-3.14*Math.pow(p.diameter/2,2))>1e-9))e.push("P07F14_DIAMETER_NORMALIZATION_INVALID");
    if(p.targetKind==="RADIUS_SQUARED_SCALING"&&(!Number.isInteger(p.scaleFactor)||p.scaleFactor<2||p.areaScaleFactor!==p.scaleFactor*p.scaleFactor||p.answer!==p.areaScaleFactor))e.push("P07F14_RADIUS_SQUARED_SCALING_INVALID");
    if(!validateG6AU07P07F14Answer(q,q.answerValue).ok)e.push("P07F14_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.q011CircleAreaDerivationPrerequisiteRequired||!m.circleAreaFormulaOwned||!m.radiusSquaredValidated||!m.positiveRadiusValidated||m.q011DerivationTeachingReowned||m.sectorAreaReowned||m.annulusAreaReowned||m.compositeCircleAreaReowned||m.circularSegmentAreaReowned||m.cowGrazingApplicationUsed||m.semicirclePerimeterTeachingReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q015OrLaterTouched||m.r04Reclassified)e.push("P07F14_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["扇形面積","圓環","牛吃草","半圓周長","剪拼","重新組合"])if(learner.includes(term))e.push("P07F14_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}

export function generateG6AU07P07F14Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F14_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F14_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F14_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f14-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;
    questions.push(buildG6AU07P07F14Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU07P07F14Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F14_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
