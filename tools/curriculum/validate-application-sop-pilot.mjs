import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateApplicationPilotBundle } from '../../src/curriculum/application/application-sop-validator.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), 'utf8'));
}

export function runApplicationSopPilotValidation() {
  const pilot = readJson('data/curriculum/application/pilots/g3b_u01/g3b-u01-application-sop-pilot.json');
  const unitRegistry = readJson('data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json');
  const contextRegistry = readJson('data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json');
  const bindingRegistry = readJson('data/curriculum/application/registry/application-context-bindings.json');
  const admissionRegistry = readJson('data/curriculum/application/registry/application-admission-registry.json');

  const bindingIdSet = new Set(pilot.contextBindingIds);
  const candidateIdSet = new Set(pilot.admissionCandidateIds);
  const bundle = {
    ...pilot,
    contextBindings: bindingRegistry.bindings.filter((row) => bindingIdSet.has(row.bindingId)),
    admissionRecords: admissionRegistry.admissionRecords.filter((row) => candidateIdSet.has(row.candidateId))
  };
  const result = validateApplicationPilotBundle(bundle, { unitRegistry, contextRegistry });
  const expected = pilot.expectedValidation;
  const countParity = result.counts.proofs === expected.proofCount
    && result.counts.contextBindings === expected.contextBindingCount
    && result.counts.singleItems === expected.singleItemCount
    && result.counts.pblTaskSets === expected.pblTaskSetCount
    && result.counts.admissionRecords === expected.admissionRecordCount
    && result.counts.productionAdmissions === expected.productionAdmissionCount;

  return {
    ...result,
    countParity,
    registrySelection: {
      requestedBindingCount: pilot.contextBindingIds.length,
      resolvedBindingCount: bundle.contextBindings.length,
      requestedAdmissionRecordCount: pilot.admissionCandidateIds.length,
      resolvedAdmissionRecordCount: bundle.admissionRecords.length
    },
    status: result.ok && countParity ? 'PASS_A05_SHADOW_PILOT' : 'FAIL_A05_SHADOW_PILOT'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runApplicationSopPilotValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok || !result.countParity) process.exitCode = 1;
}
