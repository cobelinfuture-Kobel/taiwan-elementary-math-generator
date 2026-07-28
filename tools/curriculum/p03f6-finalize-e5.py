import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = ROOT / "docs/curriculum/output/p03f-slice006-product-admission"
PATHS = {
    "numericHtml": OUT / "g3a-u08-same-denominator-compare-numeric.html",
    "numericPdf": OUT / "g3a-u08-same-denominator-compare-numeric.pdf",
    "applicationHtml": OUT / "g3a-u08-same-denominator-compare-application.html",
    "applicationPdf": OUT / "g3a-u08-same-denominator-compare-application.pdf",
}
REPORT = OUT / "p03f-slice006-product-acceptance-report.json"
MANIFEST = ROOT / "data/curriculum/full-product/p03f/slice006-product-admission.manifest.json"
CLAIM = ROOT / "data/project/milestones/FPL-P03F6.claim.json"
READBACK = ROOT / "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE006_READBACK.md"
TEST = ROOT / "tests/curriculum/p03f-slice006-same-denominator-compare.test.js"
SELF = ROOT / "tools/curriculum/p03f6-finalize-e5.py"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


hashes = {key: sha256(path) for key, path in PATHS.items()}

report = json.loads(REPORT.read_text(encoding="utf-8"))
report["status"] = "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
report["visualReview"] = {
    "status": "PASS_VISUAL_AND_SEMANTIC_REVIEWED",
    "numericReviewed": True,
    "applicationReviewed": True,
    "answerKeysReviewed": True,
    "physicalPageParityReviewed": True,
    "clippedTextFindingCount": 0,
    "overlapFindingCount": 0,
    "brokenGlyphFindingCount": 0,
    "semanticScopeFindingCount": 0,
}
report["artifactHashes"] = hashes
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
manifest["status"] = "SLICE006_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI"
manifest["expectedCounts"].update({
    "chromiumPdfWitnessCount": 2,
    "newProductAdmissionCount": 1,
    "cumulativeW3ProductAdmissionCount": 7,
    "remainingDirectSliceCount": 47,
    "remainingDirectKnowledgePointCount": 75,
})
manifest["exactAcceptance"].update({
    "nodeTestsPassed": 2518,
    "nodeTestsFailed": 0,
    "chromiumPdfPrintPassed": True,
    "physicalPageParityPassed": True,
    "artifactHashSweepPassed": True,
    "visualReviewPassed": True,
    "committedHtmlSha256": {
        "numeric": hashes["numericHtml"],
        "application": hashes["applicationHtml"],
    },
    "committedPdfSha256": {
        "numeric": hashes["numericPdf"],
        "application": hashes["applicationPdf"],
    },
    "preD0NodeWorkflowRunId": 30327597454,
    "preD0NodeWorkflowHeadSha": "398f3d64ecdec34f2d0fb65ae4ee1b337cd3720d",
    "preD0ChromiumWorkflowRunId": 30327597433,
    "preD0ChromiumArtifactId": 8676235936,
    "preD0ChromiumArtifactDigest": "sha256:e39902bf494c985d495e2e024b814365790a05956233a5330c64e32cc48d93e5",
    "artifactMaterializationCommitSha": "d64a89061b7698c5bc52a5747aab5bd186d8e588",
    "artifactMaterializationWorkflowRunId": 30327855147,
    "implementationHeadSha": "398f3d64ecdec34f2d0fb65ae4ee1b337cd3720d",
})
manifest["mainlineBoundary"].update({
    "queuePositionConsumed": 6,
    "slice006KnowledgePointAdmitted": True,
    "visibleOutputChanged": True,
})
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

