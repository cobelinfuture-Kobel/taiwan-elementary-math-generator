# W2 Product Admission Inventory Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02_W2ProductAdmissionInventoryAndGapMatrix
WAVE_ID    = R05-W2
MODE       = INVENTORY_ONLY
```

## Purpose

P02 converts the R05 `SHADOW_FOUNDATION_HARDENING` wave into an executable product-admission inventory. It must distinguish two independent blockers:

```text
shared capability blocker
→ product PatternSpec / source adapter / UI blocker
```

A KnowledgePoint cannot be treated as product-ready merely because its canonical node and prerequisite edges exist. Likewise, product Pattern bindings cannot bypass a shadow shared-capability blocker.

## Required authorities

```text
R02 canonical KnowledgePoints
→ R03 prerequisite graph
→ R04 shared runtime capability matrix
→ R05 delivery-wave assignment
→ P01E nineteen-source product baseline
```

The earlier POSTG `W02` application-program cohort is not the R05-W2 delivery wave and must not determine P02 membership.

## Required inventory row

Every R05-W2 KnowledgePoint must expose:

- canonical identity and source references;
- prerequisite rank and wave lower bound;
- required, effective, production, shadow and contract-only capabilities;
- explicit capability gap state;
- current public source/KP/PatternSpec coverage;
- explicit downstream product gap state;
- ordered next admission actions;
- fail-closed `INVENTORIED_NOT_ADMITTED` status.

## Shared foundation capability plan

P02 must separately inventory every R05-W2 capability-plan entry, including capabilities whose dependents occur in later waves. The plan must preserve dependency order and report both W2 and outside-W2 dependent counts.

## Hard boundaries

```text
shared capability hardening      = forbidden
PatternSpec implementation       = forbidden
public source adapter change     = forbidden
public UI change                 = forbidden
production admission             = forbidden
W3-W8 implementation             = forbidden
existing nineteen-source product = protected
recursive-improvement admin      = forbidden before P10
```

## Acceptance

- exact R05-W2 identity set with no duplicates;
- every row source-traceable;
- every row has at least one shadow capability blocker;
- contract-only capability drift = 0;
- five R05-W2 shadow foundation capabilities accounted;
- capability dependency order materialized;
- current product coverage and downstream gap state explicit;
- direct production admissions = 0;
- full Node regression and milestone-claim integrity pass.

## Closeout transition

```text
before = W1 publicly admitted; W2 remains an undifferentiated shadow wave

after  = W2 has an exact capability-first product implementation queue

next   = the shortest bounded W2 shared-foundation hardening task selected by the exact inventory
```
