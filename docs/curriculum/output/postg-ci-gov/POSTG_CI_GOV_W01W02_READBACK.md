# POSTG-CI-GOV-W01W02 Readback

## Scope

This bounded milestone consolidates repository pull-request validation for POSTG application work and the exact legacy unit/browser workflows observed on PR #347. It does not modify curriculum, generator, validator, renderer, worksheet, or public UI behavior.

## Result

- One `POSTG Application PR Gate`.
- One repository-wide `Node Test` gate.
- Fifteen completed POSTG milestone workflows are reusable/manual only.
- Nineteen observed legacy unit/browser workflows are reusable/manual only.
- Standalone milestone-claim validation runs after merge or by manual dispatch.
- Required PR workflows use `cancel-in-progress: true`.
- Publication uses one Git tree, one commit, and one pull request.

## Exact-head acceptance

The replacement PR is accepted only when its head SHA produces exactly:

1. `POSTG Application PR Gate`
2. `Node Test`

Any unrelated unit, browser, HTML/PDF, readback, Golden controller, or historical milestone workflow run is a blocking failure.

## Next shortest step

After merge and fresh-main readback, resume `POSTG-APP-W02-A09A_CanonicalCurriculumAuthorityReconciliationAndLegacyApplicationRouteFreeze`.
