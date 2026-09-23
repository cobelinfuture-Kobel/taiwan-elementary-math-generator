# S60G — G5A-U08 Numeric Generator and Blocking Validator

```text
TASK = S60G_G5A_U08_NumericGeneratorAndBlockingValidator
STATUS = IMPLEMENTED_PENDING_CI
```

## Scope lock

S60G implements the non-context runtime only:

```text
numeric PatternSpecs = 16
non-context reasoning PatternSpecs = 3
total S60G PatternSpecs = 19
```

The two contextual reasoning PatternSpecs for average inverse and average update remain assigned to S60H because they require SemanticTemplateFamily generation and semantic validation.

Application PatternSpecs, N+1, SDG contexts, public routing and UI activation remain forbidden in S60G.

## Runtime

The hidden deterministic generator supports:

- exact question count from 1 to 1000;
- deterministic seed replay;
- balanced allocation across selected PatternSpecs;
- grouped and deterministic shuffled ordering;
- no generic fallback;
- zero public/canonical routing.

Covered mathematical structures:

- multiplication/division precedence before addition/subtraction;
- signed-term addition/subtraction regrouping;
- consecutive subtraction;
- factor cancellation and continuous division;
- distributive expansion and common-factor extraction;
- near-round addition, subtraction and multiplication compensation;
- unique missing-operator inference;
- valid equivalence and duplicated-common-factor error judgement.

## Blocking validator

The validator exports the complete 36-code S60E registry and implements the S60G-relevant identity, depth, arithmetic, transformation and structured-reasoning gates.

Blocking failures return:

```text
output = null
acceptedQuestions = []
```

Warnings remain nonblocking and Traditional Chinese public-message policy remains reserved for later UI integration.

## Permanent QA

- 19/19 single PatternSpec positive validation;
- deterministic replay;
- 1000-question exact-count balanced stress;
- grouped/shuffled allocation equivalence;
- legal noninteger intermediate factor regrouping;
- continuous-division direction guard;
- unique operator-sequence guard;
- equality/error-type guard;
- identity, mode, depth, answer, subtraction, division and fallback mutations;
- batch zero-output enforcement;
- application/contextual-reasoning scope rejection.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_30_HIDDEN_PATTERNSPECS_MODE_CONSISTENT
GOAL_DISTANCE_AFTER  = D1_G5A_U08_NUMERIC_AND_NONCONTEXT_REASONING_RUNTIME_PENDING_CI
DISTANCE_REDUCED     = Implemented deterministic generation and blocking validation for all 19 approved non-context PatternSpecs.
REMAINING_BLOCKERS   = [
  "S60G PR CI and merge",
  "S60H N+1 application and contextual reasoning runtime",
  "Promotion, UI, worksheet and print"
]
NEXT_SHORTEST_STEP = S60H_G5A_U08_NPlus1ApplicationGeneratorAndSemanticValidator
```
