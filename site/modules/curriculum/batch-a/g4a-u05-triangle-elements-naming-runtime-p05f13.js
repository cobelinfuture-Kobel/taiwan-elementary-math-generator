import {
  G4A_U05_P05F13_KP_ID,
  G4A_U05_P05F13_PATTERN_GROUP_ID,
  G4A_U05_P05F13_PATTERN_SPECS,
  G4A_U05_P05F13_SOURCE_ID,
  G4A_U05_P05F13_SPEC_IDS,
} from "../registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";

export const G4A_U05_P05F13_MAX_QUESTION_COUNT=240;
export const G4A_U05_P05F13_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const ROTATIONS=Object.freeze(Array.from({length:24},(_,index)=>index*15));
const TEMPLATES=Object.freeze([
  Object.freeze([[-54,34],[-6,-48],[58,30]]),
  Object.freeze([[-58,26],[8,-46],[54,38]]),
  Object.freeze([[-52,40],[-16,-44],[60,20]]),
  Object.freeze([[-60,18],[4,-50],[52,42]]),
  Object.freeze([[-48,38],[18,-42],[56,24]]),
  Object.freeze([[-56,30],[-20,-46],[62,34]]),
  Object.freeze([[-62,34],[10,-44],[48,26]]),
  Object.freeze([[-50,24],[-2,-52],[64,38]]),
  Object.freeze([[-58,42],[16,-38],[50,18]]),
  Object.freeze([[-46,32],[-12,-50],[60,40]]),
]);
const LABELS=Object.freeze(["A","B","C"]);
const SIDE_NAMES=Object.freeze(["AB","BC","CA"]);
const NAMING_ORDERS=Object.freeze([
  Object.freeze(["A","B","C"]),
  Object.freeze(["B","C","A"]),
  Object.freeze(["C","A","B"]),
  Object.freeze(["A","C","B"]),
  Object.freeze(["C","B","A"]),
  Object.freeze(["B","A","C"]),
]);
const FORBIDDEN_TERMS=Object.freeze(["等邊","等腰","不等邊","銳角三角形","直角三角形","鈍角三角形","三角形不等式","全等","作圖","應用題"]);
const SPEC_BY_ID=new Map(G4A_U05_P05F13_PATTERN_SPECS.map(row=>[row.patternSpecId,row]));

