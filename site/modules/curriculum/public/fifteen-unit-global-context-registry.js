function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const FIFTEEN_UNIT_GLOBAL_CONTEXT_REGISTRY_ID = "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1";

export const FIFTEEN_UNIT_GLOBAL_CONTEXT_FAMILIES = deepFreeze([
  { contextFamilyId: "gctx_school_library", domain: "school", displayNameZh: "校園圖書館", sdgTags: ["SDG4"] },
  { contextFamilyId: "gctx_class_activity", domain: "school", displayNameZh: "班級活動", sdgTags: ["SDG4"] },
  { contextFamilyId: "gctx_sports_practice", domain: "health", displayNameZh: "運動練習", sdgTags: ["SDG3"] },
  { contextFamilyId: "gctx_community_service", domain: "community", displayNameZh: "社區服務", sdgTags: ["SDG11"] },
  { contextFamilyId: "gctx_recycling", domain: "environment", displayNameZh: "資源回收", sdgTags: ["SDG12"] },
  { contextFamilyId: "gctx_water_saving", domain: "environment", displayNameZh: "節約用水", sdgTags: ["SDG6"] },
  { contextFamilyId: "gctx_energy_saving", domain: "environment", displayNameZh: "節約能源", sdgTags: ["SDG7"] },
  { contextFamilyId: "gctx_food_distribution", domain: "daily_life", displayNameZh: "食物分配", sdgTags: ["SDG2"] },
  { contextFamilyId: "gctx_shopping_budget", domain: "daily_life", displayNameZh: "購物與預算", sdgTags: ["SDG12"] },
  { contextFamilyId: "gctx_transport_trip", domain: "transport", displayNameZh: "交通與行程", sdgTags: ["SDG11"] },
  { contextFamilyId: "gctx_science_observation", domain: "science", displayNameZh: "科學觀察", sdgTags: ["SDG9"] },
  { contextFamilyId: "gctx_agriculture_production", domain: "agriculture", displayNameZh: "農業與生產", sdgTags: ["SDG2"] },
  { contextFamilyId: "gctx_charity_donation", domain: "community", displayNameZh: "公益與捐贈", sdgTags: ["SDG10"] },
  { contextFamilyId: "gctx_cultural_event", domain: "culture", displayNameZh: "文化活動", sdgTags: ["SDG11"] },
  { contextFamilyId: "gctx_disaster_preparation", domain: "safety", displayNameZh: "防災準備", sdgTags: ["SDG11", "SDG13"] }
]);

const familyById = new Map(FIFTEEN_UNIT_GLOBAL_CONTEXT_FAMILIES.map((row) => [row.contextFamilyId, row]));

const compatibility = deepFreeze({
  g3a_u01_3a01: ["gctx_shopping_budget", "gctx_school_library", "gctx_charity_donation"],
  g3a_u02_3a02: ["gctx_recycling", "gctx_school_library", "gctx_community_service"],
  g3a_u03_3a03: ["gctx_agriculture_production", "gctx_food_distribution", "gctx_sports_practice"],
  g3a_u06_3a06: ["gctx_water_saving", "gctx_food_distribution", "gctx_class_activity"],
  g3b_u01_3b01: ["gctx_food_distribution", "gctx_class_activity", "gctx_community_service"],
  g3b_u04_3b04: ["gctx_class_activity", "gctx_sports_practice", "gctx_community_service", "gctx_cultural_event", "gctx_disaster_preparation"],
  g3b_u08_3b08: ["gctx_shopping_budget", "gctx_agriculture_production", "gctx_recycling"],
  g4a_u01_4a01: ["gctx_transport_trip", "gctx_charity_donation", "gctx_science_observation"],
  g4a_u02_4a02: ["gctx_recycling", "gctx_agriculture_production", "gctx_cultural_event"],
  g4a_u04_4a04: ["gctx_food_distribution", "gctx_water_saving", "gctx_disaster_preparation"],
  g4a_u08_4a08: ["gctx_shopping_budget", "gctx_class_activity", "gctx_community_service", "gctx_energy_saving"],
  g4b_u01_4b01: ["gctx_agriculture_production", "gctx_transport_trip", "gctx_recycling"],
  g5a_u08_5a08: ["gctx_shopping_budget", "gctx_energy_saving", "gctx_community_service", "gctx_cultural_event"],
  g4b_u04_4b04: ["gctx_transport_trip", "gctx_shopping_budget", "gctx_disaster_preparation"],
  g5a_u02_5a02: ["gctx_class_activity", "gctx_recycling", "gctx_cultural_event"]
});

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "15-unit-global-context")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0;
}

export function listCompatibleFifteenUnitGlobalContexts(sourceId) {
  return (compatibility[sourceId] ?? []).map((id) => familyById.get(id)).filter(Boolean);
}

export function selectFifteenUnitGlobalContext({ sourceId, generationSeed = "public", sequenceNumber = 1 } = {}) {
  const candidates = listCompatibleFifteenUnitGlobalContexts(sourceId);
  if (candidates.length === 0) return null;
  const index = hashSeed(`${sourceId}:${generationSeed}:${sequenceNumber}`) % candidates.length;
  return candidates[index];
}

export function buildFifteenUnitGlobalContextLineage({ sourceId, generationSeed, sequenceNumber, patternSpecId } = {}) {
  const family = selectFifteenUnitGlobalContext({ sourceId, generationSeed, sequenceNumber });
  if (!family) return null;
  return deepFreeze({
    registryId: FIFTEEN_UNIT_GLOBAL_CONTEXT_REGISTRY_ID,
    contextFamilyId: family.contextFamilyId,
    contextDomain: family.domain,
    displayNameZh: family.displayNameZh,
    sdgTags: [...family.sdgTags],
    sourceId,
    patternSpecId: patternSpecId ?? null,
    runtimeResolvable: true,
    productionSelectable: true,
    publicQuerySelectable: true,
    productionUse: "allowed"
  });
}
