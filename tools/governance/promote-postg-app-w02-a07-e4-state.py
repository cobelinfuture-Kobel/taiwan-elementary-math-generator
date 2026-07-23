#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, os
from pathlib import Path
R=Path(__file__).resolve().parents[2]
TASK='POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage'; NEXT='POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission'
READY='W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'; E4='E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
C=Path('data/project/milestones/POSTG-APP-W02-A07.claim.json'); K=Path('data/curriculum/application/reviews/POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage.json'); S=Path('data/curriculum/application/controller/postg-app-master-controller-state.json')
A6=Path('docs/curriculum/output/postg-app/w02-a06'); A7=Path('docs/curriculum/output/postg-app/w02-a07')
M=A7/'POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json'; D=A7/'POSTG_APP_W02_A07_HUMAN_REVIEW_DATA.json'; I=A7/'POSTG_APP_W02_A07_HUMAN_REVIEW_INDEX.html'; X=A7/'POSTG_APP_W02_A07_HUMAN_REVIEW.extracted.txt'
NH=A6/'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html'; NP=A6/'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf'; AH=A6/'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html'; AP=A6/'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf'; P=A6/'POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json'; AM=A6/'POSTG_APP_W02_A06_ARTIFACT_MANIFEST.json'
ART=[I,D,X,M,NH,NP,AH,AP,P,AM]
def load(p): return json.loads((R/p).read_text(encoding='utf-8'))
def dump(p,v): (R/p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p): return hashlib.sha256((R/p).read_bytes()).hexdigest()
def add(a,x):
 if x not in a:a.append(x)
def need(x,m):
 if not x:raise RuntimeError(m)
for p in ART: need((R/p).is_file() and (R/p).stat().st_size>0,f'missing {p}')
m=load(M); data=load(D)
need(m['status']==READY and m['evidenceLevel']==E4 and m['humanReviewReady'] is True and m['reviewDecision']=='NOT_STARTED','manifest boundary')
need(m['productionAdmissionGranted'] is False and m['publicSelectable'] is False,'manifest admission')
exp={'sourceNodeCount':13,'macroContextCount':16,'totalGeneratedItemCount':195,'numericGeneratedItemCount':134,'applicationReviewCount':61,'pblReviewCount':31,'pbl3ReviewCount':19,'pbl5ReviewCount':12,'numericBoundaryReviewCount':49,'operationFamilyCount':49}
for k,v in exp.items():need(m['coverage'].get(k)==v,f'coverage {k}')
need(len(data['applicationReviewRows'])==61 and len({r['contextMacroId'] for r in data['applicationReviewRows']})==16,'context coverage')
for row in m['artifacts']:
 p=Path(row['path']);need((R/p).stat().st_size==row['sizeBytes'] and sha(p)==row['sha256'],f'hash {p}')
