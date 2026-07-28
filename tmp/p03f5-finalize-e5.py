import hashlib
import json
from pathlib import Path

HTML_PATH = Path("docs/curriculum/output/p03f-slice005-product-admission/g4b-u08-equivalent-fraction.html")
PDF_PATH = Path("docs/curriculum/output/p03f-slice005-product-admission/g4b-u08-equivalent-fraction.pdf")
REPORT_PATH = Path("docs/curriculum/output/p03f-slice005-product-admission/p03f-slice005-product-acceptance-report.json")
MANIFEST_PATH = Path("data/curriculum/full-product/p03f/slice005-product-admission.manifest.json")
CLAIM_PATH = Path("data/project/milestones/FPL-P03F5.claim.json")
READBACK_PATH = Path("docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE005_READBACK.md")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


html_hash = sha256(HTML_PATH)
pdf_hash = sha256(PDF_PATH)

report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
report["status"] = "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
report["visualReview"] = {
    "status": "PASS_VISUAL_AND_SEMANTIC_REVIEWED",
    "questionPageReviewed": True,
    "answerKeyPageReviewed": True,
    "physicalPageParityReviewed": True,
    "clippedTextFindingCount": 0,
    "overlapFindingCount": 0,
    "brokenGlyphFindingCount": 0,
    "semanticScopeFindingCount": 0,
}
report["htmlSha256"] = html_hash
report["pdfSha256"] = pdf_hash
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
manifest["status"] = "SLICE005_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI"
manifest["expectedCounts"].update({
    "chromiumPdfWitnessCount": 1,
    "newProductAdmissionCount": 1,
    "cumulativeW3ProductAdmissionCount": 6,
    "remainingDirectSliceCount": 48,
    "remainingDirectKnowledgePointCount": 76,
})
manifest["exactAcceptance"].update({
    "nodeTestsPassed": 2510,
    "nodeTestsFailed": 0,
    "chromiumPdfPrintPassed": True,
    "physicalPageParityPassed": True,
    "overflowSweepPassed": True,
    "artifactHashSweepPassed": True,
    "visualReviewPassed": True,
    "committedHtmlSha256": html_hash,
    "committedPdfSha256": pdf_hash,
    "preD0NodeWorkflowRunId": 30324058767,
    "preD0NodeWorkflowHeadSha": "7ef0aab0489c9a451de462bbe3f4dc1b3f6a950f",
    "preD0ChromiumArtifactId": 8675008374,
    "preD0ChromiumArtifactDigest": "sha256:53194330bd969b7aa624bbb6d51560d0a116d0d8dc5e57bd6fd36c2c6bb90264",
    "artifactMaterializationCommitSha": "c0afea586477c8d9165b8e336bc5771dcac49e1e",
    "implementationPrNumber": 417,
    "implementationHeadSha": "7ef0aab0489c9a451de462bbe3f4dc1b3f6a950f",
})
manifest["mainlineBoundary"].update({
    "queuePositionConsumed": 5,
    "slice005KnowledgePointAdmitted": True,
    "visibleOutputChanged": True,
})
MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

