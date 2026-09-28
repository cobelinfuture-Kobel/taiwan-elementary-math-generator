import {G4A_U05_P08F09_KP_ID as KP,G4A_U05_P08F09_PATTERN_GROUP as GROUP,G4A_U05_P08F09_PATTERN_SPECS as SPECS,G4A_U05_P08F09_SOURCE_ID as SRC} from "../registry/g4a-u05-congruent-triangle-correspondence-selector-projection-p08f09.js";

export const G4A_U05_P08F09_MAX_QUESTION_COUNT=240;
export const G4A_U05_P08F09_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";

const MOTIONS=Object.freeze(["TRANSLATION","ROTATION","REFLECTION"]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const SIDE_TEMPLATES=Object.freeze([
 [7,8,9],[6,8,10],[5,7,8],[5,5,8],[6,7,9],
 [4,6,7],[8,9,11],[5,6,9],[7,7,10],[6,9,10]
].map(Object.freeze));
const VERTEX_CORRESPONDENCE=Object.freeze({A:"D",B:"E",C:"F"});
const SIDE_CORRESPONDENCE=Object.freeze({AB:"DE",BC:"EF",CA:"FD"});
const SIDE_TICK_COUNTS=Object.freeze({AB:1,BC:2,CA:3,DE:1,EF:2,FD:3});
const ANGLE_CORRESPONDENCE=Object.freeze({"∠A":"∠D","∠B":"∠E","∠C":"∠F"});
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));

function hashSeed(seed="p08f09"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
const round=n=>Number(n.toFixed(2));
function rotatePoint(p,deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:round(p.x*c-p.y*s),y:round(p.x*s+p.y*c)};}
function reflectPoint(p){return{x:round(-p.x),y:p.y};}
function translatePoints(points,cx,cy,labels){return Object.freeze(points.map((p,i)=>Object.freeze({label:labels[i],x:round(cx+p.x),y:round(cy+p.y)})));}
function localTriangle([ab,bc,ca]){
 const A={x:-ab/2,y:0},B={x:ab/2,y:0};
 const xFromA=(ca*ca+ab*ab-bc*bc)/(2*ab);
 const y=Math.sqrt(Math.max(0,ca*ca-xFromA*xFromA));
 const C={x:A.x+xFromA,y:-y};
 const center={x:(A.x+B.x+C.x)/3,y:(A.y+B.y+C.y)/3};
 const centered=[A,B,C].map(p=>({x:p.x-center.x,y:p.y-center.y}));
 const extent=Math.max(...centered.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)]),1);
 const scale=54/extent;
 return centered.map(p=>({x:round(p.x*scale),y:round(p.y*scale)}));
}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function sameLengths(left,right){
 const pairs=[[0,1],[1,2],[2,0]];
 return pairs.every(([a,b])=>Math.abs(distance(left[a],left[b])-distance(right[a],right[b]))<0.15);
}
function sideKeyAt(index){return ["AB","BC","CA"][index%3];}
function angleKeyAt(index){return ["∠A","∠B","∠C"][index%3];}
function vertexKeyAt(index){return ["A","B","C"][index%3];}
function sideLengthFor(sideKey,lengths){return sideKey==="AB"?lengths[0]:sideKey==="BC"?lengths[1]:lengths[2];}

function variantFor(spec,index,seed){
 const shift=hashSeed(seed+"|"+spec.patternSpecId)%240;
 const variant=(shift+index)%240;
 const templateIndex=variant%SIDE_TEMPLATES.length;
 const baseRotationDeg=ROTATIONS[Math.floor(variant/SIDE_TEMPLATES.length)%ROTATIONS.length];
 const transformMode=MOTIONS[Math.floor(variant/80)%MOTIONS.length];
 const relativeRotationDeg=transformMode==="ROTATION"?45+45*(templateIndex%7):0;
 const sideLengths=[...SIDE_TEMPLATES[templateIndex]];
 const base=localTriangle(sideLengths);
 const leftLocal=base.map(p=>rotatePoint(p,baseRotationDeg));
 let rightLocal;
 if(transformMode==="TRANSLATION")rightLocal=leftLocal.map(p=>({...p}));
 else if(transformMode==="ROTATION")rightLocal=leftLocal.map(p=>rotatePoint(p,relativeRotationDeg));
 else rightLocal=leftLocal.map(p=>reflectPoint(p));
 const leftVertices=translatePoints(leftLocal,88,96,["A","B","C"]);
 const rightVertices=translatePoints(rightLocal,272,96,["D","E","F"]);
 return Object.freeze({variant,templateIndex,baseRotationDeg,transformMode,relativeRotationDeg,sideLengths:Object.freeze(sideLengths),leftVertices,rightVertices});
}

