import {
  buildPath1P103AssessmentFamilyCandidates,
  PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID,
  PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES,
  validatePath1P103AssessmentFamilyCandidate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-assessment-family-candidates-v2.js";
import {
  PATH1_P1_03_PATTERN_FAMILIES,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-diversity.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

function fail(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

const candidateResult = buildPath1P103AssessmentFamilyCandidates({
  count: 12,
  seed: "path1-p1-03-assessment-family-focused-v2",
});
if (!candidateResult.ok) fail("P1_03_CANDIDATE_GENERATION_FAILED", candidateResult.errors);
if (candidateResult.items.length !== 12) fail("P1_03_CANDIDATE_COUNT_MISMATCH", candidateResult.items.length);
if (candidateResult.summary.publicCutoverApproved !== false) fail("P1_03_CANDIDATE_PUBLIC_CUTOVER_LEAK");

const expectedCandidateFamilies = PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES.map((family) => family.familyId).sort();
const actualCandidateFamilies = [...new Set(candidateResult.items.map((entry) => entry.metadata.path1PatternFamilyId))].sort();
if (JSON.stringify(actualCandidateFamilies) !== JSON.stringify(expectedCandidateFamilies)) {
  fail("P1_03_CANDIDATE_FAMILY_COVERAGE_MISMATCH", { expectedCandidateFamilies, actualCandidateFamilies });
}

for (const entry of candidateResult.items) {
  const validation = validatePath1P103AssessmentFamilyCandidate(entry);
  if (!validation.ok) fail("P1_03_CANDIDATE_VALIDATION_FAILED", { id: entry.generatedItemId, errors: validation.errors });
  if (entry.metadata.path1AssessmentCandidateProfileId !== PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID) {
    fail("P1_03_CANDIDATE_PROFILE_MISMATCH", entry.generatedItemId);
  }
  if (entry.metadata.candidateOnly !== true || entry.metadata.publicCutoverApproved !== false) {
    fail("P1_03_CANDIDATE_STATUS_LEAK", entry.generatedItemId);
  }
}

const publicResult = buildPath1ManualWorksheet({
  blockId: "P1-03",
  questionCount: 6,
  generationSeed: "path1-p1-03-public-unchanged-focused-v2",
  includeAnswerKey: true,
});
if (!publicResult.ok) fail("P1_03_CURRENT_PUBLIC_ROUTE_FAILED", publicResult.errors);
if (publicResult.worksheetDocument.questions.length !== 6) fail("P1_03_CURRENT_PUBLIC_COUNT_MISMATCH");

const expectedPublicFamilies = PATH1_P1_03_PATTERN_FAMILIES.map((family) => family.familyId).sort();
const actualPublicFamilies = [...new Set(publicResult.worksheetDocument.questions.map((entry) => entry.metadata.path1PatternFamilyId))].sort();
if (JSON.stringify(actualPublicFamilies) !== JSON.stringify(expectedPublicFamilies)) {
  fail("P1_03_CURRENT_PUBLIC_FAMILY_CHANGED", { expectedPublicFamilies, actualPublicFamilies });
}
if (publicResult.worksheetDocument.questions.some((entry) => (
  entry.metadata.path1AssessmentCandidateProfileId === PATH1_P1_03_ASSESSMENT_CANDIDATE_PROFILE_ID
  || entry.metadata.candidateOnly === true
))) {
  fail("P1_03_CANDIDATE_LEAKED_TO_PUBLIC_ROUTE");
}

const report = {
  schemaName: "Path1P103AssessmentFamilyCandidatesFocusedV2",
  status: "PASS",
  candidateQuestionCount: candidateResult.items.length,
  candidateFamilyIds: actualCandidateFamilies,
  publicQuestionCount: publicResult.worksheetDocument.questions.length,
  publicFamilyIds: actualPublicFamilies,
  publicCutoverApproved: false,
  inheritedBaselineFailuresReopened: false,
  p104Touched: false,
};

process.stdout.write(`PATH1_P1_03_ASSESSMENT_FAMILY_CANDIDATES_V2_FOCUSED=${JSON.stringify(report)}\n`);
