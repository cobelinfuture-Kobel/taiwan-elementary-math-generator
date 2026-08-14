import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  auditP03F13PublicSelectorComposition,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import {
  auditFullProductPublicControlProfiles,
} from "../../site/modules/curriculum/registry/full-product-public-control-profiles.js";

// P03F35 D0 closeout replay trigger; executable and Slice033 historical authority below are unchanged.
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const scopePath = path.join(repoRoot, "data/curriculum/public-generation/public_generation_scope.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/public_route_registry.csv");
const scope = JSON.parse(fs.readFileSync(scopePath, "utf8"));

const byId = new Map(scope.routes.map((route) => [route.routeId, route]));
const routeIds = scope.routes.map((route) => route.routeId);
const allowedClassifications = new Set([
  "PUBLIC_ACTIVE",
  "PUBLIC_DEPRECATED",
  "INTERNAL_ONLY",
  "HIDDEN_CANDIDATE",
  "DEAD_ROUTE",
  "DUPLICATE_AUTHORITY",
]);

function expectRoute(routeId, classification) {
  const route = byId.get(routeId);
  assert.ok(route, `missing route ${routeId}`);
  assert.equal(route.classification, classification);
  return route;
}

test("PGC-R00 freezes the exact 26-source historical authority while current public sources may extend through Slice033", () => {
  assert.equal(scope.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(scope.taskId, "PGC-R00_PublicGenerationScopeAndAuthorityFreeze");
  assert.equal(scope.currentAuthority.publicSourceCount, 26);
  assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 32);
  assert.equal(
    new Set(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((row) => row.sourceId)).size,
    32,
  );

  const selectorAudit = auditP03F13PublicSelectorComposition();
  assert.equal(selectorAudit.ok, true, selectorAudit.errors.join("\n"));
  assert.equal(selectorAudit.counts.publicSources, 26);

  const profileAudit = auditFullProductPublicControlProfiles({ includeW3Slice013: true });
  assert.equal(profileAudit.ok, true, profileAudit.errors.join("\n"));
  assert.equal(profileAudit.profileCount, 26);
});

test("PGC-R00 route IDs and classifications are closed and unique", () => {
  assert.equal(new Set(routeIds).size, routeIds.length, "duplicate public route ID");
  assert.ok(scope.routes.length >= 20, "public route inventory is unexpectedly incomplete");
  for (const route of scope.routes) {
    assert.ok(allowedClassifications.has(route.classification), `${route.routeId}: unknown classification`);
    assert.equal(typeof route.kind, "string", `${route.routeId}: kind missing`);
    assert.equal(typeof route.notes, "string", `${route.routeId}: notes missing`);
  }
});

test("PGC-R00 covers all public surfaces and shared product stages", () => {
  expectRoute("surface.classic.index", "PUBLIC_ACTIVE");
  expectRoute("surface.classic.404_fallback", "PUBLIC_DEPRECATED");
  expectRoute("surface.pixel.beta", "PUBLIC_ACTIVE");
  expectRoute("pipeline.public_build_from_state", "PUBLIC_ACTIVE");
  expectRoute("pipeline.shared_question_router", "PUBLIC_ACTIVE");
  expectRoute("pipeline.shared_generator", "PUBLIC_ACTIVE");
  expectRoute("pipeline.shared_validator", "PUBLIC_ACTIVE");
  expectRoute("pipeline.application_global_authority_cutover", "PUBLIC_ACTIVE");
  expectRoute("pipeline.pbl_specialized", "PUBLIC_ACTIVE");
  expectRoute("renderer.preview_html", "PUBLIC_ACTIVE");
  expectRoute("renderer.iframe_print", "PUBLIC_ACTIVE");
  expectRoute("renderer.chromium_pdf_acceptance", "INTERNAL_ONLY");
});

test("PGC-R00 excludes hidden and duplicate authorities from public completion", () => {
  expectRoute("selector.mixed_knowledge_points_cross_unit", "HIDDEN_CANDIDATE");
  expectRoute("queue.w3.slice014", "HIDDEN_CANDIDATE");
  expectRoute("selector.historical_p01e_snapshot", "INTERNAL_ONLY");
  expectRoute("selector.legacy_full_product_source_alias", "DUPLICATE_AUTHORITY");
});

test("PGC-R00 CSV registry mirrors every frozen route ID", () => {
  const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  assert.equal(lines.length, scope.routes.length + 1);
  for (const routeId of routeIds) assert.match(lines.join("\n"), new RegExp(routeId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
