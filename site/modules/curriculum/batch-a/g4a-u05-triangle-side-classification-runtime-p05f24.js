import {
  G4A_U05_P05F24_KP_ID,
  G4A_U05_P05F24_PATTERN_GROUP_ID,
  G4A_U05_P05F24_PATTERN_SPECS,
  G4A_U05_P05F24_SOURCE_ID,
  G4A_U05_P05F24_SPEC_IDS,
} from "../registry/g4a-u05-triangle-side-classification-selector-projection-p05f24.js";

export const G4A_U05_P05F24_MAX_QUESTION_COUNT=240;
export const G4A_U05_P05F24_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const CLASS_NAMES=Object.freeze(["等邊三角形","等腰三角形","不等邊三角形"]);
const LABELS=Object.freeze(["A","B","C"]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,index)=>index*15));
const FORBIDDEN_TERMS=Object.freeze(["銳角三角形","直角三角形","鈍角三角形","三角形不等式","全等三角形","量角器","作圖題","應用題"]);
const SPEC_BY_ID=new Map(G4A_U05_P05F24_PATTERN_SPECS.map(row=>[row.patternSpecId,row]));

function hashSeed(seed="p05f24"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function variantNumber(index,specIndex,seed){return (hashSeed(seed)+specIndex*71+index)%240;}
function rotate(values,shift){const n=values.length,s=((shift%n)+n)%n;return Object.freeze(values.map((_,i)=>values[(i-s+n)%n]));}
function sideProfile(variant){
  const classIndex=variant%3,ordinal=Math.floor(variant/3),shift=ordinal%3;
  let lengths;
  if(classIndex===0){const side=4+ordinal;lengths=[side,side,side];}
  else if(classIndex===1){const equal=6+(ordinal%40),other=Math.floor(ordinal/40)===0?equal-2:equal+2;lengths=[equal,equal,other];}
  else {const base=5+(ordinal%40);lengths=Math.floor(ordinal/40)===0?[base,base+1,base+2]:[base,base+2,base+3];}
  const [AB,BC,CA]=rotate(lengths,shift);
  return Object.freeze({classIndex,className:CLASS_NAMES[classIndex],ordinal,sideLengthsCm:Object.freeze({AB,BC,CA})});
}
function classify(sideLengthsCm){const values=[sideLengthsCm.AB,sideLengthsCm.BC,sideLengthsCm.CA];const unique=new Set(values).size;return unique===1?CLASS_NAMES[0]:unique===2?CLASS_NAMES[1]:CLASS_NAMES[2];}
function triangleVertices(sideLengthsCm,rotationDeg){
  const AB=sideLengthsCm.AB,BC=sideLengthsCm.BC,CA=sideLengthsCm.CA;
  const cx=(CA*CA+AB*AB-BC*BC)/(2*AB),cy=Math.sqrt(Math.max(0,CA*CA-cx*cx));
  const raw=[[0,0],[AB,0],[cx,cy]],center={x:(raw[0][0]+raw[1][0]+raw[2][0])/3,y:(raw[0][1]+raw[1][1]+raw[2][1])/3};
  const centered=raw.map(([x,y])=>[x-center.x,y-center.y]),extent=Math.max(...centered.flatMap(([x,y])=>[Math.abs(x),Math.abs(y)]),1),scale=54/extent,r=rotationDeg*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  return Object.freeze(centered.map(([x,y],index)=>Object.freeze({label:LABELS[index],x:Number(((x*c-y*s)*scale).toFixed(2)),y:Number(((x*s+y*c)*scale).toFixed(2))})));
}
function diagramFor(spec,variant){const profile=sideProfile(variant),rotationDeg=ROTATIONS[profile.ordinal%ROTATIONS.length],vertices=triangleVertices(profile.sideLengthsCm,rotationDeg);return Object.freeze({kind:"triangle_elements_naming_diagram",diagramMode:"TRIANGLE_ELEMENTS_NAMING",relation:spec.relation,variant,templateIndex:variant%10,rotationDeg,markerMode:"CLOSED_STRUCTURE",targetIndex:0,targetLabel:"A",targetSideName:"AB",namingOrder:Object.freeze(["A","B","C"]),vertices,segments:Object.freeze([Object.freeze({name:"AB",from:"A",to:"B"}),Object.freeze({name:"BC",from:"B",to:"C"}),Object.freeze({name:"CA",from:"C",to:"A"})]),segmentCount:3,closed:true,sideLengthsCm:profile.sideLengthsCm,sideClass:profile.className,equalSideCount:profile.classIndex===0?3:profile.classIndex===1?2:0,classificationBasis:"EQUAL_SIDE_COUNT",rotationInvariant:true});}
function lengthsText(d){return `AB=${d.sideLengthsCm.AB} 公分、BC=${d.sideLengthsCm.BC} 公分、CA=${d.sideLengthsCm.CA} 公分`;}
function promptFor(spec,d){if(spec.relation==="CLASSIFY_TRIANGLE_BY_EQUAL_SIDE_COUNT")return `三角形三邊長為 ${lengthsText(d)}。依邊長分類，這是哪一種三角形？`;return `圖形改變方向後，三邊長仍為 ${lengthsText(d)}。依邊長分類仍是哪一類？`;}
function answerFor(d){return d.sideClass;}
function signatureFor(question){const d=question.geometryDiagram;return [question.patternSpecId,d.variant,d.sideClass,d.sideLengthsCm.AB,d.sideLengthsCm.BC,d.sideLengthsCm.CA,d.rotationDeg,...d.vertices.flatMap(v=>[v.x,v.y])].join("|");}
function selectedSpecs(patternSpecIds){if(!Array.isArray(patternSpecIds)||patternSpecIds.length===0)return [...G4A_U05_P05F24_PATTERN_SPECS];const unique=[...new Set(patternSpecIds)];if(unique.some(id=>!SPEC_BY_ID.has(id)))return null;return unique.map(id=>SPEC_BY_ID.get(id));}
function questionFor(spec,sequenceIndex,seed){const specIndex=G4A_U05_P05F24_SPEC_IDS.indexOf(spec.patternSpecId),variant=variantNumber(sequenceIndex,specIndex,seed),geometryDiagram=diagramFor(spec,variant),promptText=promptFor(spec,geometryDiagram),answerText=answerFor(geometryDiagram);const question={id:`p05f24-q024-${specIndex+1}-${variant+1}`,generatedItemId:`p05f24-q024-${specIndex+1}-${variant+1}`,sourceId:G4A_U05_P05F24_SOURCE_ID,sourceNodeId:G4A_U05_P05F24_SOURCE_ID,knowledgePointId:G4A_U05_P05F24_KP_ID,patternGroupId:G4A_U05_P05F24_PATTERN_GROUP_ID,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,geometryDiagram,metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice024Implementation",authority:"FROZEN_QUEUE_PLUS_R02_REVIEWED_CANDIDATE_WITH_Q013_SAME_SOURCE_IDENTITY_REUSE",sourcePages:Object.freeze([1,2]),sourceMetadataUrl:"https://meow911.com/4a05/",embeddedHeaderUrl:"https://meow911.com/4a06/",sourceMetadataMismatchPreserved:true,sharedRuntimeScope:G4A_U05_P05F24_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",equalSideCountClassification:true,rotationInvariant:true,triangleElementsNamingTargetTouched:false,triangleAngleClassificationTouched:false,triangleInequalityTouched:false,congruentTriangleCorrespondenceTouched:false,geometryConstructionTouched:false,applicationContextUsed:false,q025OrLaterTouched:false})};return Object.freeze({...question,questionSignature:signatureFor(question)});}
function geometryValid(d){
  if(!d||d.kind!=="triangle_elements_naming_diagram"||d.diagramMode!=="TRIANGLE_ELEMENTS_NAMING"||d.markerMode!=="CLOSED_STRUCTURE")return false;
  if(!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!Number.isInteger(d.templateIndex)||d.templateIndex<0||d.templateIndex>=10||!ROTATIONS.includes(d.rotationDeg))return false;
  if(!Array.isArray(d.vertices)||d.vertices.length!==3||d.vertices.map(v=>v.label).join(",")!=="A,B,C"||!d.vertices.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
  if(!Array.isArray(d.segments)||d.segments.length!==3||d.segmentCount!==3||d.closed!==true)return false;
  const lengths=d.sideLengthsCm;if(!lengths||![lengths.AB,lengths.BC,lengths.CA].every(v=>Number.isInteger(v)&&v>0))return false;
  if(lengths.AB+lengths.BC<=lengths.CA||lengths.BC+lengths.CA<=lengths.AB||lengths.CA+lengths.AB<=lengths.BC)return false;
  const expectedClass=classify(lengths),expectedCount=expectedClass===CLASS_NAMES[0]?3:expectedClass===CLASS_NAMES[1]?2:0;
  if(d.sideClass!==expectedClass||d.equalSideCount!==expectedCount||d.classificationBasis!=="EQUAL_SIDE_COUNT"||d.rotationInvariant!==true)return false;
  const [a,b,c]=d.vertices,area2=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));return area2>500;
}
export function validateG4AU05P05F24Question(question){const errors=[],spec=SPEC_BY_ID.get(question?.patternSpecId);if(!spec)errors.push("P05F24_PATTERN_SPEC_INVALID");if(question?.sourceId!==G4A_U05_P05F24_SOURCE_ID||question?.sourceNodeId!==G4A_U05_P05F24_SOURCE_ID)errors.push("P05F24_SOURCE_INVALID");if(question?.knowledgePointId!==G4A_U05_P05F24_KP_ID||question?.patternGroupId!==G4A_U05_P05F24_PATTERN_GROUP_ID)errors.push("P05F24_KP_OR_GROUP_INVALID");if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F24_MODE_INVALID");const d=question?.geometryDiagram;if(!geometryValid(d))errors.push("P05F24_TRIANGLE_GEOMETRY_INVALID");if(spec&&d&&Number.isInteger(d.variant)){const expected=diagramFor(spec,d.variant);if(JSON.stringify(d)!==JSON.stringify(expected))errors.push("P05F24_DIAGRAM_CONTRACT_INVALID");if(question?.promptText!==promptFor(spec,d))errors.push("P05F24_PROMPT_INVALID");if(question?.answerText!==answerFor(d)||question?.answerText!==classify(d.sideLengthsCm))errors.push("P05F24_ANSWER_INVALID");if(question?.questionSignature!==signatureFor(question))errors.push("P05F24_SIGNATURE_INVALID");}const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;for(const term of FORBIDDEN_TERMS)if(learnerText.includes(term))errors.push(`P05F24_FORBIDDEN_TERM:${term}`);const m=question?.metadata;if(m?.sourceMetadataMismatchPreserved!==true||m?.frozenRuntimeProfile!=="profile_geometry_property"||m?.equalSideCountClassification!==true||m?.rotationInvariant!==true||m?.triangleElementsNamingTargetTouched!==false||m?.triangleAngleClassificationTouched!==false||m?.triangleInequalityTouched!==false||m?.congruentTriangleCorrespondenceTouched!==false||m?.geometryConstructionTouched!==false||m?.applicationContextUsed!==false||m?.q025OrLaterTouched!==false)errors.push("P05F24_PROVENANCE_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});}
export function generateG4AU05P05F24Questions(options={}){const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;if(count<1||count>G4A_U05_P05F24_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F24_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});if(options.knowledgePointId&&options.knowledgePointId!==G4A_U05_P05F24_KP_ID)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F24_KP_INVALID"]),warnings:Object.freeze([])});const specs=selectedSpecs(options.patternSpecIds);if(!specs||specs.length===0)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F24_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});const perSpec=new Map(specs.map(spec=>[spec.patternSpecId,0])),questions=[];for(let index=0;index<count;index+=1){const spec=specs[index%specs.length],sequenceIndex=perSpec.get(spec.patternSpecId);perSpec.set(spec.patternSpecId,sequenceIndex+1);questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f24-public"));}const errors=questions.flatMap(question=>validateG4AU05P05F24Question(question).errors),signatures=questions.map(question=>question.questionSignature);if(new Set(signatures).size!==signatures.length)errors.push("P05F24_DUPLICATE_QUESTION_SIGNATURE");const allocation=Object.freeze(specs.map(spec=>Object.freeze({patternSpecId:spec.patternSpecId,count:perSpec.get(spec.patternSpecId)})));return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation,maxQuestionCount:G4A_U05_P05F24_MAX_QUESTION_COUNT});}
