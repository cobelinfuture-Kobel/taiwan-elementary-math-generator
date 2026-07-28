from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/curriculum/output/p03f-slice007-product-admission"
PATHS = {
    "numericHtml": OUT / "g3b-u07-fraction-unit-conversion-numeric.html",
    "numericPdf": OUT / "g3b-u07-fraction-unit-conversion-numeric.pdf",
    "applicationHtml": OUT / "g3b-u07-fraction-unit-conversion-application.html",
    "applicationPdf": OUT / "g3b-u07-fraction-unit-conversion-application.pdf",
}
HASHES = {key: hashlib.sha256(path.read_bytes()).hexdigest() for key, path in PATHS.items()}

PRED0_HEAD = "06faaf2f1d162e7a04dc3cfabf9fe2f99f46d13f"
PRED0_NODE_RUN = 30334086938
PRED0_CHROMIUM_RUN = 30334086957
PRED0_CHROMIUM_ARTIFACT = 8678472303
MATERIALIZATION_COMMIT = "784afb5650f4984f151394cd31e77860f446cbfb"
MATERIALIZATION_RUN = 30334446312


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


report_path = OUT / "p03f-slice007-product-acceptance-report.json"
report = json.loads(report_path.read_text(encoding="utf-8"))
report["status"] = "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
report["artifactHashes"] = {
    "numericHtml": HASHES["numericHtml"],
    "numericPdf": HASHES["numericPdf"],
    "applicationHtml": HASHES["applicationHtml"],
    "applicationPdf": HASHES["applicationPdf"],
}
write_json(report_path, report)

manifest_path = ROOT / "data/curriculum/full-product/p03f/slice007-product-admission.manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["status"] = "SLICE007_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI"
manifest["expectedCounts"].update({
    "chromiumPdfWitnessCount": 2,
    "newProductAdmissionCount": 1,
    "cumulativeW3ProductAdmissionCount": 8,
    "remainingDirectSliceCount": 46,
    "remainingDirectKnowledgePointCount": 74,
})
manifest["exactAcceptance"].update({
    "nodeTestsPassed": 2526,
    "nodeTestsFailed": 0,
    "chromiumPdfPrintPassed": True,
    "physicalPageParityPassed": True,
    "artifactHashSweepPassed": True,
    "visualReviewPassed": True,
    "committedHtmlSha256": {"numeric": HASHES["numericHtml"], "application": HASHES["applicationHtml"]},
    "committedPdfSha256": {"numeric": HASHES["numericPdf"], "application": HASHES["applicationPdf"]},
    "implementationHeadSha": PRED0_HEAD,
    "preD0NodeWorkflowRunId": PRED0_NODE_RUN,
    "preD0NodeWorkflowHeadSha": PRED0_HEAD,
    "preD0ChromiumWorkflowRunId": PRED0_CHROMIUM_RUN,
    "preD0ChromiumArtifactId": PRED0_CHROMIUM_ARTIFACT,
    "artifactMaterializationCommitSha": MATERIALIZATION_COMMIT,
    "artifactMaterializationWorkflowRunId": MATERIALIZATION_RUN,
})
manifest["mainlineBoundary"].update({
    "queuePositionConsumed": 7,
    "slice007KnowledgePointAdmitted": True,
    "visibleOutputChanged": True,
})
write_json(manifest_path, manifest)

claim_path = ROOT / "data/project/milestones/FPL-P03F7.claim.json"
claim = json.loads(claim_path.read_text(encoding="utf-8"))
claim["actualEvidenceLevel"] = "E5_PRODUCTION_ADMITTED"
claim["claimedStatus"] = "W3_SLICE007_ARTIFACT_MATERIALIZED_VISUAL_REVIEWED_PENDING_EXACT_HEAD_CI"
claim["claims"].update({
    "productionRendererUsed": True,
    "htmlOutputVerified": True,
    "pdfOutputVerified": True,
    "visibleOutputChanged": True,
    "productionAdmitted": True,
    "d0Complete": False,
})
claim["evidence"]["htmlArtifactPaths"] = [str(PATHS["numericHtml"].relative_to(ROOT)), str(PATHS["applicationHtml"].relative_to(ROOT))]
claim["evidence"]["pdfArtifactPaths"] = [str(PATHS["numericPdf"].relative_to(ROOT)), str(PATHS["applicationPdf"].relative_to(ROOT))]
claim["evidence"]["reviewArtifactPaths"] = [str(report_path.relative_to(ROOT))]
claim["evidence"]["artifactHashes"] = [
    {"path": str(PATHS["numericHtml"].relative_to(ROOT)), "sha256": HASHES["numericHtml"]},
    {"path": str(PATHS["numericPdf"].relative_to(ROOT)), "sha256": HASHES["numericPdf"]},
    {"path": str(PATHS["applicationHtml"].relative_to(ROOT)), "sha256": HASHES["applicationHtml"]},
    {"path": str(PATHS["applicationPdf"].relative_to(ROOT)), "sha256": HASHES["applicationPdf"]},
]
claim["distance"]["distanceReduced"] = (
    "Queue position 7 is production admitted through two numeric and two role-preserving application PatternSpecs, "
    "the exact fraction number-system and domain-validator capabilities, current Classic/Pixel selection, committed "
    "four-page HTML/PDF evidence, committed hashes and visual semantic review; exact-head CI and merge remain."
)
claim["nextStep"] = {"taskId": "P03F7_ExactHeadCIAndD0Closeout", "requiredEvidenceLevelBeforeStart": "E5_PRODUCTION_ADMITTED"}
claim["d0Closeout"].update({
    "implementationHeadSha": PRED0_HEAD,
    "nodeTestsPassed": 2526,
    "nodeTestsFailed": 0,
    "visualReviewPassed": True,
    "finalExactHeadAccepted": False,
    "preD0HeadSha": PRED0_HEAD,
    "preD0NodeWorkflowRunId": PRED0_NODE_RUN,
    "preD0ChromiumWorkflowRunId": PRED0_CHROMIUM_RUN,
    "preD0ChromiumArtifactId": PRED0_CHROMIUM_ARTIFACT,
    "artifactMaterializationCommitSha": MATERIALIZATION_COMMIT,
    "artifactMaterializationWorkflowRunId": MATERIALIZATION_RUN,
})
write_json(claim_path, claim)

