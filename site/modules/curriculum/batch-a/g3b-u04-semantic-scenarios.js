import { G3B_U04_SEMANTIC_DOMAIN_ROWS } from "./g3b-u04-semantic-domain-rows.js";
import { G3B_U04_SEMANTIC_ROLE_ROWS } from "./g3b-u04-semantic-role-rows.js";
import { G3B_U04_SEMANTIC_SCENARIO_ROWS } from "./g3b-u04-semantic-scenario-rows.js";

const SOURCE_ID = "g3b_u04_3b04";
const UNIT_CODE = "3B-U04";

const ROLE_FIELDS = Object.freeze([
  "semanticRole",
  "roleType",
  "unitDimension",
  "min",
  "max",
  "boundSource"
]);

const DOMAIN_FIELDS = Object.freeze([
  "domainProfileId",
  "contextDomain",
  "sceneLabel",
  "objectLabel",
  "itemUnit",
  "packageUnit",
  "measureUnit",
  "capacityUnit",
  "containerUnit",
  "largePackUnit",
  "smallPackUnit",
  "pairItem1",
  "pairItem2",
  "comparisonObject1",
  "comparisonObject2",
  "comparisonObject3",
  "liquidLabel"
]);

const SCENARIO_FIELDS = Object.freeze([
  "scenarioProfileId",
  "templateFamilyId",
  "knowledgePointId",
  "semanticSignature",
  "equationShape",
  "unknownRole",
  "allowedContextDomains",
  "profileClass",
  "scenarioSubtype",
  "quantityRoleBindings",
  "placeholderSchema",
  "ownershipModel",
  "unitFlowModel",
  "realismProfileRef"
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function rowToObject(fields, row) {
  if (!Array.isArray(row) || row.length !== fields.length) {
    throw new Error(`S57E2 row width mismatch: expected ${fields.length}, received ${row?.length ?? "none"}.`);
  }
  return Object.fromEntries(fields.map((field, index) => [field, row[index]]));
}

export const G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS = deepFreeze({
  countable_objects_and_packaging: {
    allowedActions: ["合併", "分配", "分裝", "包裝", "保留", "使用", "補充", "排列"],
    forbiddenActions: ["把不可數物當成單件", "混用物件數與包裝數", "非整除時宣稱平均分完"],
    realismProfileRef: "realism_g3b_u04_packages_and_groups"
  },
  money_and_shared_payment: {
    allowedActions: ["合買", "平均分擔", "購買", "加購", "贈送", "計算平均成本", "支付"],
    forbiddenActions: ["把總費用當成個人費用", "把售價當成成本", "付費數量大於收到數量卻稱為贈品"],
    realismProfileRef: "realism_g3b_u04_money_and_promotion"
  },
  capacity_and_same_substance_combining: {
    allowedActions: ["倒在一起", "平均分裝", "量取", "裝瓶"],
    forbiddenActions: ["混合不同物質後仍稱同一種液體", "混用容量與物件個數", "容器容量為零或負數"],
    realismProfileRef: "realism_g3b_u04_liquid_containers"
  },
  group_team_tray_formation: {
    allowedActions: ["分組", "組隊", "裝盤", "參賽", "送出", "保留"],
    forbiddenActions: ["把人數直接當隊數", "把物品數直接當盤數", "未完成分組就扣除隊數或盤數"],
    realismProfileRef: "realism_g3b_u04_packages_and_groups"
  },
  multiplicative_comparison_objects: {
    allowedActions: ["比較倍數", "建立關係鏈", "換算等值數量", "推算最終量"],
    forbiddenActions: ["顛倒倍數方向", "跨不同量綱比較倍數", "把倍數當成物件數答案"],
    realismProfileRef: "realism_g3b_u04_multiplicative_relationship"
  },
  family_age_chain: {
    allowedActions: ["比較年齡倍數", "推算家人年齡"],
    forbiddenActions: ["年齡順序顛倒", "兒童或家長年齡超出合理範圍", "把歲數當成物件數"],
    realismProfileRef: "realism_g3b_u04_age"
  },
  production_common_period: {
    allowedActions: ["比較同時段產量", "推算工作臺產量", "完成包裝或印刷"],
    forbiddenActions: ["比較不同未說明時段的產量", "把每段時間產量當成累積多時段產量", "產量為零或負數"],
    realismProfileRef: "realism_g3b_u04_production_common_period"
  }
});

export const G3B_U04_SEMANTIC_REALISM_PROFILES = deepFreeze({
  realism_g3b_u04_general_positive_integer: {
    numberDomain: "positive_integers",
    minimum: 1,
    maximum: 10000,
    negativeAllowed: false,
    decimalAllowed: false,
    fractionAllowed: false
  },
  realism_g3b_u04_age: {
    baseChildAge: { min: 6, max: 12 },
    siblingAge: { min: 10, max: 24 },
    parentAge: { min: 25, max: 60 },
    ordering: "baseChildAge<siblingAge<parentAge"
  },
  realism_g3b_u04_money_and_promotion: {
    minimumPaidItems: 1,
    minimumBonusItems: 1,
    maximumReceivedItems: 20,
    averagePriceMustNotExceedUnitPrice: true,
    currencyUnit: "元"
  },
  realism_g3b_u04_packages_and_groups: {
    itemsPerPackageMin: 2,
    itemsPerPackageMax: 50,
    packageClassifierMustMatchObject: true,
    groupCountPositive: true
  },
  realism_g3b_u04_liquid_containers: {
    allowedUnits: ["毫升", "公升"],
    sameSubstanceBeforeCombining: true,
    positiveCapacityPerContainer: true
  },
  realism_g3b_u04_multiplicative_relationship: {
    multiplierMin: 2,
    multiplierMax: 9,
    relationshipDirectionMustBeExplicit: true,
    sameMeasureDimensionRequired: true
  },
  realism_g3b_u04_production_common_period: {
    sameTimePeriodRequired: true,
    positiveOutputPerPeriod: true,
    maximumOutput: 10000
  }
});

export const G3B_U04_SEMANTIC_ROLE_DEFINITIONS = deepFreeze(
  G3B_U04_SEMANTIC_ROLE_ROWS.map((row) => ({
    ...rowToObject(ROLE_FIELDS, row),
    integerOnly: true,
    positiveRequired: true,
    status: "registered_hidden_runtime_candidate"
  }))
);

export const G3B_U04_SEMANTIC_DOMAIN_PROFILES = deepFreeze(
  G3B_U04_SEMANTIC_DOMAIN_ROWS.map((row) => ({
    ...rowToObject(DOMAIN_FIELDS, row),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    status: "registered_hidden_runtime_candidate"
  }))
);

export const G3B_U04_SEMANTIC_SCENARIO_PROFILES = deepFreeze(
  G3B_U04_SEMANTIC_SCENARIO_ROWS.map((row) => ({
    ...rowToObject(SCENARIO_FIELDS, row),
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    status: "approved_hidden_runtime_candidate"
  }))
);

const roleByName = new Map(G3B_U04_SEMANTIC_ROLE_DEFINITIONS.map((role) => [role.semanticRole, role]));
const domainByName = new Map(G3B_U04_SEMANTIC_DOMAIN_PROFILES.map((profile) => [profile.contextDomain, profile]));
const scenarioById = new Map(G3B_U04_SEMANTIC_SCENARIO_PROFILES.map((profile) => [profile.scenarioProfileId, profile]));
const scenarioByFamily = new Map(G3B_U04_SEMANTIC_SCENARIO_PROFILES.map((profile) => [profile.templateFamilyId, profile]));

function defaultLiquidLabel(domain) {
  if (domain.liquidLabel) return domain.liquidLabel;
  if (/[水汁奶湯]/.test(domain.objectLabel)) return domain.objectLabel;
  return "飲用水";
}

function allPlaceholderValues(domain) {
  return {
    item: domain.objectLabel,
    item1: domain.pairItem1,
    item2: domain.pairItem2,
    itemUnit: domain.itemUnit ?? "個",
    recipient: "學生",
    recipientUnit: "位",
    currencyUnit: "元",
    capacityUnit: domain.capacityUnit ?? "毫升",
    containerUnit: domain.containerUnit ?? domain.packageUnit ?? "瓶",
    liquid: defaultLiquidLabel(domain),
    largePackUnit: domain.largePackUnit ?? "箱",
    smallPackUnit: domain.smallPackUnit ?? "包",
    measureUnit: domain.measureUnit ?? domain.capacityUnit ?? domain.itemUnit ?? "個",
    packageUnit: domain.packageUnit ?? "盒",
    packUnit: domain.packageUnit ?? "盒",
    person: "小安",
    person1: "小安",
    person2: "小美",
    person3: "小杰",
    baseObject: domain.comparisonObject1,
    middleObject: domain.comparisonObject2,
    finalObject: domain.comparisonObject3,
    baseContainer: domain.comparisonObject1,
    middleContainer: domain.comparisonObject2,
    finalContainer: domain.comparisonObject3,
    baseItem: domain.pairItem1,
    middleItem: domain.pairItem2,
    finalItem: domain.objectLabel,
    baseUnit: domain.itemUnit ?? "個",
    middleUnit: domain.packageUnit ?? "盒",
    finalUnit: domain.largePackUnit ?? "箱",
    child: "小安",
    sibling: "哥哥",
    parent: "媽媽"
  };
}

function bindPlaceholders(scenario, domain) {
  const values = allPlaceholderValues(domain);
  const output = {};
  for (const placeholder of scenario.placeholderSchema) {
    const value = values[placeholder];
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`S57E2 unresolved placeholder '${placeholder}' for ${scenario.templateFamilyId}/${domain.contextDomain}.`);
    }
    output[placeholder] = value;
  }
  return output;
}

