import test from "node:test";
import assert from "node:assert/strict";

import { validateR08FifteenUnitGlobalMigrationCloseout } from "../../tools/curriculum/validate-r08-15-unit-global-migration-closeout.mjs";


test("R08 closes the 15-unit migration with 35 Global-primary worksheet cases", () => {
  const report = validateR08FifteenUnitGlobalMigrationCloseout();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.deepEqual(report.summary, {
    unitCount: 15,
    expectedCaseCount: 35,
    actualCaseCount: 35,
    numericCasePass: 15,
    applicationCasePass: 15,
    pblCasePass: 5,
    answerKeyCasePass: 35,
    globalAuthorityMetadataPass: 35,
    productAuditCloseoutComplete: true,
    productAuditBlockingFindingCount: 0,
  });
});


test("R08 keeps migration close distinct from full-product and admin-backend close", () => {
  const report = validateR08FifteenUnitGlobalMigrationCloseout();
  assert.equal(report.productAudit.closeoutComplete, true);
  assert.equal(report.rows.length, 35);
  assert.equal(report.rows.every((row) => row.authority.authorityMode === "GLOBAL_PRIMARY"), true);
  assert.equal(report.rows.every((row) => row.authority.legacyAuthorityRole === "COMPATIBILITY_ALIAS_READ_ONLY"), true);
  assert.equal(report.rows.every((row) => row.authority.metadataPresent && row.authority.configSnapshotPresent), true);
});
