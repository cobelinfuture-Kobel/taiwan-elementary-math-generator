import {
  G6A_U09_P08F16_PATTERN_GROUPS as GROUPS,
  G6A_U09_P08F16_PATTERN_SPECS as SPECS,
  G6A_U09_P08F16_SOURCE_ID as SRC,
  G6A_U09_P08F16_TARGET_KP_IDS as TARGETS,
  G6A_U09_P08F16_SCALE_DRAWING_KP_ID as DRAW_KP,
  G6A_U09_P08F16_SIMILAR_ANGLE_KP_ID as ANGLE_KP
} from "../registry/g6a-u09-scale-drawing-similarity-selector-projection-p08f16.js";

export const G6A_U09_P08F16_MAX_QUESTION_COUNT=240;
export const G6A_U09_P08F16_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
const FACTORS=Object.freeze([0.5,2,3]);
const ANGLES=Object.freeze([30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120]);
const mod=(n,m)=>((n%m)+m)%m;
const round=v=>Number(v.toFixed(6));
const same=(a,b)=>Math.abs(Number(a)-Number(b))<1e-9;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const clone=v=>JSON.parse(JSON.stringify(v));
const point=(label,x,y)=>Object.freeze({label,x:round(x),y:round(y)});
function baseGeometry(u,kind="triangle"){
  const factor=FACTORS[u%FACTORS.length];
  const width=2+2*(Math.floor(u/FACTORS.length)%3);
  const height=2+2*(Math.floor(u/(FACTORS.length*3))%3);
  const ax=1+(Math.floor(u/(FACTORS.length*9))%4);
  const ay=1+(Math.floor(u/(FACTORS.length*9*4))%4);
  const a=point("A",ax,ay);
  let points;
  if(kind==="rectangle"){
    points=[a,point("B",ax+width,ay),point("C",ax+width,ay+height),point("D",ax,ay+height)];
  }else{
    const skew=(Math.floor(u/7)%3)-1;
    points=[a,point("B",ax+width,ay),point("C",ax+Math.max(0,Math.min(width-1,Math.floor(width/2)+skew)),ay+height)];
  }
  const target=points.map((p,i)=>point(["A′","B′","C′","D′"][i],ax+(p.x-ax)*factor,ay+(p.y-ay)*factor));
  return Object.freeze({factor,width,height,anchor:Object.freeze({x:ax,y:ay}),sourcePoints:Object.freeze(points),targetPoints:Object.freeze(target)});
}
function factorLabel(f){return f===0.5?"1/2":String(f);}
function coordText(p){return "("+p.x+", "+p.y+")";}
function diagramBase(mode,u,g,extra={}){
  const all=[...g.sourcePoints,...g.targetPoints];
  const maxCoord=Math.max(8,...all.flatMap(p=>[p.x,p.y]).map(Number))+2;
  return Object.freeze({kind:"scale_drawing_similarity_diagram",diagramMode:mode,variant:u,factor:g.factor,factorLabel:factorLabel(g.factor),anchor:g.anchor,sourcePoints:g.sourcePoints,targetPoints:g.targetPoints,maxCoord:Math.min(26,Math.ceil(maxCoord)),answerKeyCompact:false,sourceBackedScaleTransformation:true,...extra});
}
function buildScaleDrawing(spec,u){
  const rectangle=spec.promptMode==="DRAW_SCALED_RECTANGLE"||spec.promptMode==="COMPLETE_MISSING_VERTEX"||spec.promptMode==="VERIFY_CANDIDATE_DRAWING";
  const g=baseGeometry(u,rectangle?"rectangle":"triangle"),factor=factorLabel(g.factor);
  if(spec.promptMode==="DRAW_SCALED_TRIANGLE"){
    return Object.freeze({promptText:"左圖為三角形 ABC。以 A 為基準，按 "+factor+" 倍在右側方格畫出 A′B′C′。",answerText:"作圖如圖",answerValue:"DRAWING",answerUnit:null,patternRepresentation:Object.freeze({...g,mode:"CONSTRUCT_TRIANGLE"}),geometryDiagram:diagramBase("CONSTRUCT",u,g,{shapeKind:"triangle",showTargetSolution:false})});
  }
  if(spec.promptMode==="DRAW_SCALED_RECTANGLE"){
    return Object.freeze({promptText:"左圖為長方形 ABCD。以 A 為基準，按 "+factor+" 倍在右側方格畫出 A′B′C′D′。",answerText:"作圖如圖",answerValue:"DRAWING",answerUnit:null,patternRepresentation:Object.freeze({...g,mode:"CONSTRUCT_RECTANGLE"}),geometryDiagram:diagramBase("CONSTRUCT",u,g,{shapeKind:"rectangle",showTargetSolution:false})});
  }
  if(spec.promptMode==="COMPLETE_MISSING_VERTEX"){
    const missingIndex=1+(u%3),missing=g.targetPoints[missingIndex];
    return Object.freeze({promptText:"右圖是左圖按 "+factor+" 倍得到的放大圖或縮圖。已畫出其餘頂點，請寫出 "+missing.label+" 的座標。",answerText:coordText(missing),answerValue:Object.freeze({x:missing.x,y:missing.y}),answerUnit:"coordinate",patternRepresentation:Object.freeze({...g,mode:"MISSING_VERTEX",missingIndex}),geometryDiagram:diagramBase("MISSING_VERTEX",u,g,{shapeKind:"rectangle",missingIndex})});
  }
  const candidateValid=u%2===0;
  const candidate=g.targetPoints.map((p,i)=>i===2&&!candidateValid?point(p.label,p.x+1,p.y):p);
  return Object.freeze({promptText:"右圖宣稱是左圖以 A 為基準按 "+factor+" 倍得到的圖形。這個畫法正確嗎？",answerText:candidateValid?"是":"否",answerValue:candidateValid,answerUnit:"boolean",patternRepresentation:Object.freeze({...g,mode:"VERIFY_SCALE",candidateValid,candidatePoints:Object.freeze(candidate)}),geometryDiagram:diagramBase("VERIFY_SCALE",u,g,{shapeKind:"rectangle",candidateValid,candidatePoints:Object.freeze(candidate)})});
}
function buildSimilarAngle(spec,u){
  const shape=spec.promptMode==="PARALLEL_RELATION"?"rectangle":"triangle",g=baseGeometry(u,shape),factor=factorLabel(g.factor);
  if(spec.promptMode==="CORRESPONDING_ANGLE_VALUE"){
    const vertexIndex=u%3,angle=ANGLES[Math.floor(u/3)%ANGLES.length],sourceLabel=g.sourcePoints[vertexIndex].label,targetLabel=g.targetPoints[vertexIndex].label;
    return Object.freeze({promptText:"左圖與右圖為 "+factor+" 倍的放大圖或縮圖。若 ∠"+sourceLabel+" = "+angle+"°，則 ∠"+targetLabel+" = ？",answerText:angle+"°",answerValue:angle,answerUnit:"degree",patternRepresentation:Object.freeze({...g,mode:"ANGLE_VALUE",vertexIndex,angle}),geometryDiagram:diagramBase("ANGLE_VALUE",u,g,{shapeKind:"triangle",vertexIndex,angle})});
  }
  if(spec.promptMode==="CORRESPONDING_ANGLE_LABEL"){
    const vertexIndex=u%3,sourceLabel=g.sourcePoints[vertexIndex].label,targetLabel=g.targetPoints[vertexIndex].label;
    return Object.freeze({promptText:"左圖與右圖為 "+factor+" 倍的放大圖或縮圖。∠"+sourceLabel+" 對應右圖的哪一個角？",answerText:"∠"+targetLabel,answerValue:targetLabel,answerUnit:"angle_label",patternRepresentation:Object.freeze({...g,mode:"ANGLE_LABEL",vertexIndex}),geometryDiagram:diagramBase("ANGLE_LABEL",u,g,{shapeKind:"triangle",vertexIndex})});
  }
  if(spec.promptMode==="PARALLEL_RELATION"){
    const parallel=u%2===0,pairA="A′B′",pairB=parallel?"C′D′":"B′C′";
    return Object.freeze({promptText:"右圖是左圖按 "+factor+" 倍得到的圖形。邊 "+pairA+" 和 "+pairB+" 是否平行？",answerText:parallel?"是":"否",answerValue:parallel,answerUnit:"boolean",patternRepresentation:Object.freeze({...g,mode:"PARALLEL",parallel,pairA,pairB}),geometryDiagram:diagramBase("PARALLEL",u,g,{shapeKind:"rectangle",parallel,pairA,pairB})});
  }
  const candidateValid=u%2===0;
  const candidate=g.targetPoints.map((p,i)=>i===2&&!candidateValid?point(p.label,p.x+1,p.y+1):p);
  return Object.freeze({promptText:"右圖宣稱是左圖按 "+factor+" 倍得到的圖形。它是否保持相同形狀與對應角？",answerText:candidateValid?"是":"否",answerValue:candidateValid,answerUnit:"boolean",patternRepresentation:Object.freeze({...g,mode:"SIMILAR_VERIFY",candidateValid,candidatePoints:Object.freeze(candidate)}),geometryDiagram:diagramBase("SIMILAR_VERIFY",u,g,{shapeKind:"triangle",candidateValid,candidatePoints:Object.freeze(candidate)})});
}
const payload=(spec,u)=>spec.knowledgePointId===DRAW_KP?buildScaleDrawing(spec,u):buildSimilarAngle(spec,u);
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
function resolveKp(o={}){
  const explicit=o.knowledgePointId;
  if(TARGETS.includes(explicit))return explicit;
  const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];
  return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;
}
function selectedSpecs(kp,o={}){
  const own=SPECS.filter(x=>x.knowledgePointId===kp);
  const requested=Array.isArray(o.patternSpecIds)?own.filter(x=>o.patternSpecIds.includes(x.patternSpecId)):[];
  return requested.length?requested:own;
}
function makeQuestion(spec,u,index){
  const p=payload(spec,u),group=GROUP_BY_KP.get(spec.knowledgePointId);
  const q={id:"p08f16-"+spec.knowledgePointId+"-"+spec.patternSpecId+"-"+u+"-"+index,sourceId:SRC,knowledgePointId:spec.knowledgePointId,patternGroupId:group.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",variant:u,promptText:p.promptText,displayText:p.promptText,blankedDisplayText:p.promptText,answerText:p.answerText,answerValue:p.answerValue,answerUnit:p.answerUnit,geometryDiagram:p.geometryDiagram,patternRepresentation:p.patternRepresentation,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice016Implementation",sourceId:SRC,knowledgePointId:spec.knowledgePointId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",sharedRuntimeScope:G6A_U09_P08F16_SHARED_RUNTIME_SCOPE,sourceBackedScaleTransformation:true})};
  q.questionSignature=signature(q);
  return Object.freeze(q);
}
function samePoint(a,b){return a?.label===b?.label&&same(a?.x,b?.x)&&same(a?.y,b?.y);}
function validatePoints(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((p,i)=>samePoint(p,b[i]));}
export function validateG6AU09P08F16Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);
  if(!spec)e.push("P08F16_UNKNOWN_PATTERN_SPEC");
  else{
    if(q.sourceId!==SRC)e.push("P08F16_SOURCE_INVALID");
    if(q.knowledgePointId!==spec.knowledgePointId)e.push("P08F16_KP_INVALID");
    if(q.questionMode!=="diagram")e.push("P08F16_MODE_INVALID");
    if(!Number.isInteger(q.variant)||q.variant<0||q.variant>=240)e.push("P08F16_VARIANT_INVALID");
    if(q.geometryDiagram?.kind!=="scale_drawing_similarity_diagram"||q.geometryDiagram?.sourceBackedScaleTransformation!==true)e.push("P08F16_DIAGRAM_INVALID");
    if(!Number.isFinite(q.patternRepresentation?.factor)||q.patternRepresentation.factor<=0)e.push("P08F16_FACTOR_INVALID");
    if(!e.length){
      const expected=payload(spec,q.variant);
      if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||JSON.stringify(q.answerValue)!==JSON.stringify(expected.answerValue)||q.answerUnit!==expected.answerUnit)e.push("P08F16_ANSWER_MODEL_INVALID");
      if(JSON.stringify(q.geometryDiagram)!==JSON.stringify(expected.geometryDiagram))e.push("P08F16_DIAGRAM_SEMANTICS_INVALID");
      if(JSON.stringify(q.patternRepresentation)!==JSON.stringify(expected.patternRepresentation))e.push("P08F16_PATTERN_REPRESENTATION_INVALID");
      if(q.questionSignature!==signature(q))e.push("P08F16_SIGNATURE_INVALID");
      const g=q.patternRepresentation;
      if(!validatePoints(g.sourcePoints,expected.patternRepresentation.sourcePoints))e.push("P08F16_SOURCE_POINTS_INVALID");
      if(!validatePoints(g.targetPoints,expected.patternRepresentation.targetPoints))e.push("P08F16_TARGET_POINTS_INVALID");
    }
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
function normalizedYesNo(v){const s=String(v??"").trim();if(["是","yes","YES","Yes"].includes(s))return true;if(["否","no","NO","No"].includes(s))return false;return null;}
function parseCoordinate(v){const m=String(v??"").match(/\(?\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*\)?/);return m?{x:Number(m[1]),y:Number(m[2])}:null;}
export function validateG6AU09P08F16Answer(q,raw){
  const cq=validateG6AU09P08F16Question(q);if(!cq.ok)return Object.freeze({ok:false,errors:cq.errors});
  let ok=false;
  if(q.answerUnit==="degree"){const m=String(raw??"").match(/-?\d+(?:\.\d+)?/);ok=Boolean(m)&&same(Number(m[0]),q.answerValue);}
  else if(q.answerUnit==="coordinate"){const c=parseCoordinate(raw);ok=Boolean(c)&&same(c.x,q.answerValue.x)&&same(c.y,q.answerValue.y);}
  else if(q.answerUnit==="boolean")ok=normalizedYesNo(raw)===q.answerValue;
  else if(q.answerUnit==="angle_label")ok=String(raw??"").replaceAll(" ","").replace(/^∠/,"")===String(q.answerValue).replaceAll(" ","");
  else ok=String(raw??"").trim()===q.answerText;
  return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F16_ANSWER_MISMATCH"])});
}
export function generateG6AU09P08F16Questions(o={}){
  const kp=resolveKp(o),errors=[];
  if(!kp)return Object.freeze({ok:false,errors:Object.freeze(["P08F16_SINGLE_TARGET_KP_REQUIRED"]),warnings:Object.freeze([]),questions:Object.freeze([])});
  const count=Number.isInteger(o.questionCount)?o.questionCount:20;
  if(count<1||count>G6A_U09_P08F16_MAX_QUESTION_COUNT)errors.push("P08F16_QUESTION_COUNT_OUT_OF_RANGE");
  const specs=selectedSpecs(kp,o);
  if(!specs.length)errors.push("P08F16_PATTERN_SPEC_REQUIRED");
  if(errors.length)return Object.freeze({ok:false,errors:Object.freeze(errors),warnings:Object.freeze([]),questions:Object.freeze([])});
  const seed=String(o.generationSeed??"p08f16-scale-transform"),occurrence=new Map(),questions=[];
  for(let i=0;i<count;i++){
    const spec=specs[i%specs.length],n=occurrence.get(spec.patternSpecId)??0;
    occurrence.set(spec.patternSpecId,n+1);
    const u=mod(hash(seed+"|"+spec.patternSpecId)+n,240);
    questions.push(makeQuestion(spec,u,i));
  }
  const duplicateCount=questions.length-new Set(questions.map(q=>q.questionSignature)).size;
  if(duplicateCount>0)return Object.freeze({ok:false,errors:Object.freeze(["P08F16_DUPLICATE_SIGNATURES:"+duplicateCount]),warnings:Object.freeze([]),questions:Object.freeze(questions)});
  const validationErrors=questions.flatMap(q=>validateG6AU09P08F16Question(q).errors);
  if(validationErrors.length)return Object.freeze({ok:false,errors:Object.freeze(validationErrors),warnings:Object.freeze([]),questions:Object.freeze(questions)});
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),questions:Object.freeze(questions),sourceId:SRC,knowledgePointId:kp,questionMode:"diagram",maxQuestionCount:G6A_U09_P08F16_MAX_QUESTION_COUNT,sharedRuntimeScope:G6A_U09_P08F16_SHARED_RUNTIME_SCOPE});
}
