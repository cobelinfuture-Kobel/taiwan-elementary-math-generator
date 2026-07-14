import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_PUBLIC_SOURCE_ID,
  auditG5AU02BrowserResolver,
  isG5AU02KnowledgePointPlan,
  resolveG5AU02BrowserPlan,
} from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";

test("S96C source-unit plans remain passthrough", () => {
  const resolved = resolveG5AU02BrowserPlan({ sourceId: G5A_U02_PUBLIC_SOURCE_ID, questionCount: 22 });
  assert.equal(resolved.ok, true);
  assert.equal(resolved.mode, "sourceUnit");
  assert.deepEqual(resolved.patternSpecIds, []);
});

test("S96C resolves one public KnowledgePoint", () => {
  const [row] = listG5AU02PublicKnowledgePoints();
  const resolved = resolveG5AU02BrowserPlan({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    knowledgePointIds: [row.knowledgePointId],
    questionCount: 20,
  });
  assert.equal(isG5AU02KnowledgePointPlan(resolved.plan), true);
  assert.equal(resolved.ok, true);
  assert.equal(resolved.mode, "singleKnowledgePoint");
  assert.deepEqual(resolved.patternSpecIds, row.patternSpecIds);
});

test("S96C resolves multiple KnowledgePoints in canonical selection order", () => {
  const rows = listG5AU02PublicKnowledgePoints().slice(0, 3);
  const resolved = resolveG5AU02BrowserPlan({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    selectedKnowledgePointIds: rows.map((row) => row.knowledgePointId),
  });
  assert.equal(resolved.ok, true);
  assert.equal(resolved.mode, "multiKnowledgePoint");
  assert.deepEqual(resolved.patternSpecIds, [...new Set(rows.flatMap((row) => row.patternSpecIds))]);
});

test("S96C blocks duplicate and unknown KnowledgePoints", () => {
  const [row] = listG5AU02PublicKnowledgePoints();
  const duplicate = resolveG5AU02BrowserPlan({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    knowledgePointIds: [row.knowledgePointId, row.knowledgePointId],
  });
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors[0], /DUPLICATE/);

  const unknown = resolveG5AU02BrowserPlan({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    knowledgePointIds: ["kp_unknown"],
  });
  assert.equal(unknown.ok, false);
  assert.match(unknown.errors[0], /UNKNOWN/);
});

test("S96C ignores other source units and passes audit", () => {
  assert.equal(resolveG5AU02BrowserPlan({ sourceId: "g3a_u01_3a01" }), null);
  assert.deepEqual(auditG5AU02BrowserResolver(), { ok: true, errors: [] });
});
