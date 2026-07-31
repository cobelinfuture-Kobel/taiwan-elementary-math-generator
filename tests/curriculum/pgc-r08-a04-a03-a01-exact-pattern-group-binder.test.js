import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { exactPatternGroupAuthoritySummary, enrichBrowserRowWithExactPatternGroups } from "../../tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs";

const authority=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03-A00.route-identity-expressibility-authority.json","utf8"));
const plan=JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03-A01.exact-pattern-group-binding-plan.json","utf8"));
const queue=JSON.parse(await readFile(plan.queuePath,"utf8"));
const binder=await readFile("tools/curriculum/pgc-r08-exact-pattern-group-binder.mjs","utf8");

test("A03 A01 consumes the frozen exact PatternGroup authority",()=>{
  assert.equal(authority.decision.exactPatternGroupSelectionRepairAuthorized,true);
  assert.equal(authority.summary.failedExactPatternGroupSelectableRouteCount,136);
  assert.equal(plan.targetRouteCount,136);
  assert.equal(queue.rows.length,136);
});

test("all 136 failed browser rows enrich to a non-empty exact PatternGroup set",()=>{
  const columns=Object.fromEntries(queue.rowColumns.map((name,index)=>[name,index]));
  for(const sourceRow of queue.rows){
    const row=enrichBrowserRowWithExactPatternGroups({routeIndex:sourceRow[columns.routeIndex],routeId:sourceRow[columns.routeId]});
    assert.ok(row.publicPatternGroupIds.length>0,row.routeId);
  }
  const summary=exactPatternGroupAuthoritySummary();
  assert.equal(summary.routeCount,1155);
});

test("binder selects exact targets and drains every non-target without greedy fallback",()=>{
  assert.match(binder,/SELECT_EXACT_TARGET/);
  assert.match(binder,/DESELECT_NON_TARGET/);
  assert.doesNotMatch(binder,/first compatible/i);
  assert.equal(plan.repairContract.productMutationAllowed,false);
  assert.equal(plan.repairContract.perRoutePatchAllowed,false);
});
