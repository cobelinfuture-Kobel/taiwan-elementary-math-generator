import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ID = "g5a_u08_5a08";
const ROUTE_COUNT = 30;
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";
const capacityPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const inventoryPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json");

const capacity = JSON.parse(fs.readFileSync(capacityPath, "utf8"));
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const targetQueue = inventory.repairQueue.filter((route) => route.sourceId === SOURCE_ID);
if (targetQueue.length !== ROUTE_COUNT) {
  throw new Error(`PGC_R06_A05_REPAIR_QUEUE_TARGET_COUNT_MISMATCH:${targetQueue.length}`);
}
const targetById = new Map(targetQueue.map((route) => [route.routeId, route]));
let projected = 0;
for (const route of capacity.routes) {
  const queueRoute = targetById.get(route.routeId);
  if (!queueRoute) continue;
  projected += 1;
  const requiredGap = queueRoute.questionType === "pbl" ? DIVERSITY_GAP : CAPACITY_GAP;
  route.gapCodes = [...new Set([...(route.gapCodes ?? []), requiredGap])];
}
if (projected !== ROUTE_COUNT) {
  throw new Error(`PGC_R06_A05_CAPACITY_ROUTE_PROJECTION_MISMATCH:${projected}`);
}
fs.writeFileSync(capacityPath, `${JSON.stringify(capacity, null, 2)}\n`);

await import("./materialize-pgc-r06-a05-g5a-u08-30-residual-dual-axis-impl.mjs");
