import { validateIntegerNumberLineModel } from "../../renderer/fraction-number-line.js";

export const G3A_U01_VISUAL_RANK03_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK03_KP_ID = "kp_g3a_u01_integer_number_line_scale_location";
export const G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID = "pg_g3a_u01_visual_integer_number_line_mark_value";
export const G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID = "ps_g3a_u01_visual_integer_number_line_mark_value";
export const G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT = 240;
export const G3A_U01_VISUAL_RANK03_PROMPT_VARIANTS = Object.freeze(["MARK_GIVEN_VALUE"]);

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
  const u=mod(variant,G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT);
  const stepIndex=u%STEPS.length;
  const step=STEPS[stepIndex];
  const tickBand=Math.floor(u/STEPS.length)%6;
  const tickCount=7+tickBand;
  const offsetBand=Math.floor(u/60);
  const last=tickCount-1;
  const targetTickIndex=2+mod(stepIndex*3+tickBand+offsetBand,tickCount-3);
  const maxStart=10000-last*step;
  const unitCapacity=Math.max(0,Math.floor(maxStart/step));
  const startUnits=mod(stepIndex*11+tickBand*17+offsetBand*31,unitCapacity+1);
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
  const targetValue=values[targetTickIndex];
  return Object.freeze({
    variant:u,
    step,
    tickCount,
    targetTickIndex,
    targetValue,
    startValue,
    values:Object.freeze(values),
    visibleAnchors:Object.freeze(visibleAnchors),
  });
}

function baseScaleModel(p){
  return {
    kind:"integer_number_line",
    startValue:p.startValue,
    step:p.step,
    tickCount:p.tickCount,
    ticks:Object.freeze(p.values.map((value,index)=>Object.freeze({
      index,
      value,
      label:String(value),
    }))),
    visibleAnchors:p.visibleAnchors,
    increasingLeftToRight:true,
    axisArrowAtRight:true,
  };
}

function questionNumberLineModel(p){
  return Object.freeze({
    ...baseScaleModel(p),
    markerPolicy:"forbidden",
    ariaLabel:`整數數線，請標出 ${p.targetValue}`,
  });
}

function answerNumberLineModel(p){
  return Object.freeze({
    ...baseScaleModel(p),
    markerPolicy:"required",
    targetMarker:Object.freeze({
      markerId:"answer_marker",
      tickIndex:p.targetTickIndex,
      symbol:"▼",
    }),
    ariaLabel:`整數數線答案，${p.targetValue} 標在正確刻度`,
  });
}

function promptFor(targetValue){
  return `在數線上標出${targetValue}。`;
}

function scaleIdentity(model){
  if(!model)return null;
  return JSON.stringify({
    kind:model.kind,
    startValue:model.startValue,
    step:model.step,
    tickCount:model.tickCount,
    ticks:model.ticks,
    visibleAnchors:model.visibleAnchors,
    increasingLeftToRight:model.increasingLeftToRight,
    axisArrowAtRight:model.axisArrowAtRight,
  });
}

function signature(p){
  return [
    p.startValue,
    p.step,
    p.tickCount,
    p.targetTickIndex,
    p.targetValue,
    ...p.visibleAnchors.flatMap(anchor=>[anchor.tickIndex,anchor.value]),
  ].join("|");
}

export function buildG3AU01VisualRank03Question({
  variant=0,
  publicAdmission=false,
}={}){
  const p=parameters(variant);
  const questionNumberLine=questionNumberLineModel(p);
  const answerNumberLine=answerNumberLineModel(p);
  const promptText=promptFor(p.targetValue);
  return Object.freeze({
    id:`g3a-u01-rank03-${p.variant}-mark-given-value`,
    sourceId:G3A_U01_VISUAL_RANK03_SOURCE_ID,
    knowledgePointId:G3A_U01_VISUAL_RANK03_KP_ID,
    patternGroupId:G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
    patternSpecId:G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID,
    kind:"visualIntegerNumberLineMarkValue",
    variant:p.variant,
    promptVariant:"MARK_GIVEN_VALUE",
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    displayText:`${promptText} 答案刻度：${p.targetTickIndex+1}`,
    targetValue:p.targetValue,
    numberLine:questionNumberLine,
    questionNumberLine,
    answerNumberLine,
    answerModel:Object.freeze({
      targetValue:p.targetValue,
      targetTickIndex:p.targetTickIndex,
      answerMarkerId:answerNumberLine.targetMarker.markerId,
    }),
    answerValue:p.targetTickIndex,
    answerText:`標在${p.targetValue}所在的刻度`,
    finalAnswer:String(p.targetTickIndex),
    questionSignature:signature(p),
    metadata:Object.freeze({
      patternId:G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID,
      sourceId:G3A_U01_VISUAL_RANK03_SOURCE_ID,
      knowledgePointId:G3A_U01_VISUAL_RANK03_KP_ID,
      patternGroupId:G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
      canonicalSkillIds:Object.freeze(["integer_number_line_scale_location"]),
      skillTags:Object.freeze(["g3a_u01","integer_number_line","mark_given_value"]),
      difficultyTags:Object.freeze(["visual_marking","rank03"]),
      curriculumNodeIds:Object.freeze([G3A_U01_VISUAL_RANK03_SOURCE_ID]),
      representation:"integer-number-line",
      sourceSemanticCore:"MARK_GIVEN_VALUE",
      hiddenRuntime:!publicAdmission,
      selectorVisible:publicAdmission,
      productionUse:publicAdmission?"public_review":"forbidden",
    }),
  });
}