function hashSeed(seed="p05f13"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function variantNumber(index,specIndex,seed){return (hashSeed(seed)+specIndex*67+index)%240;}
function rotatePoint([x,y],deg){const r=deg*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return Object.freeze({x:Number((x*c-y*s).toFixed(2)),y:Number((x*s+y*c).toFixed(2))});}
function expectedMarkerMode(relation){
  if(relation==="IDENTIFY_TRIANGLE_SIDES")return "SIDE_HIGHLIGHT";
  if(relation==="IDENTIFY_TRIANGLE_ANGLES")return "ANGLE_ARC";
  if(relation==="IDENTIFY_TRIANGLE_VERTICES")return "VERTEX_DOT";
  if(relation==="NAME_TRIANGLE_ELEMENTS_CONSISTENTLY")return "NAMING_ORDER";
  return "CLOSED_STRUCTURE";
}
function diagramFor(spec,variant){
  const templateIndex=variant%TEMPLATES.length;
  const rotationDeg=ROTATIONS[Math.floor(variant/TEMPLATES.length)%ROTATIONS.length];
  const vertices=TEMPLATES[templateIndex].map((p,index)=>Object.freeze({label:LABELS[index],...rotatePoint(p,rotationDeg)}));
  const targetIndex=variant%3;
  return Object.freeze({
    kind:"triangle_elements_naming_diagram",
    diagramMode:"TRIANGLE_ELEMENTS_NAMING",
    relation:spec.relation,
    variant,
    templateIndex,
    rotationDeg,
    markerMode:expectedMarkerMode(spec.relation),
    targetIndex,
    targetLabel:LABELS[targetIndex],
    targetSideName:SIDE_NAMES[targetIndex],
    namingOrder:NAMING_ORDERS[variant%NAMING_ORDERS.length],
    vertices:Object.freeze(vertices),
    segments:Object.freeze([
      Object.freeze({name:"AB",from:"A",to:"B"}),
      Object.freeze({name:"BC",from:"B",to:"C"}),
      Object.freeze({name:"CA",from:"C",to:"A"}),
    ]),
    segmentCount:3,
    closed:true,
  });
}
function promptFor(spec,d){
  switch(spec.relation){
    case "IDENTIFY_TRIANGLE_SIDES": return "圖中加粗的線段是哪一條邊？";
    case "IDENTIFY_TRIANGLE_ANGLES": return "圖中弧線標記的是哪一個角？";
    case "IDENTIFY_TRIANGLE_VERTICES": return "圖中加大的黑點是哪一個頂點？";
    case "NAME_TRIANGLE_ELEMENTS_CONSISTENTLY": return `依 ${d.namingOrder.join("→")} 的頂點順序命名，這個三角形應寫成什麼？`;
    case "PRESERVE_CLOSED_THREE_SEGMENT_TRIANGLE_STRUCTURE": return "圖中的三條線段是否首尾相接形成封閉的三角形？";
    default: return "依圖作答。";
  }
}
function answerFor(spec,d){
  switch(spec.relation){
    case "IDENTIFY_TRIANGLE_SIDES": return `邊 ${d.targetSideName}`;
    case "IDENTIFY_TRIANGLE_ANGLES": return `∠${d.targetLabel}`;
    case "IDENTIFY_TRIANGLE_VERTICES": return `頂點 ${d.targetLabel}`;
    case "NAME_TRIANGLE_ELEMENTS_CONSISTENTLY": return `△${d.namingOrder.join("")}`;
    case "PRESERVE_CLOSED_THREE_SEGMENT_TRIANGLE_STRUCTURE": return "是，三條線段首尾相接形成封閉三角形";
    default: return "";
  }
}
function signatureFor(question){
  const d=question.geometryDiagram;
  return [question.patternSpecId,d.variant,d.templateIndex,d.rotationDeg,d.markerMode,d.targetIndex,d.targetLabel,d.targetSideName,d.namingOrder.join(""),...d.vertices.flatMap(v=>[v.x,v.y])].join("|");
}
function selectedSpecs(patternSpecIds){
  if(!Array.isArray(patternSpecIds)||patternSpecIds.length===0)return [...G4A_U05_P05F13_PATTERN_SPECS];
  const unique=[...new Set(patternSpecIds)];
  if(unique.some(id=>!SPEC_BY_ID.has(id)))return null;
  return unique.map(id=>SPEC_BY_ID.get(id));
}
function questionFor(spec,sequenceIndex,seed){
  const specIndex=G4A_U05_P05F13_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant=variantNumber(sequenceIndex,specIndex,seed);
  const geometryDiagram=diagramFor(spec,variant);
  const promptText=promptFor(spec,geometryDiagram);
  const answerText=answerFor(spec,geometryDiagram);
  const question={
    id:`p05f13-q013-${specIndex+1}-${variant+1}`,
    generatedItemId:`p05f13-q013-${specIndex+1}-${variant+1}`,
    sourceId:G4A_U05_P05F13_SOURCE_ID,
    sourceNodeId:G4A_U05_P05F13_SOURCE_ID,
    knowledgePointId:G4A_U05_P05F13_KP_ID,
    patternGroupId:G4A_U05_P05F13_PATTERN_GROUP_ID,
    patternSpecId:spec.patternSpecId,
    relation:spec.relation,
    questionMode:"diagram",
    mode:"diagram",
    promptText,
    prompt:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} ${answerText}`,
    answerText,
    geometryDiagram,
    metadata:Object.freeze({
      taskId:"P05F_W5DirectProductVerticalSlice013Implementation",
      authority:"FROZEN_QUEUE_PLUS_R02_REVIEWED_CANDIDATE_WITH_CURRENT_DRIVE_IDENTITY_CROSSCHECK",
      sourcePages:Object.freeze([1,2]),
      sourceMetadataUrl:"https://meow911.com/4a05/",
      embeddedHeaderUrl:"https://meow911.com/4a06/",
      sourceMetadataMismatchPreserved:true,
      sharedRuntimeScope:G4A_U05_P05F13_SHARED_RUNTIME_SCOPE,
      diagramVariant:variant,
      sideClassificationUsed:false,
      angleClassificationUsed:false,
      triangleInequalityUsed:false,
      congruenceCorrespondenceUsed:false,
      geometryConstructionUsed:false,
      applicationContextUsed:false,
      q014OrLaterTouched:false,
    }),
  };
  return Object.freeze({...question,questionSignature:signatureFor(question)});
}
function geometryValid(d){
  if(!d||d.kind!=="triangle_elements_naming_diagram"||d.diagramMode!=="TRIANGLE_ELEMENTS_NAMING")return false;
  if(!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!Number.isInteger(d.templateIndex)||d.templateIndex<0||d.templateIndex>=10||!ROTATIONS.includes(d.rotationDeg))return false;
  if(!Array.isArray(d.vertices)||d.vertices.length!==3||d.vertices.map(v=>v.label).join(",")!=="A,B,C")return false;
  if(!d.vertices.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
  if(!Array.isArray(d.segments)||d.segments.length!==3||d.segmentCount!==3||d.closed!==true)return false;
  if(d.segments.map(s=>`${s.name}:${s.from}${s.to}`).join("|")!=="AB:AB|BC:BC|CA:CA")return false;
  const [a,b,c]=d.vertices;
  const area2=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
  return area2>500;
}
export function validateG4AU05P05F13Question(question){
  const errors=[];
  const spec=SPEC_BY_ID.get(question?.patternSpecId);
  if(!spec)errors.push("P05F13_PATTERN_SPEC_INVALID");
  if(question?.sourceId!==G4A_U05_P05F13_SOURCE_ID||question?.sourceNodeId!==G4A_U05_P05F13_SOURCE_ID)errors.push("P05F13_SOURCE_INVALID");
  if(question?.knowledgePointId!==G4A_U05_P05F13_KP_ID||question?.patternGroupId!==G4A_U05_P05F13_PATTERN_GROUP_ID)errors.push("P05F13_KP_OR_GROUP_INVALID");
  if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F13_MODE_INVALID");
  const d=question?.geometryDiagram;
  if(!geometryValid(d))errors.push("P05F13_TRIANGLE_GEOMETRY_INVALID");
  if(spec&&d){
    const expected=diagramFor(spec,d.variant);
    if(JSON.stringify(d)!==JSON.stringify(expected))errors.push("P05F13_DIAGRAM_CONTRACT_INVALID");
    if(question?.promptText!==promptFor(spec,d))errors.push("P05F13_PROMPT_INVALID");
    if(question?.answerText!==answerFor(spec,d))errors.push("P05F13_ANSWER_INVALID");
    if(question?.questionSignature!==signatureFor(question))errors.push("P05F13_SIGNATURE_INVALID");
  }
  const learnerText=`${question?.promptText??""} ${question?.answerText??""}`;
  for(const term of FORBIDDEN_TERMS)if(learnerText.includes(term))errors.push(`P05F13_FORBIDDEN_TERM:${term}`);
  const m=question?.metadata;
  if(m?.sourceMetadataMismatchPreserved!==true||m?.sideClassificationUsed!==false||m?.angleClassificationUsed!==false||m?.triangleInequalityUsed!==false||m?.congruenceCorrespondenceUsed!==false||m?.geometryConstructionUsed!==false||m?.applicationContextUsed!==false||m?.q014OrLaterTouched!==false)errors.push("P05F13_PROVENANCE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
export function generateG4AU05P05F13Questions(options={}){
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if(count<1||count>G4A_U05_P05F13_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F13_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);
  if(!specs||specs.length===0)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F13_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpec=new Map(specs.map(spec=>[spec.patternSpecId,0]));
  const questions=[];
  for(let index=0;index<count;index+=1){
    const spec=specs[index%specs.length];
    const sequenceIndex=perSpec.get(spec.patternSpecId);
    perSpec.set(spec.patternSpecId,sequenceIndex+1);
    questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f13-public"));
  }
  const errors=questions.flatMap(question=>validateG4AU05P05F13Question(question).errors);
  const signatures=questions.map(question=>question.questionSignature);
  if(new Set(signatures).size!==signatures.length)errors.push("P05F13_DUPLICATE_QUESTION_SIGNATURE");
  const allocation=Object.freeze(specs.map(spec=>Object.freeze({patternSpecId:spec.patternSpecId,count:perSpec.get(spec.patternSpecId)})));
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation,maxQuestionCount:G4A_U05_P05F13_MAX_QUESTION_COUNT});
}