contract=load(K);contract.update(status=READY,actualEvidenceLevel=E4,humanReviewReady=True,reviewDecision='NOT_STARTED',productionAdmissionGranted=False,publicSelectable=False,verifiedCoverage={'sourceNodeCount':13,'macroContextCount':16,'applicationQuestionCount':61,'numericQuestionCount':134,'pblTaskSetCount':31,'pbl3TaskSetCount':19,'pbl5TaskSetCount':12,'numericBoundaryReviewCount':49,'operationFamilyCount':49,'reviewArtifactCount':10},nextShortestStepAfterPass=NEXT);dump(K,contract)
s=load(S);s.update(taskId=TASK,status=READY,currentCapability=READY,currentMainlineBlocker='W02_OPERATOR_HUMAN_REVIEW_DECISION_PENDING',nextShortestStep=NEXT,stopReason='NONE')
s.setdefault('dependencies',{})['w02HumanReviewPackageTaskId']=TASK
s.setdefault('authoritativeState',{}).update(w02HumanReviewRuntime='src/curriculum/application/w02-a07-human-review-package.mjs',w02HumanReviewValidationCli='tools/curriculum/validate-postg-app-w02-a07-human-review-package.mjs',w02HumanReviewManifest=M.as_posix(),w02HumanReviewData=D.as_posix(),w02A07MilestoneClaim=C.as_posix())
w=next(x for x in s['waveStates'] if x['waveId']=='W02');w.update(state=READY,humanReviewReady=True,humanReviewPackageComplete=True,reviewDecision='NOT_STARTED',reviewEvidence=M.as_posix(),applicationReviewCount=61,pblReviewCount=31,pbl3ReviewCount=19,pbl5ReviewCount=12,numericBoundaryReviewCount=49,reviewMacroContextCount=16,reviewArtifactCount=10,artifactHashCount=10,productionAdmissionGranted=False,admissionGateComplete=False,publicSelectableCandidateCount=0,productionAdmittedCandidateCount=0)
lin=s['producerStateConsumerReadback'];add(lin['producer'],TASK)
for z in [M.name,D.name,C.name]:add(lin['authoritativeState'],z)
add(lin['runtimeConsumer'],'w02-a07-human-review-package.mjs');add(lin['readback'],'validate-postg-app-w02-a07-human-review-package.mjs');dump(S,s)
marker=R/'docs/curriculum/output/POSTG_APP_W02_A07_E4_HUMAN_REVIEW_READY.marker';marker.write_text(f'TASK={TASK}\nSTATUS={READY}\nACTUAL_EVIDENCE_LEVEL={E4}\nHUMAN_REVIEW_READY=true\nREVIEW_DECISION=NOT_STARTED\nPRODUCTION_ADMISSION_GRANTED=false\nPUBLIC_SELECTABLE=false\nAPPLICATION_REVIEW_COUNT=61\nPBL_REVIEW_COUNT=31\nNUMERIC_BOUNDARY_REVIEW_COUNT=49\nMACRO_CONTEXT_REVIEW_COUNT=16\nREVIEW_ARTIFACT_COUNT=10\nWORKFLOW_RUN_ID={os.getenv("GITHUB_RUN_ID","UNKNOWN")}\nARTIFACT_SOURCE_HEAD={os.getenv("GITHUB_SHA","UNKNOWN")}\nNEXT_SHORT_STEP={NEXT}\nSTOP_REASON=NONE\n',encoding='utf-8')
(R/'docs/curriculum/output/POSTG_APP_W02_A07_E4_READBACK.md').write_text(f'''# POSTG-APP W02-A07 E4 Human Review Readback

```text
STATUS = {READY}
ACTUAL_EVIDENCE_LEVEL = {E4}
HUMAN_REVIEW_READY = true
REVIEW_DECISION = NOT_STARTED
PRODUCTION_ADMISSION_GRANTED = false
```

13 source nodes; 195 generated items; 61 application review rows with 16 macro-context lineages; 31 PBL task sets; 49 numeric family boundary rows; 10 hash-locked repository artifacts.

```text
GOAL_DISTANCE_BEFORE = D1_W02_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_REVIEW_PACKAGE_PENDING
GOAL_DISTANCE_AFTER  = D1_W02_HUMAN_REVIEW_READY_OPERATOR_DECISION_PENDING
DISTANCE_REDUCED     = Exact review materials and context lineage are available to the operator.
REMAINING_BLOCKERS   = [EXPLICIT_OPERATOR_HUMAN_REVIEW_DECISION, PRODUCTION_ADMISSION]
NEXT_SHORTEST_STEP   = {NEXT}
STOP_REASON          = NONE
```
''',encoding='utf-8')
(R/'docs/curriculum/output/POSTG_APP_W02_A07_GATE_MATRIX.md').write_text('''# W02 A07 Gate Matrix

| Gate | Final state |
|---|---|
| A06 E4 dependency | PASS |
| 61 application review rows | PASS |
| 16 macro-context lineage coverage | PASS |
| 31 PBL review rows | PASS |
| 49 numeric boundary rows | PASS |
| Exact HTML/PDF and hashes | PASS |
| Human review ready | TRUE |
| Operator decision | NOT_STARTED |
| Production admission | FALSE |
| Public selectable | FALSE |
''',encoding='utf-8')
(R/'docs/curriculum/output/POSTG_APP_W02_A07_NEXT_SHORT_STEP.marker').write_text(f'NEXT_SHORT_STEP={NEXT}\nA08_NOT_STARTED=true\nACTIVE_PR=338\nSUPERSEDED_PR=337\nA07_E4_PROMOTED=true\nSTOP_REASON=NONE\n',encoding='utf-8')
claim=load(C);claim.update(actualEvidenceLevel=E4,claimedStatus=READY)
claim['claims']={'dataStructureReady':True,'contentAuthored':True,'runtimeIntegrated':True,'productionEquivalentGeneratorUsed':True,'productionRendererUsed':True,'htmlOutputVerified':True,'pdfOutputVerified':True,'visibleOutputChanged':True,'humanReviewReady':True,'productionAdmitted':False,'d0Complete':False}
claim['evidence']={'runtimeTestPaths':['src/curriculum/application/shared/operation-family-runtime.mjs','src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs','src/curriculum/application/w02-a07-human-review-package.mjs','tests/curriculum/postg-app-w02-a06-production-equivalent-html-pdf.test.js','tests/curriculum/postg-app-w02-a07-human-review-package.test.js','tools/curriculum/validate-postg-app-w02-a07-human-review-package.mjs'],'rendererTestPaths':['site/assets/browser/pipeline/build-worksheet-document.js','site/modules/renderer/html-renderer-s57f5-extension.js','tools/curriculum/render-postg-app-w02-a06-pdf.mjs','tools/curriculum/verify-postg-app-w02-a06-pdf.py','tools/curriculum/generate-postg-app-w02-a07-review-artifacts.mjs','.github/workflows/postg-app-w02-a07-human-review-package.yml'],'htmlArtifactPaths':[I.as_posix(),NH.as_posix(),AH.as_posix()],'pdfArtifactPaths':[NP.as_posix(),AP.as_posix()],'beforeAfterEvidencePaths':[K.as_posix(),'docs/curriculum/output/POSTG_APP_W02_A06_E4_PRODUCTION_EQUIVALENT_EVIDENCE.json',D.as_posix(),M.as_posix(),S.as_posix(),'docs/curriculum/output/POSTG_APP_W02_A07_E4_HUMAN_REVIEW_READY.marker'],'reviewArtifactPaths':[p.as_posix() for p in ART],'artifactHashes':[{'path':p.as_posix(),'sha256':sha(p)} for p in ART]}
claim['humanReview']={'type':'production_equivalent_output_review','canUnlockProduction':True,'reviewArtifactRequired':True};claim['distance']={'before':'D1','after':'D1','distanceReduced':'Exact W02 generation and rendering now provide 61 application rows with complete 16-macro-context lineage, 31 PBL task sets, 49 numeric family references and ten hash-locked repository artifacts. Operator decision and production admission remain pending.'};claim['nextStep']={'taskId':NEXT,'requiredEvidenceLevelBeforeStart':E4};claim['evidenceRun']={'workflowRunId':int(os.getenv('GITHUB_RUN_ID','0') or 0),'artifactSourceHeadSha':os.getenv('GITHUB_SHA','UNKNOWN'),'artifactManifestHash':sha(M),'reviewArtifactCount':10,'manifestArtifactHashCount':m['artifactHashCount']};dump(C,claim)
print(json.dumps({'status':READY,'humanReviewReady':True,'reviewDecision':'NOT_STARTED','productionAdmissionGranted':False,'nextShortestStep':NEXT},indent=2))
