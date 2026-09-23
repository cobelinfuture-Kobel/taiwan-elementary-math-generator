import {G6A_U09_P07F12_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U09_P07F12_FORMAL_MAPPING as MAPPING,G6A_U09_P07F12_KP_ID as KP,G6A_U09_P07F12_PATTERN_GROUP as GROUP,G6A_U09_P07F12_PATTERN_SPECS as SPECS,G6A_U09_P07F12_SOURCE_ID as SRC,G6A_U09_P07F12_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u09-scale-area-change-selector-projection-p07f12.js";
export const G6A_U09_P07F12_MAX_QUESTION_COUNT=240;
export const G6A_U09_P07F12_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const FACTORS=Object.freeze([
  Object.freeze({num:1,den:2,text:"1/2"}),
  Object.freeze({num:2,den:3,text:"2/3"}),
  Object.freeze({num:3,den:4,text:"3/4"}),
  Object.freeze({num:4,den:5,text:"4/5"}),
  Object.freeze({num:5,den:4,text:"5/4"}),
  Object.freeze({num:4,den:3,text:"4/3"}),
  Object.freeze({num:3,den:2,text:"3/2"}),
  Object.freeze({num:2,den:1,text:"2"}),
  Object.freeze({num:5,den:2,text:"5/2"}),
  Object.freeze({num:3,den:1,text:"3"}),
  Object.freeze({num:7,den:4,text:"7/4"}),
  Object.freeze({num:5,den:3,text:"5/3"})
]);
const SCALE_DENOMINATORS=Object.freeze([100,200,300,400,500,600,800,1000]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1;};
function rationalText(num,den){
  const g=gcd(num,den),n=num/g,d=den/g;
  return d===1?String(n):n+"/"+d;
}
function parseNumeric(value){
  if(typeof value==="number")return Number.isFinite(value)?value:null;
  const s=String(value??"").trim();
  const m=s.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
  if(m){const d=Number(m[2]);return d===0?null:Number(m[1])/d;}
  const n=s.match(/-?\d+(?:\.\d+)?/);
  if(!n)return null;
  const valueNumber=Number(n[0]);
  return Number.isFinite(valueNumber)?valueNumber:null;
}
function genericPayload(spec,variant){
  const u=mod(variant,240),f=FACTORS[u%FACTORS.length],m=2+Math.floor(u/FACTORS.length);
  const originalLength=f.den*(m+2),originalWidth=f.den*(m+3),scaledLength=f.num*(m+2),scaledWidth=f.num*(m+3);
  const originalArea=originalLength*originalWidth,scaledArea=scaledLength*scaledWidth;
  const areaFactorNum=f.num*f.num,areaFactorDen=f.den*f.den,areaFactorText=rationalText(areaFactorNum,areaFactorDen),areaFactorValue=areaFactorNum/areaFactorDen;
  const direction=areaFactorValue>1?"變大":"變小";
  let promptText,answer,answerText;
  if(spec.targetKind==="AREA_FACTOR"){
    promptText="一個長方形的每一條對應邊都變成原來的 "+f.text+" 倍。新圖面積是原圖面積的幾倍？";
    answer=areaFactorValue;answerText=areaFactorText;
  }else if(spec.targetKind==="SCALED_AREA"){
    promptText="原長方形面積是 "+originalArea+" 平方公分，每一條對應邊都變成原來的 "+f.text+" 倍。新圖面積是多少平方公分？";
    answer=scaledArea;answerText=String(scaledArea);
  }else{
    promptText="原圖變成新圖時，每一條對應邊都是原來的 "+f.text+" 倍。新圖面積是原圖的幾倍？並判斷面積變大或變小。";
    answer=areaFactorValue;answerText=areaFactorText+" 倍（"+direction+"）";
  }
  const geometryDiagram=Object.freeze({
    kind:"scale_area_change_diagram",
    diagramMode:"SCALE_PAIR",
    semanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
    targetKind:spec.targetKind,
    variant:u,
    originalLength,originalWidth,scaledLength,scaledWidth,
    originalLengthLabel:originalLength+" cm",
    originalWidthLabel:originalWidth+" cm",
    scaledLengthLabel:scaledLength+" cm",
    scaledWidthLabel:scaledWidth+" cm",
    linearScaleFactorText:f.text,
    areaScaleFactorText:areaFactorText,
    areaScaleFactorHidden:true,
    enlargement:areaFactorValue>1,
    reduction:areaFactorValue<1
  });
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
    scaleFactorNumerator:f.num,scaleFactorDenominator:f.den,scaleFactorText:f.text,scaleFactorValue:f.num/f.den,
    areaFactorNumerator:areaFactorNum,areaFactorDenominator:areaFactorDen,areaFactorText,areaFactorValue,
    originalLength,originalWidth,scaledLength,scaledWidth,originalArea,scaledArea,
    areaSquareInvariantVerified:Math.abs(scaledArea/originalArea-areaFactorValue)<1e-12,
    direction,applicationContextUsed:false,sourceExemplarMatch:false,
    answer,answerText,promptText,geometryDiagram
  });
}
function applicationPayload(spec,variant){
  const u=mod(variant,240),den=SCALE_DENOMINATORS[u%SCALE_DENOMINATORS.length],q=Math.floor(u/SCALE_DENOMINATORS.length);
  const paperLengthCm=3+(q%10),paperWidthCm=2+Math.floor(q/10)*4+(q%2);
  const actualLengthMeters=paperLengthCm*den/100,actualWidthMeters=paperWidthCm*den/100,paperAreaCm2=paperLengthCm*paperWidthCm;
  const sourceExemplarMatch=den===300&&actualLengthMeters===18&&actualWidthMeters===9;
  const promptText="一個長方形場地實際長 "+actualLengthMeters+" 公尺、寬 "+actualWidthMeters+" 公尺，以 1:"+den+" 的比例尺畫在紙上。紙上圖形的面積是多少平方公分？";
  const geometryDiagram=Object.freeze({
    kind:"scale_area_change_diagram",
    diagramMode:"SOURCE_SCALE_APPLICATION",
    semanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
    targetKind:spec.targetKind,
    variant:u,
    actualLengthMeters,actualWidthMeters,
    scaleDenominator:den,
    paperLengthCm,paperWidthCm,
    paperAreaCm2,
    actualLengthLabel:actualLengthMeters+" m",
    actualWidthLabel:actualWidthMeters+" m",
    scaleLabel:"1:"+den,
    paperLengthLabel:"? cm",
    paperWidthLabel:"? cm",
    sourceExemplarMatch
  });
  return Object.freeze({
    variant:u,targetKind:spec.targetKind,semanticCore:"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED",
    scaleFactorNumerator:1,scaleFactorDenominator:den,scaleFactorText:"1/"+den,scaleFactorValue:1/den,
    areaFactorNumerator:1,areaFactorDenominator:den*den,areaFactorText:"1/"+(den*den),areaFactorValue:1/(den*den),
    actualLengthMeters,actualWidthMeters,paperLengthCm,paperWidthCm,paperAreaCm2,
    unitConversionMetersToCentimetersRequired:true,
    actualToPaperLengthInvariantVerified:Math.abs(actualLengthMeters*100/den-paperLengthCm)<1e-12&&Math.abs(actualWidthMeters*100/den-paperWidthCm)<1e-12,
    applicationContextUsed:true,sourceExemplarMatch,
    answer:paperAreaCm2,answerText:String(paperAreaCm2),promptText,geometryDiagram
  });
}
function payload(spec,variant){return spec.targetKind==="SOURCE_RECTANGLE_APPLICATION"?applicationPayload(spec,variant):genericPayload(spec,variant);}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU09P07F12Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0);
  const q={
    id:"p07f12-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    generatedItemId:"p07f12-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,
    answerText:p.answerText,answerValue:p.answer,geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f12-public",
    metadata:Object.freeze({
      taskId:"P07F_W7DirectProductVerticalSlice012Implementation",
      authority:MAPPING.semanticAuthority,
      r02EvidencePages:MAPPING.r02EvidencePages,currentVisualSupportingPages:MAPPING.currentVisualSupportingPages,currentVisualSupportLevel:MAPPING.currentVisualSupportLevel,
      sourcePdfDriveFileId:MAPPING.sourcePdfDriveFileId,sourcePdfSha256:MAPPING.sourcePdfSha256,
      sharedRuntimeScope:G6A_U09_P07F12_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,
      geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,
      rectangleAreaFormulaPrerequisiteRequired:true,scaleFactorLengthPrerequisiteRequired:true,scaleAreaChangeOwned:true,areaSquareRelationValidated:true,
      q007LengthScaleFactorPrerequisiteTeachingReowned:false,similarShapeAngleTeachingReowned:false,scaleDrawingConstructionReowned:false,mapScaleDistanceReowned:false,mapScaleBarInterpretationUsed:false,genericGeometryAreaFormulaReowned:false,
      applicationContextUsed:p.applicationContextUsed,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q013OrLaterTouched:false,r04Reclassified:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU09P07F12Answer(q,submitted){
  const p=q?.patternRepresentation,e=[],n=parseNumeric(submitted),expected=Number(p?.answer);
  if(!p)e.push("P07F12_REPRESENTATION_MISSING");
  else if(n===null)e.push("P07F12_ANSWER_NOT_NUMERIC");
  else if(Math.abs(n-expected)>1e-9)e.push("P07F12_ANSWER_MISMATCH");
  if(p?.targetKind==="AREA_COMPARISON"){
    const raw=String(submitted??"");
    if(raw.includes("變大")||raw.includes("變小")){
      const expectedDirection=p.direction;
      if(!raw.includes(expectedDirection))e.push("P07F12_COMPARISON_DIRECTION_MISMATCH");
    }
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:n});
}
export function validateG6AU09P07F12Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation,d=q?.geometryDiagram;
  if(!spec)e.push("P07F12_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F12_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F12_KP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F12_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F12_REPRESENTATION_INVALID");
  if(!d||d.kind!=="scale_area_change_diagram"||d.semanticCore!=="LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED"||d.targetKind!==spec?.targetKind)e.push("P07F12_DIAGRAM_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F12_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||Math.abs(Number(q.answerValue)-Number(expected.answer))>1e-9||q.questionSignature!==signature(q))e.push("P07F12_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(p.scaleFactorNumerator<=0||p.scaleFactorDenominator<=0||p.scaleFactorValue<=0)e.push("P07F12_SCALE_FACTOR_DOMAIN_INVALID");
    if(Math.abs(p.areaFactorValue-p.scaleFactorValue*p.scaleFactorValue)>1e-12)e.push("P07F12_K_SQUARED_INVARIANT_INVALID");
    if(spec.targetKind==="SOURCE_RECTANGLE_APPLICATION"){
      if(!p.applicationContextUsed||!p.unitConversionMetersToCentimetersRequired||!p.actualToPaperLengthInvariantVerified||p.paperAreaCm2!==p.paperLengthCm*p.paperWidthCm)e.push("P07F12_SOURCE_APPLICATION_INVALID");
    }else{
      if(p.applicationContextUsed||!p.areaSquareInvariantVerified||p.originalArea!==p.originalLength*p.originalWidth||p.scaledArea!==p.scaledLength*p.scaledWidth)e.push("P07F12_GENERIC_AREA_INVARIANT_INVALID");
    }
    if(!validateG6AU09P07F12Answer(q,q.answerText).ok)e.push("P07F12_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.rectangleAreaFormulaPrerequisiteRequired||!m.scaleFactorLengthPrerequisiteRequired||!m.scaleAreaChangeOwned||!m.areaSquareRelationValidated||m.q007LengthScaleFactorPrerequisiteTeachingReowned||m.similarShapeAngleTeachingReowned||m.scaleDrawingConstructionReowned||m.mapScaleDistanceReowned||m.mapScaleBarInterpretationUsed||m.genericGeometryAreaFormulaReowned||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q013OrLaterTouched||m.r04Reclassified)e.push("P07F12_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");
  for(const term of ["相似圖形角度","畫出放大圖","畫出縮圖","地圖上距離","比例尺線段"])if(learner.includes(term))e.push("P07F12_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU09P07F12Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F12_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F12_SELECTION_INVALID"]),warnings:Object.freeze([])});
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F12_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);
    const v=(hash(o.generationSeed??"p07f12-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*61)%240;
    questions.push(buildG6AU09P07F12Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));
  }
  const errors=questions.flatMap(q=>validateG6AU09P07F12Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F12_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
