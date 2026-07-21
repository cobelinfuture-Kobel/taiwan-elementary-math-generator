import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = 'data/curriculum/context/registry/global-context-fusion-population-index.json';
const LEGACY_PATH = 'data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json';
const FINGERPRINT_COMPONENTS = [
  'macroContextId',
  'mesoSituationId',
  'microScenarioId',
  'atomicEpisodeId',
  'eventGoal',
  'actorRelationship',
  'resourceRoleSet',
  'constraintModel',
  'targetRole',
  'interpretiveAct',
  'decisionModel'
];

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;
const mergeUnique = (...arrays) => [...new Set(arrays.flat().filter(Boolean))];

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function episodeBaseId(microScenarioId) {
  return microScenarioId.replace(/^gctx_micro_/, 'gctx_episode_');
}

function materializeMacro(raw) {
  return {
    schemaVersion: 1,
    nodeId: raw.nodeId,
    nodeType: 'MACRO_CONTEXT_DOMAIN',
    labelZh: raw.labelZh,
    descriptionZh: raw.descriptionZh,
    parentNodeId: null,
    facetRefs: raw.facetRefs,
    lifecycle: 'SEMANTIC_REVIEW_READY',
    sourceRefs: ['data/curriculum/context/registry/global-context-fusion-population-index.json']
  };
}

function materializeSituation(seed, profiles) {
  const sourceRefs = seed.sourceRefs;
  const legacyFamilyRefs = seed.legacyFamilyRef ? [seed.legacyFamilyRef] : [];
  const meso = {
    schemaVersion: 1,
    nodeId: seed.mesoSituationId,
    nodeType: 'MESO_SITUATION_FAMILY',
    labelZh: seed.mesoLabelZh,
    descriptionZh: seed.mesoDescriptionZh || `${seed.mesoLabelZh}的中情境家族。`,
    parentNodeId: seed.macroContextId,
    facetRefs: seed.facetRefs,
    legacyFamilyRefs,
    lifecycle: seed.legacyFamilyRef ? 'MAPPED_FROM_LEGACY' : 'SEMANTIC_REVIEW_READY',
    sourceRefs
  };
  const micro = {
    schemaVersion: 1,
    nodeId: seed.microScenarioId,
    nodeType: 'MICRO_EVENT_SCENARIO',
    labelZh: seed.microLabelZh,
    descriptionZh: seed.microDescriptionZh || `${seed.microLabelZh}的小情境事件。`,
    parentNodeId: seed.mesoSituationId,
    eventGoal: seed.eventGoal,
    actorRoles: seed.actorRoles,
    actorRelationship: seed.actorRelationship || `${seed.actorRoles.join('與')}共同完成任務`,
    resourceRoles: seed.resourceRoles,
    eventFlow: seed.eventFlow,
    constraintModel: seed.constraintModel,
    facetRefs: seed.facetRefs,
    legacyFamilyRefs,
    lifecycle: seed.legacyFamilyRef ? 'MAPPED_FROM_LEGACY' : 'SEMANTIC_REVIEW_READY',
    sourceRefs
  };
  const episodes = [];
  const surfaces = [];
  for (const profile of profiles) {
    const episodeId = `${episodeBaseId(seed.microScenarioId)}_${profile.episodeSuffix}`;
    const mode = profile.profileId === 'DIRECT_QUANTITY' ? 'direct' : 'decision';
    const generatedTemplateId = `${seed.surfaceTemplatePrefix}_${mode}_01`;
    const legacyTemplates = seed.legacySurfaceTemplateIds ?? [];
    const surfaceTemplateRefs = mergeUnique([generatedTemplateId], legacyTemplates);
    const episode = {
      schemaVersion: 1,
      nodeId: episodeId,
      nodeType: 'ATOMIC_TASK_EPISODE',
      labelZh: `${seed.microLabelZh}－${profile.profileId === 'DIRECT_QUANTITY' ? '直接數量任務' : '限制判斷任務'}`,
      descriptionZh: `${seed.microDescriptionZh || seed.microLabelZh}，以${profile.profileId}形成可綁定的微觀任務。`,
      parentNodeId: seed.microScenarioId,
      eventGoal: seed.eventGoal,
      actorRoles: seed.actorRoles,
      actorRelationship: seed.actorRelationship || `${seed.actorRoles.join('與')}共同完成任務`,
      resourceRoles: seed.resourceRoles,
      eventFlow: seed.eventFlow,
      constraintModel: seed.constraintModel,
      targetRoles: mergeUnique(seed.targetRoles, [profile.targetRole]),
      interpretiveActs: mergeUnique(seed.interpretiveActs, [profile.interpretiveAct]),
      decisionModels: mergeUnique(seed.decisionModels, [profile.decisionModel]),
      requiredContextAffordances: mergeUnique(seed.requiredContextAffordances, profile.requiredContextAffordances),
      compatibleOperationFamilies: mergeUnique(seed.compatibleOperationFamilies, profile.compatibleOperationFamilies),
      surfaceTemplateRefs,
      facetRefs: seed.facetRefs,
      legacyFamilyRefs,
      sourcePolicy: seed.sourcePolicy,
      ...(seed.currentAffairsAnchorRefs ? { currentAffairsAnchorRefs: seed.currentAffairsAnchorRefs } : {}),
      semanticFingerprintComponents: FINGERPRINT_COMPONENTS,
      lifecycle: seed.legacyFamilyRef ? 'MAPPED_FROM_LEGACY' : 'SEMANTIC_REVIEW_READY',
      sourceRefs
    };
    const surface = {
      schemaVersion: 1,
      templateId: generatedTemplateId,
      atomicEpisodeId: episodeId,
      mode: profile.profileId,
      textZh: profile.profileId === 'DIRECT_QUANTITY'
        ? `在{{place}}，{{actor}}為了${seed.eventGoal}，依照{{quantityFacts}}求出{{targetQuantity}}。`
        : `在{{place}}，{{actor}}需要遵守{{constraint}}完成${seed.eventGoal}。根據{{quantityFacts}}，判斷{{targetDecision}}。`,
      requiredSlots: profile.profileId === 'DIRECT_QUANTITY'
        ? ['place', 'actor', 'quantityFacts', 'targetQuantity']
        : ['place', 'actor', 'constraint', 'quantityFacts', 'targetDecision'],
      createsNewScenarioIdentity: false,
      productionSelectable: false,
      sourceRefs
    };
    episodes.push(episode);
    surfaces.push(surface);
  }
  return { meso, micro, episodes, surfaces };
}

