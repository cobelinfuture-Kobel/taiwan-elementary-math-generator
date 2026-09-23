import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice037-g6a-u02-fraction-division-application-preflight-authority.json");
const q036Preflight = read("data/curriculum/full-product/p04f/slice036-g6a-u02-fraction-divided-by-fraction-preflight-authority.json");
const q036Authority = read("data/curriculum/full-product/p04f/slice036-g6a-u02-fraction-divided-by-fraction-authority.json");
const queue = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const r02 = read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const rolePolicy = read("data/curriculum/full-product/p02e/quantity-semantic-role-binding-policy.json");

const TARGET_KP = "kp_g6a_u02_fraction_division_application";
const r02Source = r02.sourceRecords.find((row) => row.sourceNodeId === "g6a_u02_6a02");
const r02Target = r02Source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
const mapping = authority.formalMappings[0];
const variants = Object.fromEntries(mapping.relationVariants.map((row) => [row.variantId, row]));
const roleRules = Object.fromEntries(rolePolicy.roleFamilyRules.map((row) => [row.ruleId, row]));

test("q037 frozen queue identity and application KnowledgePoint membership are exact", () => {
  assert.equal(queue.orderedSliceIds[36], authority.queue.sliceId);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
  assert.equal(queue.orderedKnowledgePointIds[50], TARGET_KP);
  assert.equal(authority.queue.queuePosition, 37);
  assert.equal(authority.queue.intraWavePrerequisiteRank, 11);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_fraction");
  assert.equal(authority.queue.previousSliceId, "p04e_q036_r10_g6a_u02_6a02_profile_fraction_c1");
  assert.equal(authority.queue.nextSliceId, "p04e_q038_r12_g6b_u01_6b01_profile_mixed_number_domain_c1");
});

test("q037 reuses reviewed G6A-U02 source authority without inventing evidence", () => {
  assert.equal(authority.sourceAuthority.sourceFile, "meow911_6a02_source.pdf");
  assert.equal(authority.sourceAuthority.driveFileId, "1izlK6HrAU4m76SvYmH_ZUy-yvrqc9idM");
  assert.equal(authority.sourceAuthority.sourceTitle, "分數除法");
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.visualVerificationStatus, "REUSED_FROM_P04F33_FULL_PAGE_VISUAL_READBACK");
  assert.equal(q036Preflight.sourceAuthority.driveFileId, authority.sourceAuthority.driveFileId);
  assert.equal(q036Authority.source.driveFileId, authority.sourceAuthority.driveFileId);

  assert.ok(r02Source);
  assert.ok(r02Target);
  assert.equal(r02Target.canonicalNameZh, "分數除法包含除與等分除");
  assert.equal(r02Target.capabilityStatement, "學生能用分數除法求組數或每份量。");
  assert.equal(r02Target.reasoningInvariant, "包含除與等分除的數量角色不同，但除法關係均須可逆驗證。");
  assert.deepEqual(r02Target.evidencePages, [1, 2]);
  assert.equal(r02Target.applicationSuitability, "APPLICATION_COMPATIBLE");
  assert.equal(authority.knowledgePoints[0].capabilityStatement, r02Target.capabilityStatement);
  assert.equal(authority.knowledgePoints[0].reasoningInvariant, r02Target.reasoningInvariant);
});

