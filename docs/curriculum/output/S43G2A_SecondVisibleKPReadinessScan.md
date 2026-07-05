S43G2A SecondVisibleKPReadinessScan

TASK_STATUS BLOCKED_NOT_READY
CANDIDATE kp_g3a_u02_sub_multi_borrow
SOURCE g3a_u02_3a02
PATTERN_GROUP pg_g3a_u02_sub_multi_borrow_seed
PATTERN_SPEC ps_g3a_u02_4digit_sub_multi_borrow

READY_TO_OPEN_VISIBLE false

PASS_CONDITIONS_FOUND
- KnowledgePoint exists
- PatternGroup exists
- PatternSpec exists in runtime source-pattern-index
- Source-level worksheet can use the PatternSpec

BLOCKERS
- KnowledgePoint htmlSelectableStatus is hidden
- KnowledgePoint holdReason is qa_pending
- PatternGroup visibilityStatus is hidden
- PatternGroup holdReason is qa_pending
- MappingStatus is seed_mapped not qa_verified_mapped
- ConstraintStatus is seed_warning
- ValidatorRequirement is constraint_hook_required
- HTML exposure policy is internal_only
- QA status is smoke_test_required

DECISION
Do not open second visible KP in S43G2A.

NEXT_SHORTEST_STEP S43G2A1_SubtractionBorrowPolicyDesignScan
GOAL_DISTANCE_AFTER D1_S43G2A_SECOND_VISIBLE_KP_BLOCKED_BY_BORROW_POLICY_QA
