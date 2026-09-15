import {G6B_U03_P05F49_FORMAL_MAPPING as MAP,G6B_U03_P05F49_KP_ID as KP,G6B_U03_P05F49_PATTERN_GROUP_ID as GROUP,G6B_U03_P05F49_PATTERN_SPECS as SPECS,G6B_U03_P05F49_SOURCE_ID as SRC,G6B_U03_P05F49_SPEC_IDS as SPEC_IDS} from "../registry/g6b-u03-prism-surface-area-selector-projection-p05f49.js";
export const G6B_U03_P05F49_MAX_QUESTION_COUNT=240;
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const TRIANGLES=Object.freeze([[3,4,5],[5,12,13],[8,15,17],[7,24,25]].map(Object.freeze));
const PARALLELOGRAMS=Object.freeze([{base:6,side:5,height:4},{base:8,side:10,height:6},{base:9,side:13,height:12},{base:12,side:17,height:15}].map(Object.freeze));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function dimensions(spec,v){
  const scale=1+(v%5),family=Math.floor(v/5)%4,prismLength=2+(Math.floor(v/20)%12);
  if(spec.task==="TRIANGULAR_PRISM_EXPOSED_FACE_SUM"){
    const [a0,b0,c0]=TRIANGLES[family],a=a0*scale,b=b0*scale,c=c0*scale;
    return Object.freeze({baseShape:"RIGHT_TRIANGLE",baseSides:3,sideA:a,sideB:b,sideC:c,baseArea:a*b/2,basePerimeter:a+b+c,prismLength});
  }
  if(spec.task==="TRAPEZOIDAL_PRISM_LATERAL_PERIMETER_NET"){
    const [offset0,height0,leg0]=TRIANGLES[family],upperBase=4*scale,lowerBase=(4+2*offset0)*scale,height=height0*scale,leg=leg0*scale;
    return Object.freeze({baseShape:"ISOSCELES_TRAPEZOID",baseSides:4,upperBase,lowerBase,height,leg,baseArea:(upperBase+lowerBase)*height/2,basePerimeter:upperBase+lowerBase+2*leg,prismLength});
  }
  const p=PARALLELOGRAMS[family],base=p.base*scale,side=p.side*scale,height=p.height*scale;
  return Object.freeze({baseShape:"PARALLELOGRAM",baseSides:4,base,side,height,baseArea:base*height,basePerimeter:2*(base+side),prismLength});
}
function diagram(spec,v){
  const d=dimensions(spec,v),surfaceArea=2*d.baseArea+d.basePerimeter*d.prismLength;
  return Object.freeze({kind:"prism_pyramid_elements_diagram",representationMode:"PRISM_SURFACE_AREA",surfaceAreaModel:true,solidKind:"PRISM",baseSides:d.baseSides,baseShape:d.baseShape,variant:v,rotationDeg:(v*17)%360,depth:[20,22,24,26,28][Math.floor(v/48)%5],shiftX:[-10,-8,0,8,10][Math.floor(v/10)%5],taskMode:"COUNT_FACES",focusElement:"NONE",faceCount:d.baseSides+2,edgeCount:d.baseSides*3,vertexCount:d.baseSides*2,baseArea:d.baseArea,basePerimeter:d.basePerimeter,prismLength:d.prismLength,surfaceArea,dimensions:d,countEachExteriorFaceExactlyOnce:true,lateralNetWidth:d.basePerimeter,lateralNetWidthEqualsBasePerimeter:true,sourcePages:Object.freeze([1,2])});
}
function prompt(spec,d){
  const x=d.dimensions;
  if(spec.task==="TRIANGULAR_PRISM_EXPOSED_FACE_SUM")return `一個三角柱的底面是直角三角形，三邊長為 ${x.sideA}、${x.sideB}、${x.sideC} 公分，柱高 ${x.prismLength} 公分。把兩個底面與 3 個側面都算一次，表面積是多少平方公分？`;
  if(spec.task==="TRAPEZOIDAL_PRISM_LATERAL_PERIMETER_NET")return `一個梯形柱的底面是等腰梯形，上底 ${x.upperBase}、下底 ${x.lowerBase}、高 ${x.height}、兩腰各 ${x.leg} 公分，柱高 ${x.prismLength} 公分。側面展開總寬等於底面周長，表面積是多少平方公分？`;
  return `一個平行四邊形柱的底面，底 ${x.base}、高 ${x.height}、另一邊 ${x.side} 公分，柱高 ${x.prismLength} 公分。側面展開總寬等於底面周長，表面積是多少平方公分？`;
}
const sig=q=>[q.knowledgePointId,q.patternSpecId,q.geometryDiagram.variant,q.geometryDiagram.baseShape,q.geometryDiagram.baseArea,q.geometryDiagram.basePerimeter,q.geometryDiagram.prismLength,q.answerValue].join("|");
function selectSpecs(o={}){const ids=[...new Set((o.patternSpecIds??[]).filter(Boolean))];if(ids.length){if(ids.some(id=>!BY_SPEC.has(id)))return null;return ids.map(id=>BY_SPEC.get(id));}const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0];if(kp!==KP)return null;return SPECS;}
function make(spec,n,seed){
  const si=SPEC_IDS.indexOf(spec.patternSpecId),v=(hash(seed)+n+si*79)%240,d=diagram(spec,v),text=prompt(spec,d);
  const q={id:`p05f49-prism-surface-${si+1}-${v+1}`,generatedItemId:`p05f49-${si+1}-${v+1}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP,patternSpecId:spec.patternSpecId,relation:spec.relation,task:spec.task,questionMode:"diagram",mode:"diagram",promptText:text,prompt:text,blankedDisplayText:text,displayText:`${text} ${d.surfaceArea} 平方公分`,answerText:`${d.surfaceArea} 平方公分`,answerValue:d.surfaceArea,unit:"平方公分",geometryDiagram:d,metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice049Implementation",authority:"Q049_SOURCE_AUTHORITY_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",frozenRuntimeProfile:"profile_spatial_solid",sourceBackedPrismSurfaceArea:true,countEachExteriorFaceExactlyOnce:true,lateralNetWidthEqualsBasePerimeter:true,optionalGeometryConstructionCapability:true,prismBaseAreaHeightVolumeTouched:false,triangularPrismVolumeTouched:false,cylinderTouched:false,compositePrismTouched:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q050OrLaterTouched:false})};
  return Object.freeze({...q,questionSignature:sig(q),formalMappingId:MAP.mappingId});
}
export function validateG6BU03P05F49Question(q){
  const errors=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)errors.push("P05F49_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)errors.push("P05F49_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP)errors.push("P05F49_KP_OR_GROUP_INVALID");
  if(spec&&q?.knowledgePointId!==spec.knowledgePointId)errors.push("P05F49_SPEC_KP_MISMATCH");
  const d=q?.geometryDiagram;
  if(!d||d.kind!=="prism_pyramid_elements_diagram"||d.representationMode!=="PRISM_SURFACE_AREA"||!d.surfaceAreaModel||d.solidKind!=="PRISM"||![3,4].includes(d.baseSides)||d.taskMode!=="COUNT_FACES"||d.focusElement!=="NONE"||!Number.isInteger(d.variant)||d.variant<0||d.variant>=240||!d.countEachExteriorFaceExactlyOnce||!d.lateralNetWidthEqualsBasePerimeter)errors.push("P05F49_GEOMETRY_INVALID");
  if(spec&&d){const expected=diagram(spec,d.variant);if(JSON.stringify(d)!==JSON.stringify(expected))errors.push("P05F49_DIAGRAM_CONTRACT_INVALID");if(q.promptText!==prompt(spec,d)||q.answerValue!==d.surfaceArea||q.answerText!==`${d.surfaceArea} 平方公分`||q.questionSignature!==sig(q))errors.push("P05F49_ANSWER_TEXT_SIGNATURE_INVALID");if(d.surfaceArea!==2*d.baseArea+d.basePerimeter*d.prismLength)errors.push("P05F49_SURFACE_AREA_FORMULA_INVALID");if(d.lateralNetWidth!==d.basePerimeter)errors.push("P05F49_LATERAL_NET_WIDTH_INVALID");}
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_spatial_solid"||m.prismBaseAreaHeightVolumeTouched||m.triangularPrismVolumeTouched||m.cylinderTouched||m.compositePrismTouched||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q050OrLaterTouched)errors.push("P05F49_SCOPE_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
export function generateG6BU03P05F49Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F49_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selectSpecs(o);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F49_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);questions.push(make(spec,n,o.generationSeed??"p05f49-public"));}
  const errors=questions.flatMap(q=>validateG6BU03P05F49Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P05F49_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240});
}
