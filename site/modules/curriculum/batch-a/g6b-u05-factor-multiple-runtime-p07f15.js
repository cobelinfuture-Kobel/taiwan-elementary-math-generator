import {G6B_U05_P07F15_APPLIED_MODIFIER_IDS as MODIFIERS,G6B_U05_P07F15_DIFFERENCE_KP_ID as D,G6B_U05_P07F15_FORMAL_MAPPINGS as MAPPINGS,G6B_U05_P07F15_PATTERN_GROUPS as GROUPS,G6B_U05_P07F15_PATTERN_SPECS as SPECS,G6B_U05_P07F15_SOURCE_ID as SRC,G6B_U05_P07F15_SPEC_IDS as SPEC_IDS,G6B_U05_P07F15_SUM_KP_ID as S,G6B_U05_P07F15_TARGET_KP_IDS as TARGETS} from "../registry/g6b-u05-factor-multiple-selector-projection-p07f15.js";
export const G6B_U05_P07F15_MAX_QUESTION_COUNT=240;
export const G6B_U05_P07F15_SHARED_RUNTIME_SCOPE="SHARED_RUNTIME_BOUNDED";
const BY_SPEC=new Map(SPECS.map(x=>[x.patternSpecId,x])),GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x])),MAP_BY_KP=new Map(MAPPINGS.map(x=>[x.knowledgePointId,x]));
const mod=(n,m)=>((n%m)+m)%m;
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function payload(spec,v){
  const u=mod(v,240),isSum=spec.knowledgePointId===S;
  const exactSupplementary=isSum&&u===0;
  const multiplier=exactSupplementary?5:2+(u%8);
  const onePart=exactSupplementary?80:10+Math.floor(u/8);
  const smaller=onePart,larger=multiplier*onePart;
  const difference=larger-smaller,sum=larger+smaller,differenceParts=multiplier-1,totalParts=multiplier+1;
  const relationQuantity=isSum?sum:difference,relationParts=isSum?totalParts:differenceParts;
  const answer=spec.targetKind==="FIND_SMALLER"?smaller:larger;
  const promptText=isSum
    ?"甲數是乙數的 "+multiplier+" 倍，甲、乙兩數的和是 "+sum+"。"+(spec.targetKind==="FIND_SMALLER"?"乙數":"甲數")+"是多少？"
    :"甲數是乙數的 "+multiplier+" 倍，甲數比乙數多 "+difference+"。"+(spec.targetKind==="FIND_SMALLER"?"乙數":"甲數")+"是多少？";
  return Object.freeze({variant:u,semanticCore:spec.semanticCore,targetKind:spec.targetKind,multiplier,onePart,smaller,larger,difference,sum,differenceParts,totalParts,relationQuantity,relationParts,exactPartition:relationQuantity%relationParts===0,reconstructedOnePart:relationQuantity/relationParts,reconstructedSmaller:relationQuantity/relationParts,reconstructedLarger:multiplier*(relationQuantity/relationParts),answer,answerText:String(answer),sourceParameterCarrier:exactSupplementary?"SUPPLEMENTARY_EXAM_PAGE1_ITEM5_EXACT":"CONTROLLED_RELATION_VARIANT",promptText});
}
const signature=q=>[q.patternSpecId,q.promptText,q.answerText,JSON.stringify(q.patternRepresentation)].join("|");
export function buildG6BU05P07F15Question(o={}){
  const patternSpecId=o.patternSpecId??SPEC_IDS[0],spec=BY_SPEC.get(patternSpecId);if(!spec)return null;
  const p=payload(spec,o.variant??0),g=GROUP_BY_KP.get(spec.knowledgePointId),m=MAP_BY_KP.get(spec.knowledgePointId);
  const q={id:"p07f15-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),generatedItemId:"p07f15-"+(SPEC_IDS.indexOf(patternSpecId)+1)+"-"+(p.variant+1),sourceId:SRC,sourceNodeId:SRC,knowledgePointId:spec.knowledgePointId,patternGroupId:g.patternGroupId,patternSpecId,relation:spec.relation,questionMode:"numeric",mode:"numeric",promptText:p.promptText,prompt:p.promptText,blankedDisplayText:p.promptText,displayText:p.promptText+" "+p.answerText,answerText:p.answerText,answerValue:p.answer,patternRepresentation:p,formalMappingId:m.mappingId,generationSeed:o.generationSeed??"p07f15-public",metadata:Object.freeze({taskId:"P07F_W7DirectProductVerticalSlice015Implementation",authority:m.authority,sharedRuntimeScope:G6B_U05_P07F15_SHARED_RUNTIME_SCOPE,frozenRuntimeProfile:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",appliedRuntimeModifierIds:MODIFIERS,factorMultipleReasoningBound:true,factorMultipleValidatorBound:true,textNumericRepresentationBound:true,differenceMultipleOwned:spec.knowledgePointId===D,sumMultipleOwned:spec.knowledgePointId===S,exactPartitionValidated:true,reconstructBothQuantitiesValidated:true,multiplierAtLeastTwoValidated:true,originalSourceDirectSupport:m.originalSourceDirectSupport,supplementaryEvidenceUsed:m.supplementaryEvidenceUsed,sumDifferenceProblemReowned:false,ageOrRepeatedRelationReowned:false,workOrDistributionStrategyReowned:false,affineMultipleOffsetUsed:false,combinatoricsUsed:false,routeCountingUsed:false,genericApplicationOverlayUsed:false,sameUnitMixedUsed:false,crossUnitMixedUsed:false,q016OrLaterTouched:false,r04Reclassified:false})};
  return Object.freeze({...q,questionSignature:signature(q)});
}
export function validateG6BU05P07F15Answer(q,submitted){
  const n=typeof submitted==="number"?submitted:Number(String(submitted).trim()),e=[];
  if(!Number.isInteger(n)||n<=0)e.push("P07F15_ANSWER_NOT_POSITIVE_INTEGER");
  else if(n!==q?.answerValue)e.push("P07F15_ANSWER_MISMATCH");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),normalizedAnswer:Number.isInteger(n)&&n>0?n:null});
}
export function validateG6BU05P07F15Question(q){
  const e=[],spec=BY_SPEC.get(q?.patternSpecId),p=q?.patternRepresentation;
  if(!spec)e.push("P07F15_PATTERN_SPEC_INVALID");
  if(q?.sourceId!==SRC||q?.sourceNodeId!==SRC)e.push("P07F15_SOURCE_INVALID");
  if(!TARGETS.includes(q?.knowledgePointId)||q?.knowledgePointId!==spec?.knowledgePointId)e.push("P07F15_KP_INVALID");
  if(q?.questionMode!=="numeric"||q?.mode!=="numeric")e.push("P07F15_MODE_INVALID");
  if(!p||!Number.isInteger(p.variant)||p.variant<0||p.variant>=240)e.push("P07F15_REPRESENTATION_INVALID");
  if(spec&&p){
    const expected=payload(spec,p.variant);
    if(JSON.stringify(p)!==JSON.stringify(expected))e.push("P07F15_PAYLOAD_INVALID");
    if(q.promptText!==expected.promptText||q.answerText!==expected.answerText||q.answerValue!==expected.answer||q.questionSignature!==signature(q))e.push("P07F15_PROMPT_ANSWER_SIGNATURE_INVALID");
    if(!Number.isInteger(p.multiplier)||p.multiplier<2||!Number.isInteger(p.onePart)||p.onePart<=0||p.smaller!==p.onePart||p.larger!==p.multiplier*p.onePart||p.difference!==p.larger-p.smaller||p.sum!==p.larger+p.smaller)e.push("P07F15_RELATION_MODEL_INVALID");
    if(spec.knowledgePointId===D&&(p.relationQuantity!==p.difference||p.relationParts!==p.multiplier-1||p.differenceParts!==p.multiplier-1||p.semanticCore!=="DIFFERENCE_MULTIPLE_RELATION_MODEL"))e.push("P07F15_DIFFERENCE_MODEL_INVALID");
    if(spec.knowledgePointId===S&&(p.relationQuantity!==p.sum||p.relationParts!==p.multiplier+1||p.totalParts!==p.multiplier+1||p.semanticCore!=="SUM_MULTIPLE_RELATION_MODEL"))e.push("P07F15_SUM_MODEL_INVALID");
    if(!p.exactPartition||p.reconstructedOnePart!==p.onePart||p.reconstructedSmaller!==p.smaller||p.reconstructedLarger!==p.larger)e.push("P07F15_RECONSTRUCTION_INVALID");
    if(spec.targetKind==="FIND_SMALLER"&&p.answer!==p.smaller)e.push("P07F15_SMALLER_TARGET_INVALID");
    if(spec.targetKind==="FIND_LARGER"&&p.answer!==p.larger)e.push("P07F15_LARGER_TARGET_INVALID");
    if(!validateG6BU05P07F15Answer(q,q.answerValue).ok)e.push("P07F15_SELF_ANSWER_INVALID");
  }
  const m=q?.metadata??{};
  if(m.frozenRuntimeProfile!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||(m.appliedRuntimeModifierIds??[]).length!==0||!m.factorMultipleReasoningBound||!m.factorMultipleValidatorBound||!m.textNumericRepresentationBound||!m.exactPartitionValidated||!m.reconstructBothQuantitiesValidated||!m.multiplierAtLeastTwoValidated||m.sumDifferenceProblemReowned||m.ageOrRepeatedRelationReowned||m.workOrDistributionStrategyReowned||m.affineMultipleOffsetUsed||m.combinatoricsUsed||m.routeCountingUsed||m.genericApplicationOverlayUsed||m.sameUnitMixedUsed||m.crossUnitMixedUsed||m.q016OrLaterTouched||m.r04Reclassified)e.push("P07F15_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
export function generateG6BU05P07F15Questions(o={}){
  const count=Number.isInteger(o.questionCount)?o.questionCount:Number.isInteger(o.count)?o.count:20;
  if(count<1||count>240)return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F15_QUESTION_COUNT_OUT_OF_RANGE"]),warnings:Object.freeze([])});
  const kp=o.knowledgePointId??o.selectedKnowledgePointIds?.[0];
  if(!TARGETS.includes(kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F15_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const own=SPECS.filter(x=>x.knowledgePointId===kp),requested=[...new Set((o.patternSpecIds??[]).filter(Boolean))],specs=requested.length?requested.map(id=>BY_SPEC.get(id)).filter(x=>x?.knowledgePointId===kp):own;
  if(!specs.length||requested.some(id=>!BY_SPEC.has(id)||BY_SPEC.get(id).knowledgePointId!==kp))return Object.freeze({ok:false,questions:Object.freeze([]),errors:Object.freeze(["P07F15_SELECTION_INVALID"]),warnings:Object.freeze([])});
  const per=new Map(specs.map(x=>[x.patternSpecId,0])),questions=[];
  for(let i=0;i<count;i++){const spec=specs[i%specs.length],n=per.get(spec.patternSpecId);per.set(spec.patternSpecId,n+1);const v=(hash(o.generationSeed??"p07f15-public")+n+SPEC_IDS.indexOf(spec.patternSpecId)*89)%240;questions.push(buildG6BU05P07F15Question({variant:v,patternSpecId:spec.patternSpecId,generationSeed:o.generationSeed}));}
  const errors=questions.flatMap(q=>validateG6BU05P07F15Question(q).errors);
  if(new Set(questions.map(q=>q.questionSignature)).size!==questions.length)errors.push("P07F15_DUPLICATE_SIGNATURE");
  return Object.freeze({ok:errors.length===0,questions:Object.freeze(questions),errors:Object.freeze(errors),warnings:Object.freeze([]),allocation:Object.freeze(specs.map(s=>Object.freeze({patternSpecId:s.patternSpecId,count:per.get(s.patternSpecId)}))),maxQuestionCount:240});
}
