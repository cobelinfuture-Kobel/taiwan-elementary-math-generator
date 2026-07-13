import { getG5AU02HiddenPatternSpecs } from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const SOURCE_METADATA = deepFreeze([
  {
    sourceId: "g5a_u02_5a02a",
    packetId: "packet_g5a_u02_5a02a",
    canonicalTitle: "因數",
    canonicalUrl: "https://meow911.com/5a02a/",
    sourceRole: "factor_core",
    pageCount: 2,
    status: "canonical_metadata_active",
  },
  {
    sourceId: "g5a_u02_5a02a1",
    packetId: "packet_g5a_u02_5a02a1",
    canonicalTitle: "公因數",
    canonicalUrl: "https://meow911.com/5a03b/",
    sourceRole: "common_factor_gcf_extension",
    pageCount: 2,
    status: "canonical_metadata_corrected",
    correction: {
      task: "S89_G5A_U02_SourceMetadataCorrectionAndProjectionConsistencyQA",
      preservesStableSourceId: true,
      supersedesLegacyTitle: "因數",
      supersedesLegacyUrl: null,
      evidenceBasis: "manual_visual_source_review",
    },
  },
]);

const BY_SOURCE_ID = new Map(SOURCE_METADATA.map((row) => [row.sourceId, row]));
const BY_PACKET_ID = new Map(SOURCE_METADATA.map((row) => [row.packetId, row]));
const EVIDENCE_PREFIX_TO_SOURCE = deepFreeze({
  "s78:5a02a": "g5a_u02_5a02a",
  "s78:5a02a1": "g5a_u02_5a02a1",
});

export function getG5AU02SourceMetadata() {
  return SOURCE_METADATA;
}

export function getG5AU02SourceMetadataById(sourceId) {
  return BY_SOURCE_ID.get(sourceId) ?? null;
}

export function getG5AU02SourceMetadataByPacketId(packetId) {
  return BY_PACKET_ID.get(packetId) ?? null;
}

export function resolveG5AU02SourceEvidenceRef(evidenceRef) {
  if (typeof evidenceRef !== "string") return null;
  const prefix = Object.keys(EVIDENCE_PREFIX_TO_SOURCE).find((candidate) => evidenceRef.startsWith(`${candidate}:`));
  return prefix ? BY_SOURCE_ID.get(EVIDENCE_PREFIX_TO_SOURCE[prefix]) ?? null : null;
}

export function auditG5AU02SourceMetadataAndProjection() {
  const errors = [];
  const corrected = getG5AU02SourceMetadataById("g5a_u02_5a02a1");
  if (!corrected) errors.push("G5AU02_SOURCE_METADATA_MISSING");
  if (corrected?.canonicalTitle !== "公因數") errors.push("G5AU02_SOURCE_TITLE_MISMATCH");
  if (corrected?.canonicalUrl !== "https://meow911.com/5a03b/") errors.push("G5AU02_SOURCE_URL_MISMATCH");
  if (corrected?.sourceRole !== "common_factor_gcf_extension") errors.push("G5AU02_SOURCE_ROLE_MISMATCH");
  if (corrected?.correction?.preservesStableSourceId !== true) errors.push("G5AU02_SOURCE_ID_STABILITY_BROKEN");

  const specs = getG5AU02HiddenPatternSpecs();
  if (specs.length !== 22) errors.push("G5AU02_PROJECTION_PATTERN_COUNT_MISMATCH");
  const unresolved = [];
  for (const spec of specs) {
    for (const evidenceRef of spec.sourceEvidence ?? []) {
      if (!resolveG5AU02SourceEvidenceRef(evidenceRef)) unresolved.push(`${spec.patternSpecId}:${evidenceRef}`);
    }
  }
  if (unresolved.length) errors.push("G5AU02_SOURCE_EVIDENCE_UNRESOLVED");

  const packetIds = new Set(SOURCE_METADATA.map((row) => row.packetId));
  for (const spec of specs) {
    for (const packetId of spec.sourcePacketIds ?? []) {
      if (!packetIds.has(`packet_${packetId}`)) errors.push("G5AU02_SOURCE_PACKET_ID_MISMATCH");
    }
  }

  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    sourceCount: SOURCE_METADATA.length,
    projectionPatternCount: specs.length,
    evidenceReferenceCount: specs.reduce((sum, spec) => sum + (spec.sourceEvidence?.length ?? 0), 0),
    unresolvedEvidence: unresolved,
    correctedSourceId: corrected?.sourceId ?? null,
    correctedTitle: corrected?.canonicalTitle ?? null,
    correctedUrl: corrected?.canonicalUrl ?? null,
  });
}

export const G5A_U02_SOURCE_METADATA_LIFECYCLE = deepFreeze({
  metadataStatus: "canonical_corrected",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
});
