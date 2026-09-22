import {G6A_U06_P07F06_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F06_FORMAL_MAPPING as MAPPING,G6A_U06_P07F06_KP_ID as KP,G6A_U06_P07F06_PATTERN_GROUP as GROUP,G6A_U06_P07F06_PATTERN_SPECS as SPECS,G6A_U06_P07F06_SOURCE_ID as SRC,G6A_U06_P07F06_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u06-circle-circumference-formula-selector-projection-p07f06.js";
export const G6A_U06_P07F06_MAX_QUESTION_COUNT=240;
export const G6A_U06_P07F06_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const RADII=Object.freeze([32,34,36,38,40,42,44,46,48,50]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(n.toFixed(2));
function payload(spec,v){
  const u=mod(v,240),radius=2+u,diameter=radius*2,circumference=fmt(2*3.14*radius);
  const radiusMode=spec.targetKind==="FROM_RADIUS";
  const geometryDiagram=Object.freeze({kind:"circle_parts_diagram",radius:RADII[u%RADII.length],rotationDeg:ROTATIONS[Math.floor(u/RADII.length)%ROTATIONS.length],targetPart:radiusMode?"RADIUS":"DIAMETER",markerMode:radiusMode?"HIGHLIGHT_RADIUS":"HIGHLIGHT_DIAMETER",markerLabel:null,isDiameter:null});
  let promptText;
  if(spec.targetKind==="FROM_DIAMETER")promptText="圖中圓的直徑是 "+diameter+" 公分。取圓周率 3.14，用 C = π × d 求圓周長。";
  else if(spec.targetKind==="FROM_RADIUS")promptText="圖中圓的半徑是 "+radius+" 公分。取圓周率 3.14，用 C = 2 × π × r 求圓周長。";
  else promptText="一個圓的半徑是 "+radius+" 公分，所以直徑是 "+diameter+" 公分。取圓周率 3.14，分別用 C = π × d 和 C = 2 × π × r，兩式算出的圓周長應是多少？";
  return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:"CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA",radius,diameter,circumference,approximatePiValue:3.14,diameterEqualsTwoRadius:diameter===radius*2,diameterFormulaValue:fmt(3.14*diameter),radiusFormulaValue:fmt(2*3.14*radius),twoFormulaEquivalent:fmt(3.14*diameter)===fmt(2*3.14*radius),positiveInput:radius>0&&diameter>0,geometryDiagram,promptText,answer:circumference,answerText:String(circumference)});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU06P07F06Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f06-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f06-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f06-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice006Implementation",authority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CIRCUMFERENCE_CONTEXT_SECONDARY",r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,sharedRuntimeScope:G6A_U06_P07F06_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,q004PiRelationPrerequisiteRequired:true,multiplicationPrerequisiteRequired:true,circleCircumferenceFormulaOwned:true,diameterEqualsTwoRadiusValidated:true,twoFormulaEquivalenceValidated:true,positiveDiameterOrRadiusValidated:true,
      solveCircumferenceFromDiameterUsed:spec.targetKind==="FROM_DIAMETER"||spec.targetKind==="FORMULA_EQUIVALENCE",solveCircumferenceFromRadiusUsed:spec.targetKind==="FROM_RADIUS"||spec.targetKind==="FORMULA_EQUIVALENCE",solveDiameterFromCircumferenceUsed:false,solveRadiusFromCircumferenceUsed:false,q004PiRelationTeachingReowned:false,semicirclePerimeterReowned:false,sectorArcLengthReowned:false,compositeArcPerimeterReowned:false,rollingWheelDistanceApplicationUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q007OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU06P07F06Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isFinite(n))e.push("P07F06_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-Number(q?.patternRepresentation?.circumference))>1e-9)e.push("P07F06_ANSWER_CIRCUMFERENCE_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU06P07F06Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F06_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F06_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F06_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F06_MODE_INVALID");
  const p=q?.patternRepresentation,d=q?.geometryDiagram;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F06_REPRESENTATION_INVALID");
  if(!d||d.kind!=="circle_parts_diagram"||!["RADIUS","DIAMETER"].includes(d.targetPart)||!["HIGHLIGHT_RADIUS","HIGHLIGHT_DIAMETER"].includes(d.markerMode)||d.markerLabel!==null||d.isDiameter!==null||!RADII.includes(d.radius)||!ROTATIONS.includes(d.rotationDeg))e.push("P07F06_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F06_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==expected.answer||q.questionSignature!==signature(q))e.push("P07F06_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.radius)||!Number.isInteger(p.diameter)||p.radius<=0||p.diameter<=0||!p.diameterEqualsTwoRadius||p.diameter!==2*p.radius)e.push("P07F06_DIAMETER_RADIUS_INVARIANT_INVALID");
    if(p.diameterFormulaValue!==p.circumference||p.radiusFormulaValue!==p.circumference||!p.twoFormulaEquivalent||!p.positiveInput||p.approximatePiValue!==3.14)e.push("P07F06_FORMULA_INVARIANT_INVALID");
    if(!validateG6AU06P07F06Answer(q,q.answerValue).ok)e.push("P07F06_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.q004PiRelationPrerequisiteRequired||!m.multiplicationPrerequisiteRequired||!m.circleCircumferenceFormulaOwned||!m.diameterEqualsTwoRadiusValidated||!m.twoFormulaEquivalenceValidated||!m.positiveDiameterOrRadiusValidated||m.solveDiameterFromCircumferenceUsed||m.solveRadiusFromCircumferenceUsed||m.q004PiRelationTeachingReowned||m.semicirclePerimeterReowned||m.sectorArcLengthReowned||m.compositeArcPerimeterReowned||m.rollingWheelDistanceApplicationUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q007OrLaterTouched||m.r04Reclassified)e.push("P07F06_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["半圓","扇形","滾動","按比分配","百分率"])if(learner.includes(term))e.push("P07F06_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU06P07F06Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F06_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F06_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F06_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f06-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*89)%240;questions.push(buildG6AU06P07F06Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU06P07F06Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F06_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