function bindQuantityRoles(scenario) {
  return Object.fromEntries(Object.entries(scenario.quantityRoleBindings).map(([symbol, semanticRole]) => {
    const role = roleByName.get(semanticRole);
    if (!role) throw new Error(`S57E2 unregistered semantic role '${semanticRole}' in ${scenario.templateFamilyId}.`);
    return [symbol, role];
  }));
}

export function getG3BU04SemanticRoleDefinition(semanticRole) {
  return roleByName.get(semanticRole) ?? null;
}

export function getG3BU04SemanticDomainProfile(contextDomain) {
  return domainByName.get(contextDomain) ?? null;
}

export function getG3BU04SemanticScenarioProfile(scenarioProfileId) {
  return scenarioById.get(scenarioProfileId) ?? null;
}

export function listG3BU04SemanticRoleDefinitions() {
  return [...G3B_U04_SEMANTIC_ROLE_DEFINITIONS];
}

export function listG3BU04SemanticDomainProfiles() {
  return [...G3B_U04_SEMANTIC_DOMAIN_PROFILES];
}

export function listG3BU04SemanticScenarioProfiles() {
  return [...G3B_U04_SEMANTIC_SCENARIO_PROFILES];
}

export function listG3BU04ScenarioProfilesForFamily(templateFamilyId) {
  const scenario = scenarioByFamily.get(templateFamilyId);
  if (!scenario) return [];
  return scenario.allowedContextDomains.map((contextDomain) => resolveG3BU04SemanticScenarioProfile(templateFamilyId, contextDomain));
}

