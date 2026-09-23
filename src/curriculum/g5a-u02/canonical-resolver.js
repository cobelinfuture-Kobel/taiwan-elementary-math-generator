import { getG5AU02HiddenPatternSpecs } from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  auditG5AU02ClassCHiddenProjectionBinding,
  generateG5AU02ClassCFromHiddenProjection,
  getG5AU02BoundClassCSpecById,
  getG5AU02BoundClassCSpecs,
  validateG5AU02ClassCFromHiddenProjection,
} from "./class-c-hidden-projection-binding.js";
import {
  auditG5AU02ClassDHiddenProjectionBinding,
  generateG5AU02ClassDFromHiddenProjection,
  getG5AU02BoundClassDSpecById,
  getG5AU02BoundClassDSpecs,
  validateG5AU02ClassDFromHiddenProjection,
} from "./class-d-hidden-projection-binding.js";
import {
  auditG5AU02SourceMetadataAndProjection,
  resolveG5AU02SourceEvidenceRef,
} from "./source-metadata.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const CLASS_C_IDS = new Set(getG5AU02BoundClassCSpecs().map((row) => row.patternSpecId));
const CLASS_D_IDS = new Set(getG5AU02BoundClassDSpecs().map((row) => row.patternSpecId));

const RESOLVER_LIFECYCLE = deepFreeze({
  unitId: "g5a_u02",
  resolverStatus: "canonical_hidden_integrated",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

function assertPatternSpecId(patternSpecId) {
  if (typeof patternSpecId !== "string" || patternSpecId.length === 0) {
    throw new Error("G5AU02_CANONICAL_RESOLVER_PATTERN_ID_REQUIRED");
  }
}

export function resolveG5AU02CanonicalRoute(patternSpecId) {
  assertPatternSpecId(patternSpecId);
  let binding = null;
  let implementationClass = null;

  if (CLASS_C_IDS.has(patternSpecId)) {
    binding = getG5AU02BoundClassCSpecById(patternSpecId);
    implementationClass = "C";
  } else if (CLASS_D_IDS.has(patternSpecId)) {
    binding = getG5AU02BoundClassDSpecById(patternSpecId);
    implementationClass = "D";
  } else {
    throw new Error(`G5AU02_CANONICAL_RESOLVER_UNKNOWN_PATTERN:${patternSpecId}`);
  }

  if (!binding) throw new Error(`G5AU02_CANONICAL_RESOLVER_BINDING_MISSING:${patternSpecId}`);

  const sourceMetadata = [...new Map(
    binding.sourceEvidence.map((evidenceRef) => {
      const metadata = resolveG5AU02SourceEvidenceRef(evidenceRef);
      if (!metadata) throw new Error(`G5AU02_CANONICAL_RESOLVER_SOURCE_UNRESOLVED:${evidenceRef}`);
      return [metadata.sourceId, metadata];
    }),
  ).values()];

  return deepFreeze({
    unitId: "g5a_u02",
    patternSpecId,
    implementationClass,
    formalMappingId: binding.formalMappingId,
    patternGroupId: binding.patternGroupId,
    knowledgePointId: binding.knowledgePointId,
    answerModelId: binding.answerModelId,
    binding,
    sourceMetadata,
    lifecycle: RESOLVER_LIFECYCLE,
  });
}

export function generateG5AU02Canonical(patternSpecId, options = {}) {
  const route = resolveG5AU02CanonicalRoute(patternSpecId);
  const item = route.implementationClass === "C"
    ? generateG5AU02ClassCFromHiddenProjection(patternSpecId, options)
    : generateG5AU02ClassDFromHiddenProjection(patternSpecId, options);

  return deepFreeze({
    ...item,
    canonicalRoute: route,
  });
}

export function validateG5AU02Canonical(item) {
  const errors = [];
  let route = null;
  try {
    route = resolveG5AU02CanonicalRoute(item?.patternSpecId);
  } catch (error) {
    errors.push(error.message);
  }

  if (route) {
    if (!item?.canonicalRoute || JSON.stringify(item.canonicalRoute) !== JSON.stringify(route)) {
      errors.push("G5AU02_CANONICAL_RESOLVER_ROUTE_MISMATCH");
    }
    const runtimeValidation = route.implementationClass === "C"
      ? validateG5AU02ClassCFromHiddenProjection(item)
      : validateG5AU02ClassDFromHiddenProjection(item);
    errors.push(...runtimeValidation.errors);
  }

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function auditG5AU02CanonicalResolver() {
  const errors = [];
  const specs = getG5AU02HiddenPatternSpecs();
  const classCAudit = auditG5AU02ClassCHiddenProjectionBinding();
  const classDAudit = auditG5AU02ClassDHiddenProjectionBinding();
  const sourceAudit = auditG5AU02SourceMetadataAndProjection();

  if (specs.length !== 22) errors.push("G5AU02_CANONICAL_RESOLVER_PATTERN_COUNT_MISMATCH");
  if (CLASS_C_IDS.size !== 14) errors.push("G5AU02_CANONICAL_RESOLVER_CLASS_C_COUNT_MISMATCH");
  if (CLASS_D_IDS.size !== 8) errors.push("G5AU02_CANONICAL_RESOLVER_CLASS_D_COUNT_MISMATCH");
  if (!classCAudit.ok) errors.push(...classCAudit.errors);
  if (!classDAudit.ok) errors.push(...classDAudit.errors);
  if (!sourceAudit.ok) errors.push(...sourceAudit.errors);

  for (const spec of specs) {
    try {
      const route = resolveG5AU02CanonicalRoute(spec.patternSpecId);
      if (route.implementationClass !== spec.implementationClass) {
        errors.push("G5AU02_CANONICAL_RESOLVER_CLASS_MISMATCH");
      }
      if (route.formalMappingId !== spec.formalMappingId) {
        errors.push("G5AU02_CANONICAL_RESOLVER_MAPPING_MISMATCH");
      }
      if (route.patternGroupId !== spec.patternGroupId) {
        errors.push("G5AU02_CANONICAL_RESOLVER_GROUP_MISMATCH");
      }
      if (route.knowledgePointId !== spec.knowledgePointId) {
        errors.push("G5AU02_CANONICAL_RESOLVER_KP_MISMATCH");
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    totalPatternSpecCount: specs.length,
    classCCount: CLASS_C_IDS.size,
    classDCount: CLASS_D_IDS.size,
    resolvedCount: specs.length - errors.filter((code) => code.includes("UNKNOWN_PATTERN") || code.includes("BINDING_MISSING")).length,
    sourceCount: sourceAudit.sourceCount,
  });
}

export const G5A_U02_CANONICAL_RESOLVER_LIFECYCLE = RESOLVER_LIFECYCLE;