export function materializeGlobalContextAuthority(raw) {
  const macroDomains = raw.populationIndex.macroDomains.map(materializeMacro);
  const mesoSituationFamilies = [];
  const microEventScenarios = [];
  const atomicTaskEpisodes = [];
  const surfaceRealizations = [];
  for (const seed of raw.situationSeeds) {
    const materialized = materializeSituation(seed, raw.populationIndex.materializationProfiles);
    mesoSituationFamilies.push(materialized.meso);
    microEventScenarios.push(materialized.micro);
    atomicTaskEpisodes.push(...materialized.episodes);
    surfaceRealizations.push(...materialized.surfaces);
  }
  return {
    ...raw,
    hierarchy: {
      macroDomains,
      mesoSituationFamilies,
      microEventScenarios,
      atomicTaskEpisodes
    },
    surfaceRealizations
  };
}

export function validateGlobalContextAuthority(authority) {
  const issues = [];
  const { hierarchy } = authority;
  const allNodes = [
    ...hierarchy.macroDomains,
    ...hierarchy.mesoSituationFamilies,
    ...hierarchy.microEventScenarios,
    ...hierarchy.atomicTaskEpisodes
  ];
  const nodeIds = allNodes.map((row) => row.nodeId);
  if (!unique(nodeIds)) issues.push(issue('GCTX_NODE_ID_DUPLICATED', 'hierarchy'));
  const nodeMap = new Map(allNodes.map((row) => [row.nodeId, row]));
  const facetMap = new Map(authority.facetRegistry.facets.map((row) => [row.facetId, row]));
  const anchorMap = new Map(authority.currentAffairsSourceRegistry.anchors.map((row) => [row.anchorId, row]));
  const generatedSurfaceMap = new Map(authority.surfaceRealizations.map((row) => [row.templateId, row]));
  const legacySurfaceMap = new Map();
  for (const family of authority.legacyRegistry.contextFamilies ?? []) {
    for (const template of family.surfaceTemplates ?? []) legacySurfaceMap.set(template.templateId, template);
  }

  for (const node of allNodes) {
    if (node.nodeType === 'MACRO_CONTEXT_DOMAIN') {
      if (node.parentNodeId !== null) issues.push(issue('GCTX_MACRO_PARENT_INVALID', node.nodeId));
    } else if (!nodeMap.has(node.parentNodeId)) {
      issues.push(issue('GCTX_PARENT_NOT_FOUND', node.nodeId, { parentNodeId: node.parentNodeId }));
    }
    for (const facetRef of node.facetRefs ?? []) {
      if (!facetMap.has(facetRef)) issues.push(issue('GCTX_FACET_NOT_FOUND', node.nodeId, { facetRef }));
    }
    if (node.lifecycle === 'PRODUCTION_ADMITTED') issues.push(issue('GCTX_M01_PRODUCTION_NODE_FORBIDDEN', node.nodeId));
  }

  for (const episode of hierarchy.atomicTaskEpisodes) {
    if (episode.semanticFingerprintComponents.length < 8
        || !episode.semanticFingerprintComponents.includes('atomicEpisodeId')) {
      issues.push(issue('GCTX_EPISODE_FINGERPRINT_INCOMPLETE', episode.nodeId));
    }
    for (const templateRef of episode.surfaceTemplateRefs) {
      if (!generatedSurfaceMap.has(templateRef) && !legacySurfaceMap.has(templateRef)) {
        issues.push(issue('GCTX_SURFACE_TEMPLATE_NOT_FOUND', episode.nodeId, { templateRef }));
      }
    }
    if (episode.sourcePolicy === 'CURRENT_AFFAIRS_SOURCE_REQUIRED') {
      if (!(episode.currentAffairsAnchorRefs?.length > 0)) {
        issues.push(issue('GCTX_CURRENT_AFFAIRS_ANCHOR_MISSING', episode.nodeId));
      }
      if (!episode.facetRefs.includes('facet_time_current_affairs')
          || !episode.facetRefs.includes('facet_freshness_current_snapshot')) {
        issues.push(issue('GCTX_CURRENT_AFFAIRS_FACET_MISSING', episode.nodeId));
      }
      for (const anchorRef of episode.currentAffairsAnchorRefs ?? []) {
        if (!anchorMap.has(anchorRef)) issues.push(issue('GCTX_CURRENT_AFFAIRS_ANCHOR_NOT_FOUND', episode.nodeId, { anchorRef }));
      }
    }
  }

  const expected = authority.populationIndex.expectedCoverage;
  const actualCounts = {
    macroDomainCount: hierarchy.macroDomains.length,
    mesoSituationCount: hierarchy.mesoSituationFamilies.length,
    microScenarioCount: hierarchy.microEventScenarios.length,
    atomicEpisodeCount: hierarchy.atomicTaskEpisodes.length,
    surfaceRealizationCount: authority.surfaceRealizations.length,
    facetCount: authority.facetRegistry.facets.length,
    legacyFamilyMappingCount: authority.legacyMappingRegistry.mappings.length,
    productionAdmittedNodeCount: allNodes.filter((row) => row.lifecycle === 'PRODUCTION_ADMITTED').length
  };
  for (const [key, value] of Object.entries(expected)) {
    if (actualCounts[key] !== value) issues.push(issue('GCTX_COVERAGE_COUNT_MISMATCH', `coverage.${key}`, { expected: value, actual: actualCounts[key] }));
  }

  const legacyIds = (authority.legacyRegistry.contextFamilies ?? []).map((row) => row.contextFamilyId).sort();
  const mappingIds = authority.legacyMappingRegistry.mappings.map((row) => row.legacyContextFamilyId).sort();
  if (!unique(mappingIds)) issues.push(issue('GCTX_LEGACY_MAPPING_DUPLICATED', 'legacyMappings'));
  if (JSON.stringify(legacyIds) !== JSON.stringify(mappingIds)) {
    issues.push(issue('GCTX_LEGACY_MAPPING_COVERAGE_MISMATCH', 'legacyMappings', { legacyIds, mappingIds }));
  }
  for (const mapping of authority.legacyMappingRegistry.mappings) {
    for (const id of [mapping.macroContextId, mapping.mesoSituationId, mapping.microScenarioId, ...mapping.atomicEpisodeIds]) {
      if (!nodeMap.has(id)) issues.push(issue('GCTX_LEGACY_MAPPING_NODE_NOT_FOUND', mapping.legacyContextFamilyId, { id }));
    }
    for (const templateId of mapping.surfaceTemplateIds) {
      if (!legacySurfaceMap.has(templateId)) issues.push(issue('GCTX_LEGACY_TEMPLATE_NOT_FOUND', mapping.legacyContextFamilyId, { templateId }));
    }
    for (const facetRef of mapping.facetRefs) {
      if (!facetMap.has(facetRef)) issues.push(issue('GCTX_LEGACY_FACET_NOT_FOUND', mapping.legacyContextFamilyId, { facetRef }));
    }
    if (mapping.automaticLevelInferenceUsed !== false || mapping.productionAdmissionGranted !== false) {
      issues.push(issue('GCTX_LEGACY_MAPPING_POLICY_INVALID', mapping.legacyContextFamilyId));
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    counts: actualCounts,
    queryCoverage: {
      ancient: hierarchy.atomicTaskEpisodes.filter((row) => row.facetRefs.includes('facet_time_ancient')).length,
      historical: hierarchy.atomicTaskEpisodes.filter((row) => row.facetRefs.includes('facet_time_historical')).length,
      currentAffairs: hierarchy.atomicTaskEpisodes.filter((row) => row.facetRefs.includes('facet_time_current_affairs')).length,
      sdg06: hierarchy.atomicTaskEpisodes.filter((row) => row.facetRefs.includes('facet_sdg_06')).length
    }
  };
}

export function resolveLegacyContextFamily(authority, legacyContextFamilyId) {
  const mapping = authority.legacyMappingRegistry.mappings.find((row) => row.legacyContextFamilyId === legacyContextFamilyId);
  if (!mapping) return null;
  const nodes = [
    ...authority.hierarchy.macroDomains,
    ...authority.hierarchy.mesoSituationFamilies,
    ...authority.hierarchy.microEventScenarios,
    ...authority.hierarchy.atomicTaskEpisodes
  ];
  const nodeMap = new Map(nodes.map((row) => [row.nodeId, row]));
  return {
    mapping,
    macro: nodeMap.get(mapping.macroContextId),
    meso: nodeMap.get(mapping.mesoSituationId),
    micro: nodeMap.get(mapping.microScenarioId),
    episodes: mapping.atomicEpisodeIds.map((id) => nodeMap.get(id)).filter(Boolean)
  };
}

export function queryAtomicTaskEpisodes(authority, filters = {}) {
  return authority.hierarchy.atomicTaskEpisodes.filter((episode) => {
    if (filters.macroContextId) {
      const micro = authority.hierarchy.microEventScenarios.find((row) => row.nodeId === episode.parentNodeId);
      const meso = authority.hierarchy.mesoSituationFamilies.find((row) => row.nodeId === micro?.parentNodeId);
      if (meso?.parentNodeId !== filters.macroContextId) return false;
    }
    if (filters.facetId && !episode.facetRefs.includes(filters.facetId)) return false;
    if (filters.facetIds && !filters.facetIds.every((id) => episode.facetRefs.includes(id))) return false;
    if (filters.operationFamily && !episode.compatibleOperationFamilies.includes(filters.operationFamily)) return false;
    if (filters.sourcePolicy && episode.sourcePolicy !== filters.sourcePolicy) return false;
    return true;
  });
}

export function loadGlobalContextAuthority({ root = process.cwd() } = {}) {
  const populationIndex = readJson(root, INDEX_PATH);
  const situationSeeds = populationIndex.shards.flatMap((shardPath) => readJson(root, shardPath).situationSeeds);
  const raw = {
    populationIndex,
    situationSeeds,
    facetRegistry: readJson(root, populationIndex.facetRegistry),
    legacyMappingRegistry: readJson(root, populationIndex.legacyMappingRegistry),
    currentAffairsSourceRegistry: readJson(root, populationIndex.currentAffairsSourceRegistry),
    legacyRegistry: readJson(root, LEGACY_PATH)
  };
  return materializeGlobalContextAuthority(raw);
}
