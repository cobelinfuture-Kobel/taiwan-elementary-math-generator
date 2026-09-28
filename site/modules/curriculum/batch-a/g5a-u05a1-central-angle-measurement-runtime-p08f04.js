import {
  G5A_U05A1_P08F04_KP_ID as KP,
  G5A_U05A1_P08F04_PATTERN_GROUP as GROUP,
  G5A_U05A1_P08F04_PATTERN_SPECS as SPECS,
  G5A_U05A1_P08F04_SOURCE_ID as SRC,
  G5A_U05A1_P08F04_SPEC_IDS as SPEC_IDS
} from "../registry/g5a-u05a1-central-angle-measurement-selector-projection-p08f04.js";

export const G5A_U05A1_P08F04_MAX_QUESTION_COUNT=240;
export const G5A_U05A1_P08F04_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const ANGLES=Object.freeze([40,50,60,70,80,90,100,110,120,130,140,150]);
const ROTATIONS=Object.freeze(Array.from({length:20},(_,i)=>i*18));
const RADII=Object.freeze([46,50,54,58]);
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f04"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function point(cx,cy,r,deg){const rad=deg*Math.PI/180;return Object.freeze({x:Number((cx+r*Math.cos(rad)).toFixed(2)),y:Number((cy-r*Math.sin(rad)).toFixed(2))});}
function variantFor(spec,index,seed){
  const specIndex=SPEC_IDS.indexOf(spec.patternSpecId),v=(hashSeed(seed+"|"+spec.patternSpecId)+index)%960;
  return Object.freeze({variant:v,centralAngleDeg:ANGLES[v%ANGLES.length],rotationDeg:ROTATIONS[Math.floor(v/ANGLES.length)%ROTATIONS.length],radius:RADII[Math.floor(v/(ANGLES.length*ROTATIONS.length))%RADII.length],specIndex});
}
function diagramFor(spec,v){
  const center=Object.freeze({label:"O",x:120,y:74}),a=Object.freeze({label:"A",...point(center.x,center.y,v.radius,v.rotationDeg)}),b=Object.freeze({label:"B",...point(center.x,center.y,v.radius,v.rotationDeg+v.centralAngleDeg)});
  return Object.freeze({
    kind:"sector_elements_diagram",
    sectorElements:true,
    representationVariant:"SECTOR_ELEMENTS",
    markerMode:"CENTRAL_ANGLE_ARC",
    relation:spec.relation,
    diagramMode:spec.diagramMode,
    variant:v.variant,
    centralAngleDeg:v.centralAngleDeg,
    rotationDeg:v.rotationDeg,
    radius:v.radius,
    center,
    startPoint:a,
    endPoint:b,
    radii:Object.freeze([Object.freeze({name:"OA",from:"O",to:"A"}),Object.freeze({name:"OB",from:"O",to:"B"})]),
    arc:Object.freeze({name:"AB",from:"A",to:"B"}),
    closedByTwoRadiiAndArc:true,
    fullCircleInvariantDegrees:360,
    orientationInvariant:true
  });
}
function promptFor(spec,v){
  if(spec.relation==="MEASURE_CENTRAL_ANGLE_BETWEEN_TWO_RADII")return "請用量角器量一量，圖中兩條半徑 OA、OB 形成的圓心角 ∠AOB 是多少度？\n答：______°";
  if(spec.relation==="READ_CENTRAL_ANGLE_FROM_SECTOR_DIAGRAM")return "量一量圖中扇形的圓心角 ∠AOB，記錄它的度數。\n答：______°";
  return `同一個扇形旋轉前的圓心角是 ${v.centralAngleDeg}°。圖中是旋轉後的同一個扇形，圓心角是多少度？\n答：______°`;
}
function signature(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.centralAngleDeg,d.rotationDeg,d.radius,d.diagramMode].join("|");}
function build(spec,index,seed){
  const v=variantFor(spec,index,seed),geometryDiagram=diagramFor(spec,v),promptText=promptFor(spec,v),answerValue=v.centralAngleDeg,answerText=`${answerValue}°`;
  const q={
    id:`p08f04-q004-${spec.patternSpecId}-${v.variant}`,
    generatedItemId:`p08f04-q004-${spec.patternSpecId}-${v.variant}`,
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,
    questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue,geometryDiagram,
    metadata:Object.freeze({
      taskId:"P08F_W8DirectProductVerticalSlice004Implementation",
      authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F04_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sharedRuntimeScope:G5A_U05A1_P08F04_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_property",
      centralAngleMeasurementOwned:true,
      priorSectorElementsReowned:false,
      generalProtractorPlacementProcedureReowned:false,
      combinedSectorUnknownAngleReowned:false,
      sectorFractionOfCircleReowned:false,
      sameCircleSectorSizeComparisonReowned:false,
      sectorAreaArcLengthReowned:false,
      geometryConstructionReowned:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q005OrLaterTouched:false,
      humanVisualReviewRequired:true
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function selected(ids){
  if(!Array.isArray(ids)||ids.length===0)return [...SPECS];
  const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));
}
function geometryValid(d){
  if(!d||d.kind!=="sector_elements_diagram"||d.sectorElements!==true||d.representationVariant!=="SECTOR_ELEMENTS"||d.markerMode!=="CENTRAL_ANGLE_ARC"||!ANGLES.includes(d.centralAngleDeg)||!ROTATIONS.includes(d.rotationDeg)||!RADII.includes(d.radius)||d.closedByTwoRadiiAndArc!==true||d.fullCircleInvariantDegrees!==360||d.orientationInvariant!==true)return false;
  if(d.center?.label!=="O"||d.startPoint?.label!=="A"||d.endPoint?.label!=="B"||!Array.isArray(d.radii)||d.radii.length!==2||d.arc?.name!=="AB")return false;
  const a=point(d.center.x,d.center.y,d.radius,d.rotationDeg),b=point(d.center.x,d.center.y,d.radius,d.rotationDeg+d.centralAngleDeg);
  return Math.abs(a.x-d.startPoint.x)<0.02&&Math.abs(a.y-d.startPoint.y)<0.02&&Math.abs(b.x-d.endPoint.x)<0.02&&Math.abs(b.y-d.endPoint.y)<0.02;
}
export function validateG5AU05A1P08F04Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P08F04_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F04_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F04_KP_OR_GROUP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F04_MODE_INVALID");
  const d=q?.geometryDiagram;
  if(!geometryValid(d)||d?.relation!==spec?.relation||d?.diagramMode!==spec?.diagramMode)e.push("P08F04_DIAGRAM_INVALID");
  if(q?.answerValue!==d?.centralAngleDeg||q?.answerText!==`${d?.centralAngleDeg}°`)e.push("P08F04_ANSWER_INVALID");
  if(spec&&d){
    const expectedPrompt=promptFor(spec,{centralAngleDeg:d.centralAngleDeg});
    if(q.promptText!==expectedPrompt||q.blankedDisplayText!==expectedPrompt)e.push("P08F04_PROMPT_INVALID");
    if(q.questionSignature!==signature(q))e.push("P08F04_SIGNATURE_INVALID");
  }
  const m=q?.metadata;
  if(m?.centralAngleMeasurementOwned!==true||m?.priorSectorElementsReowned||m?.generalProtractorPlacementProcedureReowned||m?.combinedSectorUnknownAngleReowned||m?.sectorFractionOfCircleReowned||m?.sameCircleSectorSizeComparisonReowned||m?.sectorAreaArcLengthReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q005OrLaterTouched)e.push("P08F04_SCOPE_LEAK");
  const learner=`${q?.promptText??""} ${q?.answerText??""}`;
  for(const term of ["占全圓","幾分之幾","比較扇形","扇形面積","弧長","合併扇形","作圖"])if(learner.includes(term))e.push("P08F04_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG5AU05A1P08F04Answer(q,answer){
  const v=validateG5AU05A1P08F04Question(q);if(!v.ok)return v;
  const normalized=typeof answer==="string"?answer.trim().replace(/度$/,"").replace(/°$/,""):answer,ok=Number(normalized)===q.answerValue;
  return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F04_ANSWER_MISMATCH"])});
}
export function generateG5AU05A1P08F04Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F04_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F04_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const seed=String(o.generationSeed??"p08f04-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
  for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
  const errors=questions.flatMap(q=>validateG5AU05A1P08F04Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F04_DUPLICATE_QUESTION_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
