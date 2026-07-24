import { pathToFileURL } from "node:url";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

function finding(code, details = {}) { return Object.freeze({ code, ...details }); }
function detectCapabilityCycle(capabilities) {
  const byId = new Map(capabilities.map((row) => [row.capabilityId, row]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependencyId of byId.get(id)?.dependsOnCapabilityIds ?? []) if (visit(dependencyId)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  return capabilities.some((row) => visit(row.capabilityId));
}

export function validateR04SharedRuntimeCapabilityMatrix(matrix = materializeR04SharedRuntimeCapabilityMatrix()) {
  const errors = [];
  const warnings = [];
  const capabilityIds = matrix.capabilities.map((row) => row.capabilityId);
  const capabilitySet = new Set(capabilityIds);
  const profileIds = matrix.profiles.map((row) => row.profileId);
  const profileSet = new Set(profileIds);
  const knowledgePointIds = new Set(matrix.knowledgePoints.map((row) => row.knowledgePointId));
  const mappingIds = matrix.knowledgePointMappings.map((row) => row.mappingId);
  if (matrix.knowledgePoints.length !== 482) errors.push(finding("R04_KNOWLEDGE_POINT_COUNT_INVALID"));
  if (matrix.knowledgePointMappings.length !== 482) errors.push(finding("R04_MAPPING_COUNT_INVALID"));
  if (new Set(capabilityIds).size !== capabilityIds.length) errors.push(finding("R04_DUPLICATE_CAPABILITY_ID"));
  if (new Set(profileIds).size !== profileIds.length) errors.push(finding("R04_DUPLICATE_PROFILE_ID"));
  if (new Set(mappingIds).size !== mappingIds.length) errors.push(finding("R04_DUPLICATE_MAPPING_ID"));
  if (detectCapabilityCycle(matrix.capabilities)) errors.push(finding("R04_CAPABILITY_DEPENDENCY_CYCLE"));
  for (const capability of matrix.capabilities) {
    if (!["production_admitted", "shadow_available", "contract_only"].includes(capability.deliveryStatus)) errors.push(finding("R04_CAPABILITY_DELIVERY_STATUS_INVALID", { capabilityId: capability.capabilityId }));
    if (capability.deliveryStatus !== "contract_only" && (!Array.isArray(capability.runtimeEvidencePaths) || capability.runtimeEvidencePaths.length === 0)) errors.push(finding("R04_DELIVERED_CAPABILITY_MISSING_EVIDENCE", { capabilityId: capability.capabilityId }));
    for (const dependencyId of capability.dependsOnCapabilityIds ?? []) {
      if (!capabilitySet.has(dependencyId)) errors.push(finding("R04_UNKNOWN_CAPABILITY_DEPENDENCY", { capabilityId: capability.capabilityId, dependencyId }));
      if (dependencyId === capability.capabilityId) errors.push(finding("R04_CAPABILITY_SELF_DEPENDENCY", { capabilityId: capability.capabilityId }));
    }
  }
  for (const profile of matrix.profiles) for (const capabilityId of [...profile.requiredCapabilityIds, ...(profile.optionalCapabilityIds ?? [])]) if (!capabilitySet.has(capabilityId)) errors.push(finding("R04_PROFILE_UNKNOWN_CAPABILITY", { profileId: profile.profileId, capabilityId }));
  for (const mapping of matrix.knowledgePointMappings) {
    if (!knowledgePointIds.has(mapping.knowledgePointId)) errors.push(finding("R04_MAPPING_UNKNOWN_KNOWLEDGE_POINT", { knowledgePointId: mapping.knowledgePointId }));
    if (!profileSet.has(mapping.primaryRuntimeProfileId)) errors.push(finding("R04_MAPPING_UNKNOWN_PROFILE", { knowledgePointId: mapping.knowledgePointId }));
    if (!mapping.classificationRuleId) errors.push(finding("R04_MAPPING_CLASSIFICATION_RULE_REQUIRED", { knowledgePointId: mapping.knowledgePointId }));
    const required = new Set(mapping.requiredRuntimeCapabilityIds);
    const optional = new Set(mapping.optionalRuntimeCapabilityIds);
    const forbidden = new Set(mapping.forbiddenRuntimeCapabilityIds);
    for (const capabilityId of [...required, ...optional, ...forbidden]) if (!capabilitySet.has(capabilityId)) errors.push(finding("R04_MAPPING_UNKNOWN_CAPABILITY", { knowledgePointId: mapping.knowledgePointId, capabilityId }));
    if ([...required].some((id) => optional.has(id) || forbidden.has(id))) errors.push(finding("R04_REQUIRED_CAPABILITY_OVERLAP", { knowledgePointId: mapping.knowledgePointId }));
    if ([...optional].some((id) => forbidden.has(id))) errors.push(finding("R04_OPTIONAL_FORBIDDEN_OVERLAP", { knowledgePointId: mapping.knowledgePointId }));
    if (mapping.knowledgePointProductionAdmissionState !== "DEFERRED_TO_R06_R07") errors.push(finding("R04_PRODUCTION_ADMISSION_PREMATURE", { knowledgePointId: mapping.knowledgePointId }));
    if (mapping.mappingBasis?.legacyBatchUsedForClassification !== false) errors.push(finding("R04_LEGACY_BATCH_CLASSIFICATION_FORBIDDEN", { knowledgePointId: mapping.knowledgePointId }));
    if ("deliveryWave" in mapping || "primaryBatch" in mapping) errors.push(finding("R04_DELIVERY_WAVE_PREMATURE", { knowledgePointId: mapping.knowledgePointId }));
    const expectedUndelivered = mapping.requiredRuntimeCapabilityIds.filter((capabilityId) => matrix.capabilities.find((row) => row.capabilityId === capabilityId)?.deliveryStatus === "contract_only");
    if (expectedUndelivered.join("|") !== mapping.undeliveredRequiredCapabilityIds.join("|")) errors.push(finding("R04_UNDELIVERED_CAPABILITY_READBACK_MISMATCH", { knowledgePointId: mapping.knowledgePointId }));
  }
  const matrixIds = new Set(matrix.knowledgePointMappings.map((row) => row.knowledgePointId));
  for (const knowledgePointId of knowledgePointIds) if (!matrixIds.has(knowledgePointId)) errors.push(finding("R04_KNOWLEDGE_POINT_MAPPING_MISSING", { knowledgePointId }));
  const sameUnit = matrix.getMapping("kp_mass_times_integer");
  if (!sameUnit) errors.push(finding("R04_MASS_TIMES_INTEGER_MAPPING_MISSING"));
  else {
    if (!sameUnit.requiredRuntimeCapabilityIds.includes("cap_same_unit_quantity_arithmetic")) errors.push(finding("R04_SAME_UNIT_CAPABILITY_MISSING"));
    if (!sameUnit.requiredRuntimeCapabilityIds.includes("cap_integer_multiplication")) errors.push(finding("R04_SAME_UNIT_MULTIPLICATION_CAPABILITY_MISSING"));
    if (!sameUnit.forbiddenRuntimeCapabilityIds.includes("cap_unit_conversion")) errors.push(finding("R04_SAME_UNIT_CONVERSION_NOT_FORBIDDEN"));
  }
  const mixedUnit = matrix.getMapping("kp_mass_mixed_unit_add_sub");
  if (!mixedUnit) errors.push(finding("R04_MIXED_UNIT_MAPPING_MISSING"));
  else for (const capabilityId of ["cap_unit_conversion", "cap_mixed_unit_normalization", "cap_integer_add_sub"]) if (!mixedUnit.requiredRuntimeCapabilityIds.includes(capabilityId)) errors.push(finding("R04_MIXED_UNIT_CAPABILITY_MISSING", { capabilityId }));
  if (matrix.mainlineBoundary.productionConsumerChanged !== false) errors.push(finding("R04_PRODUCTION_CONSUMER_CHANGED"));
  if (matrix.mainlineBoundary.deliveryWaveRebased !== false) errors.push(finding("R04_DELIVERY_WAVE_REBASED_PREMATURELY"));
  if (matrix.mainlineBoundary.productionCutoverAllowed !== false) errors.push(finding("R04_PRODUCTION_CUTOVER_PREMATURE"));
  if (matrix.mainlineBoundary.parallelRuntimePipelineAllowed !== false) errors.push(finding("R04_PARALLEL_RUNTIME_PIPELINE_FORBIDDEN"));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze(warnings), summary: Object.freeze({ capabilityCount: matrix.capabilities.length, profileCount: matrix.profiles.length, knowledgePointCount: matrix.knowledgePoints.length, mappingCount: matrix.knowledgePointMappings.length, deliveryStateCounts: matrix.metrics.deliveryStateCounts }) });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateR04SharedRuntimeCapabilityMatrix();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}
