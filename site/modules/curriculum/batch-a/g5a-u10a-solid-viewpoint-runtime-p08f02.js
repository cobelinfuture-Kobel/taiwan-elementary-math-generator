import {
  G5A_U10A_P08F02_KP_ID as KP,
  G5A_U10A_P08F02_PATTERN_GROUP as GROUP,
  G5A_U10A_P08F02_PATTERN_SPECS as SPECS,
  G5A_U10A_P08F02_SOURCE_ID as SRC,
  G5A_U10A_P08F02_SPEC_IDS as SPEC_IDS
} from "../registry/g5a-u10a-solid-viewpoint-selector-projection-p08f02.js";

export const G5A_U10A_P08F02_MAX_QUESTION_COUNT=240;
export const G5A_U10A_P08F02_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const SYMBOLS=Object.freeze(["甲","乙","丙","丁","戊","己"]);
const VIEW_SIDES=Object.freeze(["RIGHT","LEFT"]);
const TURN_BY_SIDE=Object.freeze({RIGHT:"CLOCKWISE",LEFT:"COUNTERCLOCKWISE"});
const SIDE_ANSWER_BY_TURN=Object.freeze({CLOCKWISE:"左面",COUNTERCLOCKWISE:"右面"});
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f02"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function variant(index,specIndex,seed){return (hashSeed(seed+"|"+specIndex)+index*7+specIndex*31)%240;}
function labelsFor(v){
  const shift=v%6,step=[1,5][Math.floor(v/6)%2];
  return Object.freeze({front:SYMBOLS[shift],side:SYMBOLS[(shift+step)%6],top:SYMBOLS[(shift+2*step)%6]});
}
function rowFor(spec,v){
  const viewSide=VIEW_SIDES[v%2],turnDirection=TURN_BY_SIDE[viewSide],labels=labelsFor(v),profileIndex=Math.floor(v/2)%10;
  const width=86+(profileIndex%5)*4,height=62+Math.floor(profileIndex/5)*8,depth=30+(profileIndex%4)*4;
  const base={variant:v,profileIndex,viewSide,turnDirection,labels,width,height,depth,quarterTurns:1,rotationAxis:"VERTICAL"};
  if(spec.relation==="TURN_VISIBLE_SIDE_TO_FRONT")return Object.freeze({...base,answerText:labels.side,answerValue:labels.side,diagramMode:"TURN_TO_FRONT_LABEL",pairedView:false});
  if(spec.relation==="TRACK_FRONT_FACE_AFTER_QUARTER_TURN")return Object.freeze({...base,answerText:SIDE_ANSWER_BY_TURN[turnDirection],answerValue:SIDE_ANSWER_BY_TURN[turnDirection],diagramMode:"TRACK_FRONT_FACE",pairedView:false});
  return Object.freeze({...base,answerText:labels.side,answerValue:labels.side,diagramMode:"COMPLETE_ROTATED_VIEW",pairedView:true});
}
function directionZh(d){return d==="CLOCKWISE"?"順時針":"逆時針";}
function promptFor(spec,row){
  if(spec.relation==="TURN_VISIBLE_SIDE_TO_FRONT")return `從上方看，把立體${directionZh(row.turnDirection)}轉 90°。轉動後，新的正面是哪個標記？\n答：______`;
  if(spec.relation==="TRACK_FRONT_FACE_AFTER_QUARTER_TURN")return `從上方看，把立體${directionZh(row.turnDirection)}轉 90°。原來正面的「${row.labels.front}」會移到哪一面？\n答：______`;
  return `右圖是同一個立體${directionZh(row.turnDirection)}轉 90°後的樣子。問號應填哪個標記？\n答：______`;
}
function diagramFor(row){return Object.freeze({
  kind:"solid_viewpoint_representation_diagram",variant:row.variant,profileIndex:row.profileIndex,diagramMode:row.diagramMode,viewSide:row.viewSide,turnDirection:row.turnDirection,
  quarterTurns:1,rotationAxis:"VERTICAL",frontLabel:row.labels.front,sideLabel:row.labels.side,topLabel:row.labels.top,width:row.width,height:row.height,depth:row.depth,
  pairedView:row.pairedView,compositionInvariant:true,adjacencyInvariant:true
});}
function signature(q){const d=q.geometryDiagram;return [q.patternSpecId,d.variant,d.profileIndex,d.diagramMode,d.viewSide,d.turnDirection,d.frontLabel,d.sideLabel,d.topLabel,d.width,d.height,d.depth].join("|");}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function build(spec,index,seed){
  const si=SPEC_IDS.indexOf(spec.patternSpecId),r=rowFor(spec,variant(index,si,seed)),promptText=promptFor(spec,r),geometryDiagram=diagramFor(r);
  const q={id:`p08f02-q002-${si+1}-${r.variant+1}`,generatedItemId:`p08f02-q002-${si+1}-${r.variant+1}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,
    patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,
    displayText:`${promptText} ${r.answerText}`,answerText:r.answerText,answerValue:r.answerValue,geometryDiagram,
    metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice002Implementation",authority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_Q002_PREFLIGHT",sourcePages:Object.freeze([1,2]),
      sharedRuntimeScope:G5A_U10A_P08F02_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_spatial_solid",coordinateMapModifier:"mod_coordinate_map",
      solidViewpointOwned:true,rotationAxis:"VERTICAL",quarterTurnOnly:true,compositionInvariant:true,adjacencyInvariant:true,controlledRepresentationCarrier:"MARKED_CUBOID_QUARTER_TURN",
      sourceLearnerFigureCopied:false,solidShapeClassificationReowned:false,prismPyramidElementsReowned:false,solidNetCorrespondenceReowned:false,solidCrossSectionReowned:false,
      geometryConstructionReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q003OrLaterTouched:false,humanVisualReviewRequired:true})
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG5AU10AP08F02Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F02_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F02_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F02_KP_OR_GROUP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F02_MODE_INVALID");
  const d=q?.geometryDiagram;
  if(!d||d.kind!=="solid_viewpoint_representation_diagram")e.push("P08F02_DIAGRAM_MISSING");else{
    if(!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!Number.isInteger(d.profileIndex)||d.profileIndex<0||d.profileIndex>9||!VIEW_SIDES.includes(d.viewSide)||TURN_BY_SIDE[d.viewSide]!==d.turnDirection||d.quarterTurns!==1||d.rotationAxis!=="VERTICAL"||!SYMBOLS.includes(d.frontLabel)||!SYMBOLS.includes(d.sideLabel)||!SYMBOLS.includes(d.topLabel)||new Set([d.frontLabel,d.sideLabel,d.topLabel]).size!==3||!d.compositionInvariant||!d.adjacencyInvariant)e.push("P08F02_DIAGRAM_GEOMETRY_INVALID");
    if(spec?.relation==="TURN_VISIBLE_SIDE_TO_FRONT"&&(q.answerText!==d.sideLabel||d.diagramMode!=="TURN_TO_FRONT_LABEL"||d.pairedView))e.push("P08F02_ANSWER_INVALID");
    if(spec?.relation==="TRACK_FRONT_FACE_AFTER_QUARTER_TURN"&&(q.answerText!==SIDE_ANSWER_BY_TURN[d.turnDirection]||d.diagramMode!=="TRACK_FRONT_FACE"||d.pairedView))e.push("P08F02_ANSWER_INVALID");
    if(spec?.relation==="COMPLETE_ROTATED_VIEW_FACE_LABEL"&&(q.answerText!==d.sideLabel||d.diagramMode!=="COMPLETE_ROTATED_VIEW"||!d.pairedView))e.push("P08F02_ANSWER_INVALID");
    if(q.questionSignature!==signature(q))e.push("P08F02_SIGNATURE_INVALID");
  }
  const m=q?.metadata??{};
  if(m.solidShapeClassificationReowned||m.prismPyramidElementsReowned||m.solidNetCorrespondenceReowned||m.solidCrossSectionReowned||m.geometryConstructionReowned||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q003OrLaterTouched||m.sourceLearnerFigureCopied)e.push("P08F02_SCOPE_LEAK");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG5AU10AP08F02Answer(q,answer){
  const v=validateG5AU10AP08F02Question(q);if(!v.ok)return v;
  const normalized=String(answer??"").trim(),ok=normalized===String(q.answerText);
  return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F02_ANSWER_MISMATCH"])});
}
export function generateG5AU10AP08F02Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F02_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F02_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const seed=String(o.generationSeed??"p08f02-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced;
  const seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
  for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
  const errors=questions.flatMap(q=>validateG5AU10AP08F02Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F02_DUPLICATE_QUESTION_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240});
}
