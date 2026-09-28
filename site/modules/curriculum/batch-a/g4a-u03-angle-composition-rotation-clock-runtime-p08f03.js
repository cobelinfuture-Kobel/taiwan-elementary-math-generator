import {G4A_U03_P08F03_ANGLE_KP_ID as ANGLE,G4A_U03_P08F03_CLOCK_KP_ID as CLOCK,G4A_U03_P08F03_KP_IDS as TARGETS,G4A_U03_P08F03_PATTERN_GROUPS as GROUPS,G4A_U03_P08F03_PATTERN_SPECS as SPECS,G4A_U03_P08F03_SOURCE_ID as SRC,G4A_U03_P08F03_SPEC_IDS_BY_KP as SPEC_IDS} from "../registry/g4a-u03-angle-composition-rotation-clock-selector-projection-p08f03.js";
export const G4A_U03_P08F03_MAX_QUESTION_COUNT=240;
export const G4A_U03_P08F03_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const ROTATIONS=Object.freeze(Array.from({length:12},(_,i)=>i*30)),DIRECTIONS=Object.freeze(["CLOCKWISE","COUNTERCLOCKWISE"]);
const ANGLE_PAIRS=Object.freeze(Array.from({length:8},(_,i)=>(i+1)*10).flatMap(a=>Array.from({length:8},(_,i)=>(i+1)*10).map(b=>Object.freeze({a,b,total:a+b}))));
const TURN_FRACTIONS=Object.freeze([{n:1,d:4,text:"1/4",degrees:90,steps:3},{n:1,d:2,text:"1/2",degrees:180,steps:6},{n:3,d:4,text:"3/4",degrees:270,steps:9},{n:1,d:1,text:"1",degrees:360,steps:12}].map(Object.freeze));
const dirZh=d=>d==="CLOCKWISE"?"順時針":"逆時針";
const hourNorm=n=>((n-1)%12+12)%12+1;
function hashSeed(seed="p08f03"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=hashSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffled(values,seed){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function offset(seed,spec){return hashSeed(seed+"|"+spec.patternSpecId);}
function angleRow(spec,index,seed){
 const off=offset(seed,spec),v=(off+index)%768,pair=ANGLE_PAIRS[v%ANGLE_PAIRS.length],rotation=ROTATIONS[Math.floor(v/ANGLE_PAIRS.length)%ROTATIONS.length],knownPartIndex=v%2;
 const base={variant:v,diagramMode:spec.diagramMode,rotationDeg:rotation,partA:pair.a,partB:pair.b,totalDeg:pair.total,knownPartIndex};
 if(spec.relation==="COMPOSE_ADJACENT_NON_OVERLAPPING_ANGLES")return Object.freeze({...base,answerValue:pair.total});
 if(spec.relation==="DECOMPOSE_WHOLE_ANGLE_INTO_PARTS")return Object.freeze({...base,knownDeg:knownPartIndex===0?pair.a:pair.b,missingDeg:knownPartIndex===0?pair.b:pair.a,answerValue:knownPartIndex===0?pair.b:pair.a});
 return Object.freeze({...base,knownDeg:pair.a,missingDeg:pair.b,rayLabels:Object.freeze(["A","C","B"]),answerValue:pair.b});
}
function rotationTurnRow(spec,index,seed){
 const off=offset(seed,spec),v=(off+index)%96,startHour=v%12+1,direction=DIRECTIONS[Math.floor(v/12)%2],fraction=TURN_FRACTIONS[Math.floor(v/24)%4],sign=direction==="CLOCKWISE"?1:-1,endHour=hourNorm(startHour+sign*fraction.steps);
 return Object.freeze({variant:v,diagramMode:spec.diagramMode,startHour,endHour,direction,turnNumerator:fraction.n,turnDenominator:fraction.d,turnText:fraction.text,turnDegrees:fraction.degrees,clockSteps:fraction.steps,answerValue:fraction.degrees});
}
function clockStepRow(spec,index,seed){
 const off=offset(seed,spec),v=(off+index)%144,startHour=v%12+1,stepCount=Math.floor(v/12)%6+1,direction=DIRECTIONS[Math.floor(v/72)%2],sign=direction==="CLOCKWISE"?1:-1,endHour=hourNorm(startHour+sign*stepCount);
 return Object.freeze({variant:v,diagramMode:spec.diagramMode,startHour,endHour,direction,clockSteps:stepCount,answerValue:stepCount*30});
}
function clockHandsRow(spec,index,seed){
 const ordered=[];for(let a=1;a<=12;a++)for(let b=1;b<=12;b++)if(a!==b)ordered.push([a,b]);
 const off=offset(seed,spec),v=(off+index)%ordered.length,[hourA,hourB]=ordered[v],raw=Math.abs(hourA-hourB),steps=Math.min(raw,12-raw);
 return Object.freeze({variant:v,diagramMode:spec.diagramMode,hourA,hourB,clockSteps:steps,answerValue:steps*30});
}
function rowFor(spec,index,seed){if(spec.knowledgePointId===ANGLE)return angleRow(spec,index,seed);if(spec.relation==="ROTATION_TURN_TO_ANGLE")return rotationTurnRow(spec,index,seed);if(spec.relation==="CLOCK_FACE_STEP_TO_ANGLE")return clockStepRow(spec,index,seed);return clockHandsRow(spec,index,seed);}
function promptFor(spec,row){
 if(spec.relation==="COMPOSE_ADJACENT_NON_OVERLAPPING_ANGLES")return `圖中兩個相鄰且不重疊的角分別是 ${row.partA}° 和 ${row.partB}°。合起來的大角是多少度？\n答：______°`;
 if(spec.relation==="DECOMPOSE_WHOLE_ANGLE_INTO_PARTS")return `大角是 ${row.totalDeg}°，其中一部分是 ${row.knownDeg}°。另一部分是多少度？\n答：______°`;
 if(spec.relation==="SOLVE_MISSING_PART_FROM_WHOLE_AND_KNOWN_PART")return `∠AOB = ${row.totalDeg}°，∠AOC = ${row.knownDeg}°。求 ∠COB。\n答：______°`;
 if(spec.relation==="ROTATION_TURN_TO_ANGLE")return `從鐘面上的 ${row.startHour} 方向開始，${dirZh(row.direction)}轉 ${row.turnText} 圈。轉過的角度是多少？\n答：______°`;
 if(spec.relation==="CLOCK_FACE_STEP_TO_ANGLE")return `從鐘面上的 ${row.startHour} 沿${dirZh(row.direction)}方向轉到 ${row.endHour}。轉過的角度是多少？\n答：______°`;
 return `鐘面上兩根指針分別指向 ${row.hourA} 和 ${row.hourB}。兩針較小的夾角是多少度？\n答：______°`;
}
function diagramFor(spec,row){
 const common={kind:"angle_composition_rotation_clock_diagram",variant:row.variant,diagramMode:row.diagramMode,relation:spec.relation};
 if(spec.knowledgePointId===ANGLE)return Object.freeze({...common,rotationDeg:row.rotationDeg,partA:row.partA,partB:row.partB,totalDeg:row.totalDeg,knownPartIndex:row.knownPartIndex,knownDeg:row.knownDeg??null,missingDeg:row.missingDeg??null,rayLabels:row.rayLabels??null,adjacentNonOverlapping:true,wholeEqualsParts:true});
 if(spec.relation==="ROTATION_TURN_TO_ANGLE")return Object.freeze({...common,startHour:row.startHour,endHour:row.endHour,direction:row.direction,turnNumerator:row.turnNumerator,turnDenominator:row.turnDenominator,turnText:row.turnText,turnDegrees:row.turnDegrees,clockSteps:row.clockSteps,fullTurnDegrees:360,clockDivisionCount:12,clockDegreesPerDivision:30});
 if(spec.relation==="CLOCK_FACE_STEP_TO_ANGLE")return Object.freeze({...common,startHour:row.startHour,endHour:row.endHour,direction:row.direction,clockSteps:row.clockSteps,fullTurnDegrees:360,clockDivisionCount:12,clockDegreesPerDivision:30});
 return Object.freeze({...common,hourA:row.hourA,hourB:row.hourB,clockSteps:row.clockSteps,fullTurnDegrees:360,clockDivisionCount:12,clockDegreesPerDivision:30});
}
function signature(q){const d=q.geometryDiagram;return [q.patternSpecId,d.variant,d.diagramMode,d.rotationDeg??"",d.partA??"",d.partB??"",d.knownPartIndex??"",d.startHour??"",d.endHour??"",d.direction??"",d.turnText??"",d.hourA??"",d.hourB??""].join("|");}
function targetKp(o={}){const ids=[...new Set((o.selectedKnowledgePointIds??o.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&TARGETS.includes(ids[0])?ids[0]:null;if(TARGETS.includes(o.knowledgePointId))return o.knowledgePointId;const kps=[...new Set((o.patternSpecIds??[]).map(id=>BY_SPEC.get(id)?.knowledgePointId).filter(Boolean))];return kps.length===1?kps[0]:null;}
function selected(kp,ids){const own=SPECS.filter(x=>x.knowledgePointId===kp);if(!Array.isArray(ids)||ids.length===0)return own;const u=[...new Set(ids)];if(u.some(id=>!BY_SPEC.has(id)||BY_SPEC.get(id).knowledgePointId!==kp))return null;return u.map(id=>BY_SPEC.get(id));}
function build(spec,index,seed){
 const row=rowFor(spec,index,seed),group=GROUP_BY_KP.get(spec.knowledgePointId),promptText=promptFor(spec,row),geometryDiagram=diagramFor(spec,row),answerValue=row.answerValue,answerText=`${answerValue}°`;
 const q={id:`p08f03-q003-${spec.knowledgePointId===ANGLE?"a":"c"}-${spec.patternSpecId}-${row.variant}`,generatedItemId:`p08f03-q003-${spec.patternSpecId}-${row.variant}`,sourceId:SRC,sourceNodeId:SRC,knowledgePointId:spec.knowledgePointId,patternGroupId:group.patternGroupId,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue,geometryDiagram,metadata:Object.freeze({taskId:"P08F_W8DirectProductVerticalSlice003Implementation",authority:"R02_FULL_PAGE_REVIEWED_PLUS_P08F03_PREFLIGHT",sourcePages:Object.freeze([1,2]),sharedRuntimeScope:G4A_U03_P08F03_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_geometry_property",scaleInstrumentModifier:spec.knowledgePointId===CLOCK?"mod_scale_instrument":null,adjacentAngleCompositionOwned:spec.knowledgePointId===ANGLE,rotationClockOwned:spec.knowledgePointId===CLOCK,protractorMeasurementReowned:false,estimationClassificationReowned:false,linearFullVerticalAngleReowned:false,geometryConstructionReowned:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q004OrLaterTouched:false,humanVisualReviewRequired:true})};
 return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG4AU03P08F03Question(q){
 const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P08F03_PATTERN_SPEC_INVALID");
 if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P08F03_SOURCE_INVALID");if(!TARGETS.includes(q?.knowledgePointId)||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P08F03_KP_INVALID");
 if(q?.patternGroupId!==GROUP_BY_KP.get(q?.knowledgePointId)?.patternGroupId)e.push("P08F03_GROUP_INVALID");if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P08F03_MODE_INVALID");
 const d=q?.geometryDiagram;if(!d||d.kind!=="angle_composition_rotation_clock_diagram"||d.relation!==q?.relation||d.diagramMode!==spec?.diagramMode)e.push("P08F03_DIAGRAM_INVALID");
 else if(q.knowledgePointId===ANGLE){
  if(!Number.isInteger(d.partA)||!Number.isInteger(d.partB)||d.partA<10||d.partB<10||d.partA>80||d.partB>80||d.totalDeg!==d.partA+d.partB||d.totalDeg>=180||!ROTATIONS.includes(d.rotationDeg)||d.adjacentNonOverlapping!==true||d.wholeEqualsParts!==true)e.push("P08F03_ANGLE_MODEL_INVALID");
  const expected=spec?.relation==="COMPOSE_ADJACENT_NON_OVERLAPPING_ANGLES"?d.totalDeg:spec?.relation==="DECOMPOSE_WHOLE_ANGLE_INTO_PARTS"?(d.knownPartIndex===0?d.partB:d.partA):d.partB;if(q.answerValue!==expected||q.answerText!==`${expected}°`)e.push("P08F03_ANGLE_ANSWER_INVALID");
 }else if(q.knowledgePointId===CLOCK){
  if(d.fullTurnDegrees!==360||d.clockDivisionCount!==12||d.clockDegreesPerDivision!==30)e.push("P08F03_CLOCK_INVARIANT_INVALID");
  let expected=null;
  if(spec?.relation==="ROTATION_TURN_TO_ANGLE"){if(!DIRECTIONS.includes(d.direction)||!TURN_FRACTIONS.some(x=>x.text===d.turnText&&x.degrees===d.turnDegrees&&x.steps===d.clockSteps))e.push("P08F03_ROTATION_MODEL_INVALID");expected=d.turnDegrees;}
  else if(spec?.relation==="CLOCK_FACE_STEP_TO_ANGLE"){if(!DIRECTIONS.includes(d.direction)||!Number.isInteger(d.startHour)||!Number.isInteger(d.endHour)||d.startHour<1||d.startHour>12||d.endHour<1||d.endHour>12||!Number.isInteger(d.clockSteps)||d.clockSteps<1||d.clockSteps>6)e.push("P08F03_CLOCK_STEP_MODEL_INVALID");const sign=d.direction==="CLOCKWISE"?1:-1;if(hourNorm(d.startHour+sign*d.clockSteps)!==d.endHour)e.push("P08F03_CLOCK_STEP_ENDPOINT_INVALID");expected=d.clockSteps*30;}
  else{if(!Number.isInteger(d.hourA)||!Number.isInteger(d.hourB)||d.hourA<1||d.hourA>12||d.hourB<1||d.hourB>12||d.hourA===d.hourB)e.push("P08F03_CLOCK_HAND_MODEL_INVALID");const raw=Math.abs(d.hourA-d.hourB);expected=Math.min(raw,12-raw)*30;}
  if(q.answerValue!==expected||q.answerText!==`${expected}°`)e.push("P08F03_CLOCK_ANSWER_INVALID");
 }
 if(q?.metadata?.protractorMeasurementReowned||q?.metadata?.estimationClassificationReowned||q?.metadata?.linearFullVerticalAngleReowned||q?.metadata?.geometryConstructionReowned||q?.metadata?.sameUnitMixedUsed||q?.metadata?.crossUnitMixedUsed||q?.metadata?.q004OrLaterTouched)e.push("P08F03_SCOPE_LEAK");
 if(d&&q.questionSignature!==signature(q))e.push("P08F03_SIGNATURE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function validateG4AU03P08F03Answer(q,answer){const v=validateG4AU03P08F03Question(q);if(!v.ok)return v;const normalized=typeof answer==="string"?answer.trim().replace(/度$/,"").replace(/°$/,""):answer,ok=Number(normalized)===q.answerValue;return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F03_ANSWER_MISMATCH"])});}
export function generateG4AU03P08F03Questions(o={}){
 const kp=targetKp(o);if(!kp)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F03_KP_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F03_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
 const specs=selected(kp,o.patternSpecIds);if(!specs?.length)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P08F03_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
 const seed=String(o.generationSeed??"p08f03-public"),balanced=Array.from({length:count},(_,i)=>specs[i%specs.length]),schedule=specs.length>1?shuffled(balanced,seed+"|pattern-schedule"):balanced,seq=new Map(specs.map(s=>[s.patternSpecId,0])),questions=[];
 for(const s of schedule){const n=seq.get(s.patternSpecId);seq.set(s.patternSpecId,n+1);questions.push(build(s,n,seed));}
 const errors=questions.flatMap(q=>validateG4AU03P08F03Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P08F03_DUPLICATE_QUESTION_SIGNATURE");
 return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),maxQuestionCount:240,knowledgePointId:kp});
}
