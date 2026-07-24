import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  PUBLIC_CONTROL_PROFILE_REGISTRY,
  auditPublicControlProfiles,
  getPublicControlProfile,
} from "../../site/modules/curriculum/registry/public-control-profiles.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAQuestionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";

const PBL_SOURCE_IDS = new Set([
  "g3b_u04_3b04",
  "g4a_u08_4a08",
  "g5a_u08_5a08",
  "g4b_u04_4b04",
  "g5a_u02_5a02",
]);

test("public control profile registry exposes numeric/application for 15 units and PBL for exactly five", () => {
  const audit = auditPublicControlProfiles();
  assert.deepEqual(audit, { ok: true, errors: [], profileCount: 15 });
  assert.equal(PUBLIC_CONTROL_PROFILE_REGISTRY.sourceIds.length, 15);
  for (const sourceId of PUBLIC_CONTROL_PROFILE_REGISTRY.sourceIds) {
    const values = getPublicControlProfile(sourceId).questionTypeControl.options.map((row) => row.value);
    assert.ok(values.includes("numeric"), `${sourceId} numeric missing`);
    assert.ok(values.includes("application"), `${sourceId} application missing`);
    assert.equal(values.includes("pbl"), PBL_SOURCE_IDS.has(sourceId), `${sourceId} PBL eligibility mismatch`);
  }
});

test("config state sends numeric, application and approved PBL modes into the public worksheet plan", () => {
  for (const sourceId of PUBLIC_CONTROL_PROFILE_REGISTRY.sourceIds) {
    const state = createConfigState({ queryState: { sourceId, questionMode: "numeric" } });
    setBatchASourceId(state, sourceId);
    setBatchAQuestionMode(state, "application");
    assert.equal(getBatchAWorksheetPlan(state).questionMode, "application", `${sourceId} application plan missing`);
    if (PBL_SOURCE_IDS.has(sourceId)) {
      setBatchAQuestionMode(state, "pbl");
      assert.equal(getBatchAWorksheetPlan(state).questionMode, "pbl", `${sourceId} PBL plan missing`);
    } else {
      setBatchAQuestionMode(state, "pbl");
      assert.notEqual(getBatchAWorksheetPlan(state).questionMode, "pbl", `${sourceId} unapproved PBL accepted`);
    }
  }
});

test("classic public HTML loads the shared question-mode control panel", () => {
  const html = fs.readFileSync(new URL("../../site/index.html", import.meta.url), "utf8");
  assert.match(html, /id="g5a-u08-public-controls"/);
  assert.match(html, /id="g5a-u08-question-mode"/);
  assert.match(html, /public-control-ui\.js/);
});
