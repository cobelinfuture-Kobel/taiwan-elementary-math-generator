import {G5A_U05A1_P08F12_KP_ID as KP,G5A_U05A1_P08F12_PATTERN_GROUP as GROUP,G5A_U05A1_P08F12_PATTERN_SPECS as SPECS,G5A_U05A1_P08F12_SOURCE_ID as SRC,G5A_U05A1_P08F12_SPEC_IDS as SPEC_IDS} from "../registry/g5a-u05a1-sector-compare-same-circle-selector-projection-p08f12.js";

export const G5A_U05A1_P08F12_MAX_QUESTION_COUNT=240;
export const G5A_U05A1_P08F12_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const ANGLES=Object.freeze([30,45,60,72,90,120,135,150,180]);
const ROTATIONS=Object.freeze(Array.from({length:12},(_,i)=>i*30));
const RADII=Object.freeze([40,42,44,46]);
const LABELS=Object.freeze(["A","B","C"]);
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const ORDERED_PAIRS=Object.freeze(ANGLES.flatMap(a=>ANGLES.filter(b=>b!==a).map(b=>Object.freeze([a,b]))));
const ORDERED_TRIPLES=Object.freeze(ANGLES.flatMap(a=>ANGLES.filter(b=>b!==a).flatMap(b=>ANGLES.filter(c=>c!==a&&c!==b).map(c=>Object.freeze([a,b,c])))));
const ROTATION_PAIRS=Object.freeze(ROTATIONS.flatMap(a=>ROTATIONS.filter(b=>b!==a).map(b=>Object.freeze([a,b]))));