test("q037 FormalMapping separates quotative and partitive division roles", () => {
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "SOURCE_BACKED_TWO_VARIANT_APPLICATION_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "FRACTION_DIVISION_APPLICATION_RELATION");
  assert.deepEqual(Object.keys(variants).sort(), ["PARTITIVE_DIVISION_PER_GROUP", "QUOTATIVE_DIVISION_GROUP_COUNT"]);

  assert.deepEqual(variants.QUOTATIVE_DIVISION_GROUP_COUNT.knownRoleIds, ["TOTAL_QUANTITY", "PER_GROUP_QUANTITY"]);
  assert.equal(variants.QUOTATIVE_DIVISION_GROUP_COUNT.targetRoleId, "GROUP_COUNT");
  assert.equal(variants.QUOTATIVE_DIVISION_GROUP_COUNT.canonicalExpression, "groupCount = totalQuantity / perGroupQuantity");
  assert.equal(variants.QUOTATIVE_DIVISION_GROUP_COUNT.reconstructionExpression, "totalQuantity = perGroupQuantity * groupCount");

  assert.deepEqual(variants.PARTITIVE_DIVISION_PER_GROUP.knownRoleIds, ["TOTAL_QUANTITY", "GROUP_COUNT"]);
  assert.equal(variants.PARTITIVE_DIVISION_PER_GROUP.targetRoleId, "PER_GROUP_QUANTITY");
  assert.equal(variants.PARTITIVE_DIVISION_PER_GROUP.canonicalExpression, "perGroupQuantity = totalQuantity / groupCount");
  assert.equal(variants.PARTITIVE_DIVISION_PER_GROUP.reconstructionExpression, "totalQuantity = perGroupQuantity * groupCount");

  assert.equal(mapping.invariants.roleVariantMustBeExplicit, true);
  assert.equal(mapping.invariants.totalAndPerGroupDimensionMustMatch, true);
  assert.equal(mapping.invariants.answerUnitMustMatchTargetRole, true);
  assert.equal(mapping.invariants.divisionRelationMustReconstructTotal, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
});

test("q037 role vocabulary is corroborated without creating a P02E infrastructure dependency", () => {
  assert.equal(roleRules.role_quotative_division.relationFamilyId, "QUOTATIVE_DIVISION");
  assert.deepEqual(roleRules.role_quotative_division.knownRoleIds, ["TOTAL_QUANTITY", "PER_GROUP_QUANTITY"]);
  assert.equal(roleRules.role_quotative_division.targetRoleId, "GROUP_COUNT");
  assert.ok(roleRules.role_quotative_division.anyTerms.includes("包含除"));

  assert.equal(roleRules.role_partitive_division.relationFamilyId, "PARTITIVE_DIVISION");
  assert.deepEqual(roleRules.role_partitive_division.knownRoleIds, ["TOTAL_QUANTITY", "GROUP_COUNT"]);
  assert.equal(roleRules.role_partitive_division.targetRoleId, "PER_GROUP_QUANTITY");
  assert.ok(roleRules.role_partitive_division.anyTerms.includes("等分除"));

  assert.equal(authority.reconciliation.quantityRolePolicyUsage, "SEMANTIC_VOCABULARY_CORROBORATION_ONLY");
  assert.equal(authority.reconciliation.existingP02EExecutableBindingRequired, false);
  assert.equal(authority.reconciliation.globalContextRegistryExpansionRequired, false);
});

test("q037 locks two application PatternSpec candidates while predecessor numeric surfaces remain owned", () => {
  assert.equal(authority.patternSurfacePlan.questionMode, "application");
  assert.equal(authority.patternSurfacePlan.candidatePatternGroupId, "pg_g6a_u02_fraction_division_application");
  assert.deepEqual(authority.patternSurfacePlan.candidatePatternSpecs.map((row) => row.patternSpecId), [
    "ps_g6a_u02_fraction_division_quotative_application",
    "ps_g6a_u02_fraction_division_partitive_application",
  ]);
  assert.ok(authority.patternSurfacePlan.candidatePatternSpecs.every((row) => row.lifecycle === "planning_candidate"));
  assert.equal(authority.patternSurfacePlan.numericPatternSpecsRemainOwnedByPredecessors, true);
  assert.equal(authority.patternSurfacePlan.unitNumericAndApplicationSurfacesMayCoexistAfterAdmission, true);
  assert.equal(authority.patternSurfacePlan.mixedQuestionModeAdmissionInPreflight, false);
  assert.equal(authority.reconciliation.q033FractionDividedByIntegerRelationIdentityReused, false);
  assert.equal(authority.reconciliation.q035IntegerDividedByFractionRelationIdentityReused, false);
  assert.equal(authority.reconciliation.q036FractionDividedByFractionRelationIdentityReused, false);
  assert.equal(authority.reconciliation.predecessorExactRationalPrimitiveReuseCandidate, true);
  assert.equal(authority.reconciliation.recommendedImplementationScope, "SHARED_RUNTIME_BOUNDED");
});

test("q037 remains planning-only and preserves Q36 plus Q38 boundaries", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecCandidateIdsLocked, true);
  assert.equal(boundary.patternSpecLifecyclePromoted, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.publicApplicationSurfaceEnabled, false);
  assert.equal(boundary.globalContextRegistryModified, false);
  assert.equal(boundary.q036RuntimeTouched, false);
  assert.equal(boundary.q038Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
  assert.equal(q036Authority.implementationBoundary.q037Touched, false);
});
