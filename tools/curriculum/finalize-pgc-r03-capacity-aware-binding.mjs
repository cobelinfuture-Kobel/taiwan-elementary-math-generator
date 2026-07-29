import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");

export async function finalizePgcR03CapacityAwareBinding() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_CONTRACT_MISSING");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") {
    throw new Error(`PGC_R03_V3_REQUIRED:${contract.schemaName ?? "unknown"}`);
  }

  const r02Module = await import(`./materialize-pgc-r02-ui-capability-binding-r03.mjs?finalize=${Date.now()}`);
  const currentR02 = r02Module.materializePgcR02UiCapabilityBinding();
  const hardBlockers = (contract.hardBlockers ?? []).filter((code) => ![
    "CURRENT_R02_CAPACITY_AWARE_BINDING_FAILED",
    "CURRENT_UI_UNVERIFIED_CAPACITY_EXPOSED",
  ].includes(code));
  if (currentR02.status !== "PASS") hardBlockers.push("CURRENT_R02_CAPACITY_AWARE_BINDING_FAILED");
  if (currentR02.summary.unverifiedCapacityExposureCount !== 0) hardBlockers.push("CURRENT_UI_UNVERIFIED_CAPACITY_EXPOSED");

  const summary = {
    ...contract.summary,
    currentLegalBindingCount: currentR02.bindings.length,
    currentVerified20BindingCount: currentR02.summary.verified20BindingCount,
    currentLimitedBindingCount: currentR02.summary.limitedCapacityBindingCount,
    currentUnverifiedCapacityExposureCount: currentR02.summary.unverifiedCapacityExposureCount,
    hardBlockerCount: hardBlockers.length,
  };
  const hasDownstreamGaps = (contract.downstreamGaps ?? []).some((gap) => Number(gap.count) > 0);
  const finalized = {
    ...contract,
    status: hardBlockers.length > 0 ? "FAIL_CLOSED" : hasDownstreamGaps ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS",
    summary,
    hardBlockers,
    currentUiBindingContract: {
      schemaName: currentR02.schemaName,
      status: currentR02.status,
      summary: currentR02.summary,
    },
    finalizedAtRuntimeStage: "PGC_R03_CAPACITY_AWARE_BINDING_FINALIZED",
  };
  fs.writeFileSync(contractPath, `${JSON.stringify(finalized, null, 2)}\n`);
  console.log(`PGC_R03_FINALIZE_SUMMARY=${JSON.stringify(summary)}`);
  if (finalized.status === "FAIL_CLOSED") process.exitCode = 2;
  return finalized;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await finalizePgcR03CapacityAwareBinding();
}
