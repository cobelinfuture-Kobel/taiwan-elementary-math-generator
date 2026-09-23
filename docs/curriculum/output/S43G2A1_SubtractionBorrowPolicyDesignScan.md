S43G2A1 SubtractionBorrowPolicyDesignScan

TASK_STATUS PASS_DESIGN_SCAN

CURRENT_STATE
- Addition carryPolicy exists and is enforced by generator retry plus validator hook.
- Subtraction PatternSpec exists but has no borrowPolicy.
- Current policy validator only supports carryPolicy.kind addition_carry.

DESIGN_DECISION
Add subtraction_borrow policy under the existing policy field.

BORROW_POLICY_SHAPE
kind subtraction_borrow
mode at_least_two_borrows
base 10
operandPositions [1,2]
checkedColumns [ones,tens,hundreds]
minBorrowCount 2
validatorRequired true

GENERATOR_STRATEGY
Reuse existing policy retry path in batch-a-browser-generator.
Attach the policy to ps_g3a_u02_4digit_sub_multi_borrow.
The generator will sample subtraction expressions and retry until validator accepts borrow count.

VALIDATOR_STRATEGY
Extend carry-policy.js to count subtraction borrows column by column.
Require exactly one SUBTRACT operator and two integer operands.
Reject if detected borrow count in checked columns is below minBorrowCount.

NOT_IN_SCOPE
- selector visibility promotion
- mappingStatus promotion
- browser selector regeneration
- productionUse release

NEXT S43G2A2_SubtractionBorrowPolicyImplementation
GOAL_DISTANCE_AFTER D1_S43G2A1_BORROW_POLICY_DESIGN_READY
