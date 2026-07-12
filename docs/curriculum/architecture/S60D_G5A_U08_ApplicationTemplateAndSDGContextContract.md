# S60D — G5A-U08 Application Template and SDG Context Contract

```text
TASK = S60D_G5A_U08_ApplicationTemplateAndSDGContextContract
STATUS = IMPLEMENTED_PENDING_CI
```

## Result

Ten source-backed SemanticTemplateFamily contracts now cover all thirteen application panels in the supplied PDF.

Each family defines:

- source evidence ownership;
- KnowledgePoint ownership;
- N / N+1 depth;
- allowlisted semantic delta;
- RoleBinding;
- UnitFlow;
- OperationSignature;
- required and forbidden facts;
- Traditional Chinese wording constraints;
- answer unit;
- daily-life and SDG ContextVariants.

## SDG policy

```text
allowed = SDG 2, 4, 6, 7, 11, 12, 13, 15
role = semantic context taxonomy
source status = system expansion
practice data = fictionalized_for_practice
real statistics = sourceRef required
label-only SDG substitution = forbidden
```

The SDG action must affect the quantity relation. Adding words such as「環保」without changing the semantic structure is rejected.

## Coverage

```text
template families = 10
application source panels = 13 / 13
daily-life variants = 10
SDG variants = 12
approved SDG goals reached = 8 / 8
fake real statistics = 0
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_NPLUS1_MATRIX_FROZEN_APPLICATION_SEMANTICS_UNDEFINED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_10_TEMPLATE_FAMILIES_AND_SDG_CONTEXT_CONTRACT_FROZEN
DISTANCE_REDUCED     = Source-backed application semantics and SDG context boundaries now have explicit roles, units and feasibility guards.
REMAINING_BLOCKERS   = [
  "FormalMapping, answer models and validator error taxonomy are not frozen",
  "PatternSpecs are not materialized",
  "Generators, UI and print remain pending"
]
NEXT_SHORTEST_STEP = S60E_G5A_U08_FormalMappingAnswerModelValidatorContract
```
