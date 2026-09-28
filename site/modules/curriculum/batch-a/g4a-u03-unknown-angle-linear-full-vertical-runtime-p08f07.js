import {G4A_U03_P08F07_KP_ID as KP,G4A_U03_P08F07_PATTERN_GROUP as GROUP,G4A_U03_P08F07_PATTERN_SPECS as SPECS,G4A_U03_P08F07_SOURCE_ID as SRC,G4A_U03_P08F07_SPEC_IDS as SPEC_IDS} from "../registry/g4a-u03-unknown-angle-linear-full-vertical-selector-projection-p08f07.js";
export const G4A_U03_P08F07_MAX_QUESTION_COUNT=240;
export const G4A_U03_P08F07_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const LINEAR_VALUES=Object.freeze(Array.from({length:24},(_,i)=>20+i*5));
const FULL_TRIPLES=Object.freeze([[40,60,80],[45,65,90],[50,70,100],[55,75,95],[60,80,100],[65,85,105],[40,90,110],[50,80,120],[60,70,130],[45,95,115],[55,85,125],[65,75,135]].map(Object.freeze));
const ROTATIONS=Object.freeze(Array.from({length:20},(_,i)=>i*18));
const RADII=Object.freeze([52,56,60,64]);
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f07"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],r=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function variantIndex(spec,index,seed){return (hashSeed(seed+"|"+spec.patternSpecId)+index)%960;}
function rowFor(spec,index,seed){
 const v=variantIndex(spec,index,seed),rotationDeg=ROTATIONS[Math.floor(v/(spec.diagramMode==="FULL_TURN_REMAINDER"?12:24))%ROTATIONS.length];
 if(spec.diagramMode==="FULL_TURN_REMAINDER"){
  const knownAngles=Object.freeze([...FULL_TRIPLES[v%FULL_TRIPLES.length]]),unknownAngleDeg=360-knownAngles.reduce((a,b)=>a+b,0),radius=RADII[Math.floor(v/(FULL_TRIPLES.length*ROTATIONS.length))%RADII.length];
  return Object.freeze({variant:v,rotationDeg,radius,knownAngles,unknownAngleDeg});
 }
 const knownAngleDeg=LINEAR_VALUES[v%LINEAR_VALUES.length],radius=RADII[Math.floor(v/(LINEAR_VALUES.length*ROTATIONS.length))%RADII.length],unknownAngleDeg=spec.diagramMode==="LINEAR_PAIR_REMAINDER"?180-knownAngleDeg:knownAngleDeg;
 return Object.freeze({variant:v,rotationDeg,radius,knownAngleDeg,unknownAngleDeg});
}
function diagramFor(spec,row){
 const common={kind:"unknown_angle_linear_full_vertical_diagram",representationVariant:"UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL",diagramMode:spec.diagramMode,relation:spec.relation,variant:row.variant,rotationDeg:row.rotationDeg,radius:row.radius,center:Object.freeze({label:"O",x:160,y:92}),linearAdjacentAngleSumDegrees:180,fullTurnAngleSumDegrees:360,verticalAnglesEqual:true,unknownAngleFromExplicitRelation:true};
 if(spec.diagramMode==="FULL_TURN_REMAINDER")return Object.freeze({...common,knownAngles:row.knownAngles,unknownAngleDeg:row.unknownAngleDeg});
 return Object.freeze({...common,knownAngleDeg:row.knownAngleDeg,unknownAngleDeg:row.unknownAngleDeg});
}
function promptFor(spec,row){
 if(spec.diagramMode==="LINEAR_PAIR_REMAINDER")return `一直線上的相鄰兩角和是 180°。圖中已知一角是 ${row.knownAngleDeg}°，求「？」的角度。\n答：______°`;
 if(spec.diagramMode==="FULL_TURN_REMAINDER")return `同一點周圍一周是 360°。圖中三個已知角是 ${row.knownAngles.map(x=>x+"°").join("、")}，求「？」的角度。\n答：______°`;
 return `兩直線相交時，對頂角相等。圖中已知一角是 ${row.knownAngleDeg}°，求與它相對的「？」角。\n答：______°`;
}
function signature(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.diagramMode,d.rotationDeg,d.radius,d.knownAngleDeg??"",d.knownAngles?.join(",")??"",d.unknownAngleDeg].join("|");}
function build(spec,index,seed){
 const row=rowFor(spec,index,seed),geometryDiagram=diagramFor(spec,row),promptText=promptFor(spec,row),answerValue=row.unknownAngleDeg,answerText=`${answerValue}°`;
 const q={id:`p08f07-q007-${spec.patternSpecId}-${row.variant}`,generatedItemId:`p08f07-q007-${spec.patternSpecId}-${row.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue,geometryDiagram,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice007Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F07_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G4A_U03_P08F07_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",unknownAngleLinearFullVerticalOwned:true,protractorMeasurementReowned:false,angleCompositionDecompositionReowned:false,rotationClockAngleReowned:false,estimationClassificationReowned:false,geometryConstructionReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q008OrLaterTouched:false,humanVisualReviewRequired:true})};
 return Object.freeze({...q,questionSignature:signature(q)});
}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function geometryValid(d,spec){
 if(!d||d.kind!=="unknown_angle_linear_full_vertical_diagram"||d.representationVariant!=="UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL"||d.diagramMode!==spec?.diagramMode||d.relation!==spec?.relation||!Number.isInteger(d.variant)||d.variant<0||d.variant>959||!ROTATIONS.includes(d.rotationDeg)||!RADII.includes(d.radius)||d.center?.label!=="O"||d.linearAdjacentAngleSumDegrees!==180||d.fullTurnAngleSumDegrees!==360||d.verticalAnglesEqual!==true||d.unknownAngleFromExplicitRelation!==true)return false;
 if(spec.diagramMode==="LINEAR_PAIR_REMAINDER")return Number.isInteger(d.knownAngleDeg)&&LINEAR_VALUES.includes(d.knownAngleDeg)&&Number.isInteger(d.unknownAngleDeg)&&d.knownAngleDeg+d.unknownAngleDeg===180;
 if(spec.diagramMode==="FULL_TURN_REMAINDER")return Array.isArray(d.knownAngles)&&d.knownAngles.length===3&&FULL_TRIPLES.some(x=>x.join("|")===d.knownAngles.join("|"))&&Number.isInteger(d.unknownAngleDeg)&&d.knownAngles.reduce((a,b)=>a+b,0)+d.unknownAngleDeg===360;
 return Number.isInteger(d.knownAngleDeg)&&LINEAR_VALUES.includes(d.knownAngleDeg)&&Number.isInteger(d.unknownAngleDeg)&&d.knownAngleDeg===d.unknownAngleDeg;
}
export function validateG4AU03P08F07Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F07_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F07_SOURCE_INVALID");
 if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F07_KP_OR_GROUP_INVALID");
 if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F07_MODE_INVALID");
 const d=q?.geometryDiagram;if(!spec||!geometryValid(d,spec))e.push("P08F07_DIAGRAM_INVALID");
 if(q?.answerValue!==d?.unknownAngleDeg||q?.answerText!==`${d?.unknownAngleDeg}°`)e.push("P08F07_ANSWER_INVALID");
 if(spec&&d){const expectedPrompt=promptFor(spec,d);if(q.promptText!==expectedPrompt||q.blankedDisplayText!==expectedPrompt)e.push("P08F07_PROMPT_INVALID");if(q.questionSignature!==signature(q))e.push("P08F07_SIGNATURE_INVALID");}
 const m=q?.metadata;if(m?.unknownAngleLinearFullVerticalOwned!==true||m?.protractorMeasurementReowned||m?.angleCompositionDecompositionReowned||m?.rotationClockAngleReowned||m?.estimationClassificationReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q008OrLaterTouched)e.push("P08F07_SCOPE_LEAK");
 const learner=`${q?.promptText??""} ${q?.answerText??""}`;for(const term of ["量角器","鐘面","估測","作圖"])if(learner.includes(term))e.push("P08F07_FORBIDDEN_LEARNER_TERM:"+term);
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU03P08F07Answer(q,answer){const v=validateG4AU03P08F07Question(q);if(!v.ok)return v;const normalized=typeof answer==="string"?answer.trim().replace(/度$/,"").replace(/°$/,""):answer,ok=Number(normalized)===q.answerValue;return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F07_ANSWER_MISMATCH"])});}
export function generateG4AU03P08F07Questions(o={}){
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F07_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F07_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seed=String(o.generationSeed??"p08f07-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
 for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
 const errors=questions.flatMap(q=>validateG4AU03P08F07Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F07_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
