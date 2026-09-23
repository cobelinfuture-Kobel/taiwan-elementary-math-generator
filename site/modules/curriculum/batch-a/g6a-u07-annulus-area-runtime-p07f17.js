import {
  G6A_U07_P07F17_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P07F17_FORMAL_MAPPING as MAPPING,
  G6A_U07_P07F17_KP_ID as KP,
  G6A_U07_P07F17_PATTERN_GROUP as GROUP,
  G6A_U07_P07F17_PATTERN_SPECS as SPECS,
  G6A_U07_P07F17_SOURCE_ID as SRC,
  G6A_U07_P07F17_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u07-annulus-area-selector-projection-p07f17.js";
export const G6A_U07_P07F17_MAX_QUESTION_COUNT=240;
export const G6A_U07_P07F17_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(Number(n).toFixed(2));
function radii(u){const inner=1+(u%20),thickness=1+(Math.floor(u/20)%12),outer=inner+thickness;return{inner,thickness,outer};}
function diagram(u,p,mode){
  const max=52,outerPx=42+(u%11),innerPx=Math.max(14,outerPx*(p.inner/p.outer));
  return Object.freeze({kind:"annulus_area_diagram",innerRadiusPx:fmt(innerPx),outerRadiusPx:outerPx,measurementMode:mode,rotationDeg:(u%24)*15});
}
function basePayload(spec,v){
  const u=mod(v,240),p=radii(u),area=fmt(3.14*(p.outer*p.outer-p.inner*p.inner));
  if(spec.targetKind==="OUTER_AND_INNER_RADII"){
    return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,innerRadius:p.inner,outerRadius:p.outer,radialThickness:p.thickness,
      approximatePiValue:3.14,outerArea:fmt(3.14*p.outer*p.outer),innerArea:fmt(3.14*p.inner*p.inner),annulusArea:area,outerMinusInnerVerified:true,
      concentricCircles:true,positiveRadii:true,outerRadiusGreaterThanInnerRadius:true,sourceParameterCarrier:"CONTROLLED_ANNULUS_VARIANT",
      geometryDiagram:diagram(u,p,"OUTER_INNER_RADII"),promptText:"圖中的兩個圓同心，外圓半徑是 "+p.outer+" 公分，內圓半徑是 "+p.inner+" 公分。取圓周率 3.14，求圓環面積。",answer:area,answerText:String(area)});
  }
  if(spec.targetKind==="INNER_DIAMETER_AND_THICKNESS"){
    if(u===0){const q={inner:2,thickness:4,outer:6},a=fmt(3.14*(36-4));return Object.freeze({variant:0,targetKind:spec.targetKind,semanticCore:spec.semanticCore,innerDiameter:4,innerRadius:2,outerRadius:6,radialThickness:4,approximatePiValue:3.14,
      outerArea:fmt(3.14*36),innerArea:fmt(3.14*4),annulusArea:a,innerDiameterNormalizedToRadius:true,radialThicknessConvertedToOuterRadius:true,outerMinusInnerVerified:true,concentricCircles:true,positiveRadii:true,outerRadiusGreaterThanInnerRadius:true,
      sourceParameterCarrier:"SOURCE_PAGE1_INNER_DIAMETER_4_THICKNESS_4_EXACT",geometryDiagram:diagram(0,q,"INNER_DIAMETER_THICKNESS"),
      promptText:"圖中的兩個圓同心，內圓直徑是 4 公尺，圓環寬是 4 公尺。先求內、外半徑，再取圓周率 3.14，求圓環面積。",answer:a,answerText:String(a)});}
    return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,innerDiameter:p.inner*2,innerRadius:p.inner,outerRadius:p.outer,radialThickness:p.thickness,approximatePiValue:3.14,
      outerArea:fmt(3.14*p.outer*p.outer),innerArea:fmt(3.14*p.inner*p.inner),annulusArea:area,innerDiameterNormalizedToRadius:true,radialThicknessConvertedToOuterRadius:true,outerMinusInnerVerified:true,
      concentricCircles:true,positiveRadii:true,outerRadiusGreaterThanInnerRadius:true,sourceParameterCarrier:"CONTROLLED_ANNULUS_VARIANT",geometryDiagram:diagram(u,p,"INNER_DIAMETER_THICKNESS"),
      promptText:"圖中的兩個圓同心，內圓直徑是 "+(p.inner*2)+" 公分，圓環寬是 "+p.thickness+" 公分。先求內、外半徑，再取圓周率 3.14，求圓環面積。",answer:area,answerText:String(area)});
  }
  return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:spec.semanticCore,innerRadius:p.inner,outerRadius:p.outer,radialThickness:p.thickness,approximatePiValue:3.14,
    outerArea:fmt(3.14*p.outer*p.outer),innerArea:fmt(3.14*p.inner*p.inner),annulusArea:area,radialThicknessConvertedToOuterRadius:true,outerMinusInnerVerified:true,concentricCircles:true,positiveRadii:true,outerRadiusGreaterThanInnerRadius:true,
    sourceParameterCarrier:"CONTROLLED_ANNULUS_VARIANT",geometryDiagram:diagram(u,p,"INNER_RADIUS_THICKNESS"),
    promptText:"圖中的兩個圓同心，內圓半徑是 "+p.inner+" 公分，圓環寬是 "+p.thickness+" 公分。先求外半徑，再取圓周率 3.14，求圓環面積。",answer:area,answerText:String(area)});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU07P07F17Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=basePayload(spec,o.variant??0);
  const q={id:"p07f17-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f17-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,
    geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f17-public",
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice017Implementation",authority:MAPPING.semanticAuthority,r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,
      currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,sharedRuntimeScope:G6A_U07_P07F17_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,q014CircleAreaFormulaPrerequisiteRequired:true,annulusAreaOwned:true,
      outerMinusInnerValidated:true,concentricCirclesValidated:true,positiveRadiiValidated:true,outerRadiusGreaterThanInnerRadiusValidated:true,
      q011DerivationTeachingReowned:false,q014CircleAreaFormulaTeachingReowned:false,sectorAreaReowned:false,compositeCircleAreaReowned:false,circularSegmentAreaReowned:false,cowGrazingApplicationUsed:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q018OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU07P07F17Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isFinite(n))e.push("P07F17_ANSWER_NOT_NUMERIC");else if(Math.abs(n-Number(q?.patternRepresentation?.answer))>1e-9)e.push("P07F17_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU07P07F17Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,d=q?.geometryDiagram,m=q?.metadata??{};
  if(!spec)e.push("P07F17_PATTERN_SPEC_INVALID");if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F17_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F17_KP_INVALID");if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F17_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F17_REPRESENTATION_INVALID");
  if(!d||d.kind!=="annulus_area_diagram"||!(d.outerRadiusPx>d.innerRadiusPx)||d.innerRadiusPx<12||d.outerRadiusPx>52||!["OUTER_INNER_RADII","INNER_DIAMETER_THICKNESS","INNER_RADIUS_THICKNESS"].includes(d.measurementMode))e.push("P07F17_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=basePayload(spec,p.variant);if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F17_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==Number(expected.answer)||q.questionSignature!==signature(q))e.push("P07F17_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(p.innerRadius>0)||!(p.outerRadius>p.innerRadius)||!p.positiveRadii||!p.outerRadiusGreaterThanInnerRadius||!p.concentricCircles||p.approximatePiValue!==3.14)e.push("P07F17_RADIUS_DOMAIN_INVALID");
    const expectedArea=fmt(3.14*(p.outerRadius*p.outerRadius-p.innerRadius*p.innerRadius));
    if(!p.outerMinusInnerVerified||Math.abs(Number(p.annulusArea)-expectedArea)>1e-9||Math.abs(Number(p.outerArea)-3.14*p.outerRadius*p.outerRadius)>1e-9||Math.abs(Number(p.innerArea)-3.14*p.innerRadius*p.innerRadius)>1e-9)e.push("P07F17_OUTER_MINUS_INNER_INVALID");
    if(spec.targetKind==="INNER_DIAMETER_AND_THICKNESS"&&(!p.innerDiameterNormalizedToRadius||p.innerDiameter!==2*p.innerRadius||!p.radialThicknessConvertedToOuterRadius||p.outerRadius!==p.innerRadius+p.radialThickness))e.push("P07F17_DIAMETER_THICKNESS_INVALID");
    if(spec.targetKind==="INNER_RADIUS_AND_THICKNESS"&&(!p.radialThicknessConvertedToOuterRadius||p.outerRadius!==p.innerRadius+p.radialThickness))e.push("P07F17_RADIUS_THICKNESS_INVALID");
    if(!validateG6AU07P07F17Answer(q,q.answerText).ok)e.push("P07F17_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||
    !m.geometryDiagramRepresentationBound||!m.q014CircleAreaFormulaPrerequisiteRequired||!m.annulusAreaOwned||!m.outerMinusInnerValidated||!m.concentricCirclesValidated||!m.positiveRadiiValidated||
    !m.outerRadiusGreaterThanInnerRadiusValidated||m.q011DerivationTeachingReowned||m.q014CircleAreaFormulaTeachingReowned||m.sectorAreaReowned||m.compositeCircleAreaReowned||m.circularSegmentAreaReowned||
    m.cowGrazingApplicationUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q018OrLaterTouched||m.r04Reclassified)e.push("P07F17_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");for(const term of ["扇形面積","剪拼","牛吃草"])if(learner.includes(term))e.push("P07F17_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU07P07F17Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F17_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F17_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F17_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const variant=(hash(o.generationSeed??"p07f17-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*79)%240;questions.push(buildG6AU07P07F17Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU07P07F17Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F17_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