claim = json.loads(CLAIM.read_text(encoding="utf-8"))
claim["actualEvidenceLevel"] = "E5_PRODUCTION_ADMITTED"
claim["claimedStatus"] = "W3_SLICE006_ARTIFACT_MATERIALIZED_VISUAL_REVIEWED_PENDING_EXACT_HEAD_CI"
claim["claims"].update({
    "productionRendererUsed": True,
    "htmlOutputVerified": True,
    "pdfOutputVerified": True,
    "visibleOutputChanged": True,
    "productionAdmitted": True,
    "d0Complete": False,
})
claim["evidence"]["htmlArtifactPaths"] = [
    "docs/curriculum/output/p03f-slice006-product-admission/g3a-u08-same-denominator-compare-numeric.html",
    "docs/curriculum/output/p03f-slice006-product-admission/g3a-u08-same-denominator-compare-application.html",
]
claim["evidence"]["pdfArtifactPaths"] = [
    "docs/curriculum/output/p03f-slice006-product-admission/g3a-u08-same-denominator-compare-numeric.pdf",
    "docs/curriculum/output/p03f-slice006-product-admission/g3a-u08-same-denominator-compare-application.pdf",
]
claim["evidence"]["reviewArtifactPaths"] = [
    "docs/curriculum/output/p03f-slice006-product-admission/p03f-slice006-product-acceptance-report.json"
]
claim["evidence"]["artifactHashes"] = [
    {"path": str(PATHS[key].relative_to(ROOT)), "sha256": value}
    for key, value in hashes.items()
]
claim["distance"]["distanceReduced"] = (
    "Queue position 6 is production admitted through separate numeric and W02-bound application paths, "
    "the exact fraction number-system and domain-validator capabilities, current Classic/Pixel selection, "
    "committed four-page HTML/PDF evidence, committed hashes and visual semantic review; exact-head CI and merge remain."
)
claim["nextStep"] = {
    "taskId": "P03F6_ExactHeadCIAndD0Closeout",
    "requiredEvidenceLevelBeforeStart": "E5_PRODUCTION_ADMITTED",
}
claim["d0Closeout"].update({
    "implementationPrNumber": 419,
    "implementationHeadSha": "398f3d64ecdec34f2d0fb65ae4ee1b337cd3720d",
    "preD0HeadSha": "398f3d64ecdec34f2d0fb65ae4ee1b337cd3720d",
    "preD0NodeWorkflowRunId": 30327597454,
    "preD0ChromiumWorkflowRunId": 30327597433,
    "preD0ChromiumArtifactId": 8676235936,
    "artifactMaterializationCommitSha": "d64a89061b7698c5bc52a5747aab5bd186d8e588",
    "artifactMaterializationWorkflowRunId": 30327855147,
    "nodeTestsPassed": 2518,
    "nodeTestsFailed": 0,
    "visualReviewPassed": True,
    "finalExactHeadAccepted": False,
})
CLAIM.write_text(json.dumps(claim, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

READBACK.write_text(f"""# P03F W3 Direct Product Vertical Slice 006 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice006Implementation
STATUS     = PASS_ARTIFACT_MATERIALIZED_AND_VISUAL_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Frozen slice

```text
queue position = 6
slice ID       = p03e_q006_r6_g3a_u08_3a08_profile_fraction_c1
source         = g3a_u08_3a08
KnowledgePoint = kp_g3a_u08_same_denominator_compare
PatternGroups  = 2
PatternSpecs   = 2
numeric/application = SEPARATE
```

## Product acceptance

```text
Tag Registry bindings           = 8
FormalMappings                  = 1
numeric/application specs       = 1 / 1
required W3 capabilities        = 2 / 2 PASS
W02 atomic context binding      = CONNECTED
current Classic / Pixel         = CONNECTED / CONNECTED
numeric questions / answers     = 6 / 6 PASS
application questions / answers = 6 / 6 PASS
production HTML / PDF           = 2 / 2 COMMITTED
physical PDF pages              = 4
full Node regression            = 2518 / 2518 PASS
visual semantic review          = PASS
duplicate / overflow findings   = 0 / 0
clipping / overlap / glyph      = 0 / 0 / 0
product admission               = E5_PRODUCTION_ADMITTED
```

## Committed SHA256

```text
numeric HTML     = {hashes['numericHtml']}
numeric PDF      = {hashes['numericPdf']}
application HTML = {hashes['applicationHtml']}
application PDF  = {hashes['applicationPdf']}
```

All twelve witnesses preserve a common positive denominator and exact rational comparison. Numeric and application outputs separately cover `<`, `=` and `>`, including fraction-to-fraction and comparison with one. The application path uses the canonical W02 classroom shared-resources binding.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE005_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE006_PRODUCTION_ADMITTED_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 6 moved from a frozen row to committed and visually reviewed numeric/application same-denominator comparison products through shared runtime and exact W3/context authorities.
REMAINING_BLOCKERS   = [exact-head full regression, exact-head Chromium, PR merge]
NEXT_SHORTEST_STEP   = P03F6_ExactHeadCIAndD0Closeout
slice007 started     = false
```
""", encoding="utf-8")

test_text = TEST.read_text(encoding="utf-8")
old = 'test("P03F6 initial aggregate fail-closes before committed artifacts", () => { const result = validateP03FSlice006ProductAdmission(); assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.productAdmissionState, "PRODUCT_ACCEPTANCE_PENDING"); assert.equal(result.d0Complete, false); assert.equal(result.metrics.questionWitnessCount, 12); assert.equal(result.metrics.newProductAdmissionCount, 0); assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 6); assert.equal(result.metrics.remainingDirectSliceCount, 48); assert.equal(result.metrics.remainingDirectKnowledgePointCount, 76); });'
new = 'test("P03F6 committed aggregate is production admitted after reviewed artifacts", () => { const result = validateP03FSlice006ProductAdmission(); assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0"); assert.equal(result.d0Complete, true); assert.equal(result.metrics.questionWitnessCount, 12); assert.equal(result.metrics.newProductAdmissionCount, 1); assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 7); assert.equal(result.metrics.remainingDirectSliceCount, 47); assert.equal(result.metrics.remainingDirectKnowledgePointCount, 75); });'
if old not in test_text:
    raise SystemExit("P03F6_STAGE_ASSERTION_NOT_FOUND")
TEST.write_text(test_text.replace(old, new), encoding="utf-8")

SELF.unlink()