claim = json.loads(CLAIM_PATH.read_text(encoding="utf-8"))
claim["actualEvidenceLevel"] = "E5_PRODUCTION_ADMITTED"
claim["claimedStatus"] = "W3_SLICE005_ARTIFACT_MATERIALIZED_VISUAL_REVIEWED_PENDING_EXACT_HEAD_CI"
claim["claims"].update({
    "productionRendererUsed": True,
    "htmlOutputVerified": True,
    "pdfOutputVerified": True,
    "visibleOutputChanged": True,
    "productionAdmitted": True,
    "d0Complete": False,
})
claim["evidence"]["htmlArtifactPaths"] = [str(HTML_PATH)]
claim["evidence"]["pdfArtifactPaths"] = [str(PDF_PATH)]
claim["evidence"]["reviewArtifactPaths"] = [str(REPORT_PATH)]
claim["evidence"]["artifactHashes"] = [
    {"path": str(HTML_PATH), "sha256": html_hash},
    {"path": str(PDF_PATH), "sha256": pdf_hash},
]
claim["distance"]["distanceReduced"] = (
    "Queue position 5 is production admitted through the exact fraction capability trio, shared runtime, "
    "current selectors, worksheet, answer key, committed two-page HTML/PDF, committed hashes and visual "
    "semantic review; exact-head CI and merge remain before E6 D0 closeout."
)
claim["nextStep"] = {
    "taskId": "P03F5_ExactHeadCIAndD0Closeout",
    "requiredEvidenceLevelBeforeStart": "E5_PRODUCTION_ADMITTED",
}
claim["d0Closeout"].update({
    "implementationPrNumber": 417,
    "implementationHeadSha": "7ef0aab0489c9a451de462bbe3f4dc1b3f6a950f",
    "preD0HeadSha": "7ef0aab0489c9a451de462bbe3f4dc1b3f6a950f",
    "preD0NodeWorkflowRunId": 30324058767,
    "preD0ChromiumArtifactId": 8675008374,
    "artifactMaterializationCommitSha": "c0afea586477c8d9165b8e336bc5771dcac49e1e",
    "artifactMaterializationWorkflowRunId": 30324408512,
    "nodeTestsPassed": 2510,
    "nodeTestsFailed": 0,
    "visualReviewPassed": True,
    "finalExactHeadAccepted": False,
})
CLAIM_PATH.write_text(json.dumps(claim, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

readback = f"""# P03F W3 Direct Product Vertical Slice 005 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice005Implementation
STATUS     = PASS_ARTIFACT_MATERIALIZED_AND_VISUAL_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Frozen slice

```text
queue position = 5
slice ID       = p03e_q005_r5_g4b_u08_4b08_profile_fraction_c1
source         = g4b_u08_4b08
KnowledgePoint = kp_g4b_u08_generate_equivalent_fraction
PatternGroups  = 1
PatternSpecs   = 3
application    = APPLICATION_NOT_APPLICABLE
```

## Product acceptance

```text
Tag Registry bindings           = 9
FormalMappings                  = 1
numeric PatternSpecs            = 3
required W3 capabilities        = 3 / 3 PASS
shared generator / validator    = CONNECTED / CONNECTED
current Classic / Pixel         = CONNECTED / CONNECTED
WorksheetDocument / answer key  = 9 / 9 PASS
production HTML / PDF           = 1 / 1 COMMITTED
physical PDF pages              = 2
full Node regression            = 2510 / 2510 PASS
visual semantic review          = PASS
duplicate / overflow findings   = 0 / 0
clipping / overlap / glyph      = 0 / 0 / 0
product admission               = E5_PRODUCTION_ADMITTED
```

## Committed evidence

```text
HTML SHA256 = {html_hash}
PDF SHA256  = {pdf_hash}
pre-D0 Node run        = 30324058767
pre-D0 Chromium run    = 30324058740
pre-D0 artifact        = 8675008374
materialization commit = c0afea586477c8d9165b8e336bc5771dcac49e1e
```

All nine witnesses preserve exact rational identity by applying the same positive integer factor to numerator and denominator. Factor, equivalent-numerator and equivalent-denominator unknown roles are covered. The other six G4B-U08 KnowledgePoints remain hidden.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE004_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE005_PRODUCTION_ADMITTED_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 5 moved from a frozen row to a committed and visually reviewed equivalent-fraction product through three W3 fraction capabilities, shared runtime, selectors, worksheet, answer key and two-page HTML/PDF.
REMAINING_BLOCKERS   = [exact-head full regression, PR merge]
NEXT_SHORTEST_STEP   = P03F5_ExactHeadCIAndD0Closeout
```

```text
slice006 started = false
SEPARATE_APPROVAL_REQUIRED = true
```
"""
READBACK_PATH.write_text(readback, encoding="utf-8")
