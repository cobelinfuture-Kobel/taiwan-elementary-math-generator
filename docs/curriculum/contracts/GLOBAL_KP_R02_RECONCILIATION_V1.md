# R02 Global KnowledgePoint Candidate Reconciliation V1

## Scope

R02 reconciles the full 79-source-node curriculum inventory into one shadow Global KnowledgePoint candidate authority. It does not replace the merged 15-unit D0 production authority.

## Source evidence classes

| Evidence class | Source nodes | Policy |
|---|---:|---|
| Existing D0 production authority | 16 | Preserve existing KnowledgePoint IDs and runtime lineage |
| Existing W02 page-evidenced candidates | 13 | Project into the R01 candidate contract |
| Full-page-reviewed source PDFs | 50 | Materialize reviewed candidates; do not commit raw PDFs |

## Required invariants

```text
source view count = 79
reviewed PDF count = 50
reviewed page count = 99
reviewed candidate projections = 247
reviewed unique KP IDs = 242
semantic identity conflicts = 0
production cutover = false
```

Every candidate must pass the R01 Global KnowledgePoint candidate contract.

## Reconciliation precedence

```text
RECONCILED_EXISTING_KP > CANDIDATE_ONLY
```

An existing D0 identity cannot be renamed or replaced by a new candidate.

Multiple source references may be merged only when canonical name, capability statement, indispensable concepts, reasoning invariant and validator capability identity agree.

## Explicit semantic identity reconciliation

### Byte-identical improper/mixed fraction source evidence

`g4a_u06_4a06` and `g4b_u03_4b03` project into the same six canonical KnowledgePoints.

### Repeated speed source evidence

`g6a_u08_6a08` and `g6b_u02_6b02` project into the same five speed KnowledgePoints.

## Deferred work

R02 does not create:

- prerequisite edges;
- runtime capability mappings;
- delivery-wave reassignment;
- compatibility adapters;
- production consumer imports.

These are R03 through R07 responsibilities.
