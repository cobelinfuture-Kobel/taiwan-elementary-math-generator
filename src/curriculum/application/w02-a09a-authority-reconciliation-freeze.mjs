import fs from 'node:fs';
import path from 'node:path';

export const W02_A09A_TASK = 'POSTG-APP-W02-A09A_CanonicalCurriculumAuthorityReconciliationAndLegacyApplicationRouteFreeze';
export const W02_A09A_STATUS = 'W02_CANONICAL_AUTHORITY_GAP_MATERIALIZED_W03_EXECUTION_FROZEN';
export const W02_A09A_POLICY_PATH = 'data/curriculum/application/governance/postg-app-w02-a09a-authority-freeze.json';
export const W02_A09A_NEXT_TASK = 'POSTG-APP-W02-A09A1_BatchBCanonicalKnowledgePointRegistryMaterializationAnd90CandidateReconciliation';

const BASELINE_PATH = 'data/curriculum/application/assessment/w02-source13-source-authority-baseline.json';
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const exists = (root, repoPath) => fs.existsSync(path.join(root, repoPath));

export function loadW02A09AAuthorityFreeze({ root = process.cwd() } = {}) {
  const policy = readJson(root, W02_A09A_POLICY_PATH);
  const baseline = readJson(root, BASELINE_PATH);
  const candidateUnits = baseline.records.map((record) => ({
    sourceNodeId: record.sourceNodeId,
    path: record.knowledgeOperationExpectedPath,
    candidate: readJson(root, record.knowledgeOperationExpectedPath)
  }));
  const legacyRouteSnapshots = policy.legacyApplicationRoutes.inventory.map((entry) => ({
    ...entry,
    text: fs.readFileSync(path.join(root, entry.path), 'utf8')
  }));
  return {
    root,
    policy,
    baseline,
    candidateUnits,
    canonicalRegistryPresent: exists(root, policy.canonicalCurriculumAuthority.requiredKnowledgePointRegistryPath),
    legacyRouteSnapshots
  };
}

export function validateW02A09AAuthorityFreeze(loaded) {
  const issues = [];
  const { policy, baseline, candidateUnits, canonicalRegistryPresent, legacyRouteSnapshots } = loaded;
  if (policy.schemaName !== 'POSTGAPPW02A09ACanonicalAuthorityFreezeV1'
      || policy.schemaVersion !== 1
      || policy.taskId !== W02_A09A_TASK
      || policy.status !== W02_A09A_STATUS) {
    issues.push(issue('POSTG_APP_W02_A09A_POLICY_INVALID', W02_A09A_POLICY_PATH));
  }
  if (baseline.records.length !== policy.canonicalCurriculumAuthority.requiredSourceNodeCount
      || candidateUnits.length !== 13) {
    issues.push(issue('POSTG_APP_W02_A09A_SOURCE_COUNT_INVALID', BASELINE_PATH));
  }
  let candidateCount = 0;
  for (const unit of candidateUnits) {
    const candidate = unit.candidate;
    candidateCount += candidate.knowledgePoints?.length ?? 0;
    if (candidate.schemaName !== 'POSTGAPPW02KnowledgeOperationCandidateUnitV1'
        || candidate.sourceNodeId !== unit.sourceNodeId
        || candidate.candidateState !== 'PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED_CANONICAL_MODEL_PENDING') {
      issues.push(issue('POSTG_APP_W02_A09A_CANDIDATE_AUTHORITY_INVALID', unit.path));
    }
  }
  if (candidateCount !== policy.canonicalCurriculumAuthority.expectedCandidateCount) {
    issues.push(issue('POSTG_APP_W02_A09A_CANDIDATE_COUNT_INVALID', 'candidateUnits', { candidateCount }));
  }
  if (canonicalRegistryPresent
      || policy.canonicalCurriculumAuthority.canonicalRegistryStateAtFreeze !== 'MISSING'
      || policy.canonicalCurriculumAuthority.candidateAuthorityStatus !== 'APPLICATION_PROGRAM_CANDIDATE_ONLY_NOT_CANONICAL_CURRICULUM_AUTHORITY') {
    issues.push(issue('POSTG_APP_W02_A09A_CANONICAL_AUTHORITY_BOUNDARY_INVALID', policy.canonicalCurriculumAuthority.requiredKnowledgePointRegistryPath));
  }
  const freeze = policy.executionFreeze;
  if (freeze.active !== true
      || freeze.w03ImplementationMayStart !== false
      || !freeze.blockedWaveIds.includes('W03')
      || !freeze.blockedTaskPrefixes.includes('POSTG-APP-W03-')) {
    issues.push(issue('POSTG_APP_W02_A09A_W03_FREEZE_INVALID', 'executionFreeze'));
  }
  const context = policy.globalContextAuthority;
  if (context.requiredForEveryNewApplicationRoute !== true
      || context.postGenerationTextOverlayAllowed !== false
      || context.unitSpecificApplicationGeneratorAllowed !== false
      || context.unitSpecificGlobalContextOverlayAllowed !== false) {
    issues.push(issue('POSTG_APP_W02_A09A_GLOBAL_CONTEXT_AUTHORITY_INVALID', 'globalContextAuthority'));
  }
  for (const snapshot of legacyRouteSnapshots) {
    for (const symbol of snapshot.symbols) {
      if (!snapshot.text.includes(symbol)) {
        issues.push(issue('POSTG_APP_W02_A09A_LEGACY_ROUTE_INVENTORY_DRIFT', snapshot.path, { symbol }));
      }
    }
  }
  if (policy.legacyApplicationRoutes.newLegacyRouteAllowed !== false
      || policy.legacyApplicationRoutes.status !== 'GRANDFATHERED_READ_ONLY_PENDING_SHARED_CONSUMER_MIGRATION') {
    issues.push(issue('POSTG_APP_W02_A09A_LEGACY_ROUTE_FREEZE_INVALID', 'legacyApplicationRoutes'));
  }
  if (policy.mainline.w03ActivatedForImplementation !== false
      || policy.mainline.nextShortestStep !== W02_A09A_NEXT_TASK) {
    issues.push(issue('POSTG_APP_W02_A09A_MAINLINE_INVALID', 'mainline'));
  }
  return Object.freeze({
    ok: issues.length === 0,
    issues: Object.freeze(issues),
    taskId: W02_A09A_TASK,
    status: issues.length === 0 ? W02_A09A_STATUS : 'W02_A09A_AUTHORITY_FREEZE_BLOCKED',
    counts: Object.freeze({
      sourceNodeCount: candidateUnits.length,
      knowledgePointCandidateCount: candidateCount,
      legacyRouteFileCount: legacyRouteSnapshots.length,
      legacyRouteSymbolCount: legacyRouteSnapshots.reduce((sum, row) => sum + row.symbols.length, 0)
    }),
    canonicalRegistryPresent,
    w03ExecutionAllowed: false,
    globalContextSingleApplicationAuthorityRequired: true,
    nextShortestStep: W02_A09A_NEXT_TASK
  });
}

export function buildW02A09AAuthorityFreezeReadback(options = {}) {
  return validateW02A09AAuthorityFreeze(loadW02A09AAuthorityFreeze(options));
}
