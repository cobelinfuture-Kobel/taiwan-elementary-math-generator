# P03E W3 Direct Product Vertical Slice Queue Freeze Contract

## 1. Scope

`P03E_W3DirectProductVerticalSliceQueueFreeze` freezes the implementation order for the direct R05-W3 new-product cohort after:

```text
P03C W3 capability closeout
→ P03D protected D0 compatibility revalidation
→ P03E direct-product vertical-slice queue freeze
```

P03E is a queue-authority milestone. It does not implement or admit a product.

## 2. Exact cohort boundary

Included:

```text
assignedDeliveryWaveId = R05-W3
directW3CohortMember   = true
capabilityUnblocked     = true
protectedExistingD0    = false
productProductionAdmitted = false
productAdmissionState  = PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED
```

Excluded:

```text
4 protected existing-D0 rows closed by P03D
33 later-wave W3-dependent rows owned by their assigned waves
all already admitted products
```

The expected direct queue cohort is 82 KnowledgePoints. The remaining 115 new-product rows stay unadmitted.

## 3. Slice construction

A slice may not mix:

- primary source nodes;
- intra-wave prerequisite ranks;
- primary runtime profiles.

A slice may contain at most eight KnowledgePoints. KnowledgePoints and slices are sorted deterministically by prerequisite rank, source identity, runtime profile and canonical KnowledgePoint ID.

The primary source node is the lexicographically first canonical source-node ID. All supporting source-node identities remain attached to the slice.

## 4. Serial execution rule

The queue is strictly serial:

```text
slice 001 D0 closeout
→ slice 002 may start
→ slice 002 D0 closeout
→ slice 003 may start
→ ...
```

One implementation milestone may consume at most one queue slice. PR merge, CI pass or partial product evidence does not allow the next slice to start unless the current slice has reached its declared D0 closeout.

Queue order may not be silently changed. Any cohort, source, dependency or ordering change requires an explicit reconciliation task and regenerated registry.

## 5. Per-slice D0 contract

Each implementation slice must close the complete path:

```text
Source evidence
→ KnowledgePoint identity
→ Tag Registry binding
→ FormalMapping
→ PatternSpec
→ Shared generator binding
→ Deterministic validator binding
→ Public source adapter
→ Public UI selection
→ Worksheet and answer key
→ Production HTML
→ Chromium PDF and print
→ Product admission claim
```

Target evidence level:

```text
E6_D0_COMPLETE
```

Partial slice admission is prohibited. Admission remains fail closed until every required product node passes.

## 6. P03E prohibited changes

P03E must not:

- author FormalMapping or PatternSpec content;
- modify generator or validator behavior;
- add a public adapter or UI option;
- change worksheet or renderer behavior;
- admit a new product;
- modify P03, P03C or P03D authorities;
- move later-wave rows into R05-W3;
- change visible output.

## 7. Acceptance

P03E passes only when:

- all 82 direct R05-W3 KnowledgePoints are allocated exactly once;
- all slices obey source, rank, profile and size atomicity;
- the serial predecessor chain is complete;
- protected and later-wave rows are absent;
- the frozen JSON registry exactly matches the derived queue;
- all 115 new products remain unadmitted;
- the full Node regression and milestone-claim governance pass.

## 8. Next boundary

After P03E closes, the only executable next task is the first frozen slice:

```text
P03F_W3DirectProductVerticalSlice001Implementation
```

Starting that implementation requires separate operator approval.