export function listG3BU04ScenarioProfilesForContext(contextDomain) {
  if (!domainByName.has(contextDomain)) return [];
  return G3B_U04_SEMANTIC_SCENARIO_PROFILES
    .filter((scenario) => scenario.allowedContextDomains.includes(contextDomain))
    .map((scenario) => resolveG3BU04SemanticScenarioProfile(scenario.templateFamilyId, contextDomain));
}

export function resolveG3BU04SemanticScenarioProfile(templateFamilyId, contextDomain) {
  const scenario = scenarioByFamily.get(templateFamilyId);
  const domain = domainByName.get(contextDomain);
  if (!scenario || !domain || !scenario.allowedContextDomains.includes(contextDomain)) return null;
  const profileClass = G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS[scenario.profileClass];
  if (!profileClass) throw new Error(`S57E2 unregistered profile class '${scenario.profileClass}'.`);
  if (profileClass.realismProfileRef !== scenario.realismProfileRef) {
    throw new Error(`S57E2 realism profile drift in ${scenario.templateFamilyId}.`);
  }
  const quantityBounds = bindQuantityRoles(scenario);
  const placeholderBindings = bindPlaceholders(scenario, domain);
  return deepFreeze({
    scenarioProfileId: scenario.scenarioProfileId,
    scenarioId: `${scenario.scenarioProfileId}__${contextDomain}`,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    templateFamilyId: scenario.templateFamilyId,
    knowledgePointId: scenario.knowledgePointId,
    semanticSignature: scenario.semanticSignature,
    equationShape: scenario.equationShape,
    unknownRole: scenario.unknownRole,
    contextDomain,
    profileClass: scenario.profileClass,
    scenarioSubtype: scenario.scenarioSubtype,
    sceneLabel: domain.sceneLabel,
    objectLabel: domain.objectLabel,
    itemUnit: domain.itemUnit,
    recipientUnit: placeholderBindings.recipientUnit ?? null,
    packageUnit: domain.packageUnit,
    measureUnit: domain.measureUnit ?? domain.capacityUnit ?? domain.itemUnit,
    capacityUnit: domain.capacityUnit,
    containerUnit: domain.containerUnit ?? domain.packageUnit,
    currencyUnit: placeholderBindings.currencyUnit ?? null,
    largePackUnit: domain.largePackUnit,
    smallPackUnit: domain.smallPackUnit,
    placeholderBindings,
    quantityRoleBindings: { ...scenario.quantityRoleBindings },
    quantityBounds,
    allowedActions: [...profileClass.allowedActions],
    forbiddenActions: [...profileClass.forbiddenActions],
    ownershipModel: scenario.ownershipModel,
    unitFlowModel: scenario.unitFlowModel,
    realismProfileRef: scenario.realismProfileRef,
    realismProfile: G3B_U04_SEMANTIC_REALISM_PROFILES[scenario.realismProfileRef],
    selectorStatus: "hidden",
    generatorRouting: "not_implemented_in_s57e2",
    productionUse: "forbidden",
    status: "approved_hidden_runtime_candidate"
  });
}

