import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q018-g6b-u03-cylinder-volume-source-authority-preflight.json");
const q017=read("docs/ci/latest-p07f-w7-q017-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const KP="kp_g6b_u03_cylinder_volume";

test("Q018 exact frozen queue successor follows Q017 D0",()=>{
  const q=materializeP07EW7DirectProductVerticalSliceQueue(),row=q.queueEntries[17];
  assert.equal(q017.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q017.exactHeadSha,"9917df2c0fa2678c7637a9d52b260dfdb4325a4c");
  assert.equal(row.queuePosition,18);
  assert.equal(row.sliceId,"p07e_q018_r11_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.equal(row.previousSliceId,"p07e_q017_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.equal(row.primarySourceNodeId,"g6b_u03_6b03");
  assert.equal(row.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(row.intraWavePrerequisiteRank,11);
});

test("Q018 source identity and direct cylinder-volume visual witness are locked",()=>{
  const s=pre.sourceAuthority,v=s.currentDirectVisualVerification;
  assert.equal(s.sourcePdfDriveFileId,"10LlUyzn4WOkxHAY3S9SsZeGT0i_ixV9u");
  assert.equal(s.sourcePdfSizeBytes,811369);
  assert.equal(s.sourcePdfSha256,"8689048604947c680fd1d3841048ec2c981474f18974f48a97ef8ea09777cf98");
  assert.equal(s.pageCount,2);
  assert.deepEqual(s.reviewedPages,[1,2]);
  assert.equal(v.completed,true);
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.directSupportClassification,"DIRECT_LITERAL_CYLINDER_VOLUME_APPLICATION_EVIDENCE");
  assert.deepEqual(s.targetEvidenceReconciliation.exactDirectVisualEvidencePages,[1]);
  assert.equal(s.newSupplementaryEvidenceRequired,false);
});

test("Q018 exact R02 candidate is cylinder volume and prior same-source ownership remains protected",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u03_6b03"),c=src?.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);
  assert.equal(c.canonicalNameZh,"圓柱體積");
  assert.equal(c.capabilityStatement,"學生能以圓面積乘高求圓柱體積。");
  assert.equal(c.reasoningInvariant,"圓柱每層截面為等大的圓。");
  assert.deepEqual(c.evidencePages,[1,2]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.sameSourceExistingOwnership,{
    kp_g6b_u03_prism_surface_area:"P05F_W5_Q049",
    kp_g6b_u03_prism_base_area_height_volume:"P05F_W5_Q055",
    kp_g6b_u03_triangular_prism_volume:"P05F_W5_Q060",
    kp_g6b_u03_composite_prism_volume_surface:"P05F_W5_Q060"
  });
});

test("Q018 semantic lock owns cylinder volume only",()=>{
  const s=pre.semanticProfileLock,m=s.implementationSemanticLock;
  assert.equal(s.targetSemanticCore,"CYLINDER_VOLUME_AS_CIRCULAR_BASE_AREA_TIMES_PERPENDICULAR_HEIGHT");
  assert.equal(m.circularBaseAreaRequired,true);
  assert.equal(m.perpendicularCylinderHeightRequired,true);
  assert.equal(m.positiveRadiusRequired,true);
  assert.equal(m.positiveHeightRequired,true);
  assert.equal(m.diameterToRadiusNormalizationAllowed,true);
  assert.equal(m.q049PrismSurfaceAreaReownershipAllowed,false);
  assert.equal(m.q055GenericPrismVolumeReownershipAllowed,false);
  assert.equal(m.q060TriangularPrismVolumeReownershipAllowed,false);
  assert.equal(m.q060CompositePrismReownershipAllowed,false);
  assert.equal(m.cylinderSurfaceAreaAllowed,false);
  assert.equal(m.compositeCylinderPrismSurfaceVolumeAllowed,false);
  assert.equal(m.halfCylinderApplicationAsCoreAllowed,false);
  assert.equal(m.sameUnitMixedModeAllowed,false);
  assert.equal(m.crossUnitMixedModeAllowed,false);
});

test("Q018 provisional preflight remains planning-only until exact executable authority readback",()=>{
  assert.equal(pre.status,"PREFLIGHT_EXECUTABLE_AUTHORITY_READBACK_PENDING");
  assert.equal(pre.executableAuthorityReadback.pending,true);
  assert.equal(pre.q018ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q018ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ018ImplementationPlanning,true);
  assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  const impact=read("data/project/change-impact/P07F_W7_Q018_PREFLIGHT.impact.json"),plan=read("data/project/validation-plans/P07F_W7_Q018_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
