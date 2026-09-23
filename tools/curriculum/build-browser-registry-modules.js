import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const INPUT_PATHS = Object.freeze({
  knowledgePoints: "data/curriculum/registry/batch_a_knowledge_points.json",
  patternGroups: "data/curriculum/registry/batch_a_pattern_groups.json",
  patternMap: "data/curriculum/registry/batch_a_knowledge_point_pattern_map.json"
});

const OUTPUT_DIR = "site/modules/curriculum/registry";

const OUTPUT_PATHS = Object.freeze({
  knowledgePoints: `${OUTPUT_DIR}/batch-a-knowledge-points.js`,
  patternGroups: `${OUTPUT_DIR}/batch-a-pattern-groups.js`,
  patternMap: `${OUTPUT_DIR}/batch-a-knowledge-point-pattern-map.js`,
  selectorCandidates: `${OUTPUT_DIR}/batch-a-selector-candidates.js`
});

function readJson(relativePath) {
  const absolutePath = path.resolve(ROOT_DIR, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function writeText(relativePath, content) {
  const absolutePath = path.resolve(ROOT_DIR, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function assertRegistryShape(registry, expectedSchemaName, label) {
  if (!registry || typeof registry !== "object") {
    throw new Error(`${label} registry must be an object.`);
  }
  if (registry.schemaName !== expectedSchemaName) {
    throw new Error(`${label} schemaName must be ${expectedSchemaName}.`);
  }
  if (!Number.isInteger(registry.schemaVersion)) {
    throw new Error(`${label} schemaVersion must be an integer.`);
  }
  if (!Array.isArray(registry.sourceScope)) {
    throw new Error(`${label} sourceScope must be an array.`);
  }
  if (!Array.isArray(registry.rows)) {
    throw new Error(`${label} rows must be an array.`);
  }
}

export function loadBatchARegistries() {
  const knowledgePoints = readJson(INPUT_PATHS.knowledgePoints);
  const patternGroups = readJson(INPUT_PATHS.patternGroups);
  const patternMap = readJson(INPUT_PATHS.patternMap);

  assertRegistryShape(knowledgePoints, "BatchAKnowledgePointNode", "KnowledgePoint");
  assertRegistryShape(patternGroups, "BatchAPatternGroup", "PatternGroup");
  assertRegistryShape(patternMap, "BatchAKnowledgePointPatternMap", "KnowledgePointPatternMap");

  return { knowledgePoints, patternGroups, patternMap };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function hasNoHoldReason(row) {
  return row?.holdReason === null || row?.holdReason === undefined;
}

function isVisibleTriplet({ knowledgePoint, patternGroup, mapping }) {
  return knowledgePoint?.htmlSelectableStatus === "selectable"
    && patternGroup?.visibilityStatus === "visible"
    && mapping?.htmlExposurePolicy === "eligible_after_qa"
    && mapping?.qaStatus === "qa_verified"
    && typeof mapping?.patternSpecId === "string"
    && mapping.patternSpecId.length > 0
    && hasNoHoldReason(knowledgePoint)
    && hasNoHoldReason(patternGroup)
    && hasNoHoldReason(mapping)
    && knowledgePoint?.supportClass !== "D"
    && patternGroup?.supportClass !== "D"
    && mapping?.supportClass !== "D";
}

function buildIndexes(registries) {
  const knowledgePointById = new Map(registries.knowledgePoints.rows.map((row) => [row.knowledgePointId, row]));
  const patternGroupById = new Map(registries.patternGroups.rows.map((row) => [row.patternGroupId, row]));
  const mappingsByKnowledgePointId = new Map();
  const mappingsByPatternGroupId = new Map();

  for (const mapping of registries.patternMap.rows) {
    const byKp = mappingsByKnowledgePointId.get(mapping.knowledgePointId) ?? [];
    byKp.push(mapping);
    mappingsByKnowledgePointId.set(mapping.knowledgePointId, byKp);

    const byPg = mappingsByPatternGroupId.get(mapping.patternGroupId) ?? [];
    byPg.push(mapping);
    mappingsByPatternGroupId.set(mapping.patternGroupId, byPg);
  }

  return { knowledgePointById, patternGroupById, mappingsByKnowledgePointId, mappingsByPatternGroupId };
}

function buildVisibleKnowledgePoint({ knowledgePoint, patternGroups, mappings }) {
  const visiblePatternGroupIds = uniqueSorted(patternGroups.map((group) => group.patternGroupId));
  const patternSpecIds = uniqueSorted(mappings.map((mapping) => mapping.patternSpecId));
  return {
    knowledgePointId: knowledgePoint.knowledgePointId,
    sourceId: knowledgePoint.sourceId,
    unitCode: knowledgePoint.unitCode,
    unitTitle: knowledgePoint.unitTitle,
    displayName: knowledgePoint.displayName,
    supportClass: knowledgePoint.supportClass,
    canonicalSkillTag: knowledgePoint.canonicalSkillTag,
    subskillTags: cloneValue(knowledgePoint.subskillTags ?? []),
    difficultyTags: cloneValue(knowledgePoint.difficultyTags ?? []),
    representationTags: cloneValue(knowledgePoint.representationTags ?? []),
    patternGroupIds: visiblePatternGroupIds,
    patternSpecIds,
    qaStatusLabel: "qa_verified"
  };
}

export function buildSelectorProjection(registries) {
  const indexes = buildIndexes(registries);
  const visibleKnowledgePoints = [];
  const visiblePatternGroupsByKnowledgePointId = new Map();
  const visibleMappingsByKnowledgePointId = new Map();
  const availabilityBySource = new Map();

  for (const knowledgePoint of registries.knowledgePoints.rows) {
    const sourceEntry = availabilityBySource.get(knowledgePoint.sourceId) ?? {
      sourceId: knowledgePoint.sourceId,
      visibleCount: 0,
      hiddenPendingCount: 0,
      notSelectableCount: 0
    };

    const mappings = indexes.mappingsByKnowledgePointId.get(knowledgePoint.knowledgePointId) ?? [];
    const visibleTriplets = [];

    for (const mapping of mappings) {
      const patternGroup = indexes.patternGroupById.get(mapping.patternGroupId);
      if (isVisibleTriplet({ knowledgePoint, patternGroup, mapping })) {
        visibleTriplets.push({ patternGroup, mapping });
      }
    }

    if (visibleTriplets.length > 0) {
      const patternGroups = visibleTriplets.map((triplet) => triplet.patternGroup);
      const visibleMappings = visibleTriplets.map((triplet) => triplet.mapping);
      visibleKnowledgePoints.push(buildVisibleKnowledgePoint({ knowledgePoint, patternGroups, mappings: visibleMappings }));
      visiblePatternGroupsByKnowledgePointId.set(knowledgePoint.knowledgePointId, patternGroups);
      visibleMappingsByKnowledgePointId.set(knowledgePoint.knowledgePointId, visibleMappings);
      sourceEntry.visibleCount += 1;
    } else if (knowledgePoint.htmlSelectableStatus === "not_selectable" || knowledgePoint.supportClass === "D") {
      sourceEntry.notSelectableCount += 1;
    } else {
      sourceEntry.hiddenPendingCount += 1;
    }

    availabilityBySource.set(knowledgePoint.sourceId, sourceEntry);
  }

  const bySourceId = Object.fromEntries([...availabilityBySource.entries()].sort(([left], [right]) => left.localeCompare(right)));
  const visibleCount = visibleKnowledgePoints.length;
  const hiddenPendingCount = Object.values(bySourceId).reduce((sum, entry) => sum + entry.hiddenPendingCount, 0);
  const notSelectableCount = Object.values(bySourceId).reduce((sum, entry) => sum + entry.notSelectableCount, 0);

  return {
    metadata: {
      schemaName: "BatchABrowserSelectorProjection",
      schemaVersion: 1,
      generatedFrom: cloneValue(INPUT_PATHS),
      sourceScope: uniqueSorted([
        ...registries.knowledgePoints.sourceScope,
        ...registries.patternGroups.sourceScope,
        ...registries.patternMap.sourceScope
      ]),
      sourceRegistryStatus: {
        knowledgePoints: registries.knowledgePoints.registryStatus,
        patternGroups: registries.patternGroups.registryStatus,
        patternMap: registries.patternMap.registryStatus
      },
      task: "S43D6_BrowserRegistryModuleGenerationImplementation"
    },
    availability: { visibleCount, hiddenPendingCount, notSelectableCount, bySourceId },
    visibleKnowledgePoints: visibleKnowledgePoints.sort((left, right) => left.knowledgePointId.localeCompare(right.knowledgePointId)),
    visiblePatternGroupsByKnowledgePointId: Object.fromEntries([...visiblePatternGroupsByKnowledgePointId.entries()].sort(([left], [right]) => left.localeCompare(right))),
    visibleMappingsByKnowledgePointId: Object.fromEntries([...visibleMappingsByKnowledgePointId.entries()].sort(([left], [right]) => left.localeCompare(right)))
  };
}

function moduleHeader() {
  return [
    "// Auto-generated by tools/curriculum/build-browser-registry-modules.js.",
    "// Do not edit manually. Regenerate from data/curriculum/registry/*.json.",
    ""
  ].join("\n");
}

function jsValue(value) {
  return JSON.stringify(value, null, 2);
}

function registryModule({ exportName, rowsExportName, listFunctionName, getFunctionName, idField, registry }) {
  return `${moduleHeader()}function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function deepFreeze(value) {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return Object.freeze(value);
}

export const ${exportName} = deepFreeze(${jsValue({
    schemaName: registry.schemaName,
    schemaVersion: registry.schemaVersion,
    registryStatus: registry.registryStatus,
    sourceScope: registry.sourceScope,
    task: registry.task,
    generatedBy: "S43D6_BrowserRegistryModuleGenerationImplementation"
  })});

const ${rowsExportName} = deepFreeze(${jsValue(registry.rows)});

export function ${listFunctionName}() {
  return cloneValue(${rowsExportName});
}

export function ${getFunctionName}(id) {
  const row = ${rowsExportName}.find((entry) => entry.${idField} === id);
  return row ? cloneValue(row) : null;
}
`;
}

function selectorCandidatesModule(projection) {
  return `${moduleHeader()}function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function deepFreeze(value) {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return Object.freeze(value);
}

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = deepFreeze(${jsValue(projection.metadata)});

export const BATCH_A_SELECTOR_AVAILABILITY = deepFreeze(${jsValue(projection.availability)});

const VISIBLE_KNOWLEDGE_POINTS = deepFreeze(${jsValue(projection.visibleKnowledgePoints)});
const VISIBLE_PATTERN_GROUPS_BY_KP = deepFreeze(${jsValue(projection.visiblePatternGroupsByKnowledgePointId)});
const VISIBLE_MAPPINGS_BY_KP = deepFreeze(${jsValue(projection.visibleMappingsByKnowledgePointId)});

export function listVisibleBatchAKnowledgePoints() {
  return cloneValue(VISIBLE_KNOWLEDGE_POINTS);
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId?.[sourceId];
  return entry ? cloneValue(entry) : { sourceId, visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0 };
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  const row = VISIBLE_KNOWLEDGE_POINTS.find((entry) => entry.knowledgePointId === knowledgePointId);
  return row ? cloneValue(row) : null;
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return cloneValue(VISIBLE_PATTERN_GROUPS_BY_KP[knowledgePointId] ?? []);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const mappings = VISIBLE_MAPPINGS_BY_KP[knowledgePointId] ?? [];
  return [...new Set(mappings.map((mapping) => mapping.patternSpecId).filter(Boolean))].sort();
}
`;
}

export function buildBrowserRegistryModuleContents(registries = loadBatchARegistries()) {
  const projection = buildSelectorProjection(registries);
  return {
    [OUTPUT_PATHS.knowledgePoints]: registryModule({
      exportName: "BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA",
      rowsExportName: "KNOWLEDGE_POINT_ROWS",
      listFunctionName: "listBatchAKnowledgePointRows",
      getFunctionName: "getBatchAKnowledgePointRow",
      idField: "knowledgePointId",
      registry: registries.knowledgePoints
    }),
    [OUTPUT_PATHS.patternGroups]: registryModule({
      exportName: "BATCH_A_PATTERN_GROUP_REGISTRY_METADATA",
      rowsExportName: "PATTERN_GROUP_ROWS",
      listFunctionName: "listBatchAPatternGroupRows",
      getFunctionName: "getBatchAPatternGroupRow",
      idField: "patternGroupId",
      registry: registries.patternGroups
    }),
    [OUTPUT_PATHS.patternMap]: registryModule({
      exportName: "BATCH_A_KNOWLEDGE_POINT_PATTERN_MAP_METADATA",
      rowsExportName: "KNOWLEDGE_POINT_PATTERN_MAP_ROWS",
      listFunctionName: "listBatchAKnowledgePointPatternMapRows",
      getFunctionName: "getBatchAKnowledgePointPatternMapRow",
      idField: "mappingId",
      registry: registries.patternMap
    }),
    [OUTPUT_PATHS.selectorCandidates]: selectorCandidatesModule(projection)
  };
}

export function writeBrowserRegistryModules() {
  const contents = buildBrowserRegistryModuleContents(loadBatchARegistries());
  for (const [relativePath, content] of Object.entries(contents)) {
    writeText(relativePath, content);
  }
  return Object.keys(contents);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const written = writeBrowserRegistryModules();
  for (const relativePath of written) {
    console.log(`wrote ${relativePath}`);
  }
}
