import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q017-g6a-u07-annulus-area-source-authority-preflight.json");
const q016=read("docs/ci/latest-p07f-w7-q016-pages-e2e.json");
const q014=read("data/curriculum/full-product/p07f/q014-g6a-u07-circle-area-formula-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u07_annulus_area";

test("Q017 exact frozen queue row follows Q016 D0",()=>{
  const q=materializeP07EW7DirectProductVerticalSliceQueue(),row=q.queueEntries[16];
  assert.equal(q016.status,"PASS_E6_D0_COMPLETE");assert.equal(q016.exactHeadSha,"6e7aa3149593c4456e4787f242943e99b4089083");
  assert.equal(row.queuePosition,17);assert.equal(row.sliceId,"p07e_q017_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(row.previousSliceId,"p07e_q016_r11_g5b_u08_5b08_profile_ratio_percent_c1");assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.equal(row.primarySourceNodeId,"g6a_u07_6a07");assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");assert.equal(row.intraWavePrerequisiteRank,11);
});

test("Q017 reuses immutable 6a07 source identity and direct annulus visual witness",()=>{
  const s=pre.sourceAuthority,v=s.currentVisualReadbackAuthority;
  assert.equal(s.sourcePdfDriveFileId,"1mPMMJVgnBrbghylTKnlWL3nnjX9MPIYQ");assert.equal(s.sourcePdfSizeBytes,523526);assert.equal(s.sourcePdfSha256,"e4290341b2ddc3c3dd4a675272b2c77932748548fe89edef88e3dc799fa81648");
  assert.equal(q014.sourceAuthority.sourcePdfDriveFileId,s.sourcePdfDriveFileId);assert.equal(q014.sourceAuthority.sourcePdfSha256,s.sourcePdfSha256);
  assert.equal(v.page1VisibleFamily,"ANNULUS_AREA_WITH_DIAMETER_AND_RADIAL_THICKNESS");assert.equal(v.visibleInnerDiameterMeters,4);assert.equal(v.visibleRadialThicknessMeters,4);assert.equal(v.directAnnulusAreaWitnessPresent,true);
  assert.equal(s.evidenceResolution.newSupplementaryEvidenceRequired,false);
});

test("Q017 R02 candidate is exact annulus ownership and source siblings remain excluded",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6a_u07_6a07"),c=src?.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);
  assert.equal(c.canonicalNameZh,"圓環面積");assert.equal(c.capabilityStatement,"學生能以大圓面積減小圓面積求圓環。");assert.equal(c.reasoningInvariant,"同心圓間區域等於外圓扣除內圓。");assert.deepEqual(c.evidencePages,[1,2]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.sourceSiblingNotOwnedByQ017,["kp_g6a_u07_sector_area","kp_g6a_u07_composite_circle_area"]);
});

test("Q017 semantic lock owns annulus only and protects Q011/Q014",()=>{
  const s=pre.semanticProfileLock,m=s.implementationSemanticLock;
  assert.equal(s.targetSemanticCore,"ANNULUS_AREA_AS_OUTER_CIRCLE_AREA_MINUS_INNER_CIRCLE_AREA");assert.equal(m.outerMinusInnerRequired,true);assert.equal(m.concentricCirclesRequired,true);assert.equal(m.outerRadiusGreaterThanInnerRadiusRequired,true);
  assert.equal(m.innerDiameterToRadiusNormalizationAllowed,true);assert.equal(m.radialThicknessToOuterRadiusAllowed,true);assert.equal(m.q011DerivationTeachingReownershipAllowed,false);assert.equal(m.q014CircleAreaFormulaTeachingReownershipAllowed,false);
  for(const k of ["sectorAreaAllowed","compositeCircleAreaAllowed","circularSegmentAreaAllowed","cowGrazingApplicationAllowed","sameUnitMixedModeAllowed","crossUnitMixedModeAllowed"])assert.equal(m[k],false,k);
});

test("Q017 preflight remains planning-only and requires executable authority readback before merge",()=>{
  assert.equal(pre.status,"PREFLIGHT_EXECUTABLE_AUTHORITY_READBACK_PENDING");assert.equal(pre.executableAuthorityReadback.pending,true);
  assert.equal(pre.q017ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(pre.q017ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ017ImplementationPlanning,true);assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,true);assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  const impact=read("data/project/change-impact/P07F_W7_Q017_PREFLIGHT.impact.json"),plan=read("data/project/validation-plans/P07F_W7_Q017_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
