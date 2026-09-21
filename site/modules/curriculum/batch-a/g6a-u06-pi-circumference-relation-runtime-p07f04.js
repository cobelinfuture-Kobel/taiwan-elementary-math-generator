import {G6A_U06_P07F04_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U06_P07F04_FORMAL_MAPPING as MAPPING,G6A_U06_P07F04_KP_ID as KP,G6A_U06_P07F04_PATTERN_GROUP as GROUP,G6A_U06_P07F04_PATTERN_SPECS as SPECS,G6A_U06_P07F04_SOURCE_ID as SRC,G6A_U06_P07F04_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u06-pi-circumference-relation-selector-projection-p07f04.js";
export const G6A_U06_P07F04_MAX_QUESTION_COUNT=240;
export const G6A_U06_P07F04_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const RADII=Object.freeze([32,34,36,38,40,42,44,46,48,50]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(n.toFixed(2));
function circlePair(d){return Object.freeze({diameter:d,circumference:fmt(d*3.14),quotient:3.14});}
function payload(spec,v){
  const u=mod(v,240),first=circlePair(10+u),second=circlePair(260+u);
  const geometryDiagram=Object.freeze({kind:"circle_parts_diagram",radius:RADII[u%RADII.length],rotationDeg:ROTATIONS[Math.floor(u/RADII.length)%ROTATIONS.length],targetPart:"DIAMETER",markerMode:"HIGHLIGHT_DIAMETER",markerLabel:null,isDiameter:null});
  let promptText;
  if(spec.targetKind==="COMPUTE_QUOTIENT")promptText="圖中圓的直徑是 "+first.diameter+" 公分，量得圓周長約 "+first.circumference+" 公分。圓周長 ÷ 直徑約是多少？";
  else if(spec.targetKind==="IDENTIFY_COMMON_RATIO")promptText="一個圓的圓周長約 "+first.circumference+" 公分，直徑是 "+first.diameter+" 公分。圓周長約是直徑的幾倍？";
  else promptText="圓 A：圓周長約 "+first.circumference+" 公分、直徑 "+first.diameter+" 公分；圓 B：圓周長約 "+second.circumference+" 公分、直徑 "+second.diameter+" 公分。兩個圓的「圓周長 ÷ 直徑」都約是多少？";
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI",
    first,second:spec.targetKind==="COMPARE_TWO_CIRCLES"?second:null,
    quotientDirection:"CIRCUMFERENCE_DIVIDED_BY_DIAMETER",diameterPositiveNonzero:first.diameter>0&&(spec.targetKind!=="COMPARE_TWO_CIRCLES"||second.diameter>0),
    quotientApproximatelyPi:true,fixedRatioAcrossCircles:true,approximatePiValue:3.14,
    geometryDiagram,promptText,answer:3.14,answerText:"3.14"
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU06P07F04Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f04-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f04-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f04-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice004Implementation",authority:"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CONTEXT_SECONDARY",sourcePages:MAPPING.sourcePages,r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportLevel:"INDIRECT_CONTEXTUAL_NOT_LITERAL_STATEMENT",sharedRuntimeScope:G6A_U06_P07F04_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,integerDivisionCapabilityBound:true,
      circumferenceDiameterRelationOwned:true,circumferenceRolePreserved:true,diameterRolePreserved:true,diameterPositiveNonzeroValidated:true,quotientDirectionValidated:true,quotientApproximatelyPiValidated:true,fixedRatioAcrossCirclesValidated:true,
      solveCircumferenceFromDiameterUsed:false,solveDiameterFromCircumferenceUsed:false,circumferenceFormulaTeachingReowned:false,radiusBasedFormulaUsed:false,semicirclePerimeterReowned:false,sectorArcLengthReowned:false,compositeArcPerimeterReowned:false,rollingWheelApplicationUsed:false,genericGeometryFormulaDrillUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q005OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU06P07F04Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isFinite(n))e.push("P07F04_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-3.14)>0.01)e.push("P07F04_ANSWER_PI_RELATION_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU06P07F04Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P07F04_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F04_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F04_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F04_MODE_INVALID");
  const p=q?.patternRepresentation,d=q?.geometryDiagram;
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F04_REPRESENTATION_INVALID");
  if(!d||d.kind!=="circle_parts_diagram"||d.targetPart!=="DIAMETER"||d.markerMode!=="HIGHLIGHT_DIAMETER"||d.markerLabel!==null||d.isDiameter!==null||!RADII.includes(d.radius)||!ROTATIONS.includes(d.rotationDeg))e.push("P07F04_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F04_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!=="3.14"||Number(q.answerValue)!==3.14||q.questionSignature!==signature(q))e.push("P07F04_PROMPT_ANSWER_SIGNATURE_INVALID");
    const pairs=[p.first,...(p.second?[p.second]:[])];
    if(pairs.some(x=>!Number.isInteger(x.diameter)||x.diameter<=0||Math.abs(x.circumference/x.diameter-3.14)>1e-9||x.quotient!==3.14))e.push("P07F04_C_OVER_D_INVARIANT_INVALID");
    if(p.quotientDirection!=="CIRCUMFERENCE_DIVIDED_BY_DIAMETER"||!p.diameterPositiveNonzero||!p.quotientApproximatelyPi||!p.fixedRatioAcrossCircles||p.approximatePiValue!==3.14)e.push("P07F04_SEMANTIC_INVARIANT_INVALID");
    if(!validateG6AU06P07F04Answer(q,q.answerValue).ok)e.push("P07F04_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).join("|")!==MODIFIERS.join("|")||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.integerDivisionCapabilityBound||!m.circumferenceDiameterRelationOwned||!m.circumferenceRolePreserved||!m.diameterRolePreserved||!m.diameterPositiveNonzeroValidated||!m.quotientDirectionValidated||!m.quotientApproximatelyPiValidated||!m.fixedRatioAcrossCirclesValidated||m.solveCircumferenceFromDiameterUsed||m.solveDiameterFromCircumferenceUsed||m.circumferenceFormulaTeachingReowned||m.radiusBasedFormulaUsed||m.semicirclePerimeterReowned||m.sectorArcLengthReowned||m.compositeArcPerimeterReowned||m.rollingWheelApplicationUsed||m.genericGeometryFormulaDrillUsed||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q005OrLaterTouched||m.r04Reclassified)e.push("P07F04_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["半徑","半圓","扇形","滾動","最簡","百分率"])if(learner.includes(term))e.push("P07F04_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU06P07F04Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F04_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F04_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F04_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f04-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;questions.push(buildG6AU06P07F04Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU06P07F04Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F04_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
