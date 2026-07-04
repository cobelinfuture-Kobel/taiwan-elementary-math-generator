import test from "node:test";
import assert from "node:assert/strict";

import {
  parseQueryState,
  writeQueryStateFromState
} from "../../site/assets/browser/state/query-state.js";

function createS43C10VisibleAddMultiCarrySelectorAccess() {
  const knowledgePoint = Object.freeze({
    knowledgePointId: "kp_g3a_u02_add_multi_carry",
    sourceId: "g3a_u02_3a02",
    displayName: "四位數加法進位"
  });
  const patternGroup = Object.freeze({
    patternGroupId: "pg_g3a_u02_add_multi_carry_seed",
    sourceId: "g3a_u02_3a02",
    patternSpecIds: ["ps_g3a_u02_4digit_add_multi_carry"],
    visibilityStatus: "visible"
  });

  return {
    getSelectorAvailability: () => ({
      visibleCount: 1,
      hiddenPendingCount: 1,
      notSelectableCount: 2,
      bySourceId: {
        g3a_u02_3a02: {
          sourceId: "g3a_u02_3a02",
          visibleCount: 1,
          hiddenPendingCount: 1,
          notSelectableCount: 2
        }
      }
    }),
    getVisibleBatchAKnowledgePoint: (knowledgePointId) => (
      knowledgePointId === knowledgePoint.knowledgePointId ? { ...knowledgePoint } : null
    ),
    getVisiblePatternGroupsForKnowledgePoint: (knowledgePointId) => (
      knowledgePointId === knowledgePoint.knowledgePointId ? [{ ...patternGroup, patternSpecIds: [...patternGroup.patternSpecIds] }] : []
    )
  };
}

test("parseQueryState keeps existing source-unit params backward compatible", () => {
  const state = parseQueryState("?sourceId=g3a_u02_3a02&questionCount=12&ordering=shuffleAcrossPatterns&answerKey=0&generationSeed=abc&columns=3&rowsPerPage=8");

  assert.equal(state.sourceId, "g3a_u02_3a02");
  assert.equal(state.questionCount, 12);
  assert.equal(state.ordering, "shuffleAcrossPatterns");
  assert.equal(state.includeAnswerKey, false);
  assert.equal(state.generationSeed, "abc");
  assert.equal(state.columns, 3);
  assert.equal(state.rowsPerPage, 8);
  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
  assert.deepEqual(state.selectorWarnings, []);
});

test("parseQueryState drops hidden A-row selector query ids in current zero-visible state", () => {
  const state = parseQueryState("?sourceId=g3a_u02_3a02&selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_add_multi_carry&pg=pg_g3a_u02_add_multi_carry_seed");

  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
  assert.ok(state.selectorWarnings.some((warning) => warning.code === "no_visible_knowledge_points"));
  assert.ok(state.selectorWarnings.some((warning) => warning.code === "selector_mode_fallback"));
  assert.ok(state.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
});

test("parseQueryState drops D-row selector query ids in current zero-visible state", () => {
  const state = parseQueryState("?sourceId=g3a_u02_3a02&selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_word_problem_estimation_add_sub&pg=pg_g3a_u02_word_problem_estimation_add_sub");

  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
  assert.ok(state.selectorWarnings.length >= 2);
});

test("parseQueryState preserves future visible single-KP selector params when selector access exposes one visible KP", () => {
  const state = parseQueryState(
    "?sourceId=g3a_u02_3a02&selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_add_multi_carry&pg=pg_g3a_u02_add_multi_carry_seed&questionCount=7",
    { selectorAccess: createS43C10VisibleAddMultiCarrySelectorAccess() }
  );

  assert.equal(state.sourceId, "g3a_u02_3a02");
  assert.equal(state.questionCount, 7);
  assert.equal(state.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds, ["kp_g3a_u02_add_multi_carry"]);
  assert.deepEqual(state.selectedPatternGroupIds, ["pg_g3a_u02_add_multi_carry_seed"]);
  assert.deepEqual(state.selectorWarnings, []);
});

test("parseQueryState drops non-visible IDs even when future selector access has one visible KP", () => {
  const state = parseQueryState(
    "?sourceId=g3a_u02_3a02&selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_word_problem_estimation_add_sub&pg=pg_g3a_u02_word_problem_estimation_add_sub",
    { selectorAccess: createS43C10VisibleAddMultiCarrySelectorAccess() }
  );

  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
  assert.ok(state.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
  assert.ok(state.selectorWarnings.some((warning) => warning.code === "selector_mode_fallback"));
});

test("writeQueryStateFromState does not write selector params while current selector state is sourceUnit", () => {
  let replacedUrl = null;
  global.window = {
    location: {
      href: "https://example.test/?selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_add_multi_carry"
    },
    history: {
      replaceState(_state, _title, url) {
        replacedUrl = url.toString();
      }
    }
  };

  writeQueryStateFromState({
    batchA: {
      sourceId: "g3a_u02_3a02",
      questionCount: 20,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: "batch-a-browser",
      columns: 4,
      rowsPerPage: 10,
      selectionMode: "sourceUnit",
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: []
    }
  });

  const url = new URL(replacedUrl);
  assert.equal(url.searchParams.get("sourceId"), "g3a_u02_3a02");
  assert.equal(url.searchParams.get("selectionMode"), null);
  assert.equal(url.searchParams.get("kp"), null);
  assert.equal(url.searchParams.get("pg"), null);
});

test("writeQueryStateFromState writes selector params for future visible single-KP state", () => {
  let replacedUrl = null;
  global.window = {
    location: {
      href: "https://example.test/?sourceId=g3a_u02_3a02"
    },
    history: {
      replaceState(_state, _title, url) {
        replacedUrl = url.toString();
      }
    }
  };

  writeQueryStateFromState({
    batchA: {
      sourceId: "g3a_u02_3a02",
      questionCount: 7,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: "s43c10-query-survival",
      columns: 4,
      rowsPerPage: 10,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
      selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"]
    }
  });

  const url = new URL(replacedUrl);
  assert.equal(url.searchParams.get("sourceId"), "g3a_u02_3a02");
  assert.equal(url.searchParams.get("selectionMode"), "singleKnowledgePoint");
  assert.deepEqual(url.searchParams.getAll("kp"), ["kp_g3a_u02_add_multi_carry"]);
  assert.deepEqual(url.searchParams.getAll("pg"), ["pg_g3a_u02_add_multi_carry_seed"]);
});
