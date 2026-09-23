# S78 — G5A-U02 Dual-PDF Manual KnowledgePoint Extraction

```text
TASK = S78_G5A_U02_DualPDFManualKnowledgePointExtraction
STATUS = PASS_CI_SYNCED_AND_MERGED
MODE = MANUAL_VISUAL_SOURCE_EXTRACTION
```

## 1. Scope

S78 manually reviews both operator-uploaded packets associated with `g5a_u02` and records page-evidenced KnowledgePoint candidates.

```text
題型總覽-5a02a-因數.pdf
題型總覽-5a02a1-因數.pdf
→ visual page review
→ source identity audit
→ candidate KnowledgePoint registry
```

No FormalMapping, PatternSpec, generator, validator, public selector or production behavior is created.

## 2. Source packet A — requested `g5a_u02_5a02a`

```text
uploaded name       = 題型總覽-5a02a-因數.pdf
displayed title     = 因數
displayed URL       = https://meow911.com/5a02b/
metadata URL        = https://meow911.com/5a02a/
page count          = 2
SHA-256             = 342d3d888783d4601b198234f2947b06bf87b675815e539be31636970a28ddb5
```

Observed coverage:

- factor judgement by multiplication decomposition and exact division;
- systematic factor enumeration by division and multiplication pairs;
- ordered factor lists, pair symmetry and missing-factor reconstruction;
- divisibility/factor-membership judgement;
- equal-partition applications;
- factor-vs-multiple wording discrimination;
- efficient factor-pair search;
- inverse reasoning from a complete factor list;
- remainder transfer under related divisors;
- a common-factor example for 72 and 90.

Source anomaly:

```text
source_url_code_mismatch
metadata expects /5a02a/
visible page header shows /5a02b/
```

The current sourceId is preserved for extraction only. Promotion is blocked until reconciliation.

## 3. Source packet B — requested `g5a_u02_5a02a1`

```text
uploaded name       = 題型總覽-5a02a1-因數.pdf
displayed title     = 公因數
displayed URL       = https://meow911.com/5a03b/
page count          = 2
SHA-256             = ac8422b5119753d24a6b530ef6459ab39fa9835a140f39aa0c5d8049a4684307
```

Observed coverage:

- common-factor concept and full enumeration;
- greatest common factor;
- maximum equal grouping;
- all possible equal packaging counts;
- equal-square side lengths in a rectangle;
- problem-type wording discrimination;
- common-factor search by multiplication decomposition;
- square-tile area possibilities;
- multi-constraint digit-code reasoning using common factors, common multiples and multiples.

Source anomaly:

```text
source_title_and_url_scope_mismatch
file/source assignment says 5a02a1 因數
visible title says 公因數
visible page header shows /5a03b/
```

This is not treated as a duplicate factor packet. It is a common-factor/GCF packet. The current sourceId is preserved only until the source identity is reconciled.

The embedded short-division video thumbnail is not sufficient evidence for a separate KnowledgePoint; no candidate is created solely from external media.

## 4. Candidate result

```text
KnowledgePoint candidates = 19
Class C candidates        = 12
Class D candidates        = 7
cross-packet candidates   = 2
```

### Factor and divisibility candidates

1. 因數判定的乘法分解與整除等價
2. 用除法整除系統列出因數
3. 用乘法配對完整列出因數
4. 因數配對、由小到大與首尾乘積
5. 從有序因數數列還原缺漏因數
6. 判斷能否整除、是否為因數及敘述正誤
7. 等分情境中的因數應用
8. 從問法辨識因數、倍數、公因數與公倍數
9. 利用因數配對與搜尋停止點避免重複
10. 由完整因數序列推論未知數、倍數關係與奇偶性
11. 除數具因數關係時的餘數轉換

### Common-factor and GCF candidates

12. 公因數的定義與共同整除
13. 列出兩數全部公因數
14. 最大公因數的辨識
15. 兩類數量等分且組數最多
16. 兩類物品等量分裝的所有可行盒數
17. 長方形裁成同樣大正方形的可能邊長
18. 由共同邊長求所有可行正方形面積
19. 公因數、公倍數與倍數條件的多限制數字推理

The wording-discrimination candidate and common-factor-enumeration candidate have evidence in both packets.

## 5. Lifecycle boundary

```text
candidateLifecycle       = candidate_only
sourceIdentityStatus     = needs_reconciliation_before_promotion
promotionEligible        = false
FormalMapping            = not materialized
PatternSpec              = not materialized
generator                = not implemented
validator                = not implemented
selectorVisible          = false
productionUse            = forbidden
```

## 6. Acceptance

S78 passes only if:

1. both two-page PDFs are manually reviewed;
2. the 19 candidate IDs are unique;
3. every candidate has page/panel evidence and an answer-model candidate;
4. Class C/D counts are exactly 12/7;
5. both source identity anomalies are retained as promotion blockers;
6. the second packet is explicitly recognized as `公因數` content;
7. no candidate is inferred solely from the embedded video thumbnail;
8. no runtime or production artifact is created.

## 7. CI and merge evidence

```text
implementation PR        = #124
implementation merge     = 9dd3f65fcb2d28d5da8d689e17bf24f4dbdaf4fc
PR Math CI run           = 29222828731
fresh-main Math CI run   = 29222906438
fresh-main readback      = a1d3ebacc808edf3724715697a912ce42435d12a
tests                    = 1118
pass                     = 1118
fail                     = 0
working tree             = clean
```

All Node, S42, G4B-U01, G5A-U08 and G4B-U04 HTML/PDF smoke workflows passed.

## 8. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D4_G5A_U02_DUAL_SOURCE_FILES_WITHOUT_REVIEWED_KPS
GOAL_DISTANCE_AFTER  = D3_G5A_U02_DUAL_SOURCE_KP_CANDIDATES_WITH_IDENTITY_BLOCKER
DISTANCE_REDUCED     = Extracted 19 page-evidenced factor/common-factor candidates and isolated the source identity blocker.
REMAINING_BLOCKERS   = [
  "5a02a metadata /5a02a/ versus visible /5a02b/",
  "5a02a1 因數 assignment versus visible 公因數 /5a03b/",
  "KnowledgePoint boundary QA",
  "FormalMapping, PatternSpec and runtime are absent"
]
NEXT_SHORTEST_STEP   = S79_G5A_U02_DualPDFKnowledgePointBoundaryAndSourceIdentityQA
STOP_REASON          = SOURCE_IDENTITY_RECONCILIATION_REQUIRED_BEFORE_PROMOTION
```
