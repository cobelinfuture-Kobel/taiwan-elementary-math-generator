import {G5A_U07_P08F11_KP_ID as KP,G5A_U07_P08F11_PATTERN_GROUP as GROUP,G5A_U07_P08F11_PATTERN_SPECS as SPECS,G5A_U07_P08F11_SOURCE_ID as SRC,G5A_U07_P08F11_SPEC_IDS as SPEC_IDS} from "../registry/g5a-u07-coordinate-reflection-selector-projection-p08f11.js";

export const G5A_U07_P08F11_MAX_QUESTION_COUNT=240;
export const G5A_U07_P08F11_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const LABELS=Object.freeze(["A","B","C","D"]);
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f11"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],r=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function coordText(p){return `(${p.x}, ${p.y})`;}
function variantFor(spec,index,seed){
  const base=(hashSeed(seed+"|"+spec.patternSpecId)+index)%624;
  const label=LABELS[base%LABELS.length];
  const n=Math.floor(base/LABELS.length);
  let axis,source,image;
  if(spec.diagramMode==="VERTICAL_AXIS"){
    const distance=(n%6)+1,side=Math.floor(n/6)%2===0?-1:1,y=(Math.floor(n/12)%13)-6;
    axis={orientation:"VERTICAL",value:0,label:"x = 0"};source={label,x:side*distance,y};image={label:label+"′",x:-side*distance,y};
  }else if(spec.diagramMode==="HORIZONTAL_AXIS"){
    const distance=(n%6)+1,side=Math.floor(n/6)%2===0?-1:1,x=(Math.floor(n/12)%13)-6;
    axis={orientation:"HORIZONTAL",value:0,label:"y = 0"};source={label,x,y:side*distance};image={label:label+"′",x,y:-side*distance};
  }else{
    const orientation=Math.floor(n/2)%2===0?"VERTICAL":"HORIZONTAL",axisValues=[-2,-1,1,2],value=axisValues[Math.floor(n/4)%axisValues.length],distance=(Math.floor(n/16)%4)+1,side=Math.floor(n/64)%2===0?-1:1,free=(Math.floor(n/128)%11)-5;
    if(orientation==="VERTICAL"){axis={orientation,value,label:`x = ${value}`};source={label,x:value+side*distance,y:free};image={label:label+"′",x:value-side*distance,y:free};}
    else{axis={orientation,value,label:`y = ${value}`};source={label,x:free,y:value+side*distance};image={label:label+"′",x:free,y:value-side*distance};}
  }
  return Object.freeze({variant:base,label,axis:Object.freeze(axis),source:Object.freeze(source),image:Object.freeze(image),specIndex:SPEC_IDS.indexOf(spec.patternSpecId)});
}
function diagramFor(spec,v){return Object.freeze({
  kind:"coordinate_reflection_diagram",
  representationVariant:"COORDINATE_REFLECTION_ACROSS_AXIS",
  diagramMode:spec.diagramMode,
  relation:spec.relation,
  variant:v.variant,
  gridMin:-7,
  gridMax:7,
  axis:v.axis,
  sourcePoint:v.source,
  reflectedPoint:v.image,
  reflectedPointVisible:false,
  reflectionAxisRequired:true,
  perpendicularDistanceToAxisPreserved:true,
  segmentLengthsPreserved:true,
  angleMeasuresPreserved:true,
  orientationMayReverse:true,
  pointsOnAxisRemainFixed:true,
  coordinateOrGridRepresentationRequired:true,
  rulerMeasurementRequired:false,
  printScaleIsAnswerAuthority:false
});}
function promptFor(spec,v){
  if(spec.diagramMode==="VERTICAL_AXIS")return `點 ${v.source.label} 的座標是 ${coordText(v.source)}。以 y 軸（x = 0）為對稱軸鏡射後，點 ${v.image.label} 的座標是多少？\n答：______`;
  if(spec.diagramMode==="HORIZONTAL_AXIS")return `點 ${v.source.label} 的座標是 ${coordText(v.source)}。以 x 軸（y = 0）為對稱軸鏡射後，點 ${v.image.label} 的座標是多少？\n答：______`;
  return `點 ${v.source.label} 的座標是 ${coordText(v.source)}。以直線 ${v.axis.label} 為對稱軸鏡射後，點 ${v.image.label} 的座標是多少？\n答：______`;
}
function answerDiagramFor(d){return Object.freeze({...d,reflectedPointVisible:true});}
function signature(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.axis.orientation,d.axis.value,d.sourcePoint.x,d.sourcePoint.y,d.reflectedPoint.x,d.reflectedPoint.y,d.sourcePoint.label].join("|");}
function build(spec,index,seed){
  const v=variantFor(spec,index,seed),geometryDiagram=diagramFor(spec,v),answerGeometryDiagram=answerDiagramFor(geometryDiagram),promptText=promptFor(spec,v),answerText=coordText(v.image),q={
    id:`p08f11-q011-${spec.patternSpecId}-${v.variant}`,generatedItemId:`p08f11-q011-${spec.patternSpecId}-${v.variant}`,
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,
    questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue:Object.freeze({x:v.image.x,y:v.image.y}),geometryDiagram,answerGeometryDiagram,
    metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice011Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F11_PREFLIGHT",sourcePages:Object.freeze([1]),sharedRuntimeScope:G5A_U07_P08F11_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",appliedRuntimeModifierIds:Object.freeze(["mod_coordinate_map"]),coordinateReflectionOwned:true,lineSymmetryRecognitionReowned:false,symmetryAxisCountReowned:false,symmetricPointDistanceStandaloneReowned:false,completeSymmetricFigureReowned:false,geometryConstructionReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q012OrLaterTouched:false,humanVisualReviewRequired:true,rulerMeasurementRequired:false,printScaleIsAnswerAuthority:false})
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function validPoint(p){return p&&typeof p.label==="string"&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=-7&&p.x<=7&&p.y>=-7&&p.y<=7;}
function diagramValid(d,solutionVisible){
  if(!d||d.kind!=="coordinate_reflection_diagram"||d.representationVariant!=="COORDINATE_REFLECTION_ACROSS_AXIS"||!["VERTICAL_AXIS","HORIZONTAL_AXIS","SHIFTED_AXIS"].includes(d.diagramMode)||!Number.isInteger(d.variant)||d.variant<0||d.variant>=624||!["VERTICAL","HORIZONTAL"].includes(d.axis?.orientation)||!Number.isInteger(d.axis?.value)||!validPoint(d.sourcePoint)||!validPoint(d.reflectedPoint)||d.reflectedPointVisible!==solutionVisible||d.reflectionAxisRequired!==true||d.perpendicularDistanceToAxisPreserved!==true||d.segmentLengthsPreserved!==true||d.angleMeasuresPreserved!==true||d.orientationMayReverse!==true||d.pointsOnAxisRemainFixed!==true||d.coordinateOrGridRepresentationRequired!==true||d.rulerMeasurementRequired!==false||d.printScaleIsAnswerAuthority!==false)return false;
  if(d.axis.orientation==="VERTICAL"){if(d.sourcePoint.y!==d.reflectedPoint.y)return false;if(d.sourcePoint.x+d.reflectedPoint.x!==2*d.axis.value)return false;}
  else{if(d.sourcePoint.x!==d.reflectedPoint.x)return false;if(d.sourcePoint.y+d.reflectedPoint.y!==2*d.axis.value)return false;}
  if(d.diagramMode==="VERTICAL_AXIS"&&(d.axis.orientation!=="VERTICAL"||d.axis.value!==0))return false;
  if(d.diagramMode==="HORIZONTAL_AXIS"&&(d.axis.orientation!=="HORIZONTAL"||d.axis.value!==0))return false;
  if(d.diagramMode==="SHIFTED_AXIS"&&d.axis.value===0)return false;
  return true;
}
export function validateG5AU07P08F11Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F11_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F11_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F11_KP_OR_GROUP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F11_MODE_INVALID");
  const d=q?.geometryDiagram,a=q?.answerGeometryDiagram;
  if(!diagramValid(d,false)||!diagramValid(a,true)||d?.relation!==spec?.relation||d?.diagramMode!==spec?.diagramMode)e.push("P08F11_DIAGRAM_INVALID");
  if(d&&a){const expected=answerDiagramFor(d);if(JSON.stringify(a)!==JSON.stringify(expected))e.push("P08F11_ANSWER_DIAGRAM_INVALID");if(q.answerValue?.x!==d.reflectedPoint.x||q.answerValue?.y!==d.reflectedPoint.y||q.answerText!==coordText(d.reflectedPoint))e.push("P08F11_ANSWER_INVALID");}
  if(spec&&d){const v={source:d.sourcePoint,image:d.reflectedPoint,axis:d.axis};if(q.promptText!==promptFor(spec,v)||q.blankedDisplayText!==promptFor(spec,v))e.push("P08F11_PROMPT_INVALID");if(q.questionSignature!==signature(q))e.push("P08F11_SIGNATURE_INVALID");}
  const m=q?.metadata;if(m?.coordinateReflectionOwned!==true||m?.lineSymmetryRecognitionReowned||m?.symmetryAxisCountReowned||m?.symmetricPointDistanceStandaloneReowned||m?.completeSymmetricFigureReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q012OrLaterTouched||m?.rulerMeasurementRequired!==false||m?.printScaleIsAnswerAuthority!==false)e.push("P08F11_SCOPE_LEAK");
  const learner=`${q?.promptText??""} ${q?.answerText??""}`;for(const term of ["找出所有對稱軸","補全圖形","作圖","量角器","尺量"])if(learner.includes(term))e.push("P08F11_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG5AU07P08F11Answer(q,answer){
  const v=validateG5AU07P08F11Question(q);if(!v.ok)return v;
  const s=String(answer??"").trim().replaceAll("（","(").replaceAll("）",")").replaceAll("，",",").replace(/\s+/g,"");
  const m=s.match(/^\((-?\d+),(-?\d+)\)$/);if(!m)return Object.freeze({ok:false,errors:Object.freeze(["P08F11_ANSWER_FORMAT_INVALID"])});
  const ok=Number(m[1])===q.answerValue.x&&Number(m[2])===q.answerValue.y;return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F11_ANSWER_MISMATCH"])});
}
export function generateG5AU07P08F11Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F11_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F11_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const seed=String(o.generationSeed??"p08f11-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
  for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
  const errors=questions.flatMap(q=>validateG5AU07P08F11Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F11_DUPLICATE_QUESTION_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
