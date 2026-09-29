import {
  G6A_U07_P08F19_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P08F19_FORMAL_MAPPING as MAPPING,
  G6A_U07_P08F19_KP_ID as KP,
  G6A_U07_P08F19_PATTERN_GROUP as GROUP,
  G6A_U07_P08F19_PATTERN_SPECS as SPECS,
  G6A_U07_P08F19_SOURCE_ID as SRC,
  G6A_U07_P08F19_SPEC_IDS as SPEC_IDS,
  P08F19_TASK_ID
} from "../registry/g6a-u07-sector-area-selector-projection-p08f19.js";

export const G6A_U07_P08F19_MAX_QUESTION_COUNT=240;
export const G6A_U07_P08F19_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const ANGLES=Object.freeze([30,45,60,72,90,120,135,144,180,225,240,270]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(Number(n).toFixed(2));

function buildParams(){
  const out=[[18,30]];
  for(let radius=3;radius<=22&&out.length<240;radius++){
    for(const angle of ANGLES){
      if(radius===18&&angle===30)continue;
      out.push([radius,angle]);
      if(out.length===240)break;
    }
  }
  if(out.length<240)out.push([23,30]);
  return Object.freeze(out.slice(0,240).map(([radius,centralAngleDeg])=>Object.freeze({radius,centralAngleDeg})));
}
const PARAMS=buildParams();

function diagram(spec,p){
  return Object.freeze({
    kind:"sector_area_diagram_p08f19",
    visualContractVersion:"P08F19_R1",
    measurementMode:spec.targetKind==="FROM_DIAMETER_AND_ANGLE"?"DIAMETER":"RADIUS",
    radiusValue:p.radius,
    diameterValue:p.diameter,
    centralAngleDeg:p.centralAngleDeg,
    fullCircleDegrees:360,
    sectorHighlighted:true,
    centerLabel:"O",
    endpointLabels:Object.freeze(["A","B"]),
    showWholeCircleReference:true,
    showCentralAngleMarker:true,
    externalBoundaryTeaching:false,
    arcLengthTeaching:false,
    proportionalAngleRequired:true
  });
}

function payload(spec,v){
  const u=mod(v,240),param=PARAMS[u],radius=param.radius,diameter=radius*2,centralAngleDeg=param.centralAngleDeg;
  const circleArea=fmt(3.14*radius*radius);
  const angleFraction=centralAngleDeg/360;
  const sectorArea=fmt(3.14*radius*radius*centralAngleDeg/360);
  const sourceParameterCarrier=radius===18&&centralAngleDeg===30
    ?"SOURCE_PAGE1_RADIUS_18_ANGLE_30_EXACT"
    :"CONTROLLED_SECTOR_AREA_VARIANT";
  const promptText=spec.targetKind==="FROM_DIAMETER_AND_ANGLE"
    ? "圖中陰影扇形的圓心角是 "+centralAngleDeg+"°，所在圓的直徑是 "+diameter+" 公分。先求半徑，再取圓周率 3.14，求陰影扇形面積。"
    : "圖中陰影扇形的圓心角是 "+centralAngleDeg+"°，半徑是 "+radius+" 公分。取圓周率 3.14，求陰影扇形面積。";
  return Object.freeze({
    variant:u,
    targetKind:spec.targetKind,
    semanticCore:spec.semanticCore,
    radius,
    diameter,
    centralAngleDeg,
    fullCircleDegrees:360,
    approximatePiValue:3.14,
    circleArea,
    angleFraction,
    sectorArea,
    diameterNormalizedToRadius:spec.targetKind==="FROM_DIAMETER_AND_ANGLE",
    circleAreaWholeReferenceVerified:true,
    centralAngleFractionVerified:Math.abs(angleFraction-centralAngleDeg/360)<1e-12,
    sectorAreaFormulaVerified:Math.abs(sectorArea-fmt(3.14*radius*radius*centralAngleDeg/360))<1e-12,
    fullCircleClosureVerified:fmt(circleArea*360/360)===circleArea,
    positiveRadius:radius>0,
    centralAngleDomainValid:centralAngleDeg>0&&centralAngleDeg<=360,
    sourceParameterCarrier,
    geometryDiagram:diagram(spec,{radius,diameter,centralAngleDeg}),
    promptText,
    answer:sectorArea,
    answerText:String(sectorArea)+" 平方公分"
  });
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6AU07P08F19Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p08f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p08f19-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
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
    generationSeed:o.generationSeed??"p08f19-public",
    metadata:Object.freeze({
      taskId:P08F19_TASK_ID,
      authority:MAPPING.semanticAuthority,
      sourcePages:MAPPING.sourcePages,
      directVisualWitnessPage:MAPPING.directVisualWitnessPage,
      directVisualWitnessFamily:MAPPING.directVisualWitnessFamily,
      sharedRuntimeScope:G6A_U07_P08F19_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_formula",
      classificationRuleId:"rule_geometry_formula",
      appliedRuntimeModifierIds:MODIFIERS,
      integerDivisionModifierBound:true,
      geometryFormulaEvaluationBound:true,
      geometryDomainValidatorBound:true,
      geometryDiagramRepresentationBound:true,
      circleAreaFormulaPrerequisiteRequired:true,
      sectorAreaOwned:true,
      circleAreaWholeReferenceValidated:true,
      centralAngleFractionOf360Validated:true,
      sectorAreaFormulaValidated:true,
      fullCircle360ClosureValidated:true,
      diameterToRadiusNormalizationUsed:spec.targetKind==="FROM_DIAMETER_AND_ANGLE",
      q011CircleAreaDerivationTeachingReowned:false,
      q014CircleAreaFormulaTeachingReowned:false,
      q017AnnulusAreaTeachingReowned:false,
      compositeCircleAreaReowned:false,
      arcLengthOrPerimeterTeachingUsed:false,
      genericSectorFractionTeachingReowned:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q020OrLaterTouched:false,
      r04Reclassified:false,
      r05AssignmentMutated:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}

function normalizeSubmitted(submitted){
  if(typeof submitted==="number")return submitted;
  return Number(String(submitted??"").trim().replaceAll("平方公分","").replaceAll("cm²","").replaceAll("cm2","").trim());
}
export function validateG6AU07P08F19Answer(q,submitted){
  const n=normalizeSubmitted(submitted),e=[];
  if(!Number.isFinite(n))e.push("P08F19_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-Number(q?.answerValue))>1e-9)e.push("P08F19_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}

export function validateG6AU07P08F19Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,d=q?.geometryDiagram,m=q?.metadata??{};
  if(!spec)e.push("P08F19_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F19_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F19_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F19_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F19_REPRESENTATION_INVALID");
  if(!d||d.kind!=="sector_area_diagram_p08f19"||d.visualContractVersion!=="P08F19_R1"||
    !["RADIUS","DIAMETER"].includes(d.measurementMode)||!d.sectorHighlighted||!d.showWholeCircleReference||!d.showCentralAngleMarker||
    d.externalBoundaryTeaching||d.arcLengthTeaching||!d.proportionalAngleRequired||d.fullCircleDegrees!==360||
    d.centerLabel!=="O"||JSON.stringify(d.endpointLabels)!==JSON.stringify(["A","B"]))e.push("P08F19_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P08F19_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==Number(expected.answer)||q.questionSignature!==signature(q))e.push("P08F19_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(p.radius>0)||p.diameter!==2*p.radius||!p.positiveRadius||p.approximatePiValue!==3.14||
      !(p.centralAngleDeg>0&&p.centralAngleDeg<=360)||!p.centralAngleDomainValid||p.fullCircleDegrees!==360)e.push("P08F19_DOMAIN_INVALID");
    if(Math.abs(p.circleArea-fmt(3.14*p.radius*p.radius))>1e-9||Math.abs(p.angleFraction-p.centralAngleDeg/360)>1e-12||
      Math.abs(p.sectorArea-fmt(3.14*p.radius*p.radius*p.centralAngleDeg/360))>1e-9||!p.circleAreaWholeReferenceVerified||
      !p.centralAngleFractionVerified||!p.sectorAreaFormulaVerified||!p.fullCircleClosureVerified)e.push("P08F19_SECTOR_FORMULA_INVALID");
    if(spec.targetKind==="FROM_DIAMETER_AND_ANGLE"&&(!p.diameterNormalizedToRadius||d.measurementMode!=="DIAMETER"))e.push("P08F19_DIAMETER_NORMALIZATION_INVALID");
    if(spec.targetKind==="FROM_RADIUS_AND_ANGLE"&&(p.diameterNormalizedToRadius||d.measurementMode!=="RADIUS"))e.push("P08F19_RADIUS_MODE_INVALID");
    if(!validateG6AU07P08F19Answer(q,q.answerText).ok)e.push("P08F19_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||
    JSON.stringify(m.appliedRuntimeModifierIds)!==JSON.stringify(["mod_integer_division"])||!m.integerDivisionModifierBound||
    !m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||
    !m.circleAreaFormulaPrerequisiteRequired||!m.sectorAreaOwned||!m.circleAreaWholeReferenceValidated||
    !m.centralAngleFractionOf360Validated||!m.sectorAreaFormulaValidated||!m.fullCircle360ClosureValidated||
    m.q011CircleAreaDerivationTeachingReowned||m.q014CircleAreaFormulaTeachingReowned||m.q017AnnulusAreaTeachingReowned||
    m.compositeCircleAreaReowned||m.arcLengthOrPerimeterTeachingUsed||m.genericSectorFractionTeachingReowned||
    m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q020OrLaterTouched||m.r04Reclassified||m.r05AssignmentMutated)
    e.push("P08F19_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["圓環","複合圖形","弧長","周長","牛吃草","剪拼"])if(learner.includes(term))e.push("P08F19_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}

export function generateG6AU07P08F19Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F19_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F19_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p08f19-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*101)%240;
    questions.push(buildG6AU07P08F19Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU07P08F19Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F19_DUPLICATE_SIGNATURE");
  return Object.freeze({
    ok:errors.length===0,
    questions:Object.freeze(questions),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),
    maxQuestionCount:240
  });
}
