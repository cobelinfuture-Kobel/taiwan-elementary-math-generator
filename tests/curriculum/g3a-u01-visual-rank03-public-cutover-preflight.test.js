import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  listVisibleBatchAKnowledgePoints,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank02-extension.js";
import {
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as RANK02_GROUP,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID as RANK02_SPEC,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  requestsG3AU01VisualRank02Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-public-route.js";

const PREFLIGHT_PATH = new URL(
  "../../data/curriculum/mapping/g3a_u01_visual_rank03_public_selector_cutover_preflight.v1.json",
  import.meta.url,
);
const RANK03_PATH = new URL(
  "../../data/curriculum/pattern_specs/g3a_u01_visual_rank03_integer_number_line_mark_value.v1.json",
  import.meta.url,
);

const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const rank03=JSON.parse(fs.readFileSync(RANK03_PATH,"utf8"));
const RANK03_GROUP="pg_g3a_u01_visual_integer_number_line_mark_value";
const RANK03_SPEC="ps_g3a_u01_visual_integer_number_line_mark_value";

test("Rank03 public cutover preflight starts from accepted hidden runtime and does not expose it early",()=>{
  assert.equal(preflight.status,"PASS_PUBLIC_CUTOVER_PREFLIGHT_IMPLEMENTATION_NOT_STARTED");
  assert.equal(rank03.status,"hidden_runtime_accepted_public_cutover_not_started");
  assert.equal(rank03.lifecycle.hiddenWorksheetAcceptance,"PASS_FOCUSED_CI");
  assert.equal(rank03.hiddenRuntime.publicCutoverStarted,false);
  assert.equal(rank03.patternSpec.selectorStatus,"hidden");
  assert.equal(rank03.patternSpec.productionUse,"forbidden");

  const numberLineGroups=getVisiblePatternGroupsForKnowledgePoint(KP);
  assert.equal(numberLineGroups.some((group)=>group.patternGroupId===RANK02_GROUP),true);
  assert.equal(numberLineGroups.some((group)=>group.patternGroupId===RANK03_GROUP),false);
});

test("Rank03 reuses the Rank02 canonical KP and must be projected as a sibling target rather than a duplicate KP",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  assert.equal(rows.length,preflight.currentPublicTopology.canonicalVisibleKnowledgePointCount);
  assert.equal(rows.filter((row)=>row.knowledgePointId===KP).length,1);
  assert.equal(preflight.cutoverDecision.selectorNodeStrategy,"PATTERN_GROUP_SIBLING_REUSING_EXISTING_CANONICAL_KP");
  assert.equal(preflight.cutoverDecision.newKnowledgePointRequired,false);
  assert.equal(preflight.cutoverDecision.addCanonicalKnowledgePointRow,false);
  assert.equal(preflight.cutoverDecision.newSelectorTargetId,RANK03_GROUP);
  assert.equal(preflight.cutoverDecision.underlyingKnowledgePointId,KP);
});

test("Rank03 preflight preserves the existing 10-target topology and plans 11 targets after sibling cutover",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const currentTargets=[...rows.map((row)=>row.knowledgePointId),RANK01_GROUP];
  assert.equal(currentTargets.length,10);
  assert.equal(new Set(currentTargets).size,10);
  assert.equal(preflight.currentPublicTopology.currentTotalSameUnitSelectorTargetCount,10);
  assert.equal(preflight.cutoverDecision.expectedSameUnitSelectorTargetCountAfterCutover,11);
  assert.equal(currentTargets.includes(RANK03_GROUP),false);
});

test("Rank02 current KP-only public fallback is explicitly identified as blocking ambiguity before Rank03 cutover",()=>{
  const kpOnlyPlan={
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[],
    patternSpecIds:[],
  };
  assert.equal(requestsG3AU01VisualRank02Public(kpOnlyPlan),true);
  assert.equal(preflight.routeAmbiguityPreflight.severity,"BLOCKING_BEFORE_PUBLIC_CUTOVER");
  assert.match(preflight.routeAmbiguityPreflight.requiredRepair,/Rank02 PatternGroup\/PatternSpec/);
  assert.equal(preflight.publicRoutePreflight.routeIdentity.requiredPatternGroupId,RANK03_GROUP);
  assert.equal(preflight.publicRoutePreflight.routeIdentity.requiredPatternSpecId,RANK03_SPEC);
});

test("Rank03 same-unit plan requires independent forced leaves for Rank02 and Rank03 under the same KP",()=>{
  const rank02=preflight.aggregationPreflight.sameUnit.requiredRank02CanonicalLeaf;
  const rank03Leaf=preflight.aggregationPreflight.sameUnit.requiredRank03Leaf;
  assert.equal(rank02.knowledgePointId,KP);
  assert.equal(rank03Leaf.knowledgePointId,KP);
  assert.notEqual(rank02.selectorTargetId,rank03Leaf.selectorTargetId);
  assert.deepEqual(rank02.forcedPatternGroupIds,[RANK02_GROUP]);
  assert.deepEqual(rank03Leaf.forcedPatternGroupIds,[RANK03_GROUP]);
  assert.equal(preflight.cutoverDecision.allSelectPolicy.includes("simultaneously"),true);
});

test("Rank03 preflight locks Classic/Exam three-mode scope without changing runtime or Rank04+",()=>{
  assert.deepEqual(preflight.examUiPreflight.supportedCompositionModesAfterCutover,[
    "SINGLE_KP",
    "MIXED_KP_SAME_UNIT",
    "MIXED_KP_CROSS_UNIT",
  ]);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newGeneratorRequired,false);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newValidatorRequired,false);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newRendererFamilyRequired,false);
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("make Rank03 selector visible in this preflight milestone"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank04 or Rank05"));
});
