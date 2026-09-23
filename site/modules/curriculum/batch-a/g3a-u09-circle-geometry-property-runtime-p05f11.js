import {G3A_U09_P05F11_KP_IDS,G3A_U09_P05F11_PATTERN_SPECS,G3A_U09_P05F11_SOURCE_ID,G3A_U09_P05F11_SPEC_IDS_BY_KP} from "../registry/g3a-u09-circle-geometry-property-selector-projection-p05f11.js";

export const G3A_U09_P05F11_MAX_QUESTION_COUNT=240;
export const G3A_U09_P05F11_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const SPEC_BY_ID=new Map(G3A_U09_P05F11_PATTERN_SPECS.map(row=>[row.patternSpecId,row]));
const FORBIDDEN=Object.freeze(["圓周率","圓面積","圓周長公式","圓面積公式","同心圓","摺線","應用題"]);
function hashSeed(seed="p05f11"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function variant(index,specIndex,seed){return (hashSeed(seed)+specIndex*97+index)%240;}
function secondCircleRadiusPx(v,firstRadiusPx,tangentMode){let value=28+((v*7)%17);if(tangentMode==="INTERNAL"&&value===firstRadiusPx)value=value===44?43:value+1;return value;}
function diagramFor(spec,v){
  const radiusCm=2+(v%9),radiusPx=30+(v%13),rotationDeg=(v%24)*15;
  const base={kind:"circle_geometry_property_diagram",diagramMode:"",radiusCm,radiusPx,rotationDeg,variant:v,relation:spec.relation};
  if(spec.knowledgePointId===G3A_U09_P05F11_KP_IDS[0])return Object.freeze({...base,diagramMode:"COMPASS_CONSTRUCTION",centerX:92+(v%5)*9,centerY:64+(Math.floor(v/5)%4)*5,constructionStep:spec.relation,sweepDeg:[90,180,270,360][v%4]});
  if(spec.knowledgePointId===G3A_U09_P05F11_KP_IDS[1]){
    if(spec.relation.startsWith("CLASSIFY_TWO_CIRCLE")){
      const relationClass=spec.relation.endsWith("INTERSECTION")?"INTERSECTION":spec.relation.endsWith("TANGENCY")?"TANGENCY":"SEPARATION";
      const tangentMode=relationClass==="TANGENCY"?(v%2===0?"EXTERNAL":"INTERNAL"):null;
      const secondRadiusCm=2+((v*3)%8),secondRadiusPx=secondCircleRadiusPx(v,radiusPx,tangentMode);
      return Object.freeze({...base,diagramMode:"TWO_CIRCLE_RELATION",relationClass,secondRadiusCm,secondRadiusPx,tangentMode});
    }
    const positionClass=["INSIDE","ON","OUTSIDE"][v%3];
    const distanceCm=positionClass==="INSIDE"?Math.max(1,radiusCm-1):positionClass==="ON"?radiusCm:radiusCm+1;
    return Object.freeze({...base,diagramMode:"POINT_POSITION",positionClass,distanceCm});
  }
  const segmentMode=spec.relation==="MEASURE_CIRCLE_RADIUS_FROM_DIAGRAM"||spec.relation==="COMPUTE_DIAMETER_FROM_RADIUS"?"RADIUS":spec.relation==="REQUIRE_MEASURED_DIAMETER_TO_PASS_CENTER"?"DIAMETER_TEST":"DIAMETER";
  const isDiameter=segmentMode==="DIAMETER_TEST"?v%2===0:null;
  return Object.freeze({...base,diagramMode:"RADIUS_DIAMETER_MEASURE",segmentMode,isDiameter,diameterCm:radiusCm*2});
}
function promptFor(spec,d){
  switch(spec.relation){
    case "CONSTRUCT_CIRCLE_WITH_COMPASS_FROM_SPECIFIED_CENTER_AND_RADIUS":return `以 O 點為圓心、${d.radiusCm} 公分為半徑，用圓規畫圓時應怎麼做？`;
    case "KEEP_COMPASS_POINT_FIXED_AT_CENTER":return "用圓規畫圓時，尖針應固定在哪裡？";
    case "KEEP_COMPASS_OPENING_EQUAL_TO_RADIUS":return `要畫半徑 ${d.radiusCm} 公分的圓，圓規兩腳應張開多少公分？`;
    case "ROTATE_COMPASS_TO_TRACE_CIRCLE":return "尖針固定、張開距離不變後，下一步應怎麼做才能畫出圓？";
    case "CLASSIFY_POINT_INSIDE_ON_OUTSIDE_CIRCLE":return "依圖判斷 P 點在圓內、圓上或圓外。";
    case "COMPARE_POINT_CENTER_DISTANCE_TO_RADIUS":return `圖中 OP 長 ${d.distanceCm} 公分，半徑是 ${d.radiusCm} 公分；OP 與半徑相比如何？`;
    case "CLASSIFY_TWO_CIRCLE_INTERSECTION":return "依圖判斷兩個圓的關係。";
    case "CLASSIFY_TWO_CIRCLE_TANGENCY":return "依圖判斷兩個圓的關係。";
    case "CLASSIFY_TWO_CIRCLE_SEPARATION":return "依圖判斷兩個圓的關係。";
    case "MEASURE_CIRCLE_RADIUS_FROM_DIAGRAM":return "依圖上的 1 公分刻度量一量，標示的半徑是多少公分？";
    case "MEASURE_CIRCLE_DIAMETER_FROM_DIAGRAM":return "依圖上的 1 公分刻度量一量，標示的直徑是多少公分？";
    case "COMPUTE_RADIUS_FROM_DIAMETER":return `一個圓的直徑是 ${d.diameterCm} 公分，半徑是多少公分？`;
    case "COMPUTE_DIAMETER_FROM_RADIUS":return `一個圓的半徑是 ${d.radiusCm} 公分，直徑是多少公分？`;
    case "COMPARE_RADIUS_DIAMETER_MEASUREMENTS":return `同一個圓的半徑是 ${d.radiusCm} 公分，直徑是 ${d.diameterCm} 公分；哪一個較長？`;
    case "REQUIRE_MEASURED_DIAMETER_TO_PASS_CENTER":return "圖中的加粗線段可以量作這個圓的直徑嗎？";
    default:return "依圖作答。";
  }
}
function answerFor(spec,d){
  switch(spec.relation){
    case "CONSTRUCT_CIRCLE_WITH_COMPASS_FROM_SPECIFIED_CENTER_AND_RADIUS":return "尖針固定在圓心，張開到指定半徑後旋轉一周";
    case "KEEP_COMPASS_POINT_FIXED_AT_CENTER":return "圓心";
    case "KEEP_COMPASS_OPENING_EQUAL_TO_RADIUS":return `${d.radiusCm} 公分`;
    case "ROTATE_COMPASS_TO_TRACE_CIRCLE":return "旋轉一周畫出圓";
    case "CLASSIFY_POINT_INSIDE_ON_OUTSIDE_CIRCLE":return d.positionClass==="INSIDE"?"圓內":d.positionClass==="ON"?"圓上":"圓外";
    case "COMPARE_POINT_CENTER_DISTANCE_TO_RADIUS":return d.distanceCm<d.radiusCm?"OP 小於半徑":d.distanceCm===d.radiusCm?"OP 等於半徑":"OP 大於半徑";
    case "CLASSIFY_TWO_CIRCLE_INTERSECTION":return "相交";
    case "CLASSIFY_TWO_CIRCLE_TANGENCY":return "相切";
    case "CLASSIFY_TWO_CIRCLE_SEPARATION":return "分離";
    case "MEASURE_CIRCLE_RADIUS_FROM_DIAGRAM":return `${d.radiusCm} 公分`;
    case "MEASURE_CIRCLE_DIAMETER_FROM_DIAGRAM":return `${d.diameterCm} 公分`;
    case "COMPUTE_RADIUS_FROM_DIAMETER":return `${d.radiusCm} 公分`;
    case "COMPUTE_DIAMETER_FROM_RADIUS":return `${d.diameterCm} 公分`;
    case "COMPARE_RADIUS_DIAMETER_MEASUREMENTS":return "直徑較長";
    case "REQUIRE_MEASURED_DIAMETER_TO_PASS_CENTER":return d.isDiameter?"可以，是直徑":"不可以，不是直徑";
    default:return "";
  }
}
function signatureFor(question){const d=question.geometryDiagram;return [question.patternSpecId,d.variant,d.radiusCm,d.radiusPx,d.rotationDeg,d.diagramMode,d.positionClass??"",d.distanceCm??"",d.relationClass??"",d.secondRadiusCm??"",d.secondRadiusPx??"",d.tangentMode??"",d.segmentMode??"",String(d.isDiameter)].join("|");}
function questionFor(spec,sequenceIndex,seed){const specIndex=G3A_U09_P05F11_PATTERN_SPECS.findIndex(row=>row.patternSpecId===spec.patternSpecId),v=variant(sequenceIndex,specIndex,seed),geometryDiagram=diagramFor(spec,v),promptText=promptFor(spec,geometryDiagram),answerText=answerFor(spec,geometryDiagram);const question={id:`p05f11-q011-${specIndex+1}-${v+1}`,generatedItemId:`p05f11-q011-${specIndex+1}-${v+1}`,sourceId:G3A_U09_P05F11_SOURCE_ID,sourceNodeId:G3A_U09_P05F11_SOURCE_ID,knowledgePointId:spec.knowledgePointId,patternGroupId:spec.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,geometryDiagram,metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice011Implementation",authority:"Q011_SOURCE_AUTHORITY_PREFLIGHT_FULL_PAGE_VISUAL_READBACK",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G3A_U09_P05F11_SHARED_RUNTIME_SCOPE,diagramVariant:v,applicationContextUsed:false,circleCircumferenceFormulaUsed:false,circleAreaFormulaUsed:false,concentricConstructionUsed:false,foldLineConstructionUsed:false,q002SemanticsTouched:false})};return Object.freeze({...question,questionSignature:signatureFor(question)});}
function selectedSpecs(options={}){const selectedKps=options.selectedKnowledgePointIds??options.knowledgePointIds??[];const kpMatches=G3A_U09_P05F11_KP_IDS.filter(id=>selectedKps.includes(id));let kp=kpMatches.length===1?kpMatches[0]:null;if(kpMatches.length>1)return null;if(!kp&&Array.isArray(options.patternSpecIds)){const specKps=G3A_U09_P05F11_KP_IDS.filter(id=>options.patternSpecIds.some(specId=>G3A_U09_P05F11_SPEC_IDS_BY_KP[id].includes(specId)));if(specKps.length!==1)return null;kp=specKps[0];}if(!kp)return null;const allowed=G3A_U09_P05F11_SPEC_IDS_BY_KP[kp],requested=Array.isArray(options.patternSpecIds)&&options.patternSpecIds.length?options.patternSpecIds.filter(id=>allowed.includes(id)):allowed;if(!requested.length)return null;return requested.map(id=>SPEC_BY_ID.get(id));}
export function validateG3AU09P05F11Question(question){const errors=[],spec=SPEC_BY_ID.get(question?.patternSpecId);if(!spec)errors.push("P05F11_PATTERN_SPEC_INVALID");if(question?.sourceId!==G3A_U09_P05F11_SOURCE_ID||question?.sourceNodeId!==G3A_U09_P05F11_SOURCE_ID)errors.push("P05F11_SOURCE_INVALID");if(!G3A_U09_P05F11_KP_IDS.includes(question?.knowledgePointId)||spec?.knowledgePointId!==question?.knowledgePointId||spec?.patternGroupId!==question?.patternGroupId)errors.push("P05F11_KP_OR_GROUP_INVALID");if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F11_MODE_INVALID");const d=question?.geometryDiagram;if(!d||d.kind!=="circle_geometry_property_diagram"||d.relation!==spec?.relation||!Number.isInteger(d.variant)||d.variant<0||d.variant>=240)errors.push("P05F11_DIAGRAM_INVALID");if(spec&&d){if(question.promptText!==promptFor(spec,d))errors.push("P05F11_PROMPT_INVALID");if(question.answerText!==answerFor(spec,d))errors.push("P05F11_ANSWER_INVALID");if(question.questionSignature!==signatureFor(question))errors.push("P05F11_SIGNATURE_INVALID");if(d.diagramMode==="POINT_POSITION"&&((d.positionClass==="INSIDE"&&!(d.distanceCm<d.radiusCm))||(d.positionClass==="ON"&&d.distanceCm!==d.radiusCm)||(d.positionClass==="OUTSIDE"&&!(d.distanceCm>d.radiusCm))))errors.push("P05F11_POINT_DISTANCE_RELATION_INVALID");if(d.diagramMode==="RADIUS_DIAMETER_MEASURE"&&d.diameterCm!==d.radiusCm*2)errors.push("P05F11_RADIUS_DIAMETER_RELATION_INVALID");if(d.diagramMode==="TWO_CIRCLE_RELATION"&&d.relationClass==="TANGENCY"&&d.tangentMode==="INTERNAL"&&d.radiusPx===d.secondRadiusPx)errors.push("P05F11_INTERNAL_TANGENCY_RADII_INVALID");}for(const term of FORBIDDEN)if(`${question?.promptText??""} ${question?.answerText??""}`.includes(term))errors.push(`P05F11_FORBIDDEN_TERM:${term}`);const m=question?.metadata;if(m?.applicationContextUsed!==false||m?.circleCircumferenceFormulaUsed!==false||m?.circleAreaFormulaUsed!==false||m?.concentricConstructionUsed!==false||m?.foldLineConstructionUsed!==false||m?.q002SemanticsTouched!==false)errors.push("P05F11_PROVENANCE_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});}
export function generateG3AU09P05F11Questions(options={}){const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;if(count<1||count>G3A_U09_P05F11_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F11_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});const specs=selectedSpecs(options);if(!specs)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F11_SELECTION_INVALID"]),warnings:Object.freeze([])});const perSpec=new Map(specs.map(row=>[row.patternSpecId,0])),questions=[];for(let i=0;i<count;i+=1){const spec=specs[i%specs.length],n=perSpec.get(spec.patternSpecId);perSpec.set(spec.patternSpecId,n+1);questions.push(questionFor(spec,n,options.generationSeed??"p05f11-public"));}const errors=questions.flatMap(q=>validateG3AU09P05F11Question(q).errors),signatures=questions.map(q=>q.questionSignature);if(new Set(signatures).size!==signatures.length)errors.push("P05F11_DUPLICATE_QUESTION_SIGNATURE");const allocation=Object.freeze(specs.map(spec=>Object.freeze({patternSpecId:spec.patternSpecId,count:perSpec.get(spec.patternSpecId)})));return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:G3A_U09_P05F11_MAX_QUESTION_COUNT,allocation});}
