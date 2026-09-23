export const P04F38_TASK_ID="P04F38_Q038_SourceBackedNumericImplementation";
export const G6B_U01_P04F38_SOURCE_ID="g6b_u01_6b01";
export const G6B_U01_P04F38_UNIT_CODE="6B-U01";
export const G6B_U01_P04F38_UNIT_TITLE="小數與分數的計算";
export const G6B_U01_P04F38_KP_ID="kp_g6b_u01_mixed_decimal_fraction_mul_div";
export const G6B_U01_P04F38_GROUP_ID="pg_g6b_u01_mixed_decimal_fraction_mul_div";
export const G6B_U01_P04F38_SPEC_IDS=Object.freeze([
  "ps_g6b_u01_decimal_times_fraction",
  "ps_g6b_u01_fraction_times_decimal",
  "ps_g6b_u01_decimal_divided_by_fraction",
  "ps_g6b_u01_fraction_divided_by_decimal",
]);
export const G6B_U01_P04F38_FUTURE_KP_IDS=Object.freeze(["kp_g6b_u01_mixed_domain_expression"]);
export const G6B_U01_P04F38_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_decimal_number_system",
  "cap_decimal_domain_validator",
  "cap_fraction_number_system",
  "cap_fraction_domain_validator",
  "cap_mixed_number_domain_normalization",
]);

export const G6B_U01_P04F38_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:G6B_U01_P04F38_SPEC_IDS[0],operation:"MULTIPLY",leftDomain:"DECIMAL",rightDomain:"FRACTION",questionMode:"numeric",answerModel:"exact_reduced_rational",sourceEvidenceTopic:"小數與分數混合計算－乘法"}),
  Object.freeze({patternSpecId:G6B_U01_P04F38_SPEC_IDS[1],operation:"MULTIPLY",leftDomain:"FRACTION",rightDomain:"DECIMAL",questionMode:"numeric",answerModel:"exact_reduced_rational",sourceEvidenceTopic:"小數與分數混合計算－乘法交換次序"}),
  Object.freeze({patternSpecId:G6B_U01_P04F38_SPEC_IDS[2],operation:"DIVIDE",leftDomain:"DECIMAL",rightDomain:"FRACTION",questionMode:"numeric",answerModel:"exact_reduced_rational",sourceEvidenceTopic:"小數與分數混合乘除－除法"}),
  Object.freeze({patternSpecId:G6B_U01_P04F38_SPEC_IDS[3],operation:"DIVIDE",leftDomain:"FRACTION",rightDomain:"DECIMAL",questionMode:"numeric",answerModel:"exact_reduced_rational",sourceEvidenceTopic:"小數與分數混合乘除－除法反向"}),
].map(spec=>Object.freeze({...spec,knowledgePointId:G6B_U01_P04F38_KP_ID,patternFamilyId:"MIXED_DECIMAL_FRACTION_MUL_DIV",exactRationalArithmeticRequired:true,roundingAllowed:false,applicationAllowed:false})));

export const G6B_U01_P04F38_PATTERN_GROUPS=Object.freeze([Object.freeze({
  patternGroupId:G6B_U01_P04F38_GROUP_ID,sourceId:G6B_U01_P04F38_SOURCE_ID,unitCode:G6B_U01_P04F38_UNIT_CODE,unitTitle:G6B_U01_P04F38_UNIT_TITLE,displayName:"小數與分數混合乘除",primaryKnowledgePointId:G6B_U01_P04F38_KP_ID,knowledgePointIds:Object.freeze([G6B_U01_P04F38_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"mixed_decimal_fraction_mul_div",representationTags:Object.freeze(["decimal","fraction","mixed_number_domain","multiplication","division","exact_rational"]),patternSpecIds:G6B_U01_P04F38_SPEC_IDS,allocationPolicy:"balanced_operation_and_operand_order",visibilityStatus:"visible",holdReason:null,
})]);

export const G6B_U01_P04F38_SELECTOR_ROWS=Object.freeze([Object.freeze({
  knowledgePointId:G6B_U01_P04F38_KP_ID,sourceId:G6B_U01_P04F38_SOURCE_ID,unitCode:G6B_U01_P04F38_UNIT_CODE,unitTitle:G6B_U01_P04F38_UNIT_TITLE,displayName:"小數與分數混合乘除",canonicalNameZh:"小數與分數混合乘除",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"NUMERIC_ONLY",canonicalPatternGroupIds:Object.freeze([G6B_U01_P04F38_GROUP_ID]),canonicalPatternSpecIds:G6B_U01_P04F38_SPEC_IDS,patternGroupIds:Object.freeze([G6B_U01_P04F38_GROUP_ID]),patternSpecIds:G6B_U01_P04F38_SPEC_IDS,requiredCapabilityIds:G6B_U01_P04F38_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P04F38_Q038_SOURCE_BACKED_NUMERIC",productionUse:"full_product_w4_slice038_candidate",
})]);

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function listG6BU01P04F38SelectorRows(){return clone(G6B_U01_P04F38_SELECTOR_ROWS);}
export function getG6BU01P04F38SelectorRow(id){return clone(id===G6B_U01_P04F38_KP_ID?G6B_U01_P04F38_SELECTOR_ROWS[0]:null);}
export function listG6BU01P04F38PatternGroups(id){return clone(id===G6B_U01_P04F38_KP_ID?G6B_U01_P04F38_PATTERN_GROUPS:[]);}
export function resolveG6BU01P04F38PatternSpecIds(id){return clone(id===G6B_U01_P04F38_KP_ID?G6B_U01_P04F38_SPEC_IDS:[]);}
export function auditG6BU01P04F38SelectorProjection(){const errors=[];if(G6B_U01_P04F38_SELECTOR_ROWS.length!==1||G6B_U01_P04F38_PATTERN_GROUPS.length!==1||G6B_U01_P04F38_PATTERN_SPECS.length!==4)errors.push("P04F38_CARDINALITY_INVALID");const ops=new Set(G6B_U01_P04F38_PATTERN_SPECS.map(x=>x.operation));const directions=new Set(G6B_U01_P04F38_PATTERN_SPECS.map(x=>`${x.leftDomain}_${x.rightDomain}`));if(!ops.has("MULTIPLY")||!ops.has("DIVIDE")||directions.size!==2)errors.push("P04F38_RELATION_COVERAGE_INVALID");if(G6B_U01_P04F38_PATTERN_SPECS.some(x=>x.exactRationalArithmeticRequired!==true||x.roundingAllowed!==false||x.applicationAllowed!==false))errors.push("P04F38_INVARIANT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,numeric:4,application:0})});}
