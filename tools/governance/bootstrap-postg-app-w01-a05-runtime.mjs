import fs from 'node:fs';

const runtimePath = 'src/curriculum/application/w01-e4-production-review-runtime.mjs';
const source = fs.readFileSync(runtimePath, 'utf8');
let next = source;
let changed = false;

const pblStartMarker = 'function buildPblReviewSections(a02, selectedSources) {';
const pblEndMarker = '\n\nexport function materializeW01E4ProductionReview';
const pblReadyMarker = 'pblTaskSetId: candidate.pblCandidateId';
const pblReplacement = `function buildPblReviewSections(a02, selectedSources) {
  return a02.pblTaskSetCandidates
    .filter((candidate) => selectedSources.has(candidate.sourceId))
    .map((candidate) => ({
      pblTaskSetId: candidate.pblCandidateId,
      sourceId: candidate.sourceId,
      knowledgePointId: candidate.primaryKnowledgePointId,
      graphType: candidate.graphType,
      nodes: clone(candidate.taskBlueprints.map((task) => ({
        taskId: task.taskId,
        outputMilestoneId: task.outputMilestoneId,
        isFinalTask: task.isFinalTask
      }))),
      edges: clone(candidate.taskBlueprints.flatMap((task) => (
        task.inputRefs.map((inputRef) => ({
          fromMilestoneId: inputRef,
          toTaskId: task.taskId
        }))
      ))),
      finalProductCandidate: clone(candidate.finalProductCandidate),
      taskBlueprints: clone(candidate.taskBlueprints),
      projectionCandidate: candidate.projectionCandidate,
      unapprovedPageSplitForbidden: true,
      productionAdmissionAllowed: false
    }));
}`;

if (!next.includes(pblReadyMarker)) {
  const start = next.indexOf(pblStartMarker);
  const duplicateStart = start < 0 ? -1 : next.indexOf(pblStartMarker, start + pblStartMarker.length);
  const end = start < 0 ? -1 : next.indexOf(pblEndMarker, start);
  if (start < 0 || duplicateStart >= 0 || end < 0) {
    throw new Error(JSON.stringify({
      code: 'POSTG_APP_W01_A05_PBL_BOOTSTRAP_BOUNDARY_INVALID',
      start,
      duplicateStart,
      end
    }));
  }
  next = `${next.slice(0, start)}${pblReplacement}${next.slice(end)}`;
  changed = true;
}

const oldEligibility = `  const eligibleSources = uniqueSorted(a02.a01.assessment.records
    .filter((record) => record.suitableForApplication === true)
    .map((record) => record.sourceId));`;
const newEligibility = `  const eligibleSources = uniqueSorted(a02.a01.assessment.records
    .filter((record) => record.classification !== 'APPLICATION_NOT_APPLICABLE')
    .map((record) => record.sourceId));`;

if (!next.includes(newEligibility)) {
  const first = next.indexOf(oldEligibility);
  const second = first < 0 ? -1 : next.indexOf(oldEligibility, first + oldEligibility.length);
  if (first < 0 || second >= 0) {
    throw new Error(JSON.stringify({
      code: 'POSTG_APP_W01_A05_ELIGIBILITY_BOOTSTRAP_ANCHOR_INVALID',
      first,
      second
    }));
  }
  next = next.replace(oldEligibility, newEligibility);
  changed = true;
}

if (changed) fs.writeFileSync(runtimePath, next, 'utf8');

console.log(JSON.stringify({
  status: changed ? 'POSTG_APP_W01_A05_RUNTIME_BOOTSTRAPPED' : 'POSTG_APP_W01_A05_RUNTIME_ALREADY_ALIGNED',
  changed,
  pblAuthorityAligned: next.includes(pblReadyMarker),
  eligibilityAuthorityAligned: next.includes(newEligibility)
}, null, 2));
