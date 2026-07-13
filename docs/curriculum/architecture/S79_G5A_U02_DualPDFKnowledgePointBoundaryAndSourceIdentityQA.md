# S79 — G5A-U02 Dual-PDF KnowledgePoint Boundary and Source Identity QA

```text
TASK = S79_G5A_U02_DualPDFKnowledgePointBoundaryAndSourceIdentityQA
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ARTIFACT = data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidates.json
REVIEWED_CANDIDATES = 19
CANONICAL_BOUNDARIES = 18
```

## 1. Scope

S79 reviews the 19 S78 candidates for duplicate boundaries, answer-shape differences and source-packet identity.

It does not mutate the S78 extraction registry, create FormalMapping or PatternSpec rows, implement runtime code, expose public selector entries, or allow production use.

## 2. Boundary result

```text
reviewed candidates = 19
accepted as distinct = 18
merged              = 1
split               = 0
rejected            = 0
canonical boundaries = 18
canonical Class C    = 11
canonical Class D    = 7
```

The only merge is:

```text
kp_g5a_u02_efficient_factor_pair_search
→ merge into
kp_g5a_u02_factor_enumeration_by_multiplication_pairs
```

Reason: the source panels reinforce multiplication-pair enumeration but do not establish a separate answer model or independently evidenced KnowledgePoint for search stopping. Avoiding duplicate pairs becomes a method constraint of multiplication-pair enumeration.

## 3. Distinct boundary checks

The following remain distinct:

- factor-definition equivalence versus factor-membership judgement;
- trial-division enumeration versus multiplication-pair enumeration;
- ordered factor-pair structure versus missing-factor reconstruction;
- missing-factor reconstruction versus abstract complete-list inference;
- common-factor concept versus common-factor enumeration;
- maximum equal grouping using GCF versus all possible packaging counts using every common factor;
- possible square side lengths versus possible square areas.

## 4. Canonical skill families

```text
factor
factor_application
factor_reasoning
common_factor_gcf
common_factor_application
number_theory_language
number_theory_reasoning
```

The unit-level title is locked as:

```text
g5a_u02 = 因數與公因數
```

## 5. Source identity resolution

### Packet `g5a_u02_5a02a`

```text
canonical title = 因數
canonical role  = factor_core
source id       = retained
URL anomaly     = recorded_non_blocking
```

The filename, visible title and curriculum role agree. The `/5a02b/` header suffix is retained as a source-site discrepancy and does not change the internal packet id.

### Packet `g5a_u02_5a02a1`

```text
canonical title = 公因數
canonical role  = common_factor_gcf_extension
source id       = retained
identity status = resolved_by_packet_role_lock
```

The visible title, `/5a03b/` header and page content consistently identify common-factor/GCF instruction. The split-packet id remains stable, while its metadata must be corrected to show `公因數` and preserve the visible source URL.

```text
sourceIdentityStatus = resolved_for_candidate_pipeline
sourceIdentityPromotionBlocker = false
operatorDecisionRequired = false
```

Metadata correction remains required before a later public or source-catalog promotion.

## 6. External-media boundary

The embedded short-division video thumbnail does not provide enough in-panel instruction to create a standalone short-division KnowledgePoint. No such candidate is accepted.

## 7. QA artifact

```text
data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidate_qa.json
```

The artifact records all 19 decisions, eight duplicate-boundary checks, the packet-role lock, metadata correction requirements and lifecycle boundaries.

## 8. Gate

```text
19 / 19 candidate rows reviewed
18 canonical boundaries retained
1 duplicate merged
0 rejected
packet A id retained
packet A1 id retained
packet A1 canonical title = 公因數
source identity ambiguity = resolved for candidate pipeline
S78 registry mutation = none
FormalMapping = not created
PatternSpec = not created
generator = not implemented
validator = not implemented
selector = disabled
productionUse = forbidden
```

## 9. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D3_G5A_U02_19_CANDIDATES_WITH_IDENTITY_BLOCKER
GOAL_DISTANCE_AFTER  = D3_G5A_U02_18_CANONICAL_BOUNDARIES_AND_PACKET_ROLES_LOCKED
DISTANCE_REDUCED     = Removed one duplicate boundary and resolved both split-packet roles without re-keying source IDs.
REMAINING_BLOCKERS   = [
  "5a02a1 metadata must display 公因數 and preserve /5a03b/",
  "FormalMapping candidate design not created",
  "PatternSpec and runtime support absent"
]
NEXT_SHORTEST_STEP   = S80_G5A_U02_FormalMappingCandidateDesign
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
