import {G5A_U10A1_P05F38_FORMAL_MAPPING,G5A_U10A1_P05F38_KP_ID,G5A_U10A1_P05F38_PATTERN_GROUP_ID,G5A_U10A1_P05F38_PATTERN_SPECS,G5A_U10A1_P05F38_SOURCE_ID,G5A_U10A1_P05F38_SPEC_IDS} from "../registry/g5a-u10a1-cube-cuboid-spatial-reasoning-selector-projection-p05f38.js";
export const G5A_U10A1_P05F38_MAX_QUESTION_COUNT=240;
export const G5A_U10A1_P05F38_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const SPEC_BY_ID=new Map(G5A_U10A1_P05F38_PATTERN_SPECS.map(row=>[row.patternSpecId,row]));
const PROFILES=Object.freeze([0,1,2,3,4,5,6,7,8,9]),SCALES=Object.freeze([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]),SHIFTS=Object.freeze([-12,0,12]);
const COLORS=Object.freeze(["紅色","藍色","綠色","黃色","紫色","橘色","白色","黑色"]);
const CUT_CLASSES=Object.freeze([
  Object.freeze({id:"CORNER",label:"原大正方體的一個頂點",outerFaces:3}),
  Object.freeze({id:"EDGE_NOT_VERTEX",label:"原大正方體的一條稜上，但不在頂點",outerFaces:2}),
  Object.freeze({id:"FACE_INTERIOR",label:"原大正方體的一個面內部，但不在任何稜上",outerFaces:1})
]);
function hashSeed(seed="p05f38"){let h=2166136261;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function variantIndex(sequenceIndex,specIndex,seed){return(hashSeed(seed)+specIndex*79+sequenceIndex)%240;}
function baseDiagram(v){return{kind:"cube_cuboid_elements_diagram",profileIndex:PROFILES[v%PROFILES.length],scale:SCALES[Math.floor(v/10)%SCALES.length],shiftX:SHIFTS[Math.floor(v/80)%SHIFTS.length],diagramMode:"DISTINGUISH_CUBE_CUBOID",solidType:"CUBE",targetElement:"FACE",highlightIndex:v%8,faceCount:6,edgeCount:12,vertexCount:8,allEdgesEqual:true,allFacesSquares:true};}
function rotateColors(v){const offset=v%COLORS.length;return Array.from({length:5},(_,i)=>COLORS[(offset+i)%COLORS.length]);}
function diagramFor(spec,v){
  const base=baseDiagram(v);
  if(spec.diagramMode==="MISSING_FACE_CONDITION"){
    const visibleFaceValue=1+(v%6),hiddenOppositeValue=7-visibleFaceValue;
    return Object.freeze({...base,q038DiagramMode:spec.diagramMode,variant:v,condition:Object.freeze({conditionType:"OPPOSITE_PAIR_SUM_7",visibleFaceValue,hiddenOppositeValue,oppositePairSum:7}),fixedAdjacencyPreserved:true});
  }
  if(spec.diagramMode==="MULTIVIEW_FACE_COLOR_CONDITION"){
    const [top,a,b,c,e]=rotateColors(v);
    return Object.freeze({...base,q038DiagramMode:spec.diagramMode,variant:v,condition:Object.freeze({conditionType:"TWO_VIEWS_SHARED_TOP_ROTATION",views:Object.freeze([Object.freeze({top,front:a,right:b}),Object.freeze({top,front:b,right:c})]),targetFaceColor:a,oppositeFaceColor:c,unusedSideWitnessColor:e}),fixedAdjacencyPreserved:true});
  }
  const divisionCount=3+(v%5),location=CUT_CLASSES[Math.floor(v/5)%CUT_CLASSES.length];
  return Object.freeze({...base,q038DiagramMode:spec.diagramMode,variant:v,condition:Object.freeze({conditionType:"AXIS_ALIGNED_EQUAL_CUTS",divisionCount,targetLocationClass:location.id,targetLocationLabel:location.label,outerFaceCount:location.outerFaces}),fixedAdjacencyPreserved:true});
}
function promptFor(spec,d){
  const c=d.condition;
  if(spec.diagramMode==="MISSING_FACE_CONDITION")return `骰子的相對兩面點數和為 7。若某一面是 ${c.visibleFaceValue} 點，與它相對的隱藏面應是幾點？`;
  if(spec.diagramMode==="MULTIVIEW_FACE_COLOR_CONDITION"){const [v1,v2]=c.views;return `同一個正方體從兩個方向觀察：視圖一上面是${v1.top}、前面是${v1.front}、右面是${v1.right}；視圖二上面是${v2.top}、前面是${v2.front}、右面是${v2.right}。由這些條件判斷，${c.targetFaceColor}面的相對面是什麼顏色？`;}
  return `把正方體沿長、寬、高三個方向各切成 ${c.divisionCount} 等分。某個小正方體位於${c.targetLocationLabel}。它有幾個面仍在原大正方體的外表面上？`;
}
function answerFor(spec,d){const c=d.condition;if(spec.diagramMode==="MISSING_FACE_CONDITION")return `${c.hiddenOppositeValue} 點`;if(spec.diagramMode==="MULTIVIEW_FACE_COLOR_CONDITION")return c.oppositeFaceColor;return `${c.outerFaceCount} 個面`;}
function answerValueFor(spec,d){const c=d.condition;if(spec.diagramMode==="MISSING_FACE_CONDITION")return c.hiddenOppositeValue;if(spec.diagramMode==="MULTIVIEW_FACE_COLOR_CONDITION")return c.oppositeFaceColor;return c.outerFaceCount;}
function signatureFor(q){const d=q.geometryDiagram;return[q.patternSpecId,d.variant,d.q038DiagramMode,JSON.stringify(d.condition),q.answerText].join("|");}
function selectedSpecs(ids){if(!Array.isArray(ids)||ids.length===0)return[...G5A_U10A1_P05F38_PATTERN_SPECS];const unique=[...new Set(ids)];if(unique.some(id=>!SPEC_BY_ID.has(id)))return null;return unique.map(id=>SPEC_BY_ID.get(id));}
function questionFor(spec,sequenceIndex,seed){const specIndex=G5A_U10A1_P05F38_SPEC_IDS.indexOf(spec.patternSpecId),v=variantIndex(sequenceIndex,specIndex,seed),geometryDiagram=diagramFor(spec,v),promptText=promptFor(spec,geometryDiagram),answerText=answerFor(spec,geometryDiagram);const question={id:`p05f38-q038-${specIndex+1}-${v+1}`,generatedItemId:`p05f38-q038-${specIndex+1}-${v+1}`,sourceId:G5A_U10A1_P05F38_SOURCE_ID,sourceNodeId:G5A_U10A1_P05F38_SOURCE_ID,knowledgePointId:G5A_U10A1_P05F38_KP_ID,patternGroupId:G5A_U10A1_P05F38_PATTERN_GROUP_ID,patternSpecId:spec.patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",promptText,prompt:promptText,blankedDisplayText:promptText,displayText:`${promptText} ${answerText}`,answerText,answerValue:answerValueFor(spec,geometryDiagram),geometryDiagram,metadata:Object.freeze({taskId:"P05F_W5DirectProductVerticalSlice038Implementation",authority:"Q038_R02_PLUS_Q029_EXACT_PDF_VISUAL_REUSE",sourcePages:Object.freeze([1,2]),sourcePdfDriveFileId:"1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5",sharedRuntimeScope:G5A_U10A1_P05F38_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_spatial_solid",fixedAdjacencyPreserved:true,geometryPropertyReasoningDependencySatisfied:true,missingFaceConditionTarget:spec.diagramMode==="MISSING_FACE_CONDITION",faceColorConditionTarget:spec.diagramMode==="MULTIVIEW_FACE_COLOR_CONDITION",cuttingConditionTarget:spec.diagramMode==="CUT_POSITION_RELATION",q008ElementIdentityReowned:false,q018EdgeLengthReowned:false,q018FaceRelationshipReowned:false,q029NetSemanticsReowned:false,surfaceAreaArithmeticUsed:false,volumeArithmeticUsed:false,genericViewpointTargetUsed:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q039OrLaterTouched:false})};return Object.freeze({...question,questionSignature:signatureFor(question)});}
function expectedDiagram(spec,d){if(!Number.isInteger(d?.variant)||d.variant<0||d.variant>=240)return null;return diagramFor(spec,d.variant);}
export function validateG5AU10A1P05F38Question(question){
  const errors=[],spec=SPEC_BY_ID.get(question?.patternSpecId);
  if(!spec)errors.push("P05F38_PATTERN_SPEC_INVALID");
  if(question?.sourceId!==G5A_U10A1_P05F38_SOURCE_ID||question?.sourceNodeId!==G5A_U10A1_P05F38_SOURCE_ID)errors.push("P05F38_SOURCE_INVALID");
  if(question?.knowledgePointId!==G5A_U10A1_P05F38_KP_ID||question?.patternGroupId!==G5A_U10A1_P05F38_PATTERN_GROUP_ID)errors.push("P05F38_KP_OR_GROUP_INVALID");
  if(question?.questionMode!=="diagram"||question?.mode!=="diagram")errors.push("P05F38_MODE_INVALID");
  const d=question?.geometryDiagram;
  if(!d||d.kind!=="cube_cuboid_elements_diagram"||d.diagramMode!=="DISTINGUISH_CUBE_CUBOID"||d.solidType!=="CUBE"||d.targetElement!=="FACE"||d.faceCount!==6||d.edgeCount!==12||d.vertexCount!==8||d.allEdgesEqual!==true||d.allFacesSquares!==true||d.fixedAdjacencyPreserved!==true||d.q038DiagramMode!==spec?.diagramMode)errors.push("P05F38_GEOMETRY_INVALID");
  if(spec&&d){const expected=expectedDiagram(spec,d);if(!expected||JSON.stringify(d)!==JSON.stringify(expected))errors.push("P05F38_DIAGRAM_CONTRACT_INVALID");if(question?.relation!==spec.relation)errors.push("P05F38_RELATION_INVALID");if(question?.promptText!==promptFor(spec,d))errors.push("P05F38_PROMPT_INVALID");if(question?.answerText!==answerFor(spec,d)||question?.answerValue!==answerValueFor(spec,d))errors.push("P05F38_ANSWER_INVALID");if(question?.questionSignature!==signatureFor(question))errors.push("P05F38_SIGNATURE_INVALID");}
  const text=`${question?.promptText??""} ${question?.answerText??""}`;for(const term of ["展開圖","表面積","體積","應用題"])if(text.includes(term))errors.push(`P05F38_FORBIDDEN_TERM:${term}`);
  const m=question?.metadata;
  if(m?.frozenRuntimeProfile!=="profile_spatial_solid"||m?.fixedAdjacencyPreserved!==true||m?.geometryPropertyReasoningDependencySatisfied!==true||m?.q008ElementIdentityReowned!==false||m?.q018EdgeLengthReowned!==false||m?.q018FaceRelationshipReowned!==false||m?.q029NetSemanticsReowned!==false||m?.surfaceAreaArithmeticUsed!==false||m?.volumeArithmeticUsed!==false||m?.genericViewpointTargetUsed!==false||m?.applicationContextUsed!==false||m?.sameUnitMixedUsed!==false||m?.crossUnitMixedUsed!==false||m?.q039OrLaterTouched!==false)errors.push("P05F38_PROVENANCE_INVALID");
  if(!G5A_U10A1_P05F38_FORMAL_MAPPING.includedRelations.includes(question?.relation))errors.push("P05F38_RELATION_OUT_OF_SCOPE");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
export function generateG5AU10A1P05F38Questions(options={}){
  const count=Number.isInteger(options.questionCount)?options.questionCount:Number.isInteger(options.count)?options.count:20;
  if(count<1||count>G5A_U10A1_P05F38_MAX_QUESTION_COUNT)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F38_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  if(options.knowledgePointId&&options.knowledgePointId!==G5A_U10A1_P05F38_KP_ID)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F38_KP_INVALID"]),warnings:Object.freeze([])});
  const specs=selectedSpecs(options.patternSpecIds);if(!specs||specs.length===0)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P05F38_PATTERN_SPEC_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const perSpec=new Map(specs.map(spec=>[spec.patternSpecId,0])),questions=[];
  for(let index=0;index<count;index++){const spec=specs[index%specs.length],sequenceIndex=perSpec.get(spec.patternSpecId);perSpec.set(spec.patternSpecId,sequenceIndex+1);questions.push(questionFor(spec,sequenceIndex,options.generationSeed??"p05f38-public"));}
  const errors=questions.flatMap(q=>validateG5AU10A1P05F38Question(q).errors),signatures=questions.map(q=>q.questionSignature);if(new Set(signatures).size!==signatures.length)errors.push("P05F38_DUPLICATE_QUESTION_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(spec=>Object.freeze({patternSpecId:spec.patternSpecId,count:perSpec.get(spec.patternSpecId)}))),maxQuestionCount:G5A_U10A1_P05F38_MAX_QUESTION_COUNT});
}
