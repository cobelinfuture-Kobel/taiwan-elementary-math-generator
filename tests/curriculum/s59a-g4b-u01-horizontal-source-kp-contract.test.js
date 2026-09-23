import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contractUrl = new URL(
  '../../data/curriculum/contracts/S59A_G4B_U01_HorizontalOnlySourceAndKnowledgePointContract.json',
  import.meta.url,
);
const contract = JSON.parse(readFileSync(contractUrl, 'utf8'));

const unique = (values) => new Set(values).size === values.length;

test('S59A freezes the exact G4B-U01 horizontal-only public boundary', () => {
  assert.equal(contract.task, 'S59A_G4B_U01_HorizontalOnlySourceAndKnowledgePointContract');
  assert.equal(contract.sourceId, 'g4b_u01_4b01');
  assert.equal(contract.unitCode, '4B-U01');
  assert.equal(contract.scopeLock.outputMode, 'horizontal_only');
  assert.equal(contract.scopeLock.applicationProblemsRequired, false);
  assert.equal(contract.scopeLock.applicationProblemsAllowedInCore, false);
  assert.equal(contract.scopeLock.verticalRenderingAllowed, false);
  assert.equal(contract.scopeLock.verticalSourceDiagrams, 'evidence_only');
  assert.equal(contract.scopeLock.publicMissingDigitAllowed, false);
  assert.equal(contract.scopeLock.crossUnitFusionAllowed, false);
  assert.equal(contract.scopeLock.genericFallbackAllowed, false);
});

test('S59A accounts for all fourteen PDF panels without inventing source evidence', () => {
  assert.equal(contract.source.pageCount, 2);
  assert.equal(contract.source.sha256, '8e187794305d2a19ede4fe085eb493f67593621d653a4706a71cf5700d3be05b');
  assert.equal(contract.sourceEvidence.length, 14);
  assert.ok(unique(contract.sourceEvidence.map((row) => row.evidenceId)));

  const pageCounts = contract.sourceEvidence.reduce((counts, row) => {
    counts[row.page] = (counts[row.page] ?? 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(pageCounts, { 1: 10, 2: 4 });

  const dispositions = new Set(contract.sourceEvidence.map((row) => row.publicDisposition));
  assert.deepEqual(dispositions, new Set(['mapped', 'evidence_only', 'deferred_extension']));
  assert.equal(contract.sourceEvidence.filter((row) => row.publicDisposition === 'evidence_only').length, 1);
  assert.equal(contract.sourceEvidence.filter((row) => row.publicDisposition === 'deferred_extension').length, 1);
});

test('S59A freezes nine public KnowledgePoints and twelve candidate PatternSpecs', () => {
  assert.equal(contract.knowledgePoints.length, 9);
  assert.equal(contract.patternSpecCandidates.length, 12);
  assert.ok(unique(contract.knowledgePoints.map((row) => row.knowledgePointId)));
  assert.ok(unique(contract.patternSpecCandidates.map((row) => row.patternSpecId)));
  assert.ok(contract.knowledgePoints.every((row) => row.publicCore === true));

  const kpIds = new Set(contract.knowledgePoints.map((row) => row.knowledgePointId));
  for (const patternSpec of contract.patternSpecCandidates) {
    assert.ok(kpIds.has(patternSpec.knowledgePointId));
  }

  const flattenedIds = contract.knowledgePoints.flatMap((row) => row.patternSpecIds);
  assert.equal(flattenedIds.length, 12);
  assert.deepEqual(new Set(flattenedIds), new Set(contract.patternSpecCandidates.map((row) => row.patternSpecId)));
});

test('S59A keeps vertical structure and missing-digit inference outside the core public unit', () => {
  const partialProductEvidence = contract.sourceEvidence.find(
    (row) => row.evidenceId === 'src_g4b_u01_p1_panel01',
  );
  assert.equal(partialProductEvidence.publicDisposition, 'evidence_only');

  const missingDigitEvidence = contract.sourceEvidence.find(
    (row) => row.evidenceId === 'src_g4b_u01_p2_panel04',
  );
  assert.equal(missingDigitEvidence.publicDisposition, 'deferred_extension');

  assert.deepEqual(
    contract.deferredExtensions.map((row) => [row.extensionId, row.blocksCoreCloseout]),
    [
      ['g4b_u01_horizontal_missing_digit', false],
      ['g4b_u01_application_problems', false],
    ],
  );
  assert.equal(contract.acceptance.applicationProblemCount, 0);
  assert.equal(contract.acceptance.verticalPublicKnowledgePointCount, 0);
});

test('S59A retains the historical overlay only as superseded planning input', () => {
  assert.equal(
    contract.supersededPlanningInput.artifact,
    'data/curriculum/registry/unit_expansions/S43E12_G4B_U01_KPExpansion.json',
  );
  assert.equal(contract.supersededPlanningInput.status, 'retained_as_historical_overlay_not_rewritten');
  assert.equal(contract.acceptance.allSourcePanelsAccountedFor, true);
  assert.equal(contract.acceptance.visibleKnowledgePointCount, 9);
  assert.equal(contract.acceptance.corePatternSpecCandidateCount, 12);
  assert.equal(contract.goalDistance.after, 'D3_G4B_U01_HORIZONTAL_SOURCE_KP_CONTRACT_FROZEN');
  assert.equal(
    contract.goalDistance.nextShortestStep,
    'S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign',
  );
});
