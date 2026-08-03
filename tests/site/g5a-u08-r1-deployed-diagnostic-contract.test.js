import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runner = readFileSync(
  new URL("../../tools/curriculum/run-gs01-g5a-u08-deployed-pages-smoke.mjs", import.meta.url),
  "utf8",
);

test("G5A-U08 deployed matrix reports structured capability and control timeout evidence", () => {
  assert.match(runner, /G5A_U08_R1_MATRIX_CAPABILITY_SYNC_TIMEOUT/);
  assert.match(runner, /G5A_U08_R1_EXPECTED_GENERATE_CONTROL_NOT_EXPOSED/);
  assert.match(runner, /G5A_U08_R1_CONTROL_SELECTION_DID_NOT_SETTLE/);
  assert.match(runner, /snapshot: await controlSnapshot\(page\)/);
  assert.match(runner, /timeout: 15000/);
  assert.match(runner, /timeout: 30000/);
});

test("G5A-U08 deployed query replay is isolated from the final matrix row", () => {
  assert.match(runner, /G5A_U08_R1_REPLAY_PRELOAD_STATE_NOT_ISOLATED/);
  assert.match(runner, /G5A_U08_R1_REPLAY_CAPABILITY_SYNC_TIMEOUT/);
  assert.match(runner, /query-replay-preload/);
  assert.match(runner, /replayUrl\.searchParams\.delete\("kp"\)/);
  assert.match(runner, /replayUrl\.searchParams\.delete\("pg"\)/);
  assert.match(runner, /replayMatrixRow/);
});
