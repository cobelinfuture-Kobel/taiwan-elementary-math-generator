# AGENTS.md

## Project Goal

This public repository is the stable/public release surface for the Taiwan Elementary Math Generator project. The current primary goal is to provide a production-safe Taiwan elementary mathematics worksheet generation system that progresses from curriculum sources to KnowledgePoint nodes, Tag Registry, FormalMapping, PatternSpec, Generator, Validator, Worksheet output, Web UI, and stable public release.

All long-running tasks must reduce the distance to that goal. Do not expand task scope unless the new work directly advances the worksheet generation or public release path.

## Shared Policy With Dev Repository

This public repository shares the same core execution policy as the private dev repository:

```text
GitHub Actions CI readback is the authoritative verification source.
Local terminal verification is not the default closeout path.
Every long task must reduce goal distance or remove a blocker.
Scope expansion is forbidden unless the current task explicitly requires it.
Auto-progress is required unless a valid STOP_REASON is triggered.
```

Repo-specific differences:

```text
PRIVATE_DEV_REPO = development, experiments, Batch expansion, implementation work
PUBLIC_STABLE_REPO = production-safe release, public site, deployment, stable CI
```

Do not use public stable as an experimental scratchpad.

## Authoritative Verification Policy

### CI Readback Gate Is Required

GitHub Actions CI readback is the authoritative verification source for long-task closeout.

Do not ask the operator to run local terminal commands as the standard closeout path:

```text
FORBIDDEN_AS_DEFAULT:
- git pull origin main
- npm test
- git status
```

The default closeout path is:

```text
commit/push or update through GitHub
→ run GitHub Actions CI readback
→ inspect workflow result
→ record actual tests/pass/fail/working-tree result
→ close the task only if CI readback passes
```

Local terminal commands may be requested only when one of these exceptions is true:

```text
LOCAL_EXCEPTION_ALLOWED:
- GitHub Actions is unavailable.
- The task explicitly concerns unpushed local-only files.
- The operator explicitly asks for local verification.
- A CI failure must be reproduced locally after CI readback already failed.
```

If no exception applies, do not request local `git pull`, local `npm test`, or local `git status`.

### Primary Public Repo Workflows

Use this readback workflow for task closeout:

```text
.github/workflows/ci-readback.yml
Workflow name: Math CI Readback
```

Use this deployment workflow for public site release validation:

```text
.github/workflows/pages.yml
Workflow name: Deploy GitHub Pages
```

Required CI readback fields:

```text
workflow status = completed
workflow conclusion = success
npm test exit code = 0
tests = actual parsed test count
pass = actual parsed pass count
fail = 0
pass = tests
working tree = clean
run URL = recorded
```

If any field is missing, unparsed, failed, or ambiguous, the closeout must not be marked PASS.

### Public Release Gate

For any task that changes production-visible site behavior, public release is valid only when both are true:

```text
1. Math CI Readback = PASS_CI_SYNCED_AND_CLEAN
2. Deploy GitHub Pages = success
```

If the deployment workflow fails, do not mark the public release task PASS even if the readback workflow passed.

### Status Labels

Use the current task's real status label. Do not hardcode an unrelated status name.

For public repo readback, use:

```text
<CURRENT_TASK_STATUS> = PASS_CI_SYNCED_AND_CLEAN
VERIFICATION_SOURCE = GitHub Actions CI Readback
PUBLIC_RELEASE_GATE = PASS / NOT_REQUIRED / FAIL
```

If CI fails, do not proceed to the next long task. Open or recommend the next shortest FullFix task instead.

## Long Task Execution Protocol

### Scope Lock

Every task must declare exactly one current major task and one current subtask.

```text
CURRENT_MAJOR_TASK =
CURRENT_SUBTASK =
TASK_STATUS = DESIGNSCAN / IMPLEMENTATION / QA / CLOSEOUT
OUTPUT = one explicit deliverable
```

Do not start future layers unless the current task explicitly requires them:

```text
NO_SCOPE_EXPANSION:
- no Batch B/C/D/E work during Batch A task
- no UI work during schema-only task
- no generator work during mapping-only task
- no validator work during PatternSpec-only task
- no productionUse promotion before worksheet QA gate
- no public release promotion before CI and deployment gates pass
```

### Required Closeout

Every completed task must include:

```text
1. What distance was reduced?
2. Which system node advanced?
3. Which blocker was removed?
4. Whether any new blocker was created?
5. What is the next shortest effective step?
```

The closeout must also include:

```text
GOAL_DISTANCE_BEFORE = D?
GOAL_DISTANCE_AFTER  = D?
DISTANCE_REDUCED     = ?
REMAINING_BLOCKERS   = [...]
NEXT_SHORTEST_STEP   = ...
```

