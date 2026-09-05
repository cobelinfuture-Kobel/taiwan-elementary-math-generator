import {
  buildPath1P102AssessmentFamilyCandidates,
  PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID,
  PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES,
  validatePath1P102AssessmentFamilyCandidate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-assessment-family-candidates.js";
import {
  PATH1_P1_02_PATTERN_FAMILIES,
} from "../../site/modules/curriculum/learning-paths/path1-p1-02-diversity.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

function fail(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

const candidateResult = buildPath1P102AssessmentFamilyCandidates({
  count: 12,
  seed: "path1-p1-02-assessment-family-focused",
});
if (!candidateResult.ok) fail("P1_02_CANDIDATE_GENERATION_FAILED", candidateResult.errors);
if (candidateResult.items.length !== 12) fail("P1_02_CANDIDATE_COUNT_MISMATCH", candidateResult.items.length);
if (candidateResult.summary.publicCutoverApproved !== false) fail("P1_02_CANDIDATE_PUBLIC_CUTOVER_LEAK");

const expectedCandidateFamilies = PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.map((family) => family.familyId).sort();
const actualCandidateFamilies = [...new Set(candidateResult.items.map((entry) => entry.metadata.path1PatternFamilyId))].sort();
if (JSON.stringify(actualCandidateFamilies) !== JSON.stringify(expectedCandidateFamilies)) {
  fail("P1_02_CANDIDATE_FAMILY_COVERAGE_MISMATCH", { expectedCandidateFamilies, actualCandidateFamilies });
}

for (const entry of candidateResult.items) {
  const validation = validatePath1P102AssessmentFamilyCandidate(entry);
  if (!validation.ok) fail("P1_02_CANDIDATE_VALIDATION_FAILED", { id: entry.generatedItemId, errors: validation.errors });
  if (entry.metadata.path1AssessmentCandidateProfileId !== PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID) {
    fail("P1_02_CANDIDATE_PROFILE_MISMATCH", entry.generatedItemId);
  }
  if (entry.metadata.candidateOnly !== true || entry.metadata.publicCutoverApproved !== false) {
    fail("P1_02_CANDIDATE_STATUS_LEAK", entry.generatedItemId);
  }
}

const publicResult = buildPath1ManualWorksheet({
  blockId: "P1-02",
  questionCount: 6,
  generationSeed: "path1-p1-02-public-unchanged-focused",
  includeAnswerKey: true,
});
if (!publicResult.ok) fail("P1_02_CURRENT_PUBLIC_ROUTE_FAILED", publicResult.errors);
if (publicResult.worksheetDocument.questions.length !== 6) fail("P1_02_CURRENT_PUBLIC_COUNT_MISMATCH");

const expectedPublicFamilies = PATH1_P1_02_PATTERN_FAMILIES.map((family) => family.familyId).sort();
const actualPublicFamilies = [...new Set(publicResult.worksheetDocument.questions.map((entry) => entry.metadata.path1PatternFamilyId))].sort();
if (JSON.stringify(actualPublicFamilies) !== JSON.stringify(expectedPublicFamilies)) {
  fail("P1_02_CURRENT_PUBLIC_FAMILY_CHANGED", { expectedPublicFamilies, actualPublicFamilies });
}
if (publicResult.worksheetDocument.questions.some((entry) => (
  entry.metadata.path1AssessmentCandidateProfileId === PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID
  || entry.metadata.candidateOnly === true
))) {
  fail("P1_02_CANDIDATE_LEAKED_TO_PUBLIC_ROUTE");
}

const report = {
  schemaName: "Path1P102AssessmentFamilyCandidatesFocusedV1",
  status: "PASS",
  candidateQuestionCount: candidateResult.items.length,
  candidateFamilyIds: actualCandidateFamilies,
  publicQuestionCount: publicResult.worksheetDocument.questions.length,
  publicFamilyIds: actualPublicFamilies,
  publicCutoverApproved: false,
  p103Touched: false,
  p105Touched: false,
};

process.stdout.write(`PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES_FOCUSED=${JSON.stringify(report)}\n`);
