import {
  G6B_U03_P07F18_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6B_U03_P07F18_FORMAL_MAPPING as MAPPING,
  G6B_U03_P07F18_KP_ID as KP,
  G6B_U03_P07F18_PATTERN_GROUP as GROUP,
  G6B_U03_P07F18_PATTERN_SPECS as SPECS,
  G6B_U03_P07F18_SOURCE_ID as SRC,
  G6B_U03_P07F18_SPEC_IDS as SPEC_IDS
} from "../registry/g6b-u03-cylinder-volume-selector-projection-p07f18.js";
export const G6B_U03_P07F18_MAX_QUESTION_COUNT=240;
export const G6B_U03_P07F18_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const round2=n=>Number(Number(n).toFixed(2));
const textNum=n=>String(round2(n));
function dims(u){const radius=1+(u%20),height=2+(Math.floor(u/20)%12);return{radius,height,diameter:radius*2};}
function diagram(u,spec,d){
  return Object.freeze({
    kind:"cylinder_volume_diagram",
    variant:u,
    orientation:spec.orientation,
    measurementMode:spec.measurementMode,
    radiusPx:22+(u%17),
    lengthPx:72+(Math.floor(u/17)%47)
  });
}
function payload(spec,v){
  const u=mod(v,240);
  if(spec.sourceCarrier&&u===0){
    const radius=10,diameter=20,height=25,baseArea=314,volume=7850;
    const d={radius,diameter,height};
    return Object.freeze({
      variant:0,targetKind:"CYLINDER_VOLUME",semanticCore:spec.semanticCore,radius,diameter,height,approximatePiValue:3.14,
      circularBaseArea:baseArea,volume,circularBaseAreaVerified:true,perpendicularHeightVerified:true,positiveRadiusVerified:true,positiveHeightVerified:true,
      diameterNormalizedToRadius:true,prismVolumeRelationConsumed:true,sourceParameterCarrier:"SOURCE_PAGE1_DIAMETER20_LENGTH25_GEOMETRY",
      sourceVisualExactNumericCarrier:true,sourceLearnerTextExact:false,geometryDiagram:diagram(0,spec,d),
      promptText:"圖中的圓柱，圓形底面的直徑是 20 公分，柱高是 25 公分。取圓周率 3.14，求圓柱體積。",
      answer:volume,answerText:String(volume)
    });
  }
  const d=dims(u),baseArea=round2(3.14*d.radius*d.radius),volume=round2(baseArea*d.height);
  const diameterMode=spec.measurementMode==="DIAMETER_HEIGHT";
  return Object.freeze({
    variant:u,targetKind:"CYLINDER_VOLUME",semanticCore:spec.semanticCore,radius:d.radius,diameter:d.diameter,height:d.height,approximatePiValue:3.14,
    circularBaseArea:baseArea,volume,circularBaseAreaVerified:true,perpendicularHeightVerified:true,positiveRadiusVerified:true,positiveHeightVerified:true,
    diameterNormalizedToRadius:diameterMode,prismVolumeRelationConsumed:true,
    sourceParameterCarrier:spec.sourceCarrier?"SOURCE_BACKED_HORIZONTAL_FAMILY":"CONTROLLED_CYLINDER_VARIANT",
    sourceVisualExactNumericCarrier:false,sourceLearnerTextExact:false,geometryDiagram:diagram(u,spec,d),
    promptText:diameterMode
      ? "圖中的圓柱，圓形底面的直徑是 "+d.diameter+" 公分，柱高是 "+d.height+" 公分。取圓周率 3.14，求圓柱體積。"
      : "圖中的圓柱，圓形底面的半徑是 "+d.radius+" 公分，柱高是 "+d.height+" 公分。取圓周率 3.14，求圓柱體積。",
    answer:volume,answerText:textNum(volume)
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU03P07F18Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f18-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,
    geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f18-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice018Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,
      currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,
      sharedRuntimeScope:G6B_U03_P07F18_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_spatial_solid",classificationRuleId:"rule_spatial_solid",appliedRuntimeModifierIds:MODIFIERS,
      spatialSolidReasoningBound:true,geometryDomainValidatorBound:true,solidGeometryRepresentationBound:true,
      circleAreaFormulaPrerequisiteConsumed:true,prismBaseAreaHeightPrerequisiteConsumed:true,cylinderVolumeOwned:true,
      circularBaseAreaValidated:true,perpendicularCylinderHeightValidated:true,positiveRadiusValidated:true,positiveHeightValidated:true,
      q049PrismSurfaceAreaReowned:false,q055GenericPrismVolumeReowned:false,q060TriangularPrismVolumeReowned:false,q060CompositePrismReowned:false,
      cylinderSurfaceAreaReowned:false,compositeCylinderPrismSurfaceVolumeReowned:false,halfCylinderApplicationAsCoreUsed:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q019OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU03P07F18Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted??"").trim().replace(/,/g,"")),e=[];
  if(!Number.isFinite(n))e.push("P07F18_ANSWER_NOT_NUMERIC");else if(Math.abs(n-Number(q?.patternRepresentation?.answer))>1e-9)e.push("P07F18_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6BU03P07F18Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,d=q?.geometryDiagram,m=q?.metadata??{};
  if(!spec)e.push("P07F18_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F18_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F18_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F18_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F18_REPRESENTATION_INVALID");
  if(!d||d.kind!=="cylinder_volume_diagram"||!["UPRIGHT","HORIZONTAL"].includes(d.orientation)||!["RADIUS_HEIGHT","DIAMETER_HEIGHT"].includes(d.measurementMode)||d.radiusPx<20||d.radiusPx>38||d.lengthPx<70||d.lengthPx>118)e.push("P07F18_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F18_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==Number(expected.answer)||q.questionSignature!==signature(q))e.push("P07F18_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(p.radius>0)||!(p.height>0)||!p.positiveRadiusVerified||!p.positiveHeightVerified||!p.circularBaseAreaVerified||!p.perpendicularHeightVerified||p.approximatePiValue!==3.14)e.push("P07F18_DOMAIN_INVALID");
    const expectedBase=round2(3.14*p.radius*p.radius),expectedVolume=round2(expectedBase*p.height);
    if(Math.abs(Number(p.circularBaseArea)-expectedBase)>1e-9||Math.abs(Number(p.volume)-expectedVolume)>1e-9||!p.prismVolumeRelationConsumed)e.push("P07F18_VOLUME_INVARIANT_INVALID");
    if(spec.measurementMode==="DIAMETER_HEIGHT"&&(!p.diameterNormalizedToRadius||p.diameter!==2*p.radius))e.push("P07F18_DIAMETER_NORMALIZATION_INVALID");
    if(spec.measurementMode==="RADIUS_HEIGHT"&&p.diameterNormalizedToRadius)e.push("P07F18_RADIUS_MODE_INVALID");
    if(!validateG6BU03P07F18Answer(q,q.answerText).ok)e.push("P07F18_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_spatial_solid"||m.classificationRuleId!=="rule_spatial_solid"||(m.appliedRuntimeModifierIds??[]).length!==0||
    !m.spatialSolidReasoningBound||!m.geometryDomainValidatorBound||!m.solidGeometryRepresentationBound||!m.circleAreaFormulaPrerequisiteConsumed||
    !m.prismBaseAreaHeightPrerequisiteConsumed||!m.cylinderVolumeOwned||!m.circularBaseAreaValidated||!m.perpendicularCylinderHeightValidated||
    !m.positiveRadiusValidated||!m.positiveHeightValidated||m.q049PrismSurfaceAreaReowned||m.q055GenericPrismVolumeReowned||m.q060TriangularPrismVolumeReowned||
    m.q060CompositePrismReowned||m.cylinderSurfaceAreaReowned||m.compositeCylinderPrismSurfaceVolumeReowned||m.halfCylinderApplicationAsCoreUsed||
    m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q019OrLaterTouched||m.r04Reclassified)e.push("P07F18_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["表面積","半圓柱","複合柱體"])if(learner.includes(term))e.push("P07F18_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU03P07F18Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F18_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F18_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p07f18-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*83)%240;
    questions.push(buildG6BU03P07F18Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6BU03P07F18Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F18_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
