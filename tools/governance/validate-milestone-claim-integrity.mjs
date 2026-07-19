import path from "node:path";
import { pathToFileURL } from "node:url";

export * from "./milestone-claim-integrity-core.mjs";

import { runIntegrityChecks } from "./milestone-claim-integrity-core.mjs";

export function runCli(args = process.argv.slice(2)) {
  const output = runIntegrityChecks({
    requirePrManifest: args.includes("--require-pr-manifest")
  });
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.ok) process.exitCode = 1;
  return output;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) runCli();