readback_path = ROOT / "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE007_READBACK.md"
readback_path.write_text(f"""# P03F W3 Direct Product Vertical Slice 007 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice007Implementation
STATUS     = ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Frozen slice

```text
queue position = 7
slice ID       = p03e_q007_r6_g3b_u07_3b07_profile_fraction_c1
source         = g3b_u07_3b07
KnowledgePoint = kp_g3b_u07_fraction_unit_conversion
PatternGroups  = 2
PatternSpecs   = 4
numeric/application = SEPARATE
```

## E5 product evidence

```text
required W3 capabilities        = 2 / 2 PASS
numeric PatternSpecs            = 2 / 2 PASS
application PatternSpecs        = 2 / 2 PASS
numeric questions / answers     = 6 / 6 PASS
application questions / answers = 6 / 6 PASS
production HTML / PDF           = 2 / 2 COMMITTED
physical PDF pages              = 4
artifact SHA256 gate            = PASS
visual semantic review          = PASS
product admission               = PRODUCTION_ADMITTED_D0
```

The numeric and application paths independently cover `itemCount` and `fractionalUnits`. Every witness preserves `itemCount x denominator = numerator x itemsPerWhole`; application prompts preserve box, items-per-box and fractional-box roles through the W02 classroom shared-resource binding.

## Committed hashes

```text
numeric HTML SHA256     = {HASHES['numericHtml']}
numeric PDF SHA256      = {HASHES['numericPdf']}
application HTML SHA256 = {HASHES['applicationHtml']}
application PDF SHA256  = {HASHES['applicationPdf']}
```

## Pre-D0 acceptance

```text
pre-D0 head              = {PRED0_HEAD}
pre-D0 Node run          = {PRED0_NODE_RUN} SUCCESS
pre-D0 Chromium run      = {PRED0_CHROMIUM_RUN} SUCCESS
pre-D0 Chromium artifact = {PRED0_CHROMIUM_ARTIFACT}
full Node regression     = 2526 / 2526 PASS
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE006_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE007_D0_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 7 now has committed reviewed numeric/application HTML/PDF and hash-bound product admission.
REMAINING_BLOCKERS   = [exact-head CI, E6 closeout metadata, PR merge]
NEXT_SHORTEST_STEP   = P03F7_ExactHeadCIAndD0Closeout
slice008 started     = false
```
""", encoding="utf-8")

test_path = ROOT / "tests/curriculum/p03f-slice007-fraction-unit-conversion.test.js"
text = test_path.read_text(encoding="utf-8")
old = 'test("P03F7 initial aggregate fail-closes before committed artifacts", () => { const result = validateP03FSlice007ProductAdmission(); assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.productAdmissionState, "PRODUCT_ACCEPTANCE_PENDING"); assert.equal(result.d0Complete, false); assert.equal(result.metrics.questionWitnessCount, 12); assert.equal(result.metrics.newProductAdmissionCount, 0); assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 7); assert.equal(result.metrics.remainingDirectSliceCount, 47); assert.equal(result.metrics.remainingDirectKnowledgePointCount, 75); });'
new = 'test("P03F7 committed aggregate is production admitted after reviewed artifacts", () => { const result = validateP03FSlice007ProductAdmission(); assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0"); assert.equal(result.d0Complete, true); assert.equal(result.metrics.questionWitnessCount, 12); assert.equal(result.metrics.chromiumPdfWitnessCount, 2); assert.equal(result.metrics.newProductAdmissionCount, 1); assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 8); assert.equal(result.metrics.remainingDirectSliceCount, 46); assert.equal(result.metrics.remainingDirectKnowledgePointCount, 74); });'
if old not in text:
    raise RuntimeError("stale P03F7 stage assertion not found")
test_path.write_text(text.replace(old, new), encoding="utf-8")

Path(__file__).unlink()
print(json.dumps(HASHES, sort_keys=True))