function targetFor(spec,row){
 if(spec.taskForm==="IDENTIFY_PAIR")return Object.freeze({targetKind:"CONGRUENCE",sourceToken:"△ABC",targetToken:"△DEF",answerValue:"CONGRUENT",answerText:"全等"});
 if(spec.taskForm==="MATCH_VERTEX_SIDE_OR_ANGLE"){
  const kind=["VERTEX","SIDE","ANGLE"][row.variant%3],idx=Math.floor(row.variant/3)%3;
  if(kind==="VERTEX"){const source=vertexKeyAt(idx),target=VERTEX_CORRESPONDENCE[source];return Object.freeze({targetKind:kind,sourceToken:source,targetToken:target,answerValue:target,answerText:target});}
  if(kind==="SIDE"){const source=sideKeyAt(idx),target=SIDE_CORRESPONDENCE[source];return Object.freeze({targetKind:kind,sourceToken:source,targetToken:target,answerValue:target,answerText:target});}
  const source=angleKeyAt(idx),target=ANGLE_CORRESPONDENCE[source];return Object.freeze({targetKind:kind,sourceToken:source,targetToken:target,answerValue:target,answerText:target});
 }
 const source=sideKeyAt(row.variant%3),target=SIDE_CORRESPONDENCE[source],measure=sideLengthFor(source,row.sideLengths);
 return Object.freeze({targetKind:"SIDE_MEASURE",sourceToken:source,targetToken:target,knownMeasureCm:measure,answerValue:measure,answerText:`${measure} 公分`});
}
function promptFor(spec,t){
 if(spec.taskForm==="IDENTIFY_PAIR")return "觀察圖中的 △ABC 與 △DEF，判斷這兩個三角形是否全等。\n答：______";
 if(spec.taskForm==="MATCH_VERTEX_SIDE_OR_ANGLE"){
  if(t.targetKind==="VERTEX")return `△ABC 與 △DEF 全等。頂點 ${t.sourceToken} 的對應頂點是哪一個？\n答：______`;
  if(t.targetKind==="SIDE")return `△ABC 與 △DEF 全等。邊 ${t.sourceToken} 的對應邊是哪一條？\n答：______`;
  return `△ABC 與 △DEF 全等。${t.sourceToken} 的對應角是哪一個？\n答：______`;
 }
 return `△ABC 與 △DEF 全等。已知邊 ${t.sourceToken} 長 ${t.knownMeasureCm} 公分，對應邊 ${t.targetToken} 長多少公分？\n答：______ 公分`;
}
function diagramFor(spec,row,target){
 return Object.freeze({
  kind:"congruent_triangle_correspondence_diagram",
  representationVariant:"CONGRUENT_TRIANGLE_CORRESPONDENCE",
  diagramMode:spec.taskForm,
  relation:spec.relation,
  variant:row.variant,
  templateIndex:row.templateIndex,
  transformMode:row.transformMode,
  baseRotationDeg:row.baseRotationDeg,
  relativeRotationDeg:row.relativeRotationDeg,
  leftVertices:row.leftVertices,
  rightVertices:row.rightVertices,
  sideLengthsCm:row.sideLengths,
  sideTickCounts:SIDE_TICK_COUNTS,
  sideMeasurementEvidence:"EXPLICIT_NUMERIC_LABELS_PLUS_MATCHED_TICK_MARKS",
  rulerMeasurementRequired:false,
  printScaleIsAnswerAuthority:false,
  vertexCorrespondence:VERTEX_CORRESPONDENCE,
  sideCorrespondence:SIDE_CORRESPONDENCE,
  angleCorrespondence:ANGLE_CORRESPONDENCE,
  sameShape:true,
  sameSize:true,
  correspondingSidesEqual:true,
  correspondingAnglesEqual:true,
  vertexCorrespondenceConsistent:true,
  targetKind:target.targetKind,
  sourceToken:target.sourceToken,
  targetToken:target.targetToken,
  knownMeasureCm:target.knownMeasureCm??null
 });
}
function signature(q){
 const d=q.geometryDiagram;
 return [q.patternSpecId,d.variant,d.templateIndex,d.transformMode,d.baseRotationDeg,d.relativeRotationDeg,d.targetKind,d.sourceToken,d.targetToken,d.knownMeasureCm??"",q.answerText].join("|");
}
function build(spec,index,seed){
 const row=variantFor(spec,index,seed),target=targetFor(spec,row),geometryDiagram=diagramFor(spec,row,target),promptText=promptFor(spec,target);
 const q={id:`p08f09-q009-${spec.patternSpecId}-${row.variant}`,generatedItemId:`p08f09-q009-${spec.patternSpecId}-${row.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${target.answerText}`,answerText:target.answerText,answerValue:target.answerValue,geometryDiagram,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice009Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F09_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G4A_U05_P08F09_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",congruentTriangleCorrespondenceOwned:true,allowedRigidMotions:Object.freeze(["TRANSLATION","ROTATION","REFLECTION"]),sameShapeRequired:true,sameSizeRequired:true,correspondingSidesEqual:true,correspondingAnglesEqual:true,vertexCorrespondenceConsistent:true,triangleElementsNamingReowned:false,triangleSideClassificationReowned:false,triangleInequalityReowned:false,triangleAngleClassificationReowned:false,geometryConstructionReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q010OrLaterTouched:false,humanVisualReviewRequired:true,explicitSideLengthLabelsRequired:true,matchingSideTickMarksRequired:true,rulerMeasurementRequired:false,printScaleIsAnswerAuthority:false})};
 return Object.freeze({...q,questionSignature:signature(q)});
}

function correspondenceValid(d){
 return d?.vertexCorrespondence?.A==="D"&&d.vertexCorrespondence?.B==="E"&&d.vertexCorrespondence?.C==="F"
  &&d?.sideCorrespondence?.AB==="DE"&&d.sideCorrespondence?.BC==="EF"&&d.sideCorrespondence?.CA==="FD"
  &&d?.angleCorrespondence?.["∠A"]==="∠D"&&d.angleCorrespondence?.["∠B"]==="∠E"&&d.angleCorrespondence?.["∠C"]==="∠F";
}
function geometryValid(d,spec){
 if(!d||d.kind!=="congruent_triangle_correspondence_diagram"||d.representationVariant!=="CONGRUENT_TRIANGLE_CORRESPONDENCE"||d.diagramMode!==spec?.taskForm||d.relation!==spec?.relation||!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!Number.isInteger(d.templateIndex)||d.templateIndex<0||d.templateIndex>=SIDE_TEMPLATES.length||!MOTIONS.includes(d.transformMode)||!ROTATIONS.includes(d.baseRotationDeg))return false;
 if(!Array.isArray(d.leftVertices)||d.leftVertices.length!==3||!Array.isArray(d.rightVertices)||d.rightVertices.length!==3||d.leftVertices.map(x=>x.label).join(",")!=="A,B,C"||d.rightVertices.map(x=>x.label).join(",")!=="D,E,F")return false;
 if(!d.leftVertices.concat(d.rightVertices).every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
 if(!Array.isArray(d.sideLengthsCm)||d.sideLengthsCm.length!==3||d.sideLengthsCm.some(x=>!Number.isInteger(x)||x<=0))return false;
 if(d.sideTickCounts?.AB!==1||d.sideTickCounts?.BC!==2||d.sideTickCounts?.CA!==3||d.sideTickCounts?.DE!==1||d.sideTickCounts?.EF!==2||d.sideTickCounts?.FD!==3)return false;
 if(d.sideMeasurementEvidence!=="EXPLICIT_NUMERIC_LABELS_PLUS_MATCHED_TICK_MARKS"||d.rulerMeasurementRequired!==false||d.printScaleIsAnswerAuthority!==false)return false;
 if(!sameLengths(d.leftVertices,d.rightVertices)||!correspondenceValid(d)||d.sameShape!==true||d.sameSize!==true||d.correspondingSidesEqual!==true||d.correspondingAnglesEqual!==true||d.vertexCorrespondenceConsistent!==true)return false;
 if(d.transformMode==="TRANSLATION"&&d.relativeRotationDeg!==0)return false;
 if(d.transformMode==="ROTATION"&&(!Number.isInteger(d.relativeRotationDeg)||d.relativeRotationDeg===0))return false;
 if(d.transformMode==="REFLECTION"&&d.relativeRotationDeg!==0)return false;
 const t=targetFor(spec,{variant:d.variant,sideLengths:d.sideLengthsCm});
 if(d.targetKind!==t.targetKind||d.sourceToken!==t.sourceToken||d.targetToken!==t.targetToken||(d.knownMeasureCm??null)!==(t.knownMeasureCm??null))return false;
 return true;
}
export function validateG4AU05P08F09Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F09_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F09_SOURCE_INVALID");
 if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F09_KP_OR_GROUP_INVALID");
 if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F09_MODE_INVALID");
 const d=q?.geometryDiagram;if(!spec||!geometryValid(d,spec))e.push("P08F09_DIAGRAM_INVALID");
 if(spec&&d){const target=targetFor(spec,{variant:d.variant,sideLengths:d.sideLengthsCm});if(q.answerValue!==target.answerValue||q.answerText!==target.answerText)e.push("P08F09_ANSWER_INVALID");if(q.promptText!==promptFor(spec,target)||q.blankedDisplayText!==promptFor(spec,target))e.push("P08F09_PROMPT_INVALID");if(q.questionSignature!==signature(q))e.push("P08F09_SIGNATURE_INVALID");}
 const m=q?.metadata;if(m?.congruentTriangleCorrespondenceOwned!==true||m?.allowedRigidMotions?.join("|")!=="TRANSLATION|ROTATION|REFLECTION"||m?.sameShapeRequired!==true||m?.sameSizeRequired!==true||m?.correspondingSidesEqual!==true||m?.correspondingAnglesEqual!==true||m?.vertexCorrespondenceConsistent!==true||m?.triangleElementsNamingReowned||m?.triangleSideClassificationReowned||m?.triangleInequalityReowned||m?.triangleAngleClassificationReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q010OrLaterTouched)e.push("P08F09_SCOPE_LEAK");
 const learner=`${q?.promptText??""} ${q?.answerText??""}`;for(const term of ["三角形不等式","依邊長分類","依角度分類","作圖"])if(learner.includes(term))e.push("P08F09_FORBIDDEN_LEARNER_TERM:"+term);
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU05P08F09Answer(q,answer){
 const v=validateG4AU05P08F09Question(q);if(!v.ok)return v;
 const raw=String(answer??"").trim();
 const normalized=raw.replace(/公分$/,"").trim();
 const expected=typeof q.answerValue==="number"?String(q.answerValue):String(q.answerValue);
 const ok=raw===q.answerText||raw===expected||normalized===expected;
 return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F09_ANSWER_MISMATCH"])});
}
export function generateG4AU05P08F09Questions(o={}){
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
 if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F09_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F09_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
 for(let i=0;i<count;i++){const s=specs[i%specs.length],n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,String(o.generationSeed??"p08f09-public")));}
 const errors=questions.flatMap(q=>validateG4AU05P08F09Question(q).errors);
 if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F09_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
