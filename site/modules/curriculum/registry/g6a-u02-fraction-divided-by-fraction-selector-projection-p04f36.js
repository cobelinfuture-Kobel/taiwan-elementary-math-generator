import {G6A_U02_SOURCE_ID,G6A_U02_UNIT_CODE,G6A_U02_UNIT_TITLE} from "./g6a-u02-reciprocal-selector-projection.js";

export const P04F36_TASK_ID="P04F36_Q036_SourceBackedNumericImplementation";
export const G6A_U02_P04F36_SOURCE_ID=G6A_U02_SOURCE_ID;
export const G6A_U02_P04F36_KP_ID="kp_g6a_u02_fraction_divided_by_fraction";
export const G6A_U02_P04F36_GROUP_ID="pg_g6a_u02_fraction_divided_by_fraction_numeric";
export const G6A_U02_P04F36_SPEC_ID="ps_g6a_u02_fraction_divided_by_fraction_quotient_numeric";
export const G6A_U02_P04F36_FUTURE_KP_IDS=Object.freeze([
  "kp_g6a_u02_fraction_division_application",
]);

export const G6A_U02_P04F36_PATTERN_SPECS=Object.freeze([Object.freeze({
  patternSpecId:G6A_U02_P04F36_SPEC_ID,
  knowledgePointId:G6A_U02_P04F36_KP_ID,
  patternFamilyId:"FRACTION_DIVIDED_BY_FRACTION_QUOTIENT",
  semanticRelation:"FRACTION_DIVIDED_BY_FRACTION_QUOTIENT",
  knownRoleIds:Object.freeze(["DIVIDEND_FRACTION","DIVISOR_FRACTION"]),
  targetRoleId:"QUOTIENT_FRACTION",
  targetRoleMode:"FIXED",
  questionMode:"numeric",
  answerModel:"exact_reduced_fraction",
  divisorFractionMustBeNonzero:true,
  divisionByFractionEqualsMultiplyByReciprocal:true,
  quotientTimesDivisorReconstructsDividend:true,
  exactRationalArithmeticRequired:true,
  equivalentFractionReductionAllowed:true,
  roundingAllowed:false,
  supportingCapability:"RECIPROCAL_OF_NONZERO_FRACTION",
  sourceEvidenceTopic:"分數除以分數",
})]);

export const G6A_U02_P04F36_PATTERN_GROUPS=Object.freeze([Object.freeze({
  patternGroupId:G6A_U02_P04F36_GROUP_ID,
  sourceId:G6A_U02_P04F36_SOURCE_ID,
  unitCode:G6A_U02_UNIT_CODE,
  unitTitle:G6A_U02_UNIT_TITLE,
  displayName:"分數除以分數",
  primaryKnowledgePointId:G6A_U02_P04F36_KP_ID,
  knowledgePointIds:Object.freeze([G6A_U02_P04F36_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"fraction_divided_by_fraction",
  representationTags:Object.freeze(["numeric","fraction","division","reciprocal_transform","exact_rational"]),
  patternSpecIds:Object.freeze([G6A_U02_P04F36_SPEC_ID]),
  allocationPolicy:"single_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null,
})]);

export const G6A_U02_P04F36_SELECTOR_ROWS=Object.freeze([Object.freeze({
  knowledgePointId:G6A_U02_P04F36_KP_ID,
  sourceId:G6A_U02_P04F36_SOURCE_ID,
  unitCode:G6A_U02_UNIT_CODE,
  unitTitle:G6A_U02_UNIT_TITLE,
  displayName:"分數除以分數",
  canonicalNameZh:"分數除以分數",
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G6A_U02_P04F36_GROUP_ID]),
  canonicalPatternSpecIds:Object.freeze([G6A_U02_P04F36_SPEC_ID]),
  patternGroupIds:Object.freeze([G6A_U02_P04F36_GROUP_ID]),
  patternSpecIds:Object.freeze([G6A_U02_P04F36_SPEC_ID]),
  requiredCapabilityIds:Object.freeze(["cap_fraction_number_system","cap_fraction_domain_validator","cap_fraction_arithmetic"]),
  qaStatusLabel:"P04F36_Q036_SOURCE_BACKED_NUMERIC",
  productionUse:"full_product_w4_slice036_candidate",
})]);

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function listG6AU02P04F36SelectorRows(){return clone(G6A_U02_P04F36_SELECTOR_ROWS);}
export function getG6AU02P04F36SelectorRow(id){return clone(id===G6A_U02_P04F36_KP_ID?G6A_U02_P04F36_SELECTOR_ROWS[0]:null);}
export function listG6AU02P04F36PatternGroups(id){return clone(id===G6A_U02_P04F36_KP_ID?G6A_U02_P04F36_PATTERN_GROUPS:[]);}
export function resolveG6AU02P04F36PatternSpecIds(id){return clone(id===G6A_U02_P04F36_KP_ID?[G6A_U02_P04F36_SPEC_ID]:[]);}
export function auditG6AU02P04F36SelectorProjection(){
  const errors=[];
  const spec=G6A_U02_P04F36_PATTERN_SPECS[0];
  if(G6A_U02_P04F36_SELECTOR_ROWS.length!==1||G6A_U02_P04F36_PATTERN_GROUPS.length!==1||G6A_U02_P04F36_PATTERN_SPECS.length!==1)errors.push("P04F36_CARDINALITY_INVALID");
  if(spec.semanticRelation!=="FRACTION_DIVIDED_BY_FRACTION_QUOTIENT"||spec.knownRoleIds.join("|")!=="DIVIDEND_FRACTION|DIVISOR_FRACTION"||spec.targetRoleId!=="QUOTIENT_FRACTION")errors.push("P04F36_FORMAL_MAPPING_INVALID");
  if(spec.divisorFractionMustBeNonzero!==true||spec.divisionByFractionEqualsMultiplyByReciprocal!==true||spec.quotientTimesDivisorReconstructsDividend!==true||spec.exactRationalArithmeticRequired!==true||spec.roundingAllowed!==false)errors.push("P04F36_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:1,numeric:1,application:0})});
}
