# POSTG-APP-W02-A02 Readback

## Scope

`POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization`

This milestone consumes the 61 hidden W02 application PatternSpecs produced by A01D. It does not mutate KnowledgePoints, Canonical Operation Models, or PatternSpecs, and it does not enable generator, renderer, public UI, or production admission.

## Materialized capability

```text
61 application PatternSpecs
→ 61 deterministic Atomic Context Bindings
→ 61 non-production single-application candidates
```

## Required gates

```text
APPLICATION_PATTERN_SPEC_COUNT = 61
ATOMIC_CONTEXT_BINDING_COUNT = 61
SINGLE_APPLICATION_CANDIDATE_COUNT = 61
MACRO_CONTEXT_DOMAIN_COUNT = 16
DUPLICATE_CONTENT_PROJECTION_PARITY = PASS
PRODUCTION_ADMITTED_CANDIDATE_COUNT = 0
```

Every candidate retains the lineage:

```text
W02 A01D hidden PatternSpec
→ Canonical Operation Model
→ M01 Macro / Meso / Micro / Atomic Episode
→ Surface Template
→ role and target binding candidate
```

The duplicate PDF content group `pdf_5ba57aff6a97` (`g4a_u06_4a06` and `g4b_u03_4b03`) must resolve normalized application PatternSpecs to identical context projections.

## Boundary

- Numeric values are not instantiated.
- Unique-answer validation remains pending.
- N+1 proof and misconception models are not authored.
- PBL graphs are not authored.
- Runtime generator, renderer, and public selection remain unchanged.
- Production admission remains false.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_HIDDEN_APPLICATION_PATTERNSPECS_MAIN_VERIFIED
GOAL_DISTANCE_AFTER  = D2_ATOMIC_CONTEXT_AND_SINGLE_APPLICATION_CANDIDATES_MAIN_VERIFIED
DISTANCE_REDUCED     = PatternSpec → Atomic Context Binding → Single-Application Candidate
REMAINING_BLOCKERS   = [N_PLUS_ONE_PROOF_PENDING, PBL_CANDIDATES_PENDING, NUMERIC_FIXTURES_PENDING, UNIQUE_ANSWER_VALIDATION_PENDING, PRODUCTION_RUNTIME_PENDING]
NEXT_SHORTEST_STEP   = POSTG-APP-W02-A03_NPlusOneProofMisconceptionAndPBLCandidateContract
```
