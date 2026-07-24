import test from "node:test";
import assert from "node:assert/strict";

import { auditFifteenUnitPublicWorksheetCloseout } from "../../tools/curriculum/audit-15-unit-public-worksheet-closeout.mjs";

test("15-unit public worksheet closeout reaches the original D0 product endpoint", () => {
  const report = auditFifteenUnitPublicWorksheetCloseout();
  console.log(JSON.stringify(report, null, 2));

  assert.equal(report.metrics.unitCount, 15, "The closeout scope must remain exactly 13 Batch A units plus 2 Batch B units.");
  assert.equal(report.closeoutComplete, true, `15-unit public worksheet closeout is blocked:\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.status, "D0_PUBLIC_WORKSHEET_CLOSEOUT_PASS");
});
