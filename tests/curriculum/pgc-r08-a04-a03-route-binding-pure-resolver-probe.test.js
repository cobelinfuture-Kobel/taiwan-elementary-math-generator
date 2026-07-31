import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runner = await readFile("tools/curriculum/run-pgc-r08-a04-a03-route-binding-pure-resolver-probe.mjs", "utf8");

test("A03 pure resolver probe isolates browser settlement from binding semantics", () => {
  assert.match(runner, /resolvePublicUiCapabilityBinding/);
  assert.match(runner, /selectedPatternGroupIds: authorityIds/);
  assert.match(runner, /PURE_RESOLVER_BINDS_TARGET/);
  assert.match(runner, /PURE_RESOLVER_AUTHORITY_GROUP_INCOMPATIBLE/);
  assert.match(runner, /PURE_RESOLVER_TARGET_ROUTE_NOT_PROJECTED/);
  assert.match(runner, /browserInteractionCount: 0/);
  assert.match(runner, /generationInvoked: false/);
  assert.doesNotMatch(runner, /playwright/);
  assert.doesNotMatch(runner, /site\/index\.html/);
});
