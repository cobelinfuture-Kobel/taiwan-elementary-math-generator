import test from "node:test";
import assert from "node:assert/strict";
import {
  G5A_U02_SOURCE_METADATA_LIFECYCLE,
  auditG5AU02SourceMetadataAndProjection,
  getG5AU02SourceMetadata,
  getG5AU02SourceMetadataById,
  getG5AU02SourceMetadataByPacketId,
  resolveG5AU02SourceEvidenceRef,
} from "../../src/curriculum/g5a-u02/source-metadata.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

test("S89 canonical source metadata preserves exactly two stable source identities", () => {
  const rows = getG5AU02SourceMetadata();
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.sourceId), ["g5a_u02_5a02a", "g5a_u02_5a02a1"]);
  assert.deepEqual(rows.map((row) => row.packetId), ["packet_g5a_u02_5a02a", "packet_g5a_u02_5a02a1"]);
});

test("S89 corrects 5a02a1 title, URL, and source role without re-keying", () => {
  const source = getG5AU02SourceMetadataById("g5a_u02_5a02a1");
  assert.equal(source.sourceId, "g5a_u02_5a02a1");
  assert.equal(source.packetId, "packet_g5a_u02_5a02a1");
  assert.equal(source.canonicalTitle, "公因數");
  assert.equal(source.canonicalUrl, "https://meow911.com/5a03b/");
  assert.equal(source.sourceRole, "common_factor_gcf_extension");
  assert.equal(source.correction.preservesStableSourceId, true);
  assert.equal(source.correction.supersedesLegacyTitle, "因數");
  assert.equal(source.correction.supersedesLegacyUrl, null);
});

test("S89 keeps 5a02a factor-core identity unchanged", () => {
  const source = getG5AU02SourceMetadataByPacketId("packet_g5a_u02_5a02a");
  assert.equal(source.canonicalTitle, "因數");
  assert.equal(source.canonicalUrl, "https://meow911.com/5a02a/");
  assert.equal(source.sourceRole, "factor_core");
});

test("S89 resolves every S84 projection evidence reference to canonical metadata", () => {
  const specs = getG5AU02HiddenPatternSpecs();
  assert.equal(specs.length, 22);
  const evidenceRefs = specs.flatMap((spec) => spec.sourceEvidence);
  assert.ok(evidenceRefs.length > 0);
  for (const evidenceRef of evidenceRefs) {
    const source = resolveG5AU02SourceEvidenceRef(evidenceRef);
    assert.ok(source, `unresolved evidence: ${evidenceRef}`);
    assert.ok(["g5a_u02_5a02a", "g5a_u02_5a02a1"].includes(source.sourceId));
  }
});

test("S89 projection packet IDs resolve to the same two stable metadata rows", () => {
  for (const spec of getG5AU02HiddenPatternSpecs()) {
    assert.deepEqual(spec.sourcePacketIds, ["g5a_u02_5a02a", "g5a_u02_5a02a1"]);
    for (const sourceId of spec.sourcePacketIds) assert.ok(getG5AU02SourceMetadataById(sourceId));
  }
});

test("S89 audit passes with no unresolved projection evidence", () => {
  const audit = auditG5AU02SourceMetadataAndProjection();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(audit.sourceCount, 2);
  assert.equal(audit.projectionPatternCount, 22);
  assert.equal(audit.unresolvedEvidence.length, 0);
  assert.equal(audit.correctedSourceId, "g5a_u02_5a02a1");
  assert.equal(audit.correctedTitle, "公因數");
  assert.equal(audit.correctedUrl, "https://meow911.com/5a03b/");
});

test("S89 evidence resolver rejects unknown, malformed, and non-string references", () => {
  assert.equal(resolveG5AU02SourceEvidenceRef("s78:unknown:p1:left"), null);
  assert.equal(resolveG5AU02SourceEvidenceRef("g5a_u02_5a02a1"), null);
  assert.equal(resolveG5AU02SourceEvidenceRef(null), null);
});

test("S89 metadata remains deeply frozen and lifecycle remains hidden", () => {
  const rows = getG5AU02SourceMetadata();
  assert.equal(Object.isFrozen(rows), true);
  assert.equal(Object.isFrozen(rows[1]), true);
  assert.equal(Object.isFrozen(rows[1].correction), true);
  assert.deepEqual(G5A_U02_SOURCE_METADATA_LIFECYCLE, {
    metadataStatus: "canonical_corrected",
    selectorStatus: "hidden",
    canonicalRouting: "disabled",
    productionUse: "forbidden",
  });
});
