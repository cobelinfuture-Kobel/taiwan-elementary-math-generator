# GLOBAL_GITHUB_CI_HANDSHAKE_SOP_V1

## Purpose

This repository uses a low-frequency terminal-barrier polling policy for GitHub Actions readback. The goal is to prevent chat/tool execution windows from being consumed by repeated short-interval polling while CI is still running.

## Core CI handshake state machine

```text
LOCAL_PREPARATION
→ READY_FOR_SINGLE_PUSH
→ CI_RUNNING
→ CI_TERMINAL_BARRIER
→ READY_TO_MERGE | REMEDIATION_REQUIRED
→ CONSOLIDATED_FIX (if required)
→ SINGLE_REPUSH
→ MERGED
→ POST_MERGE_READBACK
→ CLOSED
```

## LOW_FREQUENCY_TERMINAL_BARRIER_POLLING

```text
POLICY_ID = LOW_FREQUENCY_TERMINAL_BARRIER_POLLING
STATUS    = APPROVED
```

Rules:

1. After a push or workflow dispatch, perform one initial readback to confirm the expected head SHA / run ID / relevant workflows started normally.
2. Do not perform repeated 20–25 second polling loops while workflows remain `queued`, `pending`, or `in_progress`.
3. During the running phase, prefer a materially longer interval before the next readback. Operational target: roughly 60–120 seconds when an actual wait mechanism is available.
4. If the available tool environment has no true deferred-wait/sleep primitive, do not emulate waiting with many short polling calls. Record `CI_RUNNING` and preserve the execution window for the terminal readback.
5. Near expected completion, query the aggregate workflow/run state first. Query individual job/step detail only when needed to resolve terminal status or diagnose a failure.
6. The CI wave reaches `CI_TERMINAL_BARRIER` only after all relevant checks are terminal: `success`, `failure`, `cancelled`, `skipped`, or `neutral`.
7. Do not remediate immediately after the first failure. Build one complete `CI_FAILURE_INVENTORY` for the wave, then perform one consolidated remediation commit/push.
8. A remediation push starts a new CI wave and the same low-frequency terminal-barrier policy applies again.

## Failure inventory categories

```text
PRODUCTION_FAILURE
TEST_EXPECTATION_FAILURE
STALE_READBACK
GENERATED_ARTIFACT_DRIFT
WORKFLOW_CONFIGURATION_FAILURE
UNRELATED_FANOUT
INFRASTRUCTURE_FLAKE
```

## PR workflow constraints

PR workflows are verification-only and SHOULD remain read-only. Diagnostics should be uploaded as artifacts rather than committed back to the PR branch. Full-repository regression should have a single authority where practical, and affected-scope workflows should avoid duplicate full-regression execution.

## Closeout/readback rule

```text
CI_RUNNING
→ do not churn tool calls

CI_TERMINAL_BARRIER
→ collect all relevant terminal results once

failure
→ one complete failure inventory
→ one consolidated remediation wave

success
→ merge when required gates are satisfied
```

This policy applies to P03F/W3 direct-product slices and subsequent Math Generator milestones unless an explicit task contract requires a stricter polling cadence.