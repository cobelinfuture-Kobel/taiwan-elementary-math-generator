# S43G3 G3A U03 Phase1 Selection Scan

STATUS = PASS_SCAN_LOCKED

sourceId = g3a_u03_3a03
unitCode = 3A-U03
unitTitle = 乘法

## Runtime-supported PatternSpecs

- ps_g3a_u03_2digit_by_1digit_carry
- ps_g3a_u03_10_multiple_by_1digit
- ps_g3a_u03_3digit_by_1digit
- ps_g3a_u03_consecutive_multiplication_two_step

## Selection decision

All four candidates use the existing expression generator and validator path.
No new generator contract is required for Phase1 selector exposure.

## Next

S43G3A_G3A_U03_SelectorOverlayPromotion
