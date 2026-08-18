import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listP03EW3DirectProductVerticalSlices } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import {
  G4B_U08_P03F43_SELECTOR_PROJECTION,
  P03F43_HIDDEN_APPLICATION_SPEC_IDS,
  P03F43_KP_IDS,
  P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS,
  P03F43_SPEC_IDS,
  P03F43_W3_CAPABILITY_IDS,
  auditG4BU08P03F43SelectorProjection,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";
import { validateP03F43PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f43-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const authority = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curriculum/full-product/p03f/slice043-g4b-u08-rank10-fraction-authority.json"), "utf8"));

test("P03F43 frozen queue allocation is exactly the two q043 G4B-U08 rank10 KPs", () => {
  const queue = listP03EW3DirectProductVerticalSlices();
  const q043 = queue.find((entry) => entry.queuePosition === 43);
  const q044 = queue.find((entry) => entry.queuePosition === 44);
  assert.equal(q043.sliceId, "p03e_q043_r10_g4b_u08_4b08_profile_fraction_c1");
  assert.deepEqual(q043.knowledgePointIds, P03F43_KP_IDS);
  assert.equal(q043.primarySourceNodeId, "g4b_u08_4b08");
  assert.equal(q043.intraWavePrerequisiteRank, 10);
  assert.equal(q043.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(q044.primarySourceNodeId, "g5a_u01_5a01");
  assert.equal(q044.knowledgePointIds.some((id) => P03F43_KP_IDS.includes(id)), false);
  assert.deepEqual(authority.queue.knowledgePointIds, P03F43_KP_IDS);
});

test("P03F43 authority locks 3 numeric PatternSpecs and keeps one application PatternSpec hidden", () => {
  assert.equal(auditG4BU08P03F43SelectorProjection().ok, true);
  assert.equal(validateP03F43PatternDefinitions().ok, true);
  assert.equal(P03F43_SPEC_IDS.length, 3);
  assert.deepEqual(authority.patternAuthority.numericPatternSpecIds, P03F43_SPEC_IDS);
  assert.deepEqual(authority.patternAuthority.hiddenApplicationPatternSpecIds, P03F43_HIDDEN_APPLICATION_SPEC_IDS);
  assert.equal(G4B_U08_P03F43_SELECTOR_PROJECTION.applicationModeAllowed, false);
  assert.equal(G4B_U08_P03F43_SELECTOR_PROJECTION.fractionArithmeticRequired, false);
});

test("P03F43 capability union preserves fraction-domain and number-line representation without fraction arithmetic", () => {
  assert.deepEqual(P03F43_W3_CAPABILITY_IDS, ["cap_fraction_domain_validator", "cap_fraction_number_system"]);
  assert.equal(P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS.includes("cap_number_line_representation"), true);
  assert.equal(P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS.includes("cap_fraction_arithmetic"), false);
  assert.equal(authority.requiredCapabilities.fractionArithmeticRequired, false);
});
