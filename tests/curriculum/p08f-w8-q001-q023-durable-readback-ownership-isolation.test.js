import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const readJson=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const readText=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");

const workflow=readText(".github/workflows/p07f-w7-q023-live-pages-e2e.yml");
const q023=readJson("docs/ci/latest-p07f-w7-q023-pages-e2e.json");
const q024Pre=readJson("data/curriculum/full-product/p07f/q024-g6b-u04-successive-rate-change-source-authority-preflight.json");
const q024Impl=readJson("data/curriculum/full-product/p07f/q024-g6b-u04-successive-rate-change-implementation.json");
const impact=readJson("data/project/change-impact/P08F_W8_Q001_Q023_DURABLE_READBACK_OWNERSHIP_ISOLATION.impact.json");
const validation=readJson("data/project/validation-plans/P08F_W8_Q001_Q023_DURABLE_READBACK_OWNERSHIP_ISOLATION.validation.json");

const Q023_D0_SHA="65fbe2def3f6705752f8f8cf20738faaf358849f";
const W8_Q001_SHA="2ddee98f99b4dec18ab6f24d9fb3acac31f18aa1";

test("Q023 durable readback is restored to its canonical historical D0 evidence",()=>{
  assert.equal(q023.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q023.exactHeadSha,Q023_D0_SHA);
  assert.equal(q023.run.id,"36107339515");
  assert.equal(q023.taskId,"P07F_W7DirectProductVerticalSlice023Implementation");
  assert.notEqual(q023.exactHeadSha,W8_Q001_SHA);
});

test("Q024 predecessor contracts consume the restored Q023 D0 SHA",()=>{
  assert.equal(q024Pre.predecessorD0Evidence.q023MergeSha,Q023_D0_SHA);
  assert.equal(q024Impl.predecessorD0.q023MergeSha,Q023_D0_SHA);
  assert.equal(q023.exactHeadSha,q024Pre.predecessorD0Evidence.q023MergeSha);
  assert.equal(q023.exactHeadSha,q024Impl.predecessorD0.q023MergeSha);
});

test("Q023 workflow no longer triggers on shared successor source-unit advances",()=>{
  assert.doesNotMatch(workflow,/site\/modules\/curriculum\/batch-a\/source-units\.js/);
  assert.match(workflow,/g6a-u08-speed-distance-time-selector-projection-p07f23\.js/);
  assert.match(workflow,/batch-a-selector-p07f23-extension\.js/);
  assert.match(workflow,/public-ui-capability-binding-p07f23\.js/);
  assert.match(workflow,/g6a-u08-speed-distance-time-runtime-p07f23\.js/);
});

test("Q023 durable PASS evidence fails closed instead of being silently overwritten by successor SHA",()=>{
  assert.match(workflow,/P07F23_HISTORICAL_PASS_READBACK_LOCKED/);
  assert.match(workflow,/existing\.status === "PASS_E6_D0_COMPLETE"/);
  assert.match(workflow,/payload\.status !== "PASS_E6_D0_COMPLETE"/);
  assert.match(workflow,/payload\.exactHeadSha !== existing\.exactHeadSha/);
  assert.match(workflow,/process\.exit\(23\)/);
});

test("ownership-isolation repair is governance-only and bounded",()=>{
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");
  assert.equal(impact.changeImpact.sharedExecutableChange,false);
  assert.equal(impact.changeImpact.publicAuthorityCutover,false);
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(impact.scopeGuards.w8ProductSemanticMutation,false);
  assert.equal(impact.scopeGuards.q023ProductSemanticMutation,false);
  assert.equal(impact.scopeGuards.q002OrLaterProductMutation,false);
  assert.deepEqual(validation.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  const gateIds=validation.lanes.KP_FOCUSED.map(x=>x.gateId);
  assert.equal(gateIds.includes("FULL_NODE_REGRESSION"),false);
  assert.equal(gateIds.includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.deepEqual(validation.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
