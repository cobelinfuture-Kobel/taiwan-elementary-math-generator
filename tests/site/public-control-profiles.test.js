import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
  PUBLIC_CONTROL_PROFILE_REGISTRY,
  auditPublicControlProfiles,
  getPublicControlProfile,
  normalizePublicControlValue,
} from "../../site/modules/curriculum/registry/public-control-profiles.js";
import { G5A_U08_SOURCE_ID } from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";

test("S96N shared profile registry validates both existing G5A units", () => {
  assert.deepEqual(auditPublicControlProfiles(), { ok: true, errors: [], profileCount: 2 });
  assert.deepEqual(new Set(PUBLIC_CONTROL_PROFILE_REGISTRY.sourceIds), new Set([
    G5A_U08_SOURCE_ID,
    G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
  ]));
});

test("S96N G5A-U02 exposes all approved controls and no unsupported SDG", () => {
  const profile = getPublicControlProfile(G5A_U02_PUBLIC_CONTROL_SOURCE_ID);
  assert.equal(profile.questionTypeControl.supported, true);
  assert.equal(profile.reasoningDepthControl.supported, true);
  assert.equal(profile.contextControl.supported, true);
  assert.equal(profile.contextControl.partial, true);
  assert.deepEqual(profile.questionTypeControl.options.map((row) => row.value), [
    "mixed", "concept", "numeric", "application", "reasoning",
  ]);
  assert.deepEqual(profile.reasoningDepthControl.options.map((row) => row.value), [
    "mixed", "basic", "extended",
  ]);
  assert.deepEqual(profile.contextControl.options.map((row) => row.value), [
    "mixed", "abstract_math", "daily_life", "geometry_context",
  ]);
  assert.equal(profile.contextControl.options.some((row) => row.value === "sdg"), false);
  assert.equal(profile.genericFallback, false);
  assert.equal(profile.freeFormAI, false);
});

test("S96N preserves G5A-U08 existing profile values", () => {
  const profile = getPublicControlProfile(G5A_U08_SOURCE_ID);
  assert.deepEqual(profile.questionTypeControl.options.map((row) => row.value), ["mixed", "numeric", "application", "reasoning"]);
  assert.deepEqual(profile.reasoningDepthControl.options.map((row) => row.value), ["mixed", "N", "N_PLUS_1"]);
  assert.deepEqual(profile.contextControl.options.map((row) => row.value), ["mixed", "daily_life", "sdg"]);
});

test("S96N normalizes values through profiles instead of source-specific conditionals", () => {
  const g5aU02 = getPublicControlProfile(G5A_U02_PUBLIC_CONTROL_SOURCE_ID);
  assert.equal(normalizePublicControlValue(g5aU02, "questionTypeControl", "numeric"), "numeric");
  assert.equal(normalizePublicControlValue(g5aU02, "questionTypeControl", "unknown"), "mixed");
  assert.equal(normalizePublicControlValue(g5aU02, "reasoningDepthControl", "N_PLUS_1"), "mixed");
  assert.equal(normalizePublicControlValue(null, "questionTypeControl", "numeric"), null);
});
