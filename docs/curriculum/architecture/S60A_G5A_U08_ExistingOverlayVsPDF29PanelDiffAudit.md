# S60A — G5A-U08 Existing Overlay vs PDF 29-Panel Diff Audit

```text
TASK = S60A_G5A_U08_ExistingOverlayVsPDF29PanelDiffAudit
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g5a_u08_5a08
```

## Scope

This milestone reconciles the operator-supplied three-page PDF with the historical S43E13 unit-expansion overlay. It does not modify runtime generation, validation, public selectors or worksheet rendering.

## Source result

```text
source panels = 29
numeric panels = 16
application panels = 13
normalized mathematical KPs = 11
historical overlay rows reconciled = 11 / 11
```

The PDF is represented by a fingerprint and panel-level evidence rows. The PDF itself remains outside the repository.

## Normalization result

The formal candidate KPs are:

1. 無括號四則混合運算順序
2. 加減連算的等值重組與湊整
3. 乘除連算的等值重組、約分與整數化
4. 分配律展開
5. 分配律提取公因數
6. 接近整數的連加補償
7. 接近整數的連減補償
8. 接近整數的乘法補償與簡算
9. 反向推算運算符號
10. 算式等值判斷與錯誤分配律辨識
11. 平均數、平均分攤、逆推平均與平均更新

Application form is reclassified as `PatternGroup.application`; multi-step depth is reclassified as `SemanticTemplateFamily.N_PLUS_1`. Neither becomes a mathematical KnowledgePoint.

## Historical overlay disposition

- `repeated_subtraction` and `left_to_right_add_sub` merge into the add/sub equivalent-regroup KP.
- precedence and mixed-four-operations rows merge into the mixed-operation-order KP.
- `parentheses_priority` becomes a representation/evaluation tag.
- `nested_parentheses` is retained only as historical planning input because the supplied PDF does not directly support it.
- the generic `simplification_strategy` row is split across seven precise KPs.
- `missing_value_equation` is corrected to missing-operator inference for the supplied source panel.
- generic word-problem and multi-step rows move to application and N+1 semantic layers.
- answer reasonableness is retained as an optional reasoning tag, not a source-backed core KP.

## Mathematical corrections

The source wording around subtraction and division is not copied as a validator rule:

- subtraction is not associative; only value-equivalent signed-term transformations are accepted;
- division is not commutative or associative; only legal factor and denominator regrouping is accepted;
- continuous division preserves direction: `a÷b÷c = a÷(b×c)`.

## Acceptance

```text
29/29 source panels accounted for
16 numeric + 13 application panels
11/11 candidate KPs have source evidence
11/11 historical rows have an explicit disposition
0 generic application-only mathematical KPs
0 silent historical-row deletion
N+1 and SDG remain semantic policies
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D4_G5A_U08_HISTORICAL_OVERLAY_AND_PDF_SOURCE_NOT_RECONCILED
GOAL_DISTANCE_AFTER  = D3_G5A_U08_29_SOURCE_EVIDENCE_AND_11_KP_RECONCILED
DISTANCE_REDUCED     = 29 PDF panels and 11 historical overlay rows now have explicit ownership and disposition.
REMAINING_BLOCKERS   = [
  "PatternGroup and canonical Tag Registry are not yet frozen",
  "N and N+1 semantic-delta ownership is not yet defined per KP",
  "FormalMapping, PatternSpecs, generators, validators, UI and print remain pending"
]
NEXT_SHORTEST_STEP = S60B_G5A_U08_KPPatternGroupTagContract
```
