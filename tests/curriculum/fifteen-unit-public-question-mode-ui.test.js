import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  FIFTEEN_UNIT_PBL_SOURCE_IDS,
  FIFTEEN_UNIT_PUBLIC_SOURCE_IDS,
  auditFifteenUnitPublicControlProfiles,
  getFifteenUnitPublicControlProfile,
} from "../../site/modules/curriculum/registry/fifteen-unit-public-control-profiles.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAQuestionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";

test("public control facade exposes numeric/application for 15 units and PBL for exactly five", () => {
  const audit = auditFifteenUnitPublicControlProfiles();
  assert.deepEqual(audit, { ok: true, errors: [], profileCount: 15, pblProfileCount: 5 });
  assert.equal(FIFTEEN_UNIT_PUBLIC_SOURCE_IDS.length, 15);
  for (const sourceId of FIFTEEN_UNIT_PUBLIC_SOURCE_IDS) {
    const values = getFifteenUnitPublicControlProfile(sourceId).questionTypeControl.options.map((row) => row.value);
    assert.ok(values.includes("numeric"), `${sourceId} numeric missing`);
    assert.ok(values.includes("application"), `${sourceId} application missing`);
    assert.equal(values.includes("pbl"), FIFTEEN_UNIT_PBL_SOURCE_IDS.has(sourceId), `${sourceId} PBL eligibility mismatch`);
  }
});

test("config state sends numeric, application and approved PBL modes into the public worksheet plan", () => {
  for (const sourceId of FIFTEEN_UNIT_PUBLIC_SOURCE_IDS) {
    const state = createConfigState({ queryState: { sourceId, questionMode: "numeric" } });
    setBatchASourceId(state, sourceId);
    setBatchAQuestionMode(state, "application");
    assert.equal(getBatchAWorksheetPlan(state).questionMode, "application", `${sourceId} application plan missing`);
    if (FIFTEEN_UNIT_PBL_SOURCE_IDS.has(sourceId)) {
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