function recomputeTargetIndex(question){
  const q=question?.questionNumberLine;
  if(!validateIntegerNumberLineModel(q)) return null;
  if(!Number.isInteger(question?.targetValue)) return null;
  const delta=question.targetValue-q.startValue;
  if(delta<0||delta%q.step!==0)return null;
  const index=delta/q.step;
  if(!Number.isInteger(index)||index<0||index>=q.tickCount)return null;
  return index;
}

export function validateG3AU01VisualRank03Question(question){
  const errors=[];
  if(
    !question
    || question.sourceId!==G3A_U01_VISUAL_RANK03_SOURCE_ID
    || question.knowledgePointId!==G3A_U01_VISUAL_RANK03_KP_ID
    || question.patternGroupId!==G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID
    || question.patternSpecId!==G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID
  ) errors.push("G3A_U01_RANK03_IDENTITY_INVALID");

  if(question?.promptVariant!=="MARK_GIVEN_VALUE"){
    errors.push("G3A_U01_RANK03_PROMPT_VARIANT_INVALID");
  }

  const qModel=question?.questionNumberLine;
  const aModel=question?.answerNumberLine;
  if(!validateIntegerNumberLineModel(qModel)||qModel?.markerPolicy!=="forbidden"||qModel?.targetMarker!=null){
    errors.push("G3A_U01_RANK03_QUESTION_NUMBER_LINE_INVALID");
  }
  if(!validateIntegerNumberLineModel(aModel)||aModel?.markerPolicy!=="required"||!aModel?.targetMarker){
    errors.push("G3A_U01_RANK03_ANSWER_NUMBER_LINE_INVALID");
  }
  if(scaleIdentity(qModel)!==scaleIdentity(aModel)){
    errors.push("G3A_U01_RANK03_SCALE_IDENTITY_INVALID");
  }

  const expectedIndex=recomputeTargetIndex(question);
  if(
    expectedIndex===null
    || question?.answerModel?.targetValue!==question?.targetValue
    || question?.answerModel?.targetTickIndex!==expectedIndex
    || question?.answerModel?.answerMarkerId!==aModel?.targetMarker?.markerId
    || aModel?.targetMarker?.tickIndex!==expectedIndex
    || question?.answerValue!==expectedIndex
  ){
    errors.push("G3A_U01_RANK03_ANSWER_OVERLAY_INVALID");
  }

  if(!String(question?.promptText??"").includes(String(question?.targetValue??""))){
    errors.push("G3A_U01_RANK03_PROMPT_TARGET_VALUE_MISSING");
  }

  const publicAdmission=question?.metadata?.selectorVisible===true;
  const scopeValid=
    question?.metadata?.representation==="integer-number-line"
    && question?.metadata?.sourceSemanticCore==="MARK_GIVEN_VALUE"
    && (
      publicAdmission
        ? question?.metadata?.hiddenRuntime===false&&question?.metadata?.productionUse==="public_review"
        : question?.metadata?.hiddenRuntime===true&&question?.metadata?.productionUse==="forbidden"
    );
  if(!scopeValid)errors.push("G3A_U01_RANK03_SCOPE_INVALID");

  if(Number.isInteger(question?.variant)){
    const rebuilt=buildG3AU01VisualRank03Question({
      variant:question.variant,
      publicAdmission,
    });
    if(
      question.questionSignature!==rebuilt.questionSignature
      || question.promptText!==rebuilt.promptText
      || question.targetValue!==rebuilt.targetValue
      || JSON.stringify(question.questionNumberLine)!==JSON.stringify(rebuilt.questionNumberLine)
      || JSON.stringify(question.answerNumberLine)!==JSON.stringify(rebuilt.answerNumberLine)
      || JSON.stringify(question.answerModel)!==JSON.stringify(rebuilt.answerModel)
    ){
      errors.push("G3A_U01_RANK03_DETERMINISTIC_CONTRACT_INVALID");
    }
  }

  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze([...new Set(errors)]),
  });
}

export function validateG3AU01VisualRank03Answer(question,answer){
  const checked=validateG3AU01VisualRank03Question(question);
  if(!checked.ok)return checked;
  const candidate=typeof answer==="object"&&answer!==null
    ? answer.targetTickIndex
    : (typeof answer==="string"&&answer.trim()!==""?Number(answer.trim()):answer);
  return Number.isInteger(candidate)&&candidate===question.answerModel.targetTickIndex
    ? Object.freeze({ok:true,errors:Object.freeze([])})
    : Object.freeze({ok:false,errors:Object.freeze(["G3A_U01_RANK03_ANSWER_MISMATCH"])});
}

export function generateG3AU01VisualRank03Questions(options={}){
  const publicAdmission=options.publicAdmission===true;
  const count=Number.isInteger(options.questionCount)?options.questionCount:20;
  if(count<1||count>G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT){
    return Object.freeze({
      ok:false,
      questions:Object.freeze([]),
      errors:Object.freeze(["G3A_U01_RANK03_QUESTION_COUNT_INVALID"]),
      warnings:Object.freeze([]),
    });
  }

  const start=hash(options.generationSeed??"g3a-u01-visual-rank03")%G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT;
  const questions=[];
  for(let i=0;i<count;i++){
    questions.push(buildG3AU01VisualRank03Question({
      variant:(start+i)%G3A_U01_VISUAL_RANK03_MAX_QUESTION_COUNT,
      publicAdmission,
    }));
  }
  const errors=questions.flatMap(question=>validateG3AU01VisualRank03Question(question).errors);
  return Object.freeze({
    ok:errors.length===0,
    questions:Object.freeze(questions),
    errors:Object.freeze(errors),
    warnings:Object.freeze([]),
    lifecycle:Object.freeze(publicAdmission
      ? {hiddenRuntime:false,selectorVisible:true,productionUse:"public_review"}
      : {hiddenRuntime:true,selectorVisible:false,productionUse:"forbidden"}),
  });
}
