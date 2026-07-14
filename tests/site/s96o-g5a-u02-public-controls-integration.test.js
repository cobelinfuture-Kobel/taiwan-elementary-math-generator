import test from "node:test";
import assert from "node:assert/strict";

import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAQuestionMode,
  setBatchASelectorSelection,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";

const SOURCE_ID = "g5a_u02_5a02";
const knowledgePointIds = listG5AU02PublicKnowledgePoints().map((row) => row.knowledgePointId);

test("S96O config state exposes G5A-U02 shared public controls", () => {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchASelectorSelection(state, {
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: knowledgePointIds,
    selectedPatternGroupIds: [],
  });
  setBatchAQuestionMode(state, "reasoning");
  setBatchADepthMode(state, "extended");
  setBatchAContextMode(state, "abstract_math");
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.questionMode, "reasoning");
  assert.equal(plan.depthMode, "extended");
  assert.equal(plan.contextMode, "abstract_math");
  assert.deepEqual(plan.publicControls, {
    questionMode: "reasoning",
    depthMode: "extended",
    contextMode: "abstract_math",
  });
  assert.equal(plan.genericFallback, false);
  assert.equal(plan.freeFormAI, false);
});

test("S96O resolver applies question type, depth and context as an intersection", () => {
  const result = resolveG5AU02BrowserPlan({
    sourceId: SOURCE_ID,
    knowledgePointIds,
    questionMode: "reasoning",
    depthMode: "extended",
    contextMode: "abstract_math",
  });
  assert.equal(result.ok, true);
  assert.ok(result.patternSpecIds.length > 0);
  assert.ok(result.patternSpecIds.length < result.candidatePatternSpecIds.length);
  assert.equal(result.lifecycle.browserResolverStatus, "integrated_with_public_control_intersection");
});

test("S96O empty control intersection blocks without generic fallback", () => {
  const questionModes = ["concept", "numeric", "application", "reasoning"];
  const depths = ["basic", "extended"];
  const contexts = ["abstract_math", "daily_life", "geometry_context"];
  let blocked = null;
  for (const questionMode of questionModes) {
    for (const depthMode of depths) {
      for (const contextMode of contexts) {
        const result = resolveG5AU02BrowserPlan({
          sourceId: SOURCE_ID,
          knowledgePointIds,
          questionMode,
          depthMode,
          contextMode,
        });
        if (!result.ok && result.errors.includes("G5AU02_PUBLIC_CONTROL_INTERSECTION_EMPTY")) {
          blocked = result;
          break;
        }
      }
      if (blocked) break;
    }
    if (blocked) break;
  }
  assert.ok(blocked, "expected at least one unsupported public-control intersection");
  assert.equal(blocked.mode, "blocked");
  assert.deepEqual(blocked.patternSpecIds, []);
  assert.equal(blocked.plan, null);
});
