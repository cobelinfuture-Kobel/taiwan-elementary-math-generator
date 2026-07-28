# P03F W3 Direct Product Vertical Slice011 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P03F_W3DirectProductVerticalSlice011Implementation
QUEUE_POSITION = 11
TARGET_EVIDENCE_LEVEL = E6_D0_COMPLETE
```

## Frozen identity

```text
sliceId = p03e_q011_r6_g4b_u06_4b06_profile_decimal_c1
sourceNodeId = g4b_u06_4b06
knowledgePointId = kp_g4b_u06_one_decimal_times_integer
runtimeProfileId = profile_decimal
intraWavePrerequisiteRank = 6
requiredCapabilities = [cap_decimal_arithmetic, cap_decimal_domain_validator, cap_decimal_number_system]
predecessor = p03e_q010_r6_g4a_u09_4a09_profile_decimal_c1
```

## Pattern authority

```text
operationModelId = op_g4b_u06_one_decimal_times_integer
operationFamilyId = decimal_multiplication
numericPatternSpecId = ps_g4b_u06_one_decimal_times_integer_product_numeric
applicationPatternSpecId = ps_g4b_u06_one_decimal_times_integer_product_application
requestedUnknownRole = product
givenRoles = [decimalFactor, integerFactor]
canonicalExpression = product = decimalFactor * integerFactor
```

## Application authority

```text
bindingCandidateId = w02_bind_ps_g4b_u06_one_decimal_times_integer_product_application
macroContextId = gctx_macro_charity_cooperation
mesoSituationId = gctx_meso_charity_donation
microScenarioId = gctx_micro_donation_package_allocation
atomicEpisodeId = gctx_episode_donation_package_allocation_direct_quantity
surfaceTemplateId = tpl_fusion_charity_donation_direct_01
semanticClosure = 每包標準物資份數 × 物資包數 = 總物資份數
```

No new Global Context family, template, or authority may be added.

## Product path

```text
public selector
→ shared browser planner
→ shared operation-family generator
→ decimal number system
→ decimal domain validator
→ decimal arithmetic MULTIPLY
→ shared worksheet assembler
→ answer key
→ shared HTML renderer
→ Chromium PDF print
```

## Scope boundary

Allowed: one KP, one numeric PatternSpec, one application PatternSpec, eight deterministic witnesses per mode, two HTML files and two PDFs.

Forbidden: other G4B-U06 KPs, Slice012, W4, later-wave work, Global Context expansion, unrelated UI/renderer refactoring, or a second runtime pipeline.

## E6 D0 gate

```text
16 / 16 questions validated
16 / 16 answer-key entries validated
3 / 3 W3 capabilities witnessed
0 duplicate prompts
0 overflow findings
0 semantic-scope findings
numeric PDF pages = 2
application PDF pages = 2
visual review passed
artifact hashes exact
full Node regression passed
required CI passed
PR merged
post-merge closeout completed
```

Before every gate is true:

```text
productAdmissionState = RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE
slice011KnowledgePointAdmitted = false
queuePositionConsumed = 10
```
