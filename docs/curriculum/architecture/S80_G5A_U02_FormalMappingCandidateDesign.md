# S80 — G5A-U02 FormalMapping Candidate Design

```text
TASK = S80_G5A_U02_FormalMappingCandidateDesign
STATUS = IMPLEMENTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## 1. Scope

S80 converts the 18 S79-approved canonical KnowledgePoint boundaries into candidate PatternGroups and FormalMapping contracts.

```text
S78 manual visual extraction
→ S79 boundary and packet-role QA
→ S80 FormalMapping candidate design
```

This task does not materialize FormalMapping rows or PatternSpecs. It does not implement a generator, validator, selector, worksheet, renderer or production behavior.

## 2. Source identity consumed

The candidate pipeline uses the packet-role decision locked by S79:

| sourceId | canonical title | role | disposition |
|---|---|---|---|
| `g5a_u02_5a02a` | 因數 | `factor_core` | retain |
| `g5a_u02_5a02a1` | 公因數 | `common_factor_gcf_extension` | retain |

The parent unit is `g5a_u02 = 因數與公因數`.

The second packet still requires a metadata correction to display `公因數` and preserve `https://meow911.com/5a03b/` before public catalog promotion. This does not block candidate-level mapping design.

## 3. Design result

```text
canonical KnowledgePoints     = 18
PatternGroup candidates       = 18
FormalMapping candidates      = 22
Class C mapping candidates    = 14
Class D mapping candidates    = 8
answer-model candidates       = 16
```

The single S79-merged candidate, `kp_g5a_u02_efficient_factor_pair_search`, does not receive its own PatternGroup. Its duplicate-avoidance and stopping behavior is preserved as guards on multiplication-pair enumeration.

## 4. Mapping families

### 4.1 Factor concept and enumeration

- factor relation equivalence through multiplication and exact division;
- complete factor enumeration by trial division;
- factor-pair enumeration by multiplication;
- factor-list derivation from complete pairs;
- ordered factor symmetry and constant pair products;
- missing-factor reconstruction;
- divisor candidate selection;
- closed factor/multiple statement judgement.

### 4.2 Factor applications and language

- all equal-partition segment counts;
- range-constrained recipient counts;
- classification of factor, multiple, common-factor and common-multiple wording.

### 4.3 Factor reasoning

- reconstruction of a target and symbolic values from a complete factor list;
- closed statement and parity evaluation after reconstruction;
- remainder transfer when one divisor is a multiple of another.

### 4.4 Common factor and GCF

- common-factor concept identification;
- complete common-factor enumeration;
- greatest common factor.

### 4.5 Common-factor applications

- maximum equal grouping by GCF;
- all feasible equal-packaging counts;
- square side lengths that divide both rectangle dimensions;
- all square-tile areas derived from valid side lengths.

### 4.6 Multi-constraint number-theory reasoning

- a four-digit code constrained by factor, common-factor, common-multiple, multiple and non-repetition predicates;
- candidate items require a unique digit tuple and may not add unstated conditions.

## 5. Formal rule candidates

```text
divides(n,d)
  = d > 0 and n mod d = 0

factorSet(n)
  = all positive divisors of n, ascending and unique

factorPairs(n)
  = all (a,b) where 1 <= a <= b and a*b = n

commonFactorSet(a,b)
  = intersection(factorSet(a), factorSet(b))

greatestCommonFactor(a,b)
  = maximum common factor

remainderTransfer
  if D is a multiple of d and N = qD + r,
  then N mod d = r mod d

rectangle square side lengths
  = commonFactorSet(length,width)

square tile areas
  = each valid side length squared
```

The detailed machine-readable formulas, answer models, source references and validator guards are stored in:

```text
data/curriculum/mapping/g5a_u02_formal_mapping_candidates.json
```

## 6. Candidate boundaries

The design is conservative and candidate-only:

```text
target numbers            = 2..999
paired number inputs      = 2..999
application quantities    = 2..9999
geometry dimensions       = 2..999
digit-code length         = 4
digits                    = 0..9
positive integers only    = true
fractions / decimals      = forbidden
negative answers          = forbidden
generic fallback          = forbidden
```

The embedded short-division video thumbnail remains non-authoritative. It does not create a mapping or enable short-division inference.

## 7. Answer-model candidates

The 16 answer shapes include:

```text
relation classification
integer list
factor-pair list
ordered factor relation
missing-value map
selection set
boolean
integer list with units
problem-type label
structured inference
boolean set
remainder
single integer
length list
area list
digit tuple
```

Different answer shapes remain separate even when they share a KnowledgePoint. For example, factor pairs and a flattened factor list are separate mappings, as are candidate selection and true/false judgement.

## 8. Gate

```text
18 / 18 S79 canonical KnowledgePoints mapped
18 unique PatternGroup candidate IDs
22 unique FormalMapping candidate IDs
22 unique proposed PatternSpec IDs
14 Class C mappings
8 Class D mappings
all mappings source-evidenced
all mappings have formal contracts and guards
merged S79 duplicate has no standalone group
packet roles preserved
FormalMapping materialization = false
PatternSpec creation = false
generator = not implemented
validator = not implemented
selector = disabled
productionUse = forbidden
```

## 9. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D3_G5A_U02_18_CANONICAL_BOUNDARIES_AND_PACKET_ROLES_LOCKED
GOAL_DISTANCE_AFTER  = D2_G5A_U02_18_PATTERN_GROUP_AND_22_FORMAL_MAPPING_CANDIDATES_DESIGNED
DISTANCE_REDUCED     = Converted all canonical factor/common-factor KnowledgePoints into explicit candidate formulas, answer shapes, source references and validator guards.
REMAINING_BLOCKERS   = [
  "FormalMapping candidate QA is pending",
  "5a02a1 public/source metadata still requires correction",
  "PatternSpec contract and runtime support are absent"
]
NEXT_SHORTEST_STEP   = S81_G5A_U02_FormalMappingCandidateQA
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
