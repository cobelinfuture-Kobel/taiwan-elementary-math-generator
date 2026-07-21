import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildPOSTGAPPMasterReadback,
  loadPOSTGAPPMasterController,
  resolvePOSTGAPPWave
} from '../../src/curriculum/application/postg-app-master-controller.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPM00Validation() {
  const readback = buildPOSTGAPPMasterReadback({ root: ROOT });
  const controller = loadPOSTGAPPMasterController({ root: ROOT });
  const w01 = resolvePOSTGAPPWave(controller, 'W01');
  const w06 = resolvePOSTGAPPWave(controller, 'W06');
  const consumerGate = Boolean(
    w01?.sourceNodes?.length === 16
    && w01?.goldenUnitIds?.length === 15
    && w01?.productionSelectable === false
    && w06?.sourceNodes?.length === 12
    && w06?.productionSelectable === false
  );
  return {
    ...readback,
    consumerGate,
    sampleResolutions: {
      W01: w01 ? {
        sourceNodeCount: w01.sourceNodes.length,
        goldenUnitCount: w01.goldenUnitIds.length,
        firstSourceNodeId: w01.sourceNodes[0].sourceNodeId,
        lastSourceNodeId: w01.sourceNodes.at(-1).sourceNodeId
      } : null,
      W06: w06 ? {
        sourceNodeCount: w06.sourceNodes.length,
        firstSourceNodeId: w06.sourceNodes[0].sourceNodeId,
        lastSourceNodeId: w06.sourceNodes.at(-1).sourceNodeId
      } : null
    },
    validationStatus: readback.ok && consumerGate
      ? 'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION'
      : 'FAIL_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPM00Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION') {
    process.exitCode = 1;
  }
}
