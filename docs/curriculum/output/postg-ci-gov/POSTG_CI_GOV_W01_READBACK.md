# POSTG-CI-GOV-W01 Readback

## Scope

This milestone consolidates POSTG application pull-request validation. It does not modify curriculum, generator, validator, renderer, or worksheet behavior.

## Result

- One POSTG application focused PR gate.
- One repository-wide Node Test gate.
- Historical POSTG milestone workflows are reusable/manual only.
- Standalone milestone-claim validation runs after merge or by manual dispatch, not as a third PR gate.
- All required PR workflows use `cancel-in-progress: true`.
- Publication is required to use one Git tree, one commit, and one pull request.

## Remaining global blocker

Legacy unit-specific HTML/PDF/browser workflows outside POSTG application scope may still have broad PR triggers. They are intentionally deferred to `POSTG-CI-GOV-W02_GlobalLegacyUnitWorkflowPullRequestFanoutIsolation` so this milestone remains bounded.
