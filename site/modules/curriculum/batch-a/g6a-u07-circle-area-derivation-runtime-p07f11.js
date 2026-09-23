import {G6A_U07_P07F11_APPLIED_MODIFIER_IDS as MODIFIERS,G6A_U07_P07F11_FORMAL_MAPPING as MAPPING,G6A_U07_P07F11_KP_ID as KP,G6A_U07_P07F11_PATTERN_GROUP as GROUP,G6A_U07_P07F11_PATTERN_SPECS as SPECS,G6A_U07_P07F11_SOURCE_ID as SRC,G6A_U07_P07F11_SPEC_IDS as SPEC_IDS} from "../registry/g6a-u07-circle-area-derivation-selector-projection-p07f11.js";
export const G6A_U07_P07F11_MAX_QUESTION_COUNT=240;
export const G6A_U07_P07F11_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x]));
const SECTOR_COUNTS=Object.freeze([8,10,12,14,16,18,20,24,28,32]);
const ROTATIONS=Object.freeze(Array.from({length:24},(_,i)=>i*15));
const FORBIDDEN_TERMS=Object.freeze(["圓環面積","扇形面積","牛吃草","複合圓形面積","折扣","百分率"]);
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function normalizeSymbol(value){return String(value??"").trim().toLowerCase().replaceAll(" ","").replaceAll("×","").replaceAll("*","").replaceAll("pi","π").replaceAll("r^2","r²").replaceAll("r2","r²");}
function diagramFor(spec,variant){
  const sectorCount=SECTOR_COUNTS[variant%SECTOR_COUNTS.length],rotationDeg=ROTATIONS[Math.floor(variant/SECTOR_COUNTS.length)%ROTATIONS.length];
  const coarseSectorCount=6+(variant%10)*2,fineSectorCount=coarseSectorCount+12+(Math.floor(variant/10)%4)*2;
  const fineOnLeft=((Math.floor(variant/5)+Math.floor(variant/10))%2)===0;
  const lengthLabel=spec.targetKind==="HALF_CIRCUMFERENCE_LENGTH"?"?":"πr";
  const widthLabel=spec.targetKind==="RADIUS_WIDTH"?"?":"r";
  return Object.freeze({
    kind:"circle_area_derivation_diagram",diagramMode:spec.targetKind==="FINER_SECTOR_APPROXIMATION"?"APPROXIMATION_COMPARE":"SINGLE_REARRANGEMENT",
    semanticCore:"CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE",targetKind:spec.targetKind,variant,sectorCount,rotationDeg,
    coarseSectorCount,fineSectorCount,fineOnLeft,lengthLabel,widthLabel,radiusLabel:"r",areaLabel:spec.targetKind==="PI_R_SQUARED_CONCLUSION"?"?":null,
    cutIntoEqualSectors:true,alternatingRearrangement:true,areaConserved:true,halfCircumferenceBecomesLength:true,radiusBecomesWidth:true,finerSectorsApproachRectangle:true
  });
}
function expectedFor(spec,d){
  if(spec.targetKind==="HALF_CIRCUMFERENCE_LENGTH")return Object.freeze({answer:"πr",answerText:"πr"});
  if(spec.targetKind==="RADIUS_WIDTH")return Object.freeze({answer:"r",answerText:"r"});
  if(spec.targetKind==="AREA_CONSERVATION")return Object.freeze({answer:"不變",answerText:"不變（剪拼前後面積相同）"});
  if(spec.targetKind==="FINER_SECTOR_APPROXIMATION"){
    const choice=d.fineOnLeft?"A":"B";
    return Object.freeze({answer:choice,answerText:choice+"（"+d.fineSectorCount+" 等分）"});
  }
  return Object.freeze({answer:"πr²",answerText:"πr²"});
}
function promptFor(spec,d){
  if(spec.targetKind==="HALF_CIRCUMFERENCE_LENGTH")return "把圓等分成 "+d.sectorCount+" 個扇形後交錯重組。重組圖形的長邊來自原圓周長的一半，用 π 和 r 表示長邊是多少？";
  if(spec.targetKind==="RADIUS_WIDTH")return "把圓切成扇形並交錯重組後，近似長方形的短邊對應原圓的哪個長度？請用 r 表示。";
  if(spec.targetKind==="AREA_CONSERVATION")return "把同一個圓切成扇形再重新排列，剪拼前後的面積是否改變？";
  if(spec.targetKind==="FINER_SECTOR_APPROXIMATION")return "圖 A、B 是同一個圓用不同等分數剪拼。哪一個重組圖形更接近長方形？請答 A 或 B。";
  return "重組圖形的長為 πr、寬為 r。利用剪拼前後面積不變，原圓的面積可寫成什麼？";
}
function payload(spec,variant){
  const u=mod(variant,240),geometryDiagram=diagramFor(spec,u),expected=expectedFor(spec,geometryDiagram),promptText=promptFor(spec,geometryDiagram);
  return Object.freeze({variant:u,targetKind:spec.targetKind,semanticCore:"CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE",sectorCount:geometryDiagram.sectorCount,rotationDeg:geometryDiagram.rotationDeg,
    areaConserved:true,halfCircumferenceLengthSymbol:"πr",radiusWidthSymbol:"r",formulaConclusion:"πr²",finerSectorsApproachRectangle:true,expectedAnswer:expected.answer,expectedAnswerText:expected.answerText,geometryDiagram,promptText});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.geometryDiagram),JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6AU07P07F11Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;const p=payload(spec,o.variant??0);
  const q={id:"p07f11-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f11-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),
    sourceId:SRC,sourceNodeId:SRC,knowledgePointId:KP,patternGroupId:GROUP.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"diagram",mode:"diagram",
    promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.expectedAnswerText,answerText:p.expectedAnswerText,answerValue:p.expectedAnswer,
    geometryDiagram:p.geometryDiagram,patternRepresentation:p,formalMappingId:MAPPING.mappingId,generationSeed:o.generationSeed??"p07f11-public",
    metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice011Implementation",authority:MAPPING.semanticAuthority,originalPdfDirectDerivationSupport:false,
      supplementaryEvidenceAuthorityType:MAPPING.supplementaryEvidenceAuthorityType,supplementaryEvidenceDriveFolderId:MAPPING.supplementaryEvidenceDriveFolderId,
      supplementaryEvidenceDriveFileIds:MAPPING.supplementaryEvidenceDriveFileIds,sharedRuntimeScope:G6A_U07_P07F11_SHARED_RUNTIME_SCOPE,
      frozenRuntimeProfile:"profile_geometry_formula",classificationRuleId:"rule_geometry_formula",appliedRuntimeModifierIds:MODIFIERS,geometryFormulaEvaluationBound:true,geometryDomainValidatorBound:true,geometryDiagramRepresentationBound:true,
      areaConservationPrerequisiteRequired:true,circleCircumferenceFormulaPrerequisiteRequired:true,circleAreaDerivationOwned:true,sectorRearrangementOwned:true,
      circleAreaFormulaProductionReowned:false,sectorAreaReowned:false,annulusAreaReowned:false,compositeCircleAreaReowned:false,applicationContextUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q012OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6AU07P07F11Answer(q,submitted){
  const p=q?.patternRepresentation,e=[];if(!p)return Object.freeze({ok:false,errors:Object.freeze(["P07F11_REPRESENTATION_MISSING"]),normalizedAnswer:null});
  const raw=String(submitted??"").trim(),n=normalizeSymbol(raw),expected=String(p.expectedAnswer);
  let ok=false;
  if(p.targetKind==="HALF_CIRCUMFERENCE_LENGTH")ok=["πr","rπ"].includes(n);
  else if(p.targetKind==="RADIUS_WIDTH")ok=n==="r";
  else if(p.targetKind==="AREA_CONSERVATION"){const compact=raw.replaceAll(" ","");ok=compact.startsWith("不變")||["相同","面積不變","剪拼前後面積相同"].includes(compact);}
  else if(p.targetKind==="FINER_SECTOR_APPROXIMATION")ok=raw.toUpperCase().startsWith(expected);
  else ok=["πr²","r²π"].includes(n);
  if(!ok)e.push("P07F11_ANSWER_MISMATCH");return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:ok?expected:raw});
}
export function validateG6AU07P07F11Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId);if(!spec)e.push("P07F11_PATTERN_SPEC_INVALID");if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F11_SOURCE_INVALID");if(q?.knowledgePointId!==KP||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F11_KP_INVALID");if(q?.questionMode!=="diagram"||q?.mode!=="diagram")e.push("P07F11_MODE_INVALID");
  const p=q?.patternRepresentation,d=q?.geometryDiagram;if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F11_REPRESENTATION_INVALID");
  if(!d||d.kind!=="circle_area_derivation_diagram"||d.semanticCore!=="CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE"||d.targetKind!==spec?.targetKind||!d.cutIntoEqualSectors||!d.alternatingRearrangement||!d.areaConserved||!d.halfCircumferenceBecomesLength||!d.radiusBecomesWidth||!d.finerSectorsApproachRectangle)e.push("P07F11_DIAGRAM_INVALID");
  if(spec&&p){const expected=payload(spec,p.variant);if(JSON.stringify(p)!==JSON.stringify(expected)||JSON.stringify(d)!==JSON.stringify(expected.geometryDiagram))e.push("P07F11_PAYLOAD_INVALID");if(q.promptText!==expected.promptText||q.answerText!==expected.expectedAnswerText||String(q.answerValue)!==String(expected.expectedAnswer)||q.questionSignature!==signature(q))e.push("P07F11_PROMPT_ANSWER_SIGNATURE_INVALID");if(!p.areaConserved||p.halfCircumferenceLengthSymbol!=="πr"||p.radiusWidthSymbol!=="r"||p.formulaConclusion!=="πr²"||!p.finerSectorsApproachRectangle)e.push("P07F11_DERIVATION_INVARIANT_INVALID");if(!validateG6AU07P07F11Answer(q,q.answerText).ok)e.push("P07F11_SELF_ANSWER_INVALID");}
  const m=q?.metadata??{};if(m.originalPdfDirectDerivationSupport!==false||m.supplementaryEvidenceAuthorityType!=="OPERATOR_PROVIDED_SUPPLEMENTARY_VISUAL_EVIDENCE"||(m.supplementaryEvidenceDriveFileIds??[]).length!==3||m.frozenRuntimeProfile!=="profile_geometry_formula"||m.classificationRuleId!=="rule_geometry_formula"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.geometryFormulaEvaluationBound||!m.geometryDomainValidatorBound||!m.geometryDiagramRepresentationBound||!m.areaConservationPrerequisiteRequired||!m.circleCircumferenceFormulaPrerequisiteRequired||!m.circleAreaDerivationOwned||!m.sectorRearrangementOwned||m.circleAreaFormulaProductionReowned||m.sectorAreaReowned||m.annulusAreaReowned||m.compositeCircleAreaReowned||m.applicationContextUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q012OrLaterTouched||m.r04Reclassified)e.push("P07F11_SCOPE_INVALID");
  const learner=(q?.promptText??"")+" "+(q?.answerText??"");for(const term of FORBIDDEN_TERMS)if(learner.includes(term))e.push("P07F11_FORBIDDEN_LEARNER_TERM:"+term);return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6AU07P07F11Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F11_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0],requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(Boolean):SPECS;
  if(kp!==undefined&&kp!==KP)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F11_SELECTION_INVALID"]),warnings:Object.freeze([])});if(!specs.length||requested.some(id=>!BY_SPEC.has(id)))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F11_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f11-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*53)%240;questions.push(buildG6AU07P07F11Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6AU07P07F11Question(q).errors);if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F11_DUPLICATE_SIGNATURE");return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
