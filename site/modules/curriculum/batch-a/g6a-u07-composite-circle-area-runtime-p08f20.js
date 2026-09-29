import {
  G6A_U07_P08F20_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P08F20_FORMAL_MAPPING as MAPPING,
  G6A_U07_P08F20_KP_ID as KP,
  G6A_U07_P08F20_PATTERN_GROUP as GROUP,
  G6A_U07_P08F20_PATTERN_SPECS as SPECS,
  G6A_U07_P08F20_SOURCE_ID as SRC,
  G6A_U07_P08F20_SPEC_IDS as SPEC_IDS,
  P08F20_TASK_ID
} from "../registry/g6a-u07-composite-circle-area-selector-projection-p08f20.js";

export const G6A_U07_P08F20_MAX_QUESTION_COUNT=240;
export const G6A_U07_P08F20_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const ANGLES=Object.freeze([30,45,60,72,90,120]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fmt=n=>Number(Number(n).toFixed(2));

function buildSemicircleSectorParams(){
  const out=[[18,90]];
  for(let radius=3;radius<=42;radius++){
    for(const sectorAngleDeg of ANGLES){
      if(radius===18&&sectorAngleDeg===90)continue;
      out.push([radius,sectorAngleDeg]);
      if(out.length===240)return Object.freeze(out.map(([r,a])=>Object.freeze({radius:r,sectorAngleDeg:a})));
    }
  }
  return Object.freeze(out.slice(0,240).map(([radius,sectorAngleDeg])=>Object.freeze({radius,sectorAngleDeg})));
}
function buildSquareCircleParams(){
  const out=[[10,0]];
  for(let radius=3;radius<=42;radius++){
    for(let margin=0;margin<=5;margin++){
      if(radius===10&&margin===0)continue;
      out.push([radius,margin]);
      if(out.length===240)return Object.freeze(out.map(([r,m])=>Object.freeze({radius:r,margin:m})));
    }
  }
  return Object.freeze(out.slice(0,240).map(([radius,margin])=>Object.freeze({radius,margin})));
}
const SEMI_PARAMS=buildSemicircleSectorParams();
const SQUARE_PARAMS=buildSquareCircleParams();

function diagram(spec,p){
  return Object.freeze({
    kind:"composite_circle_area_diagram_p08f20",
    visualContractVersion:"P08F20_R1",
    compositionMode:spec.targetKind,
    radiusValue:p.radius,
    sectorAngleDeg:p.sectorAngleDeg??null,
    squareSideValue:p.squareSide??null,
    marginValue:p.margin??null,
    piValue:3.14,
    shadedTarget:"COMPOSITE_AREA",
    showPartitionBoundary:spec.targetKind==="SEMICIRCLE_PLUS_SECTOR",
    showSubtractionBoundary:spec.targetKind==="SQUARE_MINUS_CIRCLE",
    showRadiusMeasure:true,
    showSquareSideMeasure:spec.targetKind==="SQUARE_MINUS_CIRCLE",
    showComponentLabels:true,
    externalBoundaryTeaching:false,
    arcLengthTeaching:false,
    perimeterTeaching:false
  });
}
function semicircleSectorPayload(spec,v){
  const variant=mod(v,240),param=SEMI_PARAMS[variant],radius=param.radius,sectorAngleDeg=param.sectorAngleDeg;
  const circleArea=fmt(3.14*radius*radius);
  const semicircleArea=fmt(circleArea/2);
  const sectorArea=fmt(circleArea*sectorAngleDeg/360);
  const compositeArea=fmt(semicircleArea+sectorArea);
  const sourceParameterCarrier=radius===18&&sectorAngleDeg===90
    ?"SOURCE_PAGE1_QUARTER_CIRCLE_AND_SEMICIRCLE_COMPOSITE"
    :"CONTROLLED_COMPOSITE_SEMICIRCLE_SECTOR_VARIANT";
  const promptText="圖中陰影由同一個半徑為 "+radius+" 公分的半圓甲，和圓心角 "+sectorAngleDeg+"° 的扇形乙組成，兩部分不重疊。取圓周率 3.14，求陰影總面積。";
  const p=Object.freeze({
    variant,targetKind:spec.targetKind,semanticCore:spec.semanticCore,radius,sectorAngleDeg,approximatePiValue:3.14,
    circleArea,semicircleArea,sectorArea,squareSide:null,squareArea:null,compositeArea,
    decompositionMode:"SUM_NON_OVERLAPPING_COMPONENTS",componentCount:2,nonOverlappingVerified:true,noOmissionVerified:true,
    circleAreaFormulaConsumed:true,sectorAreaPrerequisiteConsumed:true,annulusAreaPrerequisiteConsumed:false,
    sourceParameterCarrier,promptText,answer:compositeArea,answerText:String(compositeArea)+" 平方公分"
  });
  return Object.freeze({...p,geometryDiagram:diagram(spec,p)});
}
function squareCirclePayload(spec,v){
  const variant=mod(v,240),param=SQUARE_PARAMS[variant],radius=param.radius,margin=param.margin,squareSide=radius*2+margin;
  const circleArea=fmt(3.14*radius*radius),squareArea=fmt(squareSide*squareSide),compositeArea=fmt(squareArea-circleArea);
  const sourceParameterCarrier=margin===0
    ?"SOURCE_PAGE1_SQUARE_CIRCLE_COMPOSITE"
    :"CONTROLLED_SQUARE_CIRCLE_COMPOSITE_VARIANT";
  const promptText="圖中正方形邊長是 "+squareSide+" 公分，圓的半徑是 "+radius+" 公分。陰影是正方形內、圓外的部分。取圓周率 3.14，求陰影面積。";
  const p=Object.freeze({
    variant,targetKind:spec.targetKind,semanticCore:spec.semanticCore,radius,sectorAngleDeg:null,approximatePiValue:3.14,
    circleArea,semicircleArea:null,sectorArea:null,squareSide,squareArea,margin,compositeArea,
    decompositionMode:"SUBTRACT_EXCLUDED_REGION",componentCount:2,nonOverlappingVerified:true,noOmissionVerified:true,
    circleAreaFormulaConsumed:true,sectorAreaPrerequisiteConsumed:false,annulusAreaPrerequisiteConsumed:false,
    sourceParameterCarrier,promptText,answer:compositeArea,answerText:String(compositeArea)+" 平方公分"
  });
  return Object.freeze({...p,geometryDiagram:diagram(spec,p)});
}
function payload(spec,v){
  return spec.targetKind==="SEMICIRCLE_PLUS_SECTOR"?semicircleSectorPayload(spec,v):squareCirclePayload(spec,v);
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");

export function buildG6AU07P08F20Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);
  if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p08f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p08f20-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,
    relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText:p.promptText,prompt:p.promptText,
    blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,
    geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,
    generationSeed:o.generationSeed??"p08f20-public",
    metadata:Object.freeze({
      taskId:P08F20_TASK_ID,authority:MAPPING.semanticAuthority,sourcePages:MAPPING.sourcePages,
      directVisualWitnessPage:MAPPING.directVisualWitnessPage,directVisualWitnessFamilies:MAPPING.directVisualWitnessFamilies,
      sharedRuntimeScope:G6A_U07_P08F20_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_formula",
      classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,
      compositeCircleAreaOwned:true,decompositionValidated:true,noOverlapOrOmissionValidated:true,
      circleAreaFormulaPrerequisiteConsumed:true,sectorAreaPrerequisiteConsumed:p.sectorAreaPrerequisiteConsumed,
      q011CircleAreaDerivationTeachingReowned:false,q014CircleAreaFormulaTeachingReowned:false,q017AnnulusAreaTeachingReowned:false,
      q019SectorAreaTeachingReowned:false,arcLengthOrPerimeterTeachingUsed:false,applicationContextUsed:false,
      sameUnitMixedUsed:false,crossUnitMixedUsed:false,q021OrLaterTouched:false,r04Reclassified:false,r05AssignmentMutated:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function normalizeSubmitted(submitted){
  if(typeof submitted==="number")return submitted;
  return Number(String(submitted??"").trim().replaceAll("平方公分","").replaceAll("cm²","").replaceAll("cm2","").trim());
}
export function validateG6AU07P08F20Answer(q,submitted){
  const n=normalizeSubmitted(submitted),e=[];
  if(!Number.isFinite(n))e.push("P08F20_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-Number(q?.answerValue))>1e-9)e.push("P08F20_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isFinite(n)?n:null});
}
export function validateG6AU07P08F20Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,d=q?.geometryDiagram,m=q?.metadata??{};
  if(!spec)e.push("P08F20_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F20_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F20_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F20_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P08F20_REPRESENTATION_INVALID");
  if(!d||d.kind!=="composite_circle_area_diagram_p08f20"||d.visualContractVersion!=="P08F20_R1"||
    !["SEMICIRCLE_PLUS_SECTOR","SQUARE_MINUS_CIRCLE"].includes(d.compositionMode)||d.shadedTarget!=="COMPOSITE_AREA"||
    !d.showRadiusMeasure||!d.showComponentLabels||d.externalBoundaryTeaching||d.arcLengthTeaching||d.perimeterTeaching)
    e.push("P08F20_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P08F20_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Number(q.answerValue)!==Number(expected.answer)||q.questionSignature!==signature(q))
      e.push("P08F20_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!(p.radius>0)||p.approximatePiValue!==3.14||!p.nonOverlappingVerified||!p.noOmissionVerified||!p.circleAreaFormulaConsumed||
      p.annulusAreaPrerequisiteConsumed)e.push("P08F20_DOMAIN_INVALID");
    if(spec.targetKind==="SEMICIRCLE_PLUS_SECTOR"){
      if(!(p.sectorAngleDeg>0&&p.sectorAngleDeg<180)||!p.sectorAreaPrerequisiteConsumed||!d.showPartitionBoundary||d.showSubtractionBoundary||
        Math.abs(p.circleArea-fmt(3.14*p.radius*p.radius))>1e-9||Math.abs(p.semicircleArea-fmt(p.circleArea/2))>1e-9||
        Math.abs(p.sectorArea-fmt(p.circleArea*p.sectorAngleDeg/360))>1e-9||
        Math.abs(p.compositeArea-fmt(p.semicircleArea+p.sectorArea))>1e-9)e.push("P08F20_COMPONENT_SUM_INVALID");
    }else{
      if(p.sectorAreaPrerequisiteConsumed||d.showPartitionBoundary||!d.showSubtractionBoundary||!(p.squareSide>=2*p.radius)||
        Math.abs(p.circleArea-fmt(3.14*p.radius*p.radius))>1e-9||Math.abs(p.squareArea-fmt(p.squareSide*p.squareSide))>1e-9||
        Math.abs(p.compositeArea-fmt(p.squareArea-p.circleArea))>1e-9||!(p.compositeArea>0))e.push("P08F20_SUBTRACTION_INVALID");
    }
    if(!validateG6AU07P08F20Answer(q,q.answerText).ok)e.push("P08F20_SELF_ANSWER_INVALID");
  }
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||
    JSON.stringify(m.appliedRuntimeModifierIds)!=="[]"||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||
    !m.geometryDiagramRepresentationBound||!m.compositeCircleAreaOwned||!m.decompositionValidated||!m.noOverlapOrOmissionValidated||
    !m.circleAreaFormulaPrerequisiteConsumed||m.q011CircleAreaDerivationTeachingReowned||m.q014CircleAreaFormulaTeachingReowned||
    m.q017AnnulusAreaTeachingReowned||m.q019SectorAreaTeachingReowned||m.arcLengthOrPerimeterTeachingUsed||
    m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q021OrLaterTouched||m.r04Reclassified||m.r05AssignmentMutated)
    e.push("P08F20_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["弧長","周長","牛吃草","剪拼推導"])if(learner.includes(term))e.push("P08F20_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU07P08F20Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F20_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F20_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const variant=(hash(o.generationSeed??"p08f20-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*101)%240;
    questions.push(buildG6AU07P08F20Question({variant,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU07P08F20Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F20_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),
    allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
