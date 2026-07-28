
# P03F W3 Direct Product Vertical Slice 006 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice006Implementation
QUEUE      = 6
SLICE      = p03e_q006_r6_g3a_u08_3a08_profile_fraction_c1
```

## Frozen scope

- source `g3a_u08_3a08`
- KnowledgePoint `kp_g3a_u08_same_denominator_compare`
- numeric PatternSpec `ps_g3a_u08_same_denominator_compare_comparison_numeric`
- application PatternSpec `ps_g3a_u08_same_denominator_compare_comparison_application`
- required W3 capabilities: fraction number system and fraction domain validator
- application authority: W02 atomic context binding for classroom shared resources

## Invariants

1. Both compared fractions use the same positive denominator.
2. The answer is the exact rational relation `<`, `=` or `>`.
3. Fixtures cover fraction-to-fraction comparison and comparison with `1`.
4. Numeric and application outputs are generated separately.
5. No other hidden G3A-U08 KnowledgePoint is admitted.
6. Shared generator, validator, worksheet, answer key and renderer remain the only product path.
7. Slice007 is not started.
