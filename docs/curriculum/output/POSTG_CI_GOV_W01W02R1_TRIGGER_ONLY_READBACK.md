# POSTG CI Governance W01/W02 R1 Readback

## Task

`POSTG-CI-GOV-W01W02R1_TriggerOnlyPreservingHistoricalWorkflowContracts`

## Scope lock

- Base: `main@4f352e5e57027ea9271682a7af0055140a2d6471`
- Historical POSTG workflows: 15
- Historical legacy unit workflows: 18
- Active global workflows reclassified: 1 (`Math CI Readback`)
- Required pull-request gates: 2

## Implemented contract

1. Closed milestone workflows retain their existing workflow name, permissions, concurrency, jobs, steps, validators, artifact logic and diagnostic logic.
2. Only the automatic trigger layer is changed to `workflow_call` plus `workflow_dispatch`.
3. `Math CI Readback` is not historical: it retains `push` on `main` and `workflow_dispatch`, while its pull-request trigger is removed.
4. `Milestone Claim Integrity` is no longer a standalone pull-request gate; claim validation remains inside `POSTG Application PR Gate`.
5. Pull requests are accepted only when the exact head produces `POSTG Application PR Gate` and `Node Test`, with zero unrelated unit workflow runs.

## Publication discipline

- One Git tree
- One commit
- One pull request
- No workflow-generated source commit
- No iterative CI debugging commits

## Current status

`IMPLEMENTED_PENDING_PR_CI`

## Next shortest step after merge

`POSTG-APP-W02-A09A1_BatchBCanonicalKnowledgePointRegistryMaterializationAnd90CandidateReconciliation`
