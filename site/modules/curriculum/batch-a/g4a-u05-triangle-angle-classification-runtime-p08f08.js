import {G4A_U05_P08F08_KP_ID as KP,G4A_U05_P08F08_PATTERN_GROUP as GROUP,G4A_U05_P08F08_PATTERN_SPECS as SPECS,G4A_U05_P08F08_SOURCE_ID as SRC,G4A_U05_P08F08_SPEC_IDS as SPEC_IDS} from "../registry/g4a-u05-triangle-angle-classification-selector-projection-p08f08.js";
export const G4A_U05_P08F08_MAX_QUESTION_COUNT=240;
export const G4A_U05_P08F08_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const CLASS_ZH=Object.freeze({ACUTE_TRIANGLE:"銳角三角形",RIGHT_TRIANGLE:"直角三角形",OBTUSE_TRIANGLE:"鈍角三角形"});
const TRIPLES=Object.freeze({
 ACUTE_TRIANGLE:Object.freeze([[60,60,60],[50,60,70],[55,55,70],[45,65,70],[40,70,70],[55,60,65],[50,55,75],[35,70,75],[45,60,75],[50,65,65]].map(Object.freeze)),
 RIGHT_TRIANGLE:Object.freeze([[30,60,90],[45,45,90],[20,70,90],[25,65,90],[35,55,90],[40,50,90],[15,75,90],[10,80,90],[42,48,90],[36,54,90]].map(Object.freeze)),
 OBTUSE_TRIANGLE:Object.freeze([[30,40,110],[25,45,110],[20,50,110],[30,50,100],[35,45,100],[20,60,100],[25,55,100],[30,55,95],[35,50,95],[40,45,95]].map(Object.freeze))
});
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
function hashSeed(seed="p08f08"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function categoryOf(angles){const max=Math.max(...angles);if(max<90)return "ACUTE_TRIANGLE";if(max===90)return "RIGHT_TRIANGLE";return "OBTUSE_TRIANGLE";}
function verticesFor(angles,rotationDeg){
 const [A,B,C]=angles.map(x=>x*Math.PI/180),base=120;
 const rawA={x:-base/2,y:0},rawB={x:base/2,y:0};
 const ac=base*Math.sin(B)/Math.sin(C);
 const rawC={x:rawA.x+ac*Math.cos(A),y:-ac*Math.sin(A)};
 const center={x:(rawA.x+rawB.x+rawC.x)/3,y:(rawA.y+rawB.y+rawC.y)/3};
 const centered=[rawA,rawB,rawC].map(p=>({x:p.x-center.x,y:p.y-center.y}));
 const extent=Math.max(...centered.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)]),1),scale=62/extent;
 const r=rotationDeg*Math.PI/180,co=Math.cos(r),si=Math.sin(r);
 return Object.freeze(centered.map((p,i)=>Object.freeze({label:["A","B","C"][i],x:Number(((p.x*co-p.y*si)*scale).toFixed(2)),y:Number(((p.x*si+p.y*co)*scale).toFixed(2))})));
}
function variantFor(spec,index,seed){
 const shift=hashSeed(seed+"|"+spec.patternSpecId)%240,v=(shift+index)%240,triples=TRIPLES[spec.targetCategory],angles=[...triples[v%triples.length]],rotationDeg=ROTATIONS[Math.floor(v/triples.length)%ROTATIONS.length];
 return Object.freeze({variant:v,angles:Object.freeze(angles),rotationDeg});
}
function diagramFor(spec,row){
 const category=categoryOf(row.angles),vertices=verticesFor(row.angles,row.rotationDeg);
 return Object.freeze({kind:"triangle_angle_classification_diagram",representationVariant:"TRIANGLE_ANGLE_CLASSIFICATION",diagramMode:spec.targetCategory,relation:spec.relation,variant:row.variant,rotationDeg:row.rotationDeg,vertices,interiorAnglesDeg:Object.freeze({A:row.angles[0],B:row.angles[1],C:row.angles[2]}),triangleClass:category,triangleClassZh:CLASS_ZH[category],classificationBasis:"MAXIMUM_INTERIOR_ANGLE",angleSumDegrees:180,exactlyOneCategory:true,rotationInvariant:true});
}
function promptFor(d){return `觀察三角形的三個內角：${d.interiorAnglesDeg.A}°、${d.interiorAnglesDeg.B}°、${d.interiorAnglesDeg.C}°。依角度分類，這是什麼三角形？\n答：______`;}
function signature(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.diagramMode,d.rotationDeg,d.interiorAnglesDeg.A,d.interiorAnglesDeg.B,d.interiorAnglesDeg.C,d.triangleClass].join("|");}
function build(spec,index,seed){
 const row=variantFor(spec,index,seed),geometryDiagram=diagramFor(spec,row),promptText=promptFor(geometryDiagram),answerText=geometryDiagram.triangleClassZh;
 const q={id:`p08f08-q008-${spec.patternSpecId}-${row.variant}`,generatedItemId:`p08f08-q008-${spec.patternSpecId}-${row.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue:geometryDiagram.triangleClass,geometryDiagram,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice008Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F08_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G4A_U05_P08F08_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",triangleAngleClassificationOwned:true,classificationBasis:"MAXIMUM_INTERIOR_ANGLE",rotationInvariant:true,triangleElementsNamingReowned:false,triangleSideClassificationReowned:false,triangleInequalityReowned:false,congruentTriangleCorrespondenceReowned:false,geometryConstructionReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q009OrLaterTouched:false,humanVisualReviewRequired:true})};
 return Object.freeze({...q,questionSignature:signature(q)});
}
function geometryValid(d,spec){
 if(!d||d.kind!=="triangle_angle_classification_diagram"||d.representationVariant!=="TRIANGLE_ANGLE_CLASSIFICATION"||d.diagramMode!==spec?.targetCategory||d.relation!==spec?.relation||!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!ROTATIONS.includes(d.rotationDeg)||!Array.isArray(d.vertices)||d.vertices.length!==3||d.vertices.map(v=>v.label).join(",")!=="A,B,C"||!d.vertices.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
 const angles=d.interiorAnglesDeg,arr=[angles?.A,angles?.B,angles?.C];
 if(!arr.every(Number.isInteger)||arr.some(x=>x<=0)||arr.reduce((a,b)=>a+b,0)!==180)return false;
 const category=categoryOf(arr);
 if(category!==spec.targetCategory||d.triangleClass!==category||d.triangleClassZh!==CLASS_ZH[category]||d.classificationBasis!=="MAXIMUM_INTERIOR_ANGLE"||d.angleSumDegrees!==180||d.exactlyOneCategory!==true||d.rotationInvariant!==true)return false;
 const [a,b,c]=d.vertices,area2=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));return area2>1500;
}
export function validateG4AU05P08F08Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F08_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F08_SOURCE_INVALID");
 if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F08_KP_OR_GROUP_INVALID");
 if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F08_MODE_INVALID");
 const d=q?.geometryDiagram;if(!spec||!geometryValid(d,spec))e.push("P08F08_DIAGRAM_INVALID");
 if(spec&&d){if(q.answerValue!==d.triangleClass||q.answerText!==d.triangleClassZh)e.push("P08F08_ANSWER_INVALID");if(q.promptText!==promptFor(d)||q.blankedDisplayText!==promptFor(d))e.push("P08F08_PROMPT_INVALID");if(q.questionSignature!==signature(q))e.push("P08F08_SIGNATURE_INVALID");}
 const m=q?.metadata;if(m?.triangleAngleClassificationOwned!==true||m?.classificationBasis!=="MAXIMUM_INTERIOR_ANGLE"||m?.rotationInvariant!==true||m?.triangleElementsNamingReowned||m?.triangleSideClassificationReowned||m?.triangleInequalityReowned||m?.congruentTriangleCorrespondenceReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q009OrLaterTouched)e.push("P08F08_SCOPE_LEAK");
 const learner=`${q?.promptText??""} ${q?.answerText??""}`;for(const term of ["邊長分類","三角形不等式","全等","作圖"])if(learner.includes(term))e.push("P08F08_FORBIDDEN_LEARNER_TERM:"+term);
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU05P08F08Answer(q,answer){const v=validateG4AU05P08F08Question(q);if(!v.ok)return v;const a=String(answer??"").trim(),ok=a===q.answerText||a===q.answerValue;return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F08_ANSWER_MISMATCH"])});}
export function generateG4AU05P08F08Questions(o={}){
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F08_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F08_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
 for(let i=0;i<count;i++){const s=specs[i%specs.length],n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,String(o.generationSeed??"p08f08-public")));}
 const errors=questions.flatMap(q=>validateG4AU05P08F08Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F08_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
