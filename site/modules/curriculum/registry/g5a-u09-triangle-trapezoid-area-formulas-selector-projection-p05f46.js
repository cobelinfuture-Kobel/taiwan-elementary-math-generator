export const P05F46_TASK_ID="P05F_W5DirectProductVerticalSlice046Implementation";
export const G5A_U09_P05F46_SOURCE_ID="g5a_u09_5a09";
export const G5A_U09_P05F46_UNIT_CODE="5A-U09";
export const G5A_U09_P05F46_UNIT_TITLE="平行四邊形三角形梯形面積";
export const G5A_U09_P05F46_TRAPEZOID_KP_ID="kp_g5a_u09_trapezoid_area_formula";
export const G5A_U09_P05F46_TRIANGLE_KP_ID="kp_g5a_u09_triangle_area_formula";
export const G5A_U09_P05F46_KP_IDS=Object.freeze([G5A_U09_P05F46_TRAPEZOID_KP_ID,G5A_U09_P05F46_TRIANGLE_KP_ID]);
export const G5A_U09_P05F46_PROTECTED_EXISTING_KP_IDS=Object.freeze(["kp_g5a_u09_parallelogram_area_formula"]);
export const G5A_U09_P05F46_REMAINING_FUTURE_KP_IDS=Object.freeze(["kp_g5a_u09_area_unknown_dimension","kp_g5a_u09_composite_polygon_area"]);
export const G5A_U09_P05F46_REQUIRED_W5_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"]);
export const G5A_U09_P05F46_RUNTIME_DOMAIN_CAPABILITY_IDS=Object.freeze([...G5A_U09_P05F46_REQUIRED_W5_CAPABILITY_IDS,"cap_integer_division"]);
const COMMON_EXCLUDED=Object.freeze(["REOWN_PARALLELOGRAM_AREA_FORMULA","AREA_UNKNOWN_BASE_OR_HEIGHT","COMPOSITE_POLYGON_AREA","RHOMBUS_SPECIFIC_AREA_FORMULA","APPLICATION_CONTEXT_IMPLEMENTATION","SAME_UNIT_MIXED_MODE","CROSS_UNIT_MIXED_MODE","Q047_OR_LATER_SEMANTICS"]);
const TRIANGLE_RELATIONS=Object.freeze(["COMPUTE_TRIANGLE_AREA_AS_BASE_TIMES_PERPENDICULAR_HEIGHT_DIVIDED_BY_TWO","DERIVE_TRIANGLE_AREA_AS_HALF_OF_EQUAL_BASE_HEIGHT_PARALLELOGRAM","REQUIRE_HEIGHT_PERPENDICULAR_TO_SELECTED_BASE_OR_BASE_EXTENSION"]);
const TRAPEZOID_RELATIONS=Object.freeze(["COMPUTE_TRAPEZOID_AREA_AS_SUM_OF_PARALLEL_BASES_TIMES_PERPENDICULAR_HEIGHT_DIVIDED_BY_TWO","DERIVE_TRAPEZOID_AREA_BY_PAIRING_TWO_CONGRUENT_TRAPEZOIDS_INTO_PARALLELOGRAM","REQUIRE_HEIGHT_PERPENDICULAR_TO_SELECTED_BASE_OR_BASE_EXTENSION"]);
export const G5A_U09_P05F46_INCLUDED_RELATIONS=Object.freeze([...new Set([...TRIANGLE_RELATIONS,...TRAPEZOID_RELATIONS])]);
const groupId=kp=>kp===G5A_U09_P05F46_TRIANGLE_KP_ID?"pg_g5a_u09_triangle_area_formula":"pg_g5a_u09_trapezoid_area_formula";
const makeSpec=(kp,id,relation,diagramMode)=>Object.freeze({patternSpecId:id,knowledgePointId:kp,patternGroupId:groupId(kp),patternFamilyId:kp===G5A_U09_P05F46_TRIANGLE_KP_ID?"TRIANGLE_AREA_FORMULA":"TRAPEZOID_AREA_FORMULA",relation,diagramMode,questionMode:"diagram",answerDomain:"AREA_SQUARE_CENTIMETER",requiresDiagramRepresentation:true,requiresFormulaEvaluation:true,requiresPerpendicularHeight:true,divisionByTwoRequired:true,integerDivisionModifierApplied:true,applicationAllowed:false,parallelogramAreaFormulaReowned:false,unknownDimensionAllowed:false,compositePolygonAreaAllowed:false,rhombusSpecificFormulaAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
export const G5A_U09_P05F46_TRIANGLE_PATTERN_SPECS=Object.freeze([
  makeSpec(G5A_U09_P05F46_TRIANGLE_KP_ID,"ps_g5a_u09_triangle_area_base_height",TRIANGLE_RELATIONS[0],"TRIANGLE_BASE_HEIGHT_AREA"),
  makeSpec(G5A_U09_P05F46_TRIANGLE_KP_ID,"ps_g5a_u09_triangle_perpendicular_height",TRIANGLE_RELATIONS[2],"TRIANGLE_PERPENDICULAR_HEIGHT"),
  makeSpec(G5A_U09_P05F46_TRIANGLE_KP_ID,"ps_g5a_u09_triangle_half_parallelogram",TRIANGLE_RELATIONS[1],"TRIANGLE_HALF_PARALLELOGRAM"),
]);
export const G5A_U09_P05F46_TRAPEZOID_PATTERN_SPECS=Object.freeze([
  makeSpec(G5A_U09_P05F46_TRAPEZOID_KP_ID,"ps_g5a_u09_trapezoid_parallel_bases_height",TRAPEZOID_RELATIONS[0],"TRAPEZOID_PARALLEL_BASES_HEIGHT_AREA"),
  makeSpec(G5A_U09_P05F46_TRAPEZOID_KP_ID,"ps_g5a_u09_trapezoid_perpendicular_height",TRAPEZOID_RELATIONS[2],"TRAPEZOID_PERPENDICULAR_HEIGHT"),
  makeSpec(G5A_U09_P05F46_TRAPEZOID_KP_ID,"ps_g5a_u09_trapezoid_pair_parallelogram",TRAPEZOID_RELATIONS[1],"TRAPEZOID_CONGRUENT_PAIR"),
]);
export const G5A_U09_P05F46_PATTERN_SPECS=Object.freeze([...G5A_U09_P05F46_TRAPEZOID_PATTERN_SPECS,...G5A_U09_P05F46_TRIANGLE_PATTERN_SPECS]);
export const G5A_U09_P05F46_SPEC_IDS=Object.freeze(G5A_U09_P05F46_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G5A_U09_P05F46_SPEC_IDS_BY_KP=Object.freeze(Object.fromEntries(G5A_U09_P05F46_KP_IDS.map(kp=>[kp,Object.freeze(G5A_U09_P05F46_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId))])));
const makeMapping=(kp,name,capability,invariant,pages,relations)=>Object.freeze({mappingId:`fm_${kp.replace(/^kp_/,"")}_p05f46`,sourceId:G5A_U09_P05F46_SOURCE_ID,sourcePages:Object.freeze(pages),knowledgePointId:kp,canonicalNameZh:name,capabilityStatement:capability,reasoningInvariant:invariant,relationFamily:kp===G5A_U09_P05F46_TRIANGLE_KP_ID?"TRIANGLE_AREA_FORMULA":"TRAPEZOID_AREA_FORMULA",inputRepresentation:"POLYGON_BASE_HEIGHT_DIAGRAM",answerDomain:"AREA_SQUARE_CENTIMETER",includedRelations:relations,excludedRelations:COMMON_EXCLUDED,applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,requiredW5CapabilityIds:G5A_U09_P05F46_REQUIRED_W5_CAPABILITY_IDS,runtimeDomainCapabilityIds:G5A_U09_P05F46_RUNTIME_DOMAIN_CAPABILITY_IDS,appliedRuntimeModifierIds:Object.freeze(["mod_integer_division"]),patternSpecIds:G5A_U09_P05F46_SPEC_IDS_BY_KP[kp],r02EvidencePages:Object.freeze(pages),selectedHeightMustBePerpendicularToSelectedBaseOrExtension:true,divisionByTwoRequired:true,integerDivisionMustBeExact:true,parallelogramAreaFormulaReowned:false});
export const G5A_U09_P05F46_FORMAL_MAPPINGS=Object.freeze([
  makeMapping(G5A_U09_P05F46_TRAPEZOID_KP_ID,"梯形面積","學生能以上下底和乘高除以2求梯形面積。","兩個全等梯形可拼成底為上下底和的平行四邊形。",[3],TRAPEZOID_RELATIONS),
  makeMapping(G5A_U09_P05F46_TRIANGLE_KP_ID,"三角形面積","學生能以底乘高除以2求三角形面積。","同底等高三角形面積是平行四邊形的一半。",[2],TRIANGLE_RELATIONS),
]);
const makeGroup=(kp,name,tags)=>Object.freeze({patternGroupId:groupId(kp),sourceId:G5A_U09_P05F46_SOURCE_ID,unitCode:G5A_U09_P05F46_UNIT_CODE,unitTitle:G5A_U09_P05F46_UNIT_TITLE,displayName:name,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"triangle_trapezoid_area_formula_diagram",representationTags:Object.freeze(tags),patternSpecIds:G5A_U09_P05F46_SPEC_IDS_BY_KP[kp],allocationPolicy:"balanced_area_formula_relation",visibilityStatus:"visible",holdReason:null});
export const G5A_U09_P05F46_PATTERN_GROUPS=Object.freeze([
  makeGroup(G5A_U09_P05F46_TRAPEZOID_KP_ID,"梯形面積圖形題",["geometry","area","trapezoid","parallel_bases","perpendicular_height","division_by_two"]),
  makeGroup(G5A_U09_P05F46_TRIANGLE_KP_ID,"三角形面積圖形題",["geometry","area","triangle","base_height","perpendicular_height","division_by_two"]),
]);
const row=(kp,name)=>Object.freeze({knowledgePointId:kp,sourceId:G5A_U09_P05F46_SOURCE_ID,unitCode:G5A_U09_P05F46_UNIT_CODE,unitTitle:G5A_U09_P05F46_UNIT_TITLE,displayName:name,canonicalNameZh:name,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([groupId(kp)]),canonicalPatternSpecIds:G5A_U09_P05F46_SPEC_IDS_BY_KP[kp],patternGroupIds:Object.freeze([groupId(kp)]),patternSpecIds:G5A_U09_P05F46_SPEC_IDS_BY_KP[kp],requiredCapabilityIds:G5A_U09_P05F46_RUNTIME_DOMAIN_CAPABILITY_IDS,qaStatusLabel:"P05F46_G5A_U09_SOURCE_BACKED_AREA_FORMULA",productionUse:"full_product_w5_slice046_candidate"});
export const G5A_U09_P05F46_SELECTOR_ROWS=Object.freeze([row(G5A_U09_P05F46_TRAPEZOID_KP_ID,"梯形面積"),row(G5A_U09_P05F46_TRIANGLE_KP_ID,"三角形面積")]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG5AU09P05F46SelectorRow(id){return clone(G5A_U09_P05F46_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);}
export function listG5AU09P05F46PatternGroups(id){return G5A_U09_P05F46_KP_IDS.includes(id)?G5A_U09_P05F46_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id).map(clone):[];}
export function resolveG5AU09P05F46PatternSpecIds(id){return clone(G5A_U09_P05F46_SPEC_IDS_BY_KP[id]??[]);}
export function auditG5AU09P05F46Projection(){const errors=[];if(G5A_U09_P05F46_KP_IDS.length!==2||G5A_U09_P05F46_PATTERN_GROUPS.length!==2||G5A_U09_P05F46_PATTERN_SPECS.length!==6)errors.push("P05F46_CARDINALITY_INVALID");if(new Set(G5A_U09_P05F46_SPEC_IDS).size!==6)errors.push("P05F46_DUPLICATE_SPEC_ID");if(G5A_U09_P05F46_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||!x.requiresDiagramRepresentation||!x.requiresFormulaEvaluation||!x.requiresPerpendicularHeight||!x.divisionByTwoRequired||!x.integerDivisionModifierApplied||x.applicationAllowed||x.parallelogramAreaFormulaReowned||x.unknownDimensionAllowed||x.compositePolygonAreaAllowed))errors.push("P05F46_PATTERN_INVARIANT_INVALID");if(G5A_U09_P05F46_FORMAL_MAPPINGS.some(x=>x.appliedRuntimeModifierIds[0]!=="mod_integer_division"||!x.runtimeDomainCapabilityIds.includes("cap_integer_division")))errors.push("P05F46_INTEGER_DIVISION_BINDING_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:6,diagram:6,application:0})});}
