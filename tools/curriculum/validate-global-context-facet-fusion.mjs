import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadGlobalContextAuthority,
  queryAtomicTaskEpisodes,
  resolveLegacyContextFamily,
  validateGlobalContextAuthority
} from '../../src/curriculum/context/global-context-ontology-resolver.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runGlobalContextFacetFusionValidation() {
  const authority = loadGlobalContextAuthority({ root: ROOT });
  const validation = validateGlobalContextAuthority(authority);
  const transit = resolveLegacyContextFamily(authority, 'gctx_family_transit_trip_capacity');
  const queries = {
    ancient: queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_ancient' }).map((row) => row.nodeId),
    historical: queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_historical' }).map((row) => row.nodeId),
    currentAffairs: queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_current_affairs' }).map((row) => row.nodeId),
    sdg06: queryAtomicTaskEpisodes(authority, { facetId: 'facet_sdg_06' }).map((row) => row.nodeId),
    currentAffairsWater: queryAtomicTaskEpisodes(authority, {
      facetIds: ['facet_time_current_affairs', 'facet_sdg_06'],
      sourcePolicy: 'CURRENT_AFFAIRS_SOURCE_REQUIRED'
    }).map((row) => row.nodeId)
  };
  const queryGate = queries.ancient.length > 0
    && queries.historical.length > 0
    && queries.currentAffairs.length > 0
    && queries.sdg06.length > 0
    && queries.currentAffairsWater.length > 0;
  const transitGate = Boolean(
    transit?.macro?.nodeId === 'gctx_macro_transport_mobility'
    && transit?.meso?.nodeId === 'gctx_meso_field_trip_transport'
    && transit?.micro?.nodeId === 'gctx_micro_student_vehicle_allocation'
    && transit?.episodes?.length === 2
  );
  return {
    ...validation,
    queryGate,
    transitGate,
    sampleResolution: transit
      ? {
          legacyContextFamilyId: transit.mapping.legacyContextFamilyId,
          chain: [
            transit.macro.nodeId,
            transit.meso.nodeId,
            transit.micro.nodeId,
            ...transit.episodes.map((row) => row.nodeId)
          ]
        }
      : null,
    queries,
    status: validation.ok && queryGate && transitGate
      ? 'PASS_POSTG_APP_M01_GLOBAL_CONTEXT_FACET_FUSION'
      : 'FAIL_POSTG_APP_M01_GLOBAL_CONTEXT_FACET_FUSION'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runGlobalContextFacetFusionValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== 'PASS_POSTG_APP_M01_GLOBAL_CONTEXT_FACET_FUSION') process.exitCode = 1;
}
