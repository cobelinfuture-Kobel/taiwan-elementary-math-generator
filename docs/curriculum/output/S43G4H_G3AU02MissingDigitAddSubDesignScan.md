# S43G4H G3A-U02 Missing Digit Add/Sub DesignScan

## Scope

Add two supplementary calculation KnowledgePoints under G3A-U02:

- `kp_g3a_u02_add_missing_digit_operand`
- `kp_g3a_u02_sub_missing_digit_operand`

## Locked Shape

```text
A + B = C
A - B = C
```

Rules:

1. Generate a valid complete expression first.
2. Replace exactly one digit in operand `A` or `B` with `□`.
3. Do not use vertical layout.
4. Do not hide any digit in result `C`.
5. Student answer is exactly one digit `0` to `9`.
6. Validator must verify both:
   - submitted digit equals the hidden digit
   - substituting the digit restores the original equation

## Non-scope

- vertical-column rendering
- missing digit in result `C`
- multiple missing digits
- `四位數減法中間缺位`
- `連續退位中間有0的處理`

## PatternSpec Candidates

```text
ps_g3a_u02_add_missing_digit_operand
ps_g3a_u02_sub_missing_digit_operand
```

## Selector Target

G3A-U02 visible KP count moves from 4 to 6 after implementation and selector promotion.
Batch A global visible KP count moves from 10 to 12.

## Next

```text
S43G4I_G3AU02MissingDigitPatternSpecContract
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_CORE_AND_RENDERER_QUALITY_PATCHED_AND_CI_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U02_MISSING_DIGIT_DESIGN_SCOPE_LOCKED
DISTANCE_REDUCED     = missing digit add/sub scope locked without expanding into vertical layout or zero-borrow special topics
REMAINING_BLOCKERS   = ["PatternSpec contract not yet added", "generator not yet implemented", "validator not yet implemented", "selector not yet promoted"]
NEXT_SHORTEST_STEP   = S43G4I_G3AU02MissingDigitPatternSpecContract
```
