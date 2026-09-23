# Global Context Hierarchy Ontology V1

```text
CONTRACT_ID = GLOBAL_CONTEXT_HIERARCHY_ONTOLOGY_V1
TASK_ID = GCTX-HIER-A00_AuthorityIndexAndExtractionContract
STATUS = STRUCTURE_DEFINED_CONTENT_NOT_POPULATED
RUNTIME_CHANGE = false
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Canonical gap statement

The current global-context architecture is not yet fully defined as a hierarchy of:

```text
大情境
→ 中情境
→ 小情境
→ 微觀情境
```

The existing flat `contextFamilies` registry must not be interpreted as the complete global-context universe, and its entry count must not be used as the total number of student-visible situations available to the generator.

This contract records that gap in the authoritative global-context location and defines how future tools, AI agents, generators, validators, and audits must retrieve and interpret global-context data.

## 2. Canonical extraction entry point

All global-context discovery must start from:

```text
data/curriculum/context/registry/global-context-authority-index.json
```

Consumers must not begin by opening one unit-specific or legacy context-family registry and assuming that file represents the complete ontology.

Resolution order:

```text
Global Context Authority Index
→ Global Context Hierarchy Ontology
→ Hierarchy Node Schema
→ Explicit hierarchy nodes
→ Legacy seed registries when referenced
→ Application Context Bindings
```

## 3. Hierarchy levels

### L1 — `MACRO_CONTEXT_DOMAIN`／大情境

A broad life domain that organizes situations but is not itself a directly generated problem.

Examples:

```text
學校生活
家庭生活
購物與預算
交通與旅行
環境保護
社區服務
```

L1 repetition is expected and is not a visible-scenario duplicate by itself.

### L2 — `MESO_SITUATION_FAMILY`／中情境

A recurring activity family, institutional purpose, or real-world mechanism inside one macro domain.

Examples under school life:

```text
班級活動準備
校外教學
運動會
成果發表
圖書館管理
午餐分配
```

### L3 — `MICRO_EVENT_SCENARIO`／小情境

A concrete event with a real-world goal, actors, resources, event flow, and constraints.

Examples under field-trip transport:

```text
安排學生搭車
安排師生分車
器材另外裝車
比較兩種車型
臨時增加參加人數後重新安排
```

### L4 — `ATOMIC_TASK_EPISODE`／微觀情境

The smallest reusable contextual task that can be bound to a KnowledgePoint and canonical operation model.

Examples under student transport:

```text
依總人數與每車容量決定最少車輛
判斷現有車輛是否足夠
求安排後的剩餘座位
增加人數後判斷是否加車
比較容量與費用後選擇方案
```

L4 is the primary context-selection unit for application-question generation.

## 4. Non-ontology realization layers

### L5 — `SURFACE_REALIZATION`／文字表達

A wording template or paraphrase for one atomic task episode.

Different wording does not create a new context node.

```text
至少需要幾輛車？
最少要準備幾輛車？
要準備多少輛車，才不會有人沒有座位？
```

These may all realize the same L4 episode.

### Runtime numeric instance

Names, numbers, colors, and noun substitutions are generated instances. They do not create new ontology nodes or unique semantic scenarios.

## 5. Required hierarchy chain

Every production-eligible context must eventually resolve through one complete chain:

```text
macroContextId
→ mesoSituationId
→ microScenarioId
→ atomicEpisodeId
→ surfaceTemplateId
→ numericInstance
```

Rules:

- one L2 node has exactly one L1 parent;
- one L3 node has exactly one L2 parent;
- one L4 node has exactly one L3 parent;
- L5 templates belong to an L4 episode and are not counted as context nodes;
- no missing or cyclic parent reference is allowed;
- no hierarchy level may be inferred solely from a legacy filename or label.

## 6. Mathematical binding boundary

Context hierarchy does not own mathematics.

Required binding order:

```text
KnowledgePoint
→ Canonical Operation Model
→ Application Capability
→ requiredContextAffordances
→ eligible Atomic Task Episode
→ admitted Context Binding
→ Surface Realization
→ Numeric Instance
```

The hierarchy may describe event goals, actors, resources, event flow, constraints, and decision meaning. It may not change operation signatures, quantity roles, unit flow, canonical answers, or validator invariants.

## 7. Atomic-task semantic identity

An atomic task episode must be distinguished by semantic structure, not by wording or nouns.

Minimum semantic identity components:

```text
macroContextId
mesoSituationId
microScenarioId
atomicEpisodeId
eventGoal
actorRelationship
resourceRoleSet
constraintModel
targetRole
interpretiveAct
decisionModel
```

The following are not sufficient to create a new episode:

```text
changed person name
changed number
changed color
changed object noun only
changed wording only
changed random seed
```

## 8. Diversity and repetition interpretation

A worksheet may intentionally revisit the same macro domain. Therefore, macro-domain repetition must not be treated as student-visible scenario duplication.

Required diversity metrics are separate:

```text
macroDomainRepeatRate
mesoSituationRepeatRate
microScenarioRepeatRate
atomicEpisodeRepeatRate
semanticFingerprintRepeatRate
surfaceTemplateRepeatRate
exactPromptRepeatRate
```

The future five-day pack contract should normally require:

```text
atomicEpisodeRepeatRate = 0
semanticFingerprintRepeatRate = 0
exactPromptRepeatRate = 0
```

This contract does not implement the pack allocator.

## 9. Existing GS02 registry classification

The existing registry:

```text
data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json
```

is preserved and reclassified for extraction purposes as:

```text
LEGACY_FLAT_CONTEXT_FAMILY_AND_SURFACE_TEMPLATE_SEED_REGISTRY
```

It contains valuable domains, event structures, templates, constraints, and QA seeds. However:

```text
it is not the complete global-context universe;
its 18 context families are not 18 total student-visible scenarios;
its surface templates are not hierarchy nodes;
its contextFamilyId values are not automatically L1, L2, L3, or L4;
each legacy entry requires explicit hierarchy mapping before production hierarchy claims.
```

No existing GS02 content is deleted or silently promoted by this contract.

## 10. Retrieval aliases

Search and extraction systems should associate this authority with the following terms:

```text
全域情境
全域生活情境
大情境
中情境
小情境
微觀情境
情境本體
情境階層
情境樹
生活應用題情境
global context
global context ontology
context hierarchy
macro context
meso situation
micro scenario
atomic task episode
scenario diversity
```

## 11. Current completeness state

```text
Hierarchy semantics defined = true
Canonical authority index defined = true
Node schema defined = true
Legacy source classification defined = true
Macro node population complete = false
Meso node population complete = false
Micro node population complete = false
Atomic episode population complete = false
Legacy mapping complete = false
Application binding migration complete = false
Production runtime consumption complete = false
```

The hierarchy must therefore be reported as:

```text
STRUCTURE_DEFINED_CONTENT_NOT_POPULATED
```

It must not be reported as complete.

## 12. Next program integration

This contract is a prerequisite for:

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
```

Its first controller milestone must consume this authority before performing:

```text
156 KnowledgePoint application-suitability assessment
per-unit application capability expansion
five-day pack diversity planning
context-to-KnowledgePoint binding admission
```

## 13. Scope boundary

This task only records hierarchy semantics and extraction authority.

```text
populate macro domains = forbidden
populate meso families = forbidden
populate micro scenarios = forbidden
populate atomic episodes = forbidden
modify existing GS02 entries = forbidden
modify generator = forbidden
modify runtime validator = forbidden
modify renderer = forbidden
modify public UI = forbidden
production admission = forbidden
```

## 14. Acceptance

This contract passes only when:

```text
a canonical authority index exists under data/curriculum/context/registry;
the four context levels are machine-readable;
L5 wording is explicitly non-ontology;
the GS02 registry is classified as a legacy flat seed registry;
18 families cannot be extracted as the complete context universe;
retrieval aliases are machine-readable;
current population completeness remains false;
no runtime or production behavior changes.
```
