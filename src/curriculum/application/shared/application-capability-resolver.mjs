import fs from 'node:fs';
import path from 'node:path';

const CAPABILITY_REGISTRY_PATH = 'data/curriculum/application/registry/application-capability-registry.json';
const ADMISSION_REGISTRY_PATH = 'data/curriculum/application/registry/wave-application-admission-registry.json';
const WAVE_ORDER = ['W01', 'W02', 'W03', 'W04', 'W05', 'W06'];

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

export function loadSharedApplicationRegistries({ root = process.cwd() } = {}) {
  return {
    root,
    capabilityRegistry: readJson(root, CAPABILITY_REGISTRY_PATH),
    admissionRegistry: readJson(root, ADMISSION_REGISTRY_PATH)
  };
}

export function validateSharedApplicationRegistries(registries) {
  const issues = [];
  const providers = registries.capabilityRegistry.waveProviders ?? [];
  const admissions = registries.admissionRegistry.waves ?? [];
  const providerIds = providers.map((row) => row.waveId);
  const admissionIds = admissions.map((row) => row.waveId);

  if (JSON.stringify(registries.capabilityRegistry.providerOrder) !== JSON.stringify(WAVE_ORDER)
      || JSON.stringify(providerIds) !== JSON.stringify(WAVE_ORDER)
      || JSON.stringify(admissionIds) !== JSON.stringify(WAVE_ORDER)) {
    issues.push(issue('POSTG_APP_SHARED_WAVE_ORDER_INVALID', 'registries'));
  }
  if (!unique(providers.map((row) => row.providerId)) || !unique(providerIds) || !unique(admissionIds)) {
    issues.push(issue('POSTG_APP_SHARED_PROVIDER_IDENTITY_DUPLICATED', 'registries'));
  }

  const admissionByWave = new Map(admissions.map((row) => [row.waveId, row]));
  for (const provider of providers) {
    const admission = admissionByWave.get(provider.waveId);
    if (!admission) {
      issues.push(issue('POSTG_APP_SHARED_ADMISSION_RECORD_MISSING', provider.waveId));
      continue;
    }
    for (const field of ['shadowProjectionAllowed', 'productionAdmitted', 'publicSelectable']) {
      if (provider[field] !== admission[field]) {
        issues.push(issue('POSTG_APP_SHARED_PROVIDER_ADMISSION_MISMATCH', `${provider.waveId}.${field}`));
      }
    }
  }

  const admittedWaveIds = registries.admissionRegistry.admittedWaveIds ?? [];
  const expectedPrefix = WAVE_ORDER.slice(0, admittedWaveIds.length);
  if (admittedWaveIds.length === 0
      || JSON.stringify(admittedWaveIds) !== JSON.stringify(expectedPrefix)) {
    issues.push(issue('POSTG_APP_SHARED_ADMISSION_PREFIX_INVALID', 'admissionRegistry.admittedWaveIds'));
  }
  const nextWaveId = WAVE_ORDER[admittedWaveIds.length] ?? null;
  for (const provider of providers) {
    const admitted = admittedWaveIds.includes(provider.waveId);
    if (admitted) {
      const providerTypeValid = provider.waveId === 'W01'
        ? provider.providerType === 'EXISTING_RUNTIME_PROVIDER'
        : provider.providerType === 'DYNAMIC_WAVE_PROVIDER';
      if (!providerTypeValid
          || provider.lifecycleState !== 'PRODUCTION_ADMITTED'
          || provider.shadowProjectionAllowed !== true
          || provider.productionAdmitted !== true) {
        issues.push(issue('POSTG_APP_SHARED_ADMITTED_PROVIDER_STATE_INVALID', provider.waveId));
      }
      continue;
    }
    const expectedState = provider.waveId === nextWaveId ? 'ASSESSMENT_READY' : 'BLOCKED_BY_PREVIOUS_WAVE';
    if (provider.providerType !== 'RESERVED_FUTURE_WAVE_SLOT'
        || provider.lifecycleState !== expectedState
        || provider.entryMaterialization !== null
        || provider.shadowProjectionAllowed !== false
        || provider.productionAdmitted !== false
        || provider.publicSelectable !== false) {
      issues.push(issue('POSTG_APP_SHARED_FUTURE_WAVE_SLOT_INVALID', provider.waveId));
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      providerCount: providers.length,
      admissionRecordCount: admissions.length,
      reservedFutureWaveSlotCount: providers.filter((row) => row.providerType === 'RESERVED_FUTURE_WAVE_SLOT').length,
      productionAdmittedWaveCount: admissions.filter((row) => row.productionAdmitted).length,
      publicSelectableWaveCount: admissions.filter((row) => row.publicSelectable).length
    }
  };
}

export function resolveWaveApplicationAccess(registries, waveId, mode = 'SHADOW') {
  const provider = registries.capabilityRegistry.waveProviders.find((row) => row.waveId === waveId) ?? null;
  const admission = registries.admissionRegistry.waves.find((row) => row.waveId === waveId) ?? null;
  if (!provider || !admission) {
    return { ok: false, errorCode: 'POSTG_APP_SHARED_WAVE_NOT_REGISTERED', provider, admission };
  }
  if (mode === 'SHADOW') {
    return provider.shadowProjectionAllowed === true && admission.shadowProjectionAllowed === true
      ? { ok: true, errorCode: null, provider, admission }
      : { ok: false, errorCode: 'POSTG_APP_SHARED_WAVE_SHADOW_PROJECTION_FORBIDDEN', provider, admission };
  }
  if (mode === 'PRODUCTION') {
    return provider.productionAdmitted === true && admission.productionAdmitted === true
      ? { ok: true, errorCode: null, provider, admission }
      : { ok: false, errorCode: 'POSTG_APP_SHARED_WAVE_PRODUCTION_FORBIDDEN', provider, admission };
  }
  if (mode === 'PUBLIC') {
    return provider.publicSelectable === true && admission.publicSelectable === true
      ? { ok: true, errorCode: null, provider, admission }
      : { ok: false, errorCode: 'POSTG_APP_SHARED_WAVE_PUBLIC_SELECTION_FORBIDDEN', provider, admission };
  }
  return { ok: false, errorCode: 'POSTG_APP_SHARED_ACCESS_MODE_INVALID', provider, admission };
}

export const SHARED_APPLICATION_REGISTRY_PATHS = {
  capabilityRegistry: CAPABILITY_REGISTRY_PATH,
  admissionRegistry: ADMISSION_REGISTRY_PATH
};
