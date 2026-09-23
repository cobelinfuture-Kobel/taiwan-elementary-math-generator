export const P04F39_TASK_ID="P04F39_Q039_SourceBackedMixedDomainExpressionImplementation";
export const G6B_U01_P04F39_SOURCE_ID="g6b_u01_6b01";
export const G6B_U01_P04F39_UNIT_CODE="6B-U01";
export const G6B_U01_P04F39_UNIT_TITLE="小數與分數的計算";
export const G6B_U01_P04F39_KP_ID="kp_g6b_u01_mixed_domain_expression";
export const G6B_U01_P04F39_GROUP_ID="pg_g6b_u01_mixed_domain_expression";
export const G6B_U01_P04F39_SPEC_IDS=Object.freeze([
  "ps_g6b_u01_decimal_plus_fraction_times_decimal",
  "ps_g6b_u01_decimal_minus_fraction_times_decimal",
  "ps_g6b_u01_fraction_plus_decimal_divided_by_fraction",
  "ps_g6b_u01_parenthesized_decimal_plus_fraction_times_decimal",
  "ps_g6b_u01_decimal_times_parenthesized_fraction_plus_decimal",
  "ps_g6b_u01_decimal_times_fraction_divided_by_decimal",
]);
export const G6B_U01_P04F39_FUTURE_KP_IDS=Object.freeze([]);
export const G6B_U01_P04F39_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_decimal_number_system",
  "cap_decimal_domain_validator",
  "cap_fraction_number_system",
  "cap_fraction_domain_validator",
  "cap_mixed_number_domain_normalization",
]);
const spec=(patternSpecId,evaluationShape,operandDomains,operatorSequence,precedenceRule,parenthesesMode,sourceEvidenceTopic)=>Object.freeze({patternSpecId,evaluationShape,operandDomains:Object.freeze(operandDomains),operatorSequence:Object.freeze(operatorSequence),precedenceRule,parenthesesMode,sourceEvidenceTopic,questionMode:"numeric",answerModel:"exact_reduced_rational"});
export const G6B_U01_P04F39_PATTERN_SPECS=Object.freeze([
  spec(G6B_U01_P04F39_SPEC_IDS[0],"A_PLUS_B_TIMES_C",["DECIMAL","FRACTION","DECIMAL"],["ADD","MULTIPLY"],"MULTIPLICATIVE_BEFORE_ADDITIVE","NONE","小數與分數混合算式－先乘後加"),
  spec(G6B_U01_P04F39_SPEC_IDS[1],"A_MINUS_B_TIMES_C",["DECIMAL","FRACTION","DECIMAL"],["SUBTRACT","MULTIPLY"],"MULTIPLICATIVE_BEFORE_ADDITIVE","NONE","小數與分數混合算式－先乘後減"),
  spec(G6B_U01_P04F39_SPEC_IDS[2],"A_PLUS_B_DIVIDED_BY_C",["FRACTION","DECIMAL","FRACTION"],["ADD","DIVIDE"],"MULTIPLICATIVE_BEFORE_ADDITIVE","NONE","小數與分數混合算式－先除後加"),
  spec(G6B_U01_P04F39_SPEC_IDS[3],"PARENTHESIZED_A_PLUS_B_TIMES_C",["DECIMAL","FRACTION","DECIMAL"],["ADD","MULTIPLY"],"PARENTHESES_FIRST","A_PLUS_B","小數與分數混合算式－括號先算再乘"),
  spec(G6B_U01_P04F39_SPEC_IDS[4],"A_TIMES_PARENTHESIZED_B_PLUS_C",["DECIMAL","FRACTION","DECIMAL"],["MULTIPLY","ADD"],"PARENTHESES_FIRST","B_PLUS_C","小數與分數混合算式－乘上括號和"),
  spec(G6B_U01_P04F39_SPEC_IDS[5],"A_TIMES_B_DIVIDED_BY_C",["DECIMAL","FRACTION","DECIMAL"],["MULTIPLY","DIVIDE"],"SAME_PRECEDENCE_LEFT_TO_RIGHT","NONE","小數與分數混合算式－乘除同級由左至右"),
].map(item=>Object.freeze({...item,knowledgePointId:G6B_U01_P04F39_KP_ID,patternFamilyId:"MIXED_DOMAIN_EXPRESSION_EVALUATION",operandCount:3,multiStep:true,exactRationalArithmeticRequired:true,roundingAllowed:false,applicationAllowed:false})));
export const G6B_U01_P04F39_PATTERN_GROUPS=Object.freeze([Object.freeze({patternGroupId:G6B_U01_P04F39_GROUP_ID,sourceId:G6B_U01_P04F39_SOURCE_ID,unitCode:G6B_U01_P04F39_UNIT_CODE,unitTitle:G6B_U01_P04F39_UNIT_TITLE,displayName:"小數分數混合算式",primaryKnowledgePointId:G6B_U01_P04F39_KP_ID,knowledgePointIds:Object.freeze([G6B_U01_P04F39_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"mixed_domain_expression",representationTags:Object.freeze(["decimal","fraction","mixed_number_domain","expression","operation_precedence","parentheses","exact_rational"]),patternSpecIds:G6B_U01_P04F39_SPEC_IDS,allocationPolicy:"balanced_expression_shape",visibilityStatus:"visible",holdReason:null})]);
export const G6B_U01_P04F39_SELECTOR_ROWS=Object.freeze([Object.freeze({knowledgePointId:G6B_U01_P04F39_KP_ID,sourceId:G6B_U01_P04F39_SOURCE_ID,unitCode:G6B_U01_P04F39_UNIT_CODE,unitTitle:G6B_U01_P04F39_UNIT_TITLE,displayName:"小數分數混合算式",canonicalNameZh:"小數分數混合算式",mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"NUMERIC_ONLY",canonicalPatternGroupIds:Object.freeze([G6B_U01_P04F39_GROUP_ID]),canonicalPatternSpecIds:G6B_U01_P04F39_SPEC_IDS,patternGroupIds:Object.freeze([G6B_U01_P04F39_GROUP_ID]),patternSpecIds:G6B_U01_P04F39_SPEC_IDS,requiredCapabilityIds:G6B_U01_P04F39_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P04F39_Q039_SOURCE_BACKED_NUMERIC",productionUse:"full_product_w4_slice039_candidate"})]);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function listG6BU01P04F39SelectorRows(){return clone(G6B_U01_P04F39_SELECTOR_ROWS);}
export function getG6BU01P04F39SelectorRow(id){return clone(id===G6B_U01_P04F39_KP_ID?G6B_U01_P04F39_SELECTOR_ROWS[0]:null);}
export function listG6BU01P04F39PatternGroups(id){return clone(id===G6B_U01_P04F39_KP_ID?G6B_U01_P04F39_PATTERN_GROUPS:[]);}
export function resolveG6BU01P04F39PatternSpecIds(id){return clone(id===G6B_U01_P04F39_KP_ID?G6B_U01_P04F39_SPEC_IDS:[]);}
export function auditG6BU01P04F39SelectorProjection(){const errors=[];if(G6B_U01_P04F39_SELECTOR_ROWS.length!==1||G6B_U01_P04F39_PATTERN_GROUPS.length!==1||G6B_U01_P04F39_PATTERN_SPECS.length!==6)errors.push("P04F39_CARDINALITY_INVALID");const operations=new Set(G6B_U01_P04F39_PATTERN_SPECS.flatMap(x=>x.operatorSequence)),precedence=new Set(G6B_U01_P04F39_PATTERN_SPECS.map(x=>x.precedenceRule));for(const op of ["ADD","SUBTRACT","MULTIPLY","DIVIDE"])if(!operations.has(op))errors.push(`P04F39_OPERATION_COVERAGE_MISSING:${op}`);for(const rule of ["MULTIPLICATIVE_BEFORE_ADDITIVE","PARENTHESES_FIRST","SAME_PRECEDENCE_LEFT_TO_RIGHT"])if(!precedence.has(rule))errors.push(`P04F39_PRECEDENCE_COVERAGE_MISSING:${rule}`);if(G6B_U01_P04F39_PATTERN_SPECS.some(x=>x.exactRationalArithmeticRequired!==true||x.roundingAllowed!==false||x.applicationAllowed!==false||x.multiStep!==true||x.operandCount!==3))errors.push("P04F39_INVARIANT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:6,numeric:6,application:0})});}
