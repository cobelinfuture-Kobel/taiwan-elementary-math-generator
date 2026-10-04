import { validateIntegerNumberLineModel } from "../../renderer/fraction-number-line.js";

export const G3A_U01_VISUAL_RANK02_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK02_KP_ID = "kp_g3a_u01_integer_number_line_scale_location";
export const G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID = "pg_g3a_u01_visual_integer_number_line_read_value";
export const G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID = "ps_g3a_u01_visual_integer_number_line_read_value";
export const G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT = 240;
export const G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS = Object.freeze([
  "READ_SYMBOL_MARKER_VALUE",
  "READ_ORDERED_MARKER_VALUE",
]);

const STEPS = Object.freeze([1,2,5,10,20,25,50,100,200,500]);

function mod(n,m){ return ((n%m)+m)%m; }
function hash(value){
  let h=2166136261;
  for(const c of String(value??"")){
    h^=c.codePointAt(0);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}

function parameters(variant){
  const u=mod(variant,G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT);
  const stepIndex=u%STEPS.length;
  const step=STEPS[stepIndex];
  const tickBand=Math.floor(u/STEPS.length)%6;
  const tickCount=7+tickBand;
  const offsetBand=Math.floor(u/60);
  const last=tickCount-1;
  const targetTickIndex=2+mod(stepIndex+tickBand+offsetBand,tickCount-3);
  const maxStart=10000-last*step;
  const unitCapacity=Math.max(0,Math.floor(maxStart/step));
  const startUnits=mod(stepIndex*7+tickBand*13+offsetBand*29,unitCapacity+1);
  const startValue=startUnits*step;
  const values=Array.from({length:tickCount},(_,index)=>startValue+index*step);
  const anchorIndices=[0,1,last];
  if(last>=7){
    const middle=Math.floor(last/2);
    if(middle!==targetTickIndex&&!anchorIndices.includes(middle)) anchorIndices.push(middle);
  }
  const visibleAnchors=anchorIndices
    .filter(index=>index!==targetTickIndex)
    .sort((a,b)=>a-b)
    .map(tickIndex=>Object.freeze({tickIndex,value:values[tickIndex]}));
  return Object.freeze({
    variant:u,step,tickCount,targetTickIndex,startValue,
    values:Object.freeze(values),
    visibleAnchors:Object.freeze(visibleAnchors),
  });
}

function numberLineModel(p){
  return Object.freeze({
    kind:"integer_number_line",
    startValue:p.startValue,
    step:p.step,
    tickCount:p.tickCount,
    ticks:Object.freeze(p.values.map((value,index)=>Object.freeze({
      index,value,label:String(value)
    }))),
    visibleAnchors:p.visibleAnchors,
    targetMarker:Object.freeze({
      markerId:"target_arrow",
      tickIndex:p.targetTickIndex,
      symbol:"▼"
    }),
    increasingLeftToRight:true,
    axisArrowAtRight:true,
    ariaLabel:"整數數線，請讀出箭頭所指的數"
  });
}

function promptFor(promptVariant){
  if(promptVariant==="READ_SYMBOL_MARKER_VALUE") return "數線上▼所指的數是多少？";
  if(promptVariant==="READ_ORDERED_MARKER_VALUE") return "數線上第一個箭頭所指的數是多少？";
  throw new Error("g3a_u01_visual_rank02_prompt_variant_invalid");
}

function signature(p,promptVariant){
  return [
    p.startValue,p.step,p.tickCount,p.targetTickIndex,promptVariant,
    ...p.visibleAnchors.flatMap(anchor=>[anchor.tickIndex,anchor.value])
  ].join("|");
}

export function buildG3AU01VisualRank02Question({
  variant=0,
  promptVariant="READ_SYMBOL_MARKER_VALUE",
  publicAdmission=false,
}={}){
  if(!G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS.includes(promptVariant)){
    throw new Error("g3a_u01_visual_rank02_prompt_variant_invalid");
  }
  const p=parameters(variant);
  const numberLine=numberLineModel(p);
  const answerValue=p.startValue+p.targetTickIndex*p.step;
  const promptText=promptFor(promptVariant);
  return Object.freeze({
    id:`g3a-u01-rank02-${p.variant}-${promptVariant.toLowerCase()}`,
    sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
    knowledgePointId:G3A_U01_VISUAL_RANK02_KP_ID,
    patternGroupId:G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
    patternSpecId:G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID,
    kind:"visualIntegerNumberLineReadValue",
    variant:p.variant,
    promptVariant,
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} 答案：${answerValue}`,
    numberLine,
    answerModel:Object.freeze({
      targetMarkerId:numberLine.targetMarker.markerId,
      targetTickIndex:p.targetTickIndex,
      answerValue,
    }),
    answerValue,
    answerText:String(answerValue),
    finalAnswer:String(answerValue),
    questionSignature:signature(p,promptVariant),
    metadata:Object.freeze({
      patternId:G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID,
      sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK02_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
      canonicalSkillIds:Object.freeze(["integer_number_line_scale_reading"]),
      skillTags:Object.freeze(["g3a_u01","integer_number_line","read_marker_value"]),
      difficultyTags:Object.freeze(["visual_reading","rank02"]),
      curriculumNodeIds:Object.freeze([G3A_U01_VISUAL_RANK02_SOURCE_ID]),
      representation:"integer-number-line",
      sourceSemanticCore:"READ_MARKER_VALUE",
      hiddenRuntime:!publicAdmission,
      selectorVisible:publicAdmission,
      productionUse:publicAdmission?"public_review":"forbidden",
    })
  });
}

function recomputeAnswer(question){
  if(!validateIntegerNumberLineModel(question?.numberLine)) return null;
  const model=question.numberLine;
  return model.startValue+model.targetMarker.tickIndex*model.step;
}

export function validateG3AU01VisualRank02Question(question){
  const errors=[];
  if(
    !question
    || question.sourceId!==G3A_U01_VISUAL_RANK02_SOURCE_ID
    || question.knowledgePointId!==G3A_U01_VISUAL_RANK02_KP_ID
    || question.patternGroupId!==G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID
    || question.patternSpecId!==G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID
  ) errors.push("G3A_U01_RANK02_IDENTITY_INVALID");
  if(!G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS.includes(question?.promptVariant)){
    errors.push("G3A_U01_RANK02_PROMPT_VARIANT_INVALID");
  }
  if(!validateIntegerNumberLineModel(question?.numberLine)){
    errors.push("G3A_U01_RANK02_NUMBER_LINE_MODEL_INVALID");
  }
  const expected=recomputeAnswer(question);
  if(
    expected===null
    || question?.answerModel?.answerValue!==expected
    || question?.answerModel?.targetTickIndex!==question?.numberLine?.targetMarker?.tickIndex
    || question?.answerModel?.targetMarkerId!==question?.numberLine?.targetMarker?.markerId
    || question?.answerValue!==expected
    || question?.answerText!==String(expected)
  ) errors.push("G3A_U01_RANK02_ANSWER_INVALID");
  const publicAdmission=question?.metadata?.selectorVisible===true;
  const scopeValid=
    question?.metadata?.representation==="integer-number-line"
    && question?.metadata?.sourceSemanticCore==="READ_MARKER_VALUE"
    && (
      publicAdmission
        ? question?.metadata?.hiddenRuntime===false&&question?.metadata?.productionUse==="public_review"
        : question?.metadata?.hiddenRuntime===true&&question?.metadata?.productionUse==="forbidden"
    );
  if(!scopeValid) errors.push("G3A_U01_RANK02_SCOPE_INVALID");
  if(Number.isInteger(question?.variant)&&G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS.includes(question?.promptVariant)){
    const rebuilt=buildG3AU01VisualRank02Question({
      variant:question.variant,
      promptVariant:question.promptVariant,
      publicAdmission,
    });
    if(
      question.questionSignature!==rebuilt.questionSignature
      || question.promptText!==rebuilt.promptText
      || JSON.stringify(question.numberLine)!==JSON.stringify(rebuilt.numberLine)
      || JSON.stringify(question.answerModel)!==JSON.stringify(rebuilt.answerModel)
    ) errors.push("G3A_U01_RANK02_DETERMINISTIC_CONTRACT_INVALID");
  }
  return Object.freeze({ok:errors.length===0,errors:Object.freeze([...new Set(errors)])});
}

export function validateG3AU01VisualRank02Answer(question,answer){
  const checked=validateG3AU01VisualRank02Question(question);
  if(!checked.ok) return checked;
  const numeric=typeof answer==="string"&&answer.trim()!==""?Number(answer.trim()):answer;
  return Number.isInteger(numeric)&&numeric===question.answerModel.answerValue
    ? Object.freeze({ok:true,errors:Object.freeze([])})
    : Object.freeze({ok:false,errors:Object.freeze(["G3A_U01_RANK02_ANSWER_MISMATCH"])});
}

export function generateG3AU01VisualRank02Questions(options={}){
  const publicAdmission=options.publicAdmission===true;
  const count=Number.isInteger(options.questionCount)?options.questionCount:20;
  if(count<1||count>G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT){
    return Object.freeze({
      ok:false,questions:Object.freeze([]),
      errors:Object.freeze(["G3A_U01_RANK02_QUESTION_COUNT_INVALID"]),
      warnings:Object.freeze([])
    });
  }
  const requested=Array.isArray(options.promptVariants)
    ? options.promptVariants.filter(value=>G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS.includes(value))
    : [];
  const promptVariants=requested.length?requested:G3A_U01_VISUAL_RANK02_PROMPT_VARIANTS;
  const start=hash(options.generationSeed??"g3a-u01-visual-rank02")%G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT;
  const questions=[];
  for(let i=0;i<count;i++){
    questions.push(buildG3AU01VisualRank02Question({
      variant:(start+i)%G3A_U01_VISUAL_RANK02_MAX_QUESTION_COUNT,
      promptVariant:promptVariants[i%promptVariants.length],
      publicAdmission,
    }));
  }
  const errors=questions.flatMap(question=>validateG3AU01VisualRank02Question(question).errors);
  return Object.freeze({
    ok:errors.length===0,
    questions:Object.freeze(questions),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
    lifecycle:Object.freeze(publicAdmission
      ? {hiddenRuntime:false,selectorVisible:true,productionUse:"public_review"}
      : {hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"})
  });
}
