import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adapter = readFileSync(
  new URL("../../site/assets/browser/g4b-u04-public-controls.js", import.meta.url),
  "utf8",
);

test("G4B-U04 dynamic source injection restores an explicit query-backed source", () => {
  assert.match(
    adapter,
    /if \(queryParam\("sourceId"\) === G4B_U04_SOURCE_ID\) source\.value = G4B_U04_SOURCE_ID;/,
  );
  assert.doesNotMatch(
    adapter,
    /if \(!source\.value && queryParam\("sourceId"\) === G4B_U04_SOURCE_ID\)/,
  );
});