export const G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY = deepFreeze({
  schemaName: "G3BU04SemanticScenarioRoleRegistry",
  schemaVersion: 3,
  task: "S57E2_G3B_U04_SemanticScenarioAndRoleRegistry",
  sourceId: SOURCE_ID,
  unitCode: UNIT_CODE,
  registryStatus: "authoritative_compact_hidden_not_routed",
  policy: {
    nounBankOnlyForbidden: true,
    allPromptPlaceholdersMustResolve: true,
    allQuantityRolesMustBeRegistered: true,
    unitClassifierActionCompatibilityRequired: true,
    selectorVisibility: "hidden",
    generatorRouting: "not_implemented_in_s57e2",
    productionUse: "forbidden"
  },
  requiredProfileClasses: Object.keys(G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS),
  profileClassDefinitions: G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS,
  realismProfiles: G3B_U04_SEMANTIC_REALISM_PROFILES,
  semanticRoles: G3B_U04_SEMANTIC_ROLE_DEFINITIONS,
  domainProfiles: G3B_U04_SEMANTIC_DOMAIN_PROFILES,
  scenarioProfiles: G3B_U04_SEMANTIC_SCENARIO_PROFILES,
  summary: {
    scenarioProfileCount: 32,
    domainVariantCount: 117,
    semanticRoleCount: 77,
    domainProfileCount: 77,
    templateFamilyCount: 32,
    knowledgePointCount: 9,
    contextDomainCount: 77,
    profileClassCount: 7,
    uncoveredFamilyCount: 0,
    uncoveredContextDomainCount: 0,
    unresolvedPlaceholderCount: 0,
    unregisteredRoleCount: 0,
    selectorVisibleCount: 0,
    productionReadyCount: 0,
    runtimeProjectionMaterialized: true,
    runtimeProjectionRouted: false
  }
});