function hashSeed(seed="p08f12"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],r=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function sector(label,angle,rotation,radius){return Object.freeze({label,centralAngleDeg:angle,rotationDeg:rotation,radius});}
function variantFor(spec,index,seed){
  const h=hashSeed(seed+"|"+spec.patternSpecId);
  if(spec.diagramMode==="TWO_SECTORS_COMPARE"){
    const cap=ORDERED_PAIRS.length*ROTATIONS.length*RADII.length,v=(h+index)%cap,pair=ORDERED_PAIRS[v%ORDERED_PAIRS.length],rotation=ROTATIONS[Math.floor(v/ORDERED_PAIRS.length)%ROTATIONS.length],radius=RADII[Math.floor(v/(ORDERED_PAIRS.length*ROTATIONS.length))%RADII.length];
    return Object.freeze({variant:v,sectors:Object.freeze([sector("A",pair[0],rotation,radius),sector("B",pair[1],(rotation+120)%360,radius)])});
  }
  if(spec.diagramMode==="THREE_SECTORS_ORDER"){
    const cap=ORDERED_TRIPLES.length*RADII.length,v=(h+index)%cap,t=ORDERED_TRIPLES[v%ORDERED_TRIPLES.length],radius=RADII[Math.floor(v/ORDERED_TRIPLES.length)%RADII.length],rotation=ROTATIONS[Math.floor(v/RADII.length)%ROTATIONS.length];
    return Object.freeze({variant:v,sectors:Object.freeze([sector("A",t[0],rotation,radius),sector("B",t[1],(rotation+120)%360,radius),sector("C",t[2],(rotation+240)%360,radius)])});
  }
  const cap=ANGLES.length*ROTATION_PAIRS.length*RADII.length,v=(h+index)%cap,angle=ANGLES[v%ANGLES.length],rp=ROTATION_PAIRS[Math.floor(v/ANGLES.length)%ROTATION_PAIRS.length],radius=RADII[Math.floor(v/(ANGLES.length*ROTATION_PAIRS.length))%RADII.length];
  return Object.freeze({variant:v,sectors:Object.freeze([sector("A",angle,rp[0],radius),sector("B",angle,rp[1],radius)])});
}
function diagramFor(spec,v){return Object.freeze({
  kind:"same_radius_sector_comparison_diagram",
  representationVariant:"SAME_RADIUS_SECTOR_COMPARISON",
  diagramMode:spec.diagramMode,
  relation:spec.relation,
  variant:v.variant,
  sectors:v.sectors,
  sameCircleOrEqualRadiusRequired:true,
  equalRadius:true,
  comparedSectorCentralAnglesRequired:true,
  centralAnglesVisible:true,
  compareByCentralAngle:true,
  largerCentralAngleImpliesLargerArc:true,
  largerCentralAngleImpliesLargerSector:true,
  equalCentralAnglesImplyEqualSectorSize:true,
  noAreaFormulaRequired:true,
  noArcLengthFormulaRequired:true,
  rulerMeasurementRequired:false,
  printScaleIsAnswerAuthority:false
});}
function answerFor(spec,v){
  if(spec.diagramMode==="TWO_SECTORS_COMPARE")return v.sectors[0].centralAngleDeg>v.sectors[1].centralAngleDeg?"A":"B";
  if(spec.diagramMode==="THREE_SECTORS_ORDER")return [...v.sectors].sort((a,b)=>b.centralAngleDeg-a.centralAngleDeg).map(s=>s.label).join(" > ");
  return "一樣大";
}
function promptFor(spec,v){
  if(spec.diagramMode==="TWO_SECTORS_COMPARE")return `扇形 A 和 B 的半徑相同。A 的圓心角是 ${v.sectors[0].centralAngleDeg}°，B 的圓心角是 ${v.sectors[1].centralAngleDeg}°。哪一個扇形較大？\n提示：半徑相同時，比較圓心角。\n答：______`;
  if(spec.diagramMode==="THREE_SECTORS_ORDER")return `扇形 A、B、C 的半徑相同，圓心角分別是 ${v.sectors[0].centralAngleDeg}°、${v.sectors[1].centralAngleDeg}°、${v.sectors[2].centralAngleDeg}°。請由大到小排列。\n提示：半徑相同時，圓心角越大，扇形越大。\n答：______`;
  return `扇形 A 和 B 的半徑相同，而且圓心角都是 ${v.sectors[0].centralAngleDeg}°。兩個扇形的大小關係是什麼？\n提示：半徑相同且圓心角相同時，扇形一樣大。\n答：______`;
}
function signature(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.sectors.map(s=>[s.label,s.centralAngleDeg,s.rotationDeg,s.radius].join(":")).join("|"),d.diagramMode].join("|");}
function build(spec,index,seed){
  const v=variantFor(spec,index,seed),geometryDiagram=diagramFor(spec,v),promptText=promptFor(spec,v),answerText=answerFor(spec,v);
  const q={
    id:`p08f12-q012-${spec.patternSpecId}-${v.variant}`,
    generatedItemId:`p08f12-q012-${spec.patternSpecId}-${v.variant}`,
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,
    questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,
    answerValue:Object.freeze({text:answerText}),
    geometryDiagram,
    metadata:Object.freeze({
      taskId:"P08F_W8DirectProductVerticalSlice012Implementation",
      authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F12_PREFLIGHT",
      sourcePages:Object.freeze([1,2]),
      sharedRuntimeScope:G5A_U05A1_P08F12_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_property",
      sameCircleSectorComparisonOwned:true,
      centralAngleMeasurementReowned:false,
      combinedSectorUnknownAngleReowned:false,
      sectorFractionOfCircleReowned:false,
      sectorElementNamingReowned:false,
      sectorAreaArcLengthReowned:false,
      geometryConstructionReowned:false,
      applicationContextUsed:false,
      sameUnitMixedUsed:false,
      crossUnitMixedUsed:false,
      q013OrLaterTouched:false,
      humanVisualReviewRequired:true,
      rulerMeasurementRequired:false,
      printScaleIsAnswerAuthority:false
    })
  };
  return Object.freeze({...q,questionSignature:signature(q)});
}
function selected(ids){if(!Array.isArray(ids)||ids.length===0)return [...SPECS];const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)))return null;return u.map(id=>BY_SPEC.get(id));}
function diagramValid(d){
  if(!d||d.kind!=="same_radius_sector_comparison_diagram"||d.representationVariant!=="SAME_RADIUS_SECTOR_COMPARISON"||!["TWO_SECTORS_COMPARE","THREE_SECTORS_ORDER","EQUAL_ANGLE_EQUAL_SIZE"].includes(d.diagramMode)||!Number.isInteger(d.variant)||d.variant<0||!Array.isArray(d.sectors)||![2,3].includes(d.sectors.length)||d.sameCircleOrEqualRadiusRequired!==true||d.equalRadius!==true||d.comparedSectorCentralAnglesRequired!==true||d.centralAnglesVisible!==true||d.compareByCentralAngle!==true||d.largerCentralAngleImpliesLargerArc!==true||d.largerCentralAngleImpliesLargerSector!==true||d.equalCentralAnglesImplyEqualSectorSize!==true||d.noAreaFormulaRequired!==true||d.noArcLengthFormulaRequired!==true||d.rulerMeasurementRequired!==false||d.printScaleIsAnswerAuthority!==false)return false;
  if(d.sectors.length!==new Set(d.sectors.map(s=>s.label)).size)return false;
  if(!d.sectors.every(s=>LABELS.includes(s.label)&&ANGLES.includes(s.centralAngleDeg)&&ROTATIONS.includes(s.rotationDeg)&&RADII.includes(s.radius)))return false;
  if(new Set(d.sectors.map(s=>s.radius)).size!==1)return false;
  if(d.diagramMode==="TWO_SECTORS_COMPARE"&&(d.sectors.length!==2||d.sectors[0].centralAngleDeg===d.sectors[1].centralAngleDeg))return false;
  if(d.diagramMode==="THREE_SECTORS_ORDER"&&(d.sectors.length!==3||new Set(d.sectors.map(s=>s.centralAngleDeg)).size!==3))return false;
  if(d.diagramMode==="EQUAL_ANGLE_EQUAL_SIZE"&&(d.sectors.length!==2||d.sectors[0].centralAngleDeg!==d.sectors[1].centralAngleDeg||d.sectors[0].rotationDeg===d.sectors[1].rotationDeg))return false;
  return true;
}
function expectedAnswer(spec,d){return answerFor(spec,{sectors:d.sectors});}
export function validateG5AU05A1P08F12Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F12_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F12_SOURCE_INVALID");
  if(q?.knowledgePointId!==KP||q?.patternGroupId!==GROUP.patternGroupId)e.push("P08F12_KP_OR_GROUP_INVALID");
  if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F12_MODE_INVALID");
  const d=q?.geometryDiagram;if(!diagramValid(d)||d?.relation!==spec?.relation||d?.diagramMode!==spec?.diagramMode||d?.sectors?.length!==spec?.sectorCount)e.push("P08F12_DIAGRAM_INVALID");
  const expected=spec&&d?expectedAnswer(spec,d):null;if(!expected||q?.answerText!==expected||q?.answerValue?.text!==expected)e.push("P08F12_ANSWER_INVALID");
  if(spec&&d){const expectedPrompt=promptFor(spec,{sectors:d.sectors});if(q.promptText!==expectedPrompt||q.blankedDisplayText!==expectedPrompt)e.push("P08F12_PROMPT_INVALID");if(q.questionSignature!==signature(q))e.push("P08F12_SIGNATURE_INVALID");}
  const m=q?.metadata;if(m?.sameCircleSectorComparisonOwned!==true||m?.centralAngleMeasurementReowned||m?.combinedSectorUnknownAngleReowned||m?.sectorFractionOfCircleReowned||m?.sectorElementNamingReowned||m?.sectorAreaArcLengthReowned||m?.geometryConstructionReowned||m?.applicationContextUsed||m?.sameUnitMixedUsed||m?.crossUnitMixedUsed||m?.q013OrLaterTouched||m?.rulerMeasurementRequired!==false||m?.printScaleIsAnswerAuthority!==false)e.push("P08F12_SCOPE_LEAK");
  const learner=`${q?.promptText??""} ${q?.answerText??""}`;for(const term of ["扇形面積","弧長公式","量角器","用尺","作圖"])if(learner.includes(term))e.push("P08F12_FORBIDDEN_LEARNER_TERM:"+term);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG5AU05A1P08F12Answer(q,answer){
  const v=validateG5AU05A1P08F12Question(q);if(!v.ok)return v;
  let s=String(answer??"").trim().replaceAll("＞",">").replace(/\s+/g,"");
  let expected=String(q.answerText).replace(/\s+/g,"");
  if(expected==="一樣大"&&["相等","一樣","相同大小"].includes(s))s="一樣大";
  const ok=s===expected;return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F12_ANSWER_MISMATCH"])});
}
export function generateG5AU05A1P08F12Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F12_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const specs=selected(o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F12_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const seed=String(o.generationSeed??"p08f12-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
  for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
  const errors=questions.flatMap(q=>validateG5AU05A1P08F12Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F12_DUPLICATE_QUESTION_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:KP});
}
