import {G4A_U03_P08F05_KP_ID as KP,G4A_U03_P08F05_PATTERN_GROUP as GROUP,G4A_U03_P08F05_PATTERN_SPECS as SPECS,G4A_U03_P08F05_SOURCE_ID as SRC,G4A_U03_P08F05_SPEC_IDS as SPEC_IDS} from "../registry/g4a-u03-angle-estimation-classification-selector-projection-p08f05.js";
export const G4A_U03_P08F05_MAX_QUESTION_COUNT=240;
export const G4A_U03_P08F05_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const ESTIMATE_ANGLES=Object.freeze([30,40,50,60,70,80,100,110,120,130,140,150,160]);
const CLASSIFY_ANGLES=Object.freeze([30,45,60,75,90,105,120,135,150,180,360]);
const INVARIANT_ANGLES=Object.freeze([45,60,75,90,110,120,135,150,180]);
const ROTATIONS=Object.freeze(Array.from({length:12},(_,i)=>i*30));
const LENGTHS=Object.freeze([48,60]);
const LENGTH_PAIRS=Object.freeze([[42,72],[50,66],[38,76]].map(Object.freeze));
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f05"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function classify(deg){if(deg>0&&deg<90)return "銳角";if(deg===90)return "直角";if(deg>90&&deg<180)return "鈍角";if(deg===180)return "平角";if(deg===360)return "周角";return null;}
function vindex(spec,index,seed,size){return (hashSeed(seed+"|"+spec.patternSpecId)+index)%size;}
function rowFor(spec,index,seed){
 if(spec.relation==="ESTIMATE_ANGLE_USING_REFERENCE_ANGLE"){
  const size=ESTIMATE_ANGLES.length*ROTATIONS.length*LENGTHS.length,v=vindex(spec,index,seed,size),angleDeg=ESTIMATE_ANGLES[v%ESTIMATE_ANGLES.length],rotationDeg=ROTATIONS[Math.floor(v/ESTIMATE_ANGLES.length)%ROTATIONS.length],armLength=LENGTHS[Math.floor(v/(ESTIMATE_ANGLES.length*ROTATIONS.length))%LENGTHS.length];
  return Object.freeze({variant:v,diagramMode:spec.diagramMode,angleDeg,rotationDeg,armLength,referenceAngleDeg:90,answerValue:angleDeg,answerKind:"DEGREES"});
 }
 if(spec.relation==="CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE"){
  const size=CLASSIFY_ANGLES.length*ROTATIONS.length*LENGTHS.length,v=vindex(spec,index,seed,size),angleDeg=CLASSIFY_ANGLES[v%CLASSIFY_ANGLES.length],rotationDeg=ROTATIONS[Math.floor(v/CLASSIFY_ANGLES.length)%ROTATIONS.length],armLength=LENGTHS[Math.floor(v/(CLASSIFY_ANGLES.length*ROTATIONS.length))%LENGTHS.length],classification=classify(angleDeg);
  return Object.freeze({variant:v,diagramMode:spec.diagramMode,angleDeg,rotationDeg,armLength,classification,answerValue:classification,answerKind:"CLASSIFICATION"});
 }
 const size=INVARIANT_ANGLES.length*ROTATIONS.length*LENGTH_PAIRS.length,v=vindex(spec,index,seed,size),angleDeg=INVARIANT_ANGLES[v%INVARIANT_ANGLES.length],rotationDeg=ROTATIONS[Math.floor(v/INVARIANT_ANGLES.length)%ROTATIONS.length],pair=LENGTH_PAIRS[Math.floor(v/(INVARIANT_ANGLES.length*ROTATIONS.length))%LENGTH_PAIRS.length],classification=classify(angleDeg);
 return Object.freeze({variant:v,diagramMode:spec.diagramMode,angleDeg,rotationDeg,armLengthA:pair[0],armLengthB:pair[1],classification,answerValue:classification,answerKind:"CLASSIFICATION"});
}
function promptFor(spec){
 if(spec.relation==="ESTIMATE_ANGLE_USING_REFERENCE_ANGLE")return "請以圖中的直角 90° 為基準估一估，目標角大約是多少度？\n答：約 ______°";
 if(spec.relation==="CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE")return "看圖判斷這個角屬於哪一類：銳角、直角、鈍角、平角或周角？\n答：______";
 return "圖中的甲、乙兩個角邊長不同，但張開程度相同。它們都屬於哪一類角？\n答：______";
}
function diagramFor(spec,row){return Object.freeze({kind:"angle_estimation_classification_diagram",relation:spec.relation,diagramMode:row.diagramMode,variant:row.variant,angleDeg:row.angleDeg,rotationDeg:row.rotationDeg,armLength:row.armLength??null,armLengthA:row.armLengthA??null,armLengthB:row.armLengthB??null,referenceAngleDeg:row.referenceAngleDeg??null,classification:row.classification??null,classificationIndependentOfArmLength:spec.relation==="RECOGNIZE_CLASSIFICATION_INVARIANT_UNDER_ARM_LENGTH_CHANGE",protractorShown:false,exactDegreeLabelShown:false});}
function signature(q){const d=q.geometryDiagram;return [q.patternSpecId,d.variant,d.diagramMode,d.angleDeg,d.rotationDeg,d.armLength??"",d.armLengthA??"",d.armLengthB??"",d.referenceAngleDeg??"",d.classification??""].join("|");}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return SPECS;const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function target(o={}){const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;if(o.knowledgePointId===KP)return true;return (o.patternSpecIds??[]).some(id=>BY_SPEC.has(id));}
function build(spec,index,seed){
 const row=rowFor(spec,index,seed),promptText=promptFor(spec),geometryDiagram=diagramFor(spec,row),answerText=row.answerKind==="DEGREES"?String(row.answerValue)+"°":String(row.answerValue);
 const q={id:"p08f05-q005-"+spec.patternSpecId+"-"+row.variant,generatedItemId:"p08f05-q005-"+spec.patternSpecId+"-"+row.variant,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:promptText+" "+answerText,answerText,answerValue:row.answerValue,geometryDiagram,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice005Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F05_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G4A_U03_P08F05_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",angleEstimationClassificationOwned:true,referenceAngleEstimate:spec.relation==="ESTIMATE_ANGLE_USING_REFERENCE_ANGLE",classificationByMagnitude:spec.relation==="CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE",classificationIndependentOfArmLength:spec.relation==="RECOGNIZE_CLASSIFICATION_INVARIANT_UNDER_ARM_LENGTH_CHANGE",protractorMeasurementReowned:false,angleCompositionDecompositionReowned:false,rotationClockAngleReowned:false,linearFullVerticalUnknownAngleReowned:false,geometryConstructionReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q006OrLaterTouched:false,humanVisualReviewRequired:true})};
 return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG4AU03P08F05Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId),d=q?.geometryDiagram;
 if(!spec)e.push("P08F05_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F05_SOURCE_INVALID");
 if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F05_KP_INVALID");
 if(q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F05_GROUP_INVALID");
 if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F05_MODE_INVALID");
 if(!d||d.kind!=="angle_estimation_classification_diagram"||d.relation!==q?.relation||d.diagramMode!==spec?.diagramMode||d.protractorShown!==false||d.exactDegreeLabelShown!==false)e.push("P08F05_DIAGRAM_INVALID");
 else{
  if(!Number.isInteger(d.angleDeg)||![...ESTIMATE_ANGLES,...CLASSIFY_ANGLES,...INVARIANT_ANGLES].includes(d.angleDeg)||!ROTATIONS.includes(d.rotationDeg))e.push("P08F05_ANGLE_MODEL_INVALID");
  if(spec?.relation==="ESTIMATE_ANGLE_USING_REFERENCE_ANGLE"){
   if(d.referenceAngleDeg!==90||!LENGTHS.includes(d.armLength)||q.answerValue!==d.angleDeg||q.answerText!==String(d.angleDeg)+"°")e.push("P08F05_ESTIMATE_MODEL_INVALID");
  }else if(spec?.relation==="CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE"){
   const c=classify(d.angleDeg);if(!c||d.classification!==c||q.answerValue!==c||q.answerText!==c||!LENGTHS.includes(d.armLength))e.push("P08F05_CLASSIFICATION_MODEL_INVALID");
  }else{
   const c=classify(d.angleDeg);if(!c||d.classification!==c||q.answerValue!==c||q.answerText!==c||d.classificationIndependentOfArmLength!==true||!LENGTH_PAIRS.some(p=>p[0]===d.armLengthA&&p[1]===d.armLengthB)||d.armLengthA===d.armLengthB)e.push("P08F05_ARM_LENGTH_INVARIANT_INVALID");
  }
 }
 if(q?.metadata?.protractorMeasurementReowned||q?.metadata?.angleCompositionDecompositionReowned||q?.metadata?.rotationClockAngleReowned||q?.metadata?.linearFullVerticalUnknownAngleReowned||q?.metadata?.geometryConstructionReowned||q?.metadata?.sameUnitMixedUsed||q?.metadata?.crossUnitMixedUsed||q?.metadata?.q006OrLaterTouched)e.push("P08F05_SCOPE_LEAK");
 if(d&&q.questionSignature!==signature(q))e.push("P08F05_SIGNATURE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU03P08F05Answer(q,answer){
 const v=validateG4AU03P08F05Question(q);if(!v.ok)return v;
 let ok=false;
 if(typeof q.answerValue==="number"){const normalized=typeof answer==="string"?answer.trim().replace(/^約\s*/,"").replace(/度$/,"").replace(/°$/,""):answer;ok=Number(normalized)===q.answerValue;}
 else ok=String(answer??"").trim()===q.answerText;
 return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F05_ANSWER_MISMATCH"])});
}
export function generateG4AU03P08F05Questions(o={}){
 if(!target(o))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F05_KP_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
 if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F05_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F05_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seed=String(o.generationSeed??"p08f05-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
 for(const spec of schedule){const n=seq.get(spec.patternSpecId);seq.set(spec.patternSpecId,n+1);questions.push(build(spec,n,seed));}
 const errors=questions.flatMap(q=>validateG4AU03P08F05Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F05_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
