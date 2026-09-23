import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03DW3ProtectedD0CompatibilityRevalidation } from "../../src/curriculum/full-product/p03d-w3-protected-d0-compatibility-revalidation.mjs";

test("P03D runtime output is fail-closed and immutable at its public boundaries", () => {
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(Object.isFrozen(runtime.rows), true);
  assert.equal(Object.isFrozen(runtime.compatibilityWitnesses), true);
  assert.equal(Object.isFrozen(runtime.unaffectedNewProductRows), true);
  assert.equal(Object.isFrozen(runtime.metrics), true);
  assert.equal(runtime.rows.every((row) => Object.isFrozen(row)), true);
  assert.equal(runtime.compatibilityWitnesses.every((row) => Object.isFrozen(row)), true);
  assert.equal(runtime.rows.every((row) => row.newlyProductAdmittedByP03D === false), true);
  assert.equal(runtime.unaffectedNewProductRows.every((row) => row.productProductionAdmitted === false), true);
});
