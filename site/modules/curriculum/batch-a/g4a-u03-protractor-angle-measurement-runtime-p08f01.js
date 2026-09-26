import {
  G4A_U03_P08F01_KP_ID as KP,
  G4A_U03_P08F01_PATTERN_GROUP as GROUP,
  G4A_U03_P08F01_PATTERN_SPECS as SPECS,
  G4A_U03_P08F01_SOURCE_ID as SRC,
  G4A_U03_P08F01_SPEC_IDS as SPEC_IDS
} from "../registry/g4a-u03-protractor-angle-measurement-selector-projection-p08f01.js";

export const G4A_U03_P08F01_MAX_QUESTION_COUNT=240;
export const G4A_U03_P08F01_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const ANGLES=Object.freeze(Array.from({length:16},(_,i)=>(i+1)*10));
const ROTATIONS=Object.freeze(Array.from({length:15},(_,i)=>i*12));
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f01"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function variant(index,specIndex,seed){return (hashSeed(seed)+specIndex*79+index*7)%240;}
function rowFor(spec,v){
  const targetDegrees=ANGLES[v%ANGLES.length],rotationDeg=ROTATIONS[Math.floor(v/ANGLES.length)%ROTATIONS.length];
  if(spec.relation==="VERIFY_PROTRACTOR_ALIGNMENT"){
    const mode=v%4,centerAligned=mode===0||mode===2,zeroBaselineAligned=mode===0||mode===1;
    return Object.freeze({variant:v,targetDegrees,rotationDeg,baselineSide:v%2===0?"LEFT":"RIGHT",centerAligned,zeroBaselineAligned,
      centerOffsetPx:centerAligned?0:(v%2===0?16:-16),scaleRotationOffsetDeg:zeroBaselineAligned?0:(v%2===0?12:-12)});
  }
  return Object.freeze({variant:v,targetDegrees,rotationDeg,baselineSide:spec.baselineSide,centerAligned:true,zeroBaselineAligned:true,centerOffsetPx:0,scaleRotationOffsetDeg:0});
}
function alignmentState(row){
  if(row.centerAligned&&row.zeroBaselineAligned)return Object.freeze({code:"A",text:"A"});
  if(row.centerAligned&&!row.zeroBaselineAligned)return Object.freeze({code:"B",text:"B"});
  if(!row.centerAligned&&row.zeroBaselineAligned)return Object.freeze({code:"C",text:"C"});
  return Object.freeze({code:"D",text:"D"});
}
function promptFor(spec){
  if(spec.relation==="VERIFY_PROTRACTOR_ALIGNMENT")return "判斷量角器的放置：\nA 都正確　B 只中心正確\nC 只 0° 線正確　D 都不正確";
  return "請看量角器，這個角是多少度？";
}
function answerFor(spec,row){
  if(spec.relation==="VERIFY_PROTRACTOR_ALIGNMENT"){const state=alignmentState(row);return Object.freeze({answerText:state.text,answerValue:state.code,alignmentStateCode:state.code});}
  return Object.freeze({answerText:`${row.targetDegrees}°`,answerValue:row.targetDegrees,alignmentStateCode:null});
}
function diagramFor(row){return Object.freeze({kind:"protractor_angle_measurement_diagram",targetDegrees:row.targetDegrees,rotationDeg:row.rotationDeg,baselineSide:row.baselineSide,centerAligned:row.centerAligned,zeroBaselineAligned:row.zeroBaselineAligned,centerOffsetPx:row.centerOffsetPx,scaleRotationOffsetDeg:row.scaleRotationOffsetDeg,dualScale:true});}
function signature(q){const d=q.geometryDiagram;return [q.patternSpecId,d.targetDegrees,d.rotationDeg,d.baselineSide,d.centerAligned,d.zeroBaselineAligned,d.centerOffsetPx,d.scaleRotationOffsetDeg].join("|");}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function build(spec,index,seed){const si=SPEC_IDS.indexOf(spec.patternSpecId),r=rowFor(spec,variant(index,si,seed)),a=answerFor(spec,r),promptText=promptFor(spec),geometryDiagram=diagramFor(r);const q={
 id:`p08f01-q001-${si+1}-${r.variant+1}`,generatedItemId:`p08f01-q001-${si+1}-${r.variant+1}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,
 patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,
 blankedDisplayText:promptText,displayText:`${promptText} ${a.answerText}`,answerText:a.answerText,answerValue:a.answerValue,geometryDiagram,
 metadata:Object.freeze({taskId:"P08F_W8_Q001_LearnerFacingAcceptanceRepair",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F01_PREFLIGHT",sourcePages:Object.freeze([1,2]),
 sharedRuntimeScope:G4A_U03_P08F01_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",scaleInstrumentModifier:"mod_scale_instrument",
 protractorCenterAligned:r.centerAligned,zeroDegreeBaselineAligned:r.zeroBaselineAligned,readingDirectionMatchesSelectedZero:true,dualScaleVisible:true,
 alignmentStateCode:a.alignmentStateCode,alignmentDiagnosticResolution:a.alignmentStateCode?"CENTER_AND_ZERO_LINE_4_STATE":null,
 angleCompositionReowned:false,rotationClockReowned:false,estimationClassificationReowned:false,unknownAngleReowned:false,q002OrLaterTouched:false})
 };return Object.freeze({...q,questionSignature:signature(q)});}
export function validateG4AU03P08F01Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F01_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F01_SOURCE_INVALID");if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F01_KP_OR_GROUP_INVALID");
 if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F01_MODE_INVALID");const d=q?.geometryDiagram;
 if(!d||d.kind!=="protractor_angle_measurement_diagram")e.push("P08F01_DIAGRAM_MISSING");else{
  if(!ANGLES.includes(d.targetDegrees)||!ROTATIONS.includes(d.rotationDeg)||!["LEFT","RIGHT"].includes(d.baselineSide)||d.dualScale!==true)e.push("P08F01_DIAGRAM_GEOMETRY_INVALID");
  if(typeof d.centerAligned!=="boolean"||typeof d.zeroBaselineAligned!=="boolean")e.push("P08F01_ALIGNMENT_FLAGS_INVALID");
  if(d.centerAligned!== (d.centerOffsetPx===0))e.push("P08F01_CENTER_ALIGNMENT_INVALID");
  if(d.zeroBaselineAligned!== (d.scaleRotationOffsetDeg===0))e.push("P08F01_ZERO_ALIGNMENT_INVALID");
  if(spec?.relation!=="VERIFY_PROTRACTOR_ALIGNMENT"&&(!d.centerAligned||!d.zeroBaselineAligned))e.push("P08F01_READING_REQUIRES_VALID_PLACEMENT");
  if(spec?.relation==="VERIFY_PROTRACTOR_ALIGNMENT"){
    const expected=alignmentState(d).code;if(q.answerText!==expected||q.answerValue!==expected||q?.metadata?.alignmentStateCode!==expected)e.push("P08F01_ANSWER_INVALID");
  }else if(q.answerText!==`${d.targetDegrees}°`||q.answerValue!==d.targetDegrees)e.push("P08F01_ANSWER_INVALID");
  if(q.questionSignature!==signature(q))e.push("P08F01_SIGNATURE_INVALID");
 }
 if(q?.metadata?.angleCompositionReowned||q?.metadata?.rotationClockReowned||q?.metadata?.estimationClassificationReowned||q?.metadata?.unknownAngleReowned||q?.metadata?.q002OrLaterTouched)e.push("P08F01_SCOPE_LEAK");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU03P08F01Answer(q,answer){
 const v=validateG4AU03P08F01Question(q);if(!v.ok)return v;
 const normalized=typeof answer==="string"?answer.trim().replace(/度$/,"").replace(/°$/,"").toUpperCase():answer;
 const ok=typeof q.answerValue==="number"?Number(normalized)===q.answerValue:String(normalized)===String(q.answerValue).toUpperCase();
 return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F01_ANSWER_MISMATCH"])});
}
export function generateG4AU03P08F01Questions(o={}){
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F01_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F01_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seed=String(o.generationSeed??"p08f01-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced;
 const seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
 const errors=questions.flatMap(q=>validateG4AU03P08F01Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F01_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240});
}