### Distance Scale

```text
D5 = very far: only direction exists; no stable data structure.
D4 = far: sources exist but are not tagged/node-structured.
D3 = medium: KnowledgePoint / Tag / Mapping candidates exist.
D2 = near: FormalMapping / PatternSpec / Validator contract exists.
D1 = very near: generator / validator / renderer can consume the artifacts.
D0 = reached: stable question generation, answer validation, worksheet output, and public release work.
```

### Distance Vector

When useful, report the goal distance by system layer:

```text
Source
KnowledgePoint
TagRegistry
FormalMapping
PatternSpec
Generator
Validator
Worksheet
WebUI
Production
PublicRelease
```

Only claim movement for layers actually changed by the task.

## Auto-Progress Control

This project uses a resumable long-task mode and defaults to automatic task progression unless a valid stop condition is triggered.

A completed milestone is a record point, not a natural stop point. The assistant must not stop merely because a milestone was closed, CI passed, a PR was merged, deployment passed, or a readback was produced.

Rules:

```text
1. PASS_CI_SYNCED_AND_MERGED is not a stop point.
2. PASS_CI_SYNCED_AND_CLEAN is not a stop point.
3. PR merged is not a stop point.
4. public deployment success is not a stop point.
5. closeout completed is not a stop point.
6. readback completed is not a stop point.
7. NEXT_SHORT_STEP is not a request for operator approval; it is the next immediate execution entry.
8. After every milestone, produce a short readback, update status, then continue into NEXT_SHORT_STEP when STOP_REASON = NONE.
9. If there is no STOP_REASON, continue execution in the same run or next available tool step.
```

### Allowed Stop Reasons

The assistant may stop only when one of these conditions is true:

```text
STOP_ALLOWED_ONLY_IF:
- CI failure
- GitHub tool error / tool safety blocker
- PR merge blocked
- deployment failure for production-visible changes
- next step is outside approved scope
- next step would modify files explicitly forbidden by the current milestone
- next step requires operator selection of source_ref / evidence
- transition from planning-only to implementation requires separate approval under an existing policy
```

If stopping, the response must include:

```text
STOP_REASON = <non-NONE reason>
BLOCKER_TYPE = <CI_FAILURE | TOOL_SAFETY | MERGE_BLOCKED | DEPLOYMENT_FAILURE | SCOPE_BLOCKED | FILE_SCOPE_BLOCKED | SOURCE_SELECTION_REQUIRED | APPROVAL_REQUIRED>
LAST_COMPLETED_STATUS = <last completed task/status>
REQUIRED_OPERATOR_ACTION = <specific operator action>
NEXT_RESUME_TASK = <exact task to resume>
```

If not stopping, the response must include:

```text
AUTO_CONTINUE_DECISION = CONTINUE
STOP_REASON = NONE
ACTION = Immediately start NEXT_SHORT_STEP
```

### Anti Semi-Auto Rule

Do not treat milestone closeout, PR merge, CI success, deployment success, status readback, or NEXT_SHORT_STEP output as a natural stopping point.

Unless a valid STOP_REASON is present, continue to the next milestone. Do not ask for confirmation when the next step is already inside approved scope and does not require new source/evidence selection.

## Anti-Scope-Creep Gate

Before doing any new task, verify:

```text
1. Does this directly advance the Taiwan elementary math worksheet generation or public release system?
2. Is it aligned with the current source data and registry path?
3. Can it update goal distance or remove a blocker?
4. Is it the next shortest effective step?
```

If the answer is no, stop and return to the current shortest path.

## CI Closeout Template

Use this template for task closeout after CI readback:

```text
CI_READBACK = PASS
VERIFICATION_SOURCE = GitHub Actions
WORKFLOW = Math CI Readback
RUN_URL = <GitHub Actions run URL>

npm test exit code = 0
tests = <actual>
pass = <actual>
fail = 0
working tree = clean

<CURRENT_TASK_STATUS> = PASS_CI_SYNCED_AND_CLEAN
PUBLIC_RELEASE_GATE = PASS / NOT_REQUIRED

NEXT_SHORT_STEP = <one exact next task>
AUTO_CONTINUE_DECISION = CONTINUE
STOP_REASON = NONE
ACTION = Immediately start NEXT_SHORT_STEP
```

If the workflow has not been run, say so explicitly:

```text
CI_READBACK = NOT_RUN
STATUS = NOT_FINAL
NEXT_SHORTEST_STEP = Run GitHub Actions CI readback workflow.
STOP_REASON = CI_READBACK_NOT_RUN
BLOCKER_TYPE = CI_FAILURE
REQUIRED_OPERATOR_ACTION = Run GitHub Actions CI readback workflow.
```
