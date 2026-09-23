import assert from "node:assert/strict";
import test from "node:test";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  G5A_U02_CANONICAL_RESOLVER_LIFECYCLE,
  auditG5AU02CanonicalResolver,
  generateG5AU02Canonical,
  resolveG5AU02CanonicalRoute,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";

const specs = getG5AU02HiddenPatternSpecs();

test("S90 resolver audit covers all 22 hidden PatternSpecs", () => {
  const audit = auditG5AU02CanonicalResolver();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(audit.totalPatternSpecCount, 22);
  assert.equal(audit.classCCount, 14);
  assert.equal(audit.classDCount, 8);
  assert.equal(audit.resolvedCount, 22);
  assert.equal(audit.sourceCount, 2);
});

test("S90 resolves exact canonical identity for every hidden PatternSpec", () => {
  for (const spec of specs) {
    const route = resolveG5AU02CanonicalRoute(spec.patternSpecId);
    assert.equal(route.patternSpecId, spec.patternSpecId);
    assert.equal(route.implementationClass, spec.implementationClass);
    assert.equal(route.formalMappingId, spec.formalMappingId);
    assert.equal(route.patternGroupId, spec.patternGroupId);
    assert.equal(route.knowledgePointId, spec.knowledgePointId);
    assert.equal(route.answerModelId, spec.answerModel.shape);
    assert.ok(route.sourceMetadata.length >= 1);
    assert.equal(route.lifecycle.selectorStatus, "hidden");
    assert.equal(route.lifecycle.productionUse, "forbidden");
  }
});

test("S90 generates and validates through the correct Class C or D binding", () => {
  for (const spec of specs) {
    const item = generateG5AU02Canonical(spec.patternSpecId, { seed: 20260714 });
    assert.equal(item.patternSpecId, spec.patternSpecId);
    assert.equal(item.canonicalRoute.implementationClass, spec.implementationClass);
    const result = validateG5AU02Canonical(item);
    assert.equal(result.ok, true, `${spec.patternSpecId}:${result.errors.join(",")}`);
  }
});

test("S90 blocks unknown, empty, and non-string PatternSpec IDs without fallback", () => {
  assert.throws(() => resolveG5AU02CanonicalRoute("ps_g5a_u02_unknown"), /UNKNOWN_PATTERN/);
  assert.throws(() => resolveG5AU02CanonicalRoute(""), /PATTERN_ID_REQUIRED/);
  assert.throws(() => resolveG5AU02CanonicalRoute(null), /PATTERN_ID_REQUIRED/);
});

test("S90 validator blocks missing or mutated canonical route", () => {
  const spec = specs[0];
  const item = generateG5AU02Canonical(spec.patternSpecId, { seed: 90 });
  const missing = { ...item };
  delete missing.canonicalRoute;
  assert.equal(validateG5AU02Canonical(missing).ok, false);
  assert.ok(validateG5AU02Canonical(missing).errors.includes("G5AU02_CANONICAL_RESOLVER_ROUTE_MISMATCH"));

  const mutated = {
    ...item,
    canonicalRoute: { ...item.canonicalRoute, knowledgePointId: "kp_mutated" },
  };
  assert.equal(validateG5AU02Canonical(mutated).ok, false);
  assert.ok(validateG5AU02Canonical(mutated).errors.includes("G5AU02_CANONICAL_RESOLVER_ROUTE_MISMATCH"));
});

test("S90 route and lifecycle are deeply frozen and remain hidden", () => {
  const route = resolveG5AU02CanonicalRoute(specs[0].patternSpecId);
  assert.equal(Object.isFrozen(route), true);
  assert.equal(Object.isFrozen(route.binding), true);
  assert.equal(Object.isFrozen(route.sourceMetadata), true);
  assert.equal(Object.isFrozen(G5A_U02_CANONICAL_RESOLVER_LIFECYCLE), true);
  assert.deepEqual(G5A_U02_CANONICAL_RESOLVER_LIFECYCLE, {
    unitId: "g5a_u02",
    resolverStatus: "canonical_hidden_integrated",
    selectorStatus: "hidden",
    canonicalRouting: "internal_explicit_only",
    productionUse: "forbidden",
    genericFallback: "forbidden",
    freeFormAI: "forbidden",
  });
});
