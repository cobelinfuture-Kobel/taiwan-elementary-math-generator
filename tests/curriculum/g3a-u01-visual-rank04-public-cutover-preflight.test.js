import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  listVisibleBatchAKnowledgePoints,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank03-extension.js";
import {
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as RANK02_GROUP,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID as RANK03_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank03-selector-projection.js";
import {
  requestsG3AU01VisualRank02Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-public-route.js";
import {
  requestsG3AU01VisualRank03Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-public-route.js";

const PREFLIGHT_PATH = new URL(
  "../../data/curriculum/mapping/g3a_u01_visual_rank04_public_selector_cutover_preflight.v1.json",
  import.meta.url,
);
const RANK04_PATH = new URL(
  "../../data/curriculum/pattern_specs/g3a_u01_visual_rank04_integer_number_line_complete_scale.v1.json",
  import.meta.url,
);

const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const rank04=JSON.parse(fs.readFileSync(RANK04_PATH,"utf8"));
const RANK04_GROUP="pg_g3a_u01_visual_integer_number_line_complete_scale";
const RANK04_SPEC="ps_g3a_u01_visual_integer_number_line_complete_scale";

test("Rank04 public cutover preflight starts from accepted hidden runtime and does not expose it early",()=>{
  assert.equal(preflight.status,"PASS_PUBLIC_CUTOVER_PREFLIGHT_IMPLEMENTATION_NOT_STARTED");
  assert.equal(rank04.status,"hidden_runtime_accepted_public_cutover_not_started");
  assert.equal(rank04.lifecycle.hiddenWorksheetAcceptance,"PASS_FOCUSED_CI");
  assert.equal(rank04.hiddenRuntime.publicCutoverStarted,false);
  assert.equal(rank04.patternSpec.selectorStatus,"hidden");
  assert.equal(rank04.patternSpec.productionUse,"forbidden");

  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  assert.equal(groups.some((group)=>group.patternGroupId===RANK02_GROUP),true);
  assert.equal(groups.some((group)=>group.patternGroupId===RANK03_GROUP),true);
  assert.equal(groups.some((group)=>group.patternGroupId===RANK04_GROUP),false);
});

test("Rank04 reuses the existing number-line KP and must be projected as a third sibling target",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  assert.equal(rows.length,preflight.currentPublicTopology.canonicalVisibleKnowledgePointCount);
  assert.equal(rows.filter((row)=>row.knowledgePointId===KP).length,1);
  assert.equal(preflight.cutoverDecision.selectorNodeStrategy,"PATTERN_GROUP_SIBLING_REUSING_EXISTING_CANONICAL_KP");
  assert.equal(preflight.cutoverDecision.newKnowledgePointRequired,false);
  assert.equal(preflight.cutoverDecision.addCanonicalKnowledgePointRow,false);
  assert.equal(preflight.cutoverDecision.newSelectorTargetId,RANK04_GROUP);
  assert.equal(preflight.cutoverDecision.underlyingKnowledgePointId,KP);
});

test("Rank04 preflight preserves the current 11-target topology and plans 12 targets after sibling cutover",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const currentTargets=[...rows.map((row)=>row.knowledgePointId),RANK01_GROUP,RANK03_GROUP];
  assert.equal(currentTargets.length,11);
  assert.equal(new Set(currentTargets).size,11);
  assert.equal(preflight.currentPublicTopology.currentTotalSameUnitSelectorTargetCount,11);
  assert.equal(preflight.cutoverDecision.expectedSameUnitSelectorTargetCountAfterCutover,12);
  assert.equal(currentTargets.includes(RANK04_GROUP),false);
});

test("Rank04 preflight preserves explicit Rank02/Rank03 routing and requires a distinct Rank04 PatternGroup/PatternSpec route",()=>{
  const rank04Plan={
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[RANK04_GROUP],
    patternSpecIds:[RANK04_SPEC],
  };
  assert.equal(requestsG3AU01VisualRank02Public(rank04Plan),false);
  assert.equal(requestsG3AU01VisualRank03Public(rank04Plan),false);
  assert.equal(preflight.routeAmbiguityPreflight.severity,"BLOCKING_BEFORE_PUBLIC_CUTOVER");
  assert.match(preflight.routeAmbiguityPreflight.requiredRepair,/explicit Rank04 PatternGroup\/PatternSpec/);
  assert.equal(preflight.publicRoutePreflight.routeIdentity.requiredPatternGroupId,RANK04_GROUP);
  assert.equal(preflight.publicRoutePreflight.routeIdentity.requiredPatternSpecId,RANK04_SPEC);

  const kpOnly={...rank04Plan,selectedPatternGroupIds:[],patternSpecIds:[]};
  assert.equal(requestsG3AU01VisualRank02Public(kpOnly),false);
  assert.equal(requestsG3AU01VisualRank03Public(kpOnly),false);
});

test("Rank04 same-unit plan requires independent Rank02, Rank03 and Rank04 leaves under one KP",()=>{
  const rank02=preflight.aggregationPreflight.sameUnit.requiredRank02CanonicalLeaf;
  const rank03=preflight.aggregationPreflight.sameUnit.requiredRank03Leaf;
  const rank04Leaf=preflight.aggregationPreflight.sameUnit.requiredRank04Leaf;
  assert.equal(rank02.knowledgePointId,KP);
  assert.equal(rank03.knowledgePointId,KP);
  assert.equal(rank04Leaf.knowledgePointId,KP);
  assert.equal(new Set([rank02.selectorTargetId,rank03.selectorTargetId,rank04Leaf.selectorTargetId]).size,3);
  assert.deepEqual(rank02.forcedPatternGroupIds,[RANK02_GROUP]);
  assert.deepEqual(rank03.forcedPatternGroupIds,[RANK03_GROUP]);
  assert.deepEqual(rank04Leaf.forcedPatternGroupIds,[RANK04_GROUP]);
  assert.equal(preflight.cutoverDecision.allSelectPolicy.includes("simultaneously"),true);
});

test("Rank04 preflight locks Classic/Exam three-mode scope without changing runtime or Rank05+",()=>{
  assert.deepEqual(preflight.examUiPreflight.supportedCompositionModesAfterCutover,[
    "SINGLE_KP",
    "MIXED_KP_SAME_UNIT",
    "MIXED_KP_CROSS_UNIT",
  ]);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newGeneratorRequired,false);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newValidatorRequired,false);
  assert.equal(preflight.publicRoutePreflight.runtimeReuse.newRendererFamilyRequired,false);
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("make Rank04 selector visible in this preflight milestone"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank05 or Rank06"));
});
