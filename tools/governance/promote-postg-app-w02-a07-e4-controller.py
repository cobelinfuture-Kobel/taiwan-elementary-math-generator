#!/usr/bin/env python3
from pathlib import Path
R=Path(__file__).resolve().parents[2];READY='W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';NEXT='POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission';E4='E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
def one(t,a,b,n):
 c=t.count(a)
 if c!=1:raise RuntimeError(f'{n}: {c}')
 return t.replace(a,b,1)
p=R/'src/curriculum/application/postg-app-master-controller.mjs';t=p.read_text()
t=one(t,"const W02_A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A06.claim.json';\nconst GOLDEN_UNIT_DIR","const W02_A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A06.claim.json';\nconst W02_A07_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A07.claim.json';\nconst GOLDEN_UNIT_DIR",'const')
t=one(t,"    w02A06Claim: readJsonIfExists(root, W02_A06_CLAIM_PATH)\n","    w02A06Claim: readJsonIfExists(root, W02_A06_CLAIM_PATH),\n    w02A07Claim: readJsonIfExists(root, W02_A07_CLAIM_PATH)\n",'load')
t=one(t,"    w02A05Claim,\n    w02A06Claim\n","    w02A05Claim,\n    w02A06Claim,\n    w02A07Claim\n",'destructure')
t=one(t,"    'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED',\n",f"    '{READY}',\n",'state')
t=one(t,"      || w02State.artifactHashCount !== 5\n      || w02State.productionEquivalentOutputVerified !== true\n      || w02State.humanReviewReady !== false\n","      || w02State.artifactHashCount !== 10\n      || w02State.productionEquivalentOutputVerified !== true\n      || w02State.humanReviewReady !== true\n      || w02State.humanReviewPackageComplete !== true\n      || w02State.reviewDecision !== 'NOT_STARTED'\n      || w02State.applicationReviewCount !== 61\n      || w02State.pblReviewCount !== 31\n      || w02State.pbl3ReviewCount !== 19\n      || w02State.pbl5ReviewCount !== 12\n      || w02State.numericBoundaryReviewCount !== 49\n      || w02State.reviewMacroContextCount !== 16\n      || w02State.reviewArtifactCount !== 10\n      || w02State.reviewEvidence !== 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json'\n",'evidence')
t=one(t,"  if (controllerState.currentWaveId !== 'W02'\n      || controllerState.currentCapability !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'\n      || controllerState.currentMainlineBlocker !== 'W02_HUMAN_REVIEW_PACKAGE_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage') {\n",f"  if (controllerState.currentWaveId !== 'W02'\n      || controllerState.currentCapability !== '{READY}'\n      || controllerState.currentMainlineBlocker !== 'W02_OPERATOR_HUMAN_REVIEW_DECISION_PENDING'\n      || controllerState.nextShortestStep !== '{NEXT}') {{\n",'transition')
check=f"""
  if (!w02A07Claim
      || w02A07Claim.actualEvidenceLevel !== '{E4}'
      || w02A07Claim.claimedStatus !== '{READY}'
      || w02A07Claim.claims?.runtimeIntegrated !== true
      || w02A07Claim.claims?.productionEquivalentGeneratorUsed !== true
      || w02A07Claim.claims?.productionRendererUsed !== true
      || w02A07Claim.claims?.htmlOutputVerified !== true
      || w02A07Claim.claims?.pdfOutputVerified !== true
      || w02A07Claim.claims?.visibleOutputChanged !== true
      || w02A07Claim.claims?.humanReviewReady !== true
      || w02A07Claim.claims?.productionAdmitted !== false
      || w02A07Claim.claims?.d0Complete !== false
      || w02A07Claim.humanReview?.type !== 'production_equivalent_output_review'
      || w02A07Claim.evidence?.reviewArtifactPaths?.length !== 10
      || w02A07Claim.evidence?.artifactHashes?.length !== 10
      || w02A07Claim.nextStep?.taskId !== '{NEXT}') {{
    issues.push(issue('POSTG_APP_W02_A07_CLAIM_INVALID', W02_A07_CLAIM_PATH));
  }}
"""
t=one(t,'\n  const contextValidation = validateGlobalContextAuthority(controller.contextAuthority);',check+'\n  const contextValidation = validateGlobalContextAuthority(controller.contextAuthority);','check')
t=one(t,"      ? 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'\n",f"      ? '{READY}'\n",'readback');p.write_text(t)
p=R/'tests/curriculum/postg-app-m00-master-controller.test.js';t=p.read_text()
t=one(t,"test('M00 validates the exact 79-node scope with W01 admitted and W02 A06 E4 output verified', () => {","test('M00 validates the exact 79-node scope with W01 admitted and W02 A07 human review ready', () => {",'title1')
t=one(t,"  assert.equal(result.status, 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED');\n",f"  assert.equal(result.status, '{READY}');\n",'result')
t=one(t,"  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage');\n",f"  assert.equal(result.nextShortestStep, '{NEXT}');\n",'next')
t=one(t,"test('Wave 02 has A06 production-equivalent HTML PDF E4 verification without admission', () => {","test('Wave 02 has the A07 production-equivalent human review package without admission', () => {",'title2')
t=one(t,"  assert.equal(w02.currentState.state, 'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED');\n",f"  assert.equal(w02.currentState.state, '{READY}');\n",'wstate')
t=one(t,"  assert.equal(w02.currentState.artifactHashCount, 5);\n  assert.equal(w02.currentState.productionEquivalentOutputVerified, true);\n  assert.equal(w02.currentState.humanReviewReady, false);\n","  assert.equal(w02.currentState.artifactHashCount, 10);\n  assert.equal(w02.currentState.productionEquivalentOutputVerified, true);\n  assert.equal(w02.currentState.humanReviewReady, true);\n  assert.equal(w02.currentState.humanReviewPackageComplete, true);\n  assert.equal(w02.currentState.reviewDecision, 'NOT_STARTED');\n  assert.equal(w02.currentState.applicationReviewCount, 61);\n  assert.equal(w02.currentState.pblReviewCount, 31);\n  assert.equal(w02.currentState.pbl3ReviewCount, 19);\n  assert.equal(w02.currentState.pbl5ReviewCount, 12);\n  assert.equal(w02.currentState.numericBoundaryReviewCount, 49);\n  assert.equal(w02.currentState.reviewMacroContextCount, 16);\n  assert.equal(w02.currentState.reviewArtifactCount, 10);\n  assert.equal(w02.currentState.reviewEvidence, 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json');\n",'review')
t=one(t,"test('W01 stays E5, W02 A00 through A05 remain E3, and A06 is E4 non-production', () => {","test('W01 stays E5, W02 A00 through A05 remain E3, A06 and A07 are E4 non-production', () => {",'title3')
t=one(t,"  assert.equal(controller.w02A06Claim.claims.productionAdmitted, false);\n  assert.equal(controller.w02A06Claim.claims.d0Complete, false);\n",f"  assert.equal(controller.w02A06Claim.claims.productionAdmitted, false);\n  assert.equal(controller.w02A06Claim.claims.d0Complete, false);\n  assert.equal(controller.w02A07Claim.actualEvidenceLevel, '{E4}');\n  assert.equal(controller.w02A07Claim.claimedStatus, '{READY}');\n  assert.equal(controller.w02A07Claim.claims.productionRendererUsed, true);\n  assert.equal(controller.w02A07Claim.claims.htmlOutputVerified, true);\n  assert.equal(controller.w02A07Claim.claims.pdfOutputVerified, true);\n  assert.equal(controller.w02A07Claim.claims.visibleOutputChanged, true);\n  assert.equal(controller.w02A07Claim.claims.humanReviewReady, true);\n  assert.equal(controller.w02A07Claim.claims.productionAdmitted, false);\n  assert.equal(controller.w02A07Claim.claims.d0Complete, false);\n",'claim')
t=one(t,"test('forged approval, W02 claims and A06 output state fail closed', () => {","test('forged approval, W02 claims and A07 review state fail closed', () => {",'title4')
t=one(t,"    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID'],\n    ['w02A06Claim', 'POSTG_APP_W02_A06_CLAIM_INVALID']\n","    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID'],\n    ['w02A06Claim', 'POSTG_APP_W02_A06_CLAIM_INVALID'],\n    ['w02A07Claim', 'POSTG_APP_W02_A07_CLAIM_INVALID']\n",'forged');p.write_text(t)
print('controller and tests promoted')
