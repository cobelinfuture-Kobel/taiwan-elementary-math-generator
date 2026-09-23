# S22D G3-to-G6 CurriculumNodeCandidate Matrix

## Status Block

| Field | Value |
|---|---|
| S22D_STATUS | PASS_WITH_SHALLOW_SCOPE |
| artifactStatus | created_by_S22F |
| authorityLevel | shallow_candidate |
| productionRuntime | false |
| visualVerification | false |
| sourceAuthorityStatus | metadata_backed |

## Scope Boundary

- This is **not** FormalPatternMapping.
- This is **not** source-backed ExampleItem extraction.
- This does **not** verify answers.
- This does **not** authorize generator runtime.
- This is a curriculum / tag candidate matrix only.

## Schema

CurriculumNodeCandidate fields:

| Field | Type | Description |
|---|---|---|
| curriculumNodeCandidateId | string | Unique node candidate identifier |
| sourceCode | string | Source code from textbook |
| sourceId | string | Source identifier |
| grade | integer | Grade level (3-6) |
| semester | string | Semester code (g3a..g6b) |
| unit | string | Unit code (u01..u11) |
| sourceSubunit | string or null | Subunit within unit |
| sourceTitle | string | Title of source unit/chapter in Chinese |
| domainTags | string[] | Curriculum domain tags |
| canonicalSkillTags | string[] | Canonical skill tag identifiers |
| questionKindTags | string[] | Question kind tags |
| supportStatusTags | string[] | Support status tags |
| deepMappingPriority | enum | v1_priority, future_priority, planned_only, low_priority |
| extractionStatus | const | shallow_candidate |
| sourceAuthorityStatus | const | metadata_backed |

## Summary by Semester

| Semester | Count |
|---|---|
| g3a | 9 |
| g3b | 10 |
| g4a | 10 |
| g4b | 10 |
| g5a | 14 |
| g5b | 11 |
| g6a | 9 |
| g6b | 6 |
| **Total** | **79** |

## Priority Summary

| Priority | Count |
|---|---|
| v1_priority | 13 |
| future_priority | 56 |
| planned_only | 10 |
| **Total** | **79** |

Note: Priority counts are computed from row-level data. S22F_PRIORITY_COUNT_CORRECTION = NOT_NEEDED (row-level count matches: v1=13, future=56, planned=10).

## V1 Priority Node Lock

The following 13 nodes are locked as v1_priority:

| # | curriculumNodeCandidateId | sourceTitle |
|---|---|---|
| 1 | g3a_u01_3a01 | 10000以內的數 |
| 2 | g3a_u02_3a02 | 四位數的加減 |
| 3 | g3a_u03_3a03 | 乘法 |
| 4 | g3a_u06_3a06 | 二位數除以一位數 |
| 5 | g3b_u01_3b01 | 除法 |
| 6 | g3b_u04_3b04 | 兩步驟計算 |
| 7 | g3b_u08_3b08 | 乘法與除法 |
| 8 | g4a_u01_4a01 | 1億以內的數 |
| 9 | g4a_u02_4a02 | 整數的乘法 |
| 10 | g4a_u04_4a04 | 整數的除法 |
| 11 | g4a_u08_4a08 | 整數四則 |
| 12 | g4b_u01_4b01 | 多位數的乘與除 |
| 13 | g5a_u08_5a08 | 整數四則 |

---


## S22F2 Canonicalization Note

S22F2 canonicalized domainTags and questionKindTags to official TagRegistry tagIds.
- domainTags now use `domain_` prefix (e.g., `domain_number_sense` instead of `number_sense`).
- questionKindTags now use `qk_` prefix (e.g., `qk_expression` instead of `expression`).
- Node count remained 79.
- Priority counts remained v1_priority=13, future_priority=56, planned_only=10.
- supportStatusTags and canonicalSkillTags were not changed.
- sourceId was intentionally not changed in this task.

## S22F3 SourceId Normalization Note

S22F3 normalized sourceId to full node-level source identifiers.
- sourceId now equals curriculumNodeCandidateId for all 79 nodes.
- sourceCode remains the short source code (e.g., 3a01, 5a02a, 6b06).
- No tag references were changed.
- Node count remained 79.
- Priority counts remained v1_priority=13, future_priority=56, planned_only=10.
- G5 sourceSubunit values were preserved.

## Grouped Matrix Tables

### G3A (9 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g3a_u01_3a01 | 10000以內的數 | domain_number_sense | number_place_value, number_reading_writing, number_comparison, money_representation, number_line | qk_number_sense, qk_representation, qk_visual_reading | v1NumberSenseSupported, v1TextFallbackSupported | v1_priority |
| g3a_u02_3a02 | 四位數的加減 | domain_operation | integer_addition, integer_subtraction, integer_add_sub_mixed | qk_expression | v1ExpressionSupported | v1_priority |
| g3a_u03_3a03 | 乘法 | domain_operation | integer_multiplication, multi_digit_multiplication | qk_expression | v1ExpressionSupported | v1_priority |
| g3a_u04_3a04 | 毫米與數線 | domain_measurement, domain_number_line | measurement_length_mm, number_line | qk_measurement_conversion, qk_visual_reading | futureMeasurementEngine, v1TextFallbackSupported | future_priority |
| g3a_u05_3a05 | 角 | domain_geometry | geometry_angle | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g3a_u06_3a06 | 二位數除以一位數 | domain_operation | integer_division, two_digit_div_by_one_digit | qk_expression | v1ExpressionSupported | v1_priority |
| g3a_u07_3a07 | 尋找規律 | domain_pattern_relationship | pattern_sequence | qk_pattern_sequence | plannedOnly | planned_only |
| g3a_u08_3a08 | 分數 | domain_fraction | fraction_basic | domain_fraction | futureFractionDomain | future_priority |
| g3a_u09_3a09 | 圓 | domain_geometry | geometry_circle | qk_visual_geometry | requiresVisualGenerator | future_priority |

### G3B (10 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g3b_u01_3b01 | 除法 | domain_operation | integer_division | qk_expression | v1ExpressionSupported | v1_priority |
| g3b_u02_3b02 | 公升與毫升 | domain_measurement | measurement_capacity_l_ml | qk_measurement_conversion | futureMeasurementEngine | future_priority |
| g3b_u03_3b03 | 時間 | domain_measurement | measurement_time | qk_measurement_conversion, qk_word_problem | futureMeasurementEngine | future_priority |
| g3b_u04_3b04 | 兩步驟計算 | domain_operation | two_step_calculation, integer_mixed_operations | qk_expression, qk_word_problem | v1ExpressionSupported, requiresWordProblemTemplate | v1_priority |
| g3b_u05_3b05 | 平方公分與面積 | domain_geometry, domain_measurement | area_cm2, geometry_area | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine, requiresVisualGenerator | future_priority |
| g3b_u06_3b06 | 公斤公克 | domain_measurement | measurement_mass_kg_g | qk_measurement_conversion | futureMeasurementEngine | future_priority |
| g3b_u07_3b07 | 分數的加減 | domain_fraction | fraction_add_sub | domain_fraction | futureFractionDomain | future_priority |
| g3b_u08_3b08 | 乘法與除法 | domain_operation | integer_mul_div_mixed | qk_expression | v1ExpressionSupported | v1_priority |
| g3b_u09_3b09 | 小數 | domain_decimal | decimal_basic | domain_decimal | futureDecimalDomain | future_priority |
| g3b_u10_3b10 | 統計表 | domain_data | statistics_table | qk_chart_data | requiresChartDataEngine | future_priority |

### G4A (10 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g4a_u01_4a01 | 1億以內的數 | domain_number_sense | large_number_place_value, number_reading_writing | qk_number_sense | v1NumberSenseSupported | v1_priority |
| g4a_u02_4a02 | 整數的乘法 | domain_operation | integer_multiplication, multi_digit_multiplication | qk_expression | v1ExpressionSupported | v1_priority |
| g4a_u03_4a03 | 角度 | domain_geometry, domain_measurement | angle_measurement, geometry_angle | qk_visual_geometry, qk_measurement_conversion | requiresVisualGenerator | future_priority |
| g4a_u04_4a04 | 整數的除法 | domain_operation | integer_division, multi_digit_division | qk_expression | v1ExpressionSupported | v1_priority |
| g4a_u05_4a05 | 三角形 | domain_geometry | geometry_triangle | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g4a_u06_4a06 | 假分數與帶分數 | domain_fraction | improper_fraction, mixed_number | domain_fraction | futureFractionDomain | future_priority |
| g4a_u07_4a07 | 數量規律 | domain_pattern_relationship | quantity_pattern, pattern_sequence | qk_pattern_sequence | plannedOnly | planned_only |
| g4a_u08_4a08 | 整數四則 | domain_operation | integer_mixed_operations, operation_precedence | qk_expression | v1ExpressionSupported | v1_priority |
| g4a_u09_4a09 | 2位小數 | domain_decimal | decimal_basic, two_decimal_places | domain_decimal | futureDecimalDomain | future_priority |
| g4a_u10_4a10 | 公里 | domain_measurement | measurement_length_km | qk_measurement_conversion | futureMeasurementEngine | future_priority |

### G4B (10 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g4b_u01_4b01 | 多位數的乘與除 | domain_operation | multi_digit_multiplication, multi_digit_division, integer_mul_div_mixed | qk_expression | v1ExpressionSupported | v1_priority |
| g4b_u02_4b02 | 垂直平行與四邊形 | domain_geometry | perpendicular_parallel, geometry_quadrilateral | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g4b_u03_4b03 | 假分數與帶分數 | domain_fraction | improper_fraction, mixed_number | domain_fraction | futureFractionDomain | future_priority |
| g4b_u04_4b04 | 概數 | domain_number_sense | rounding_approximation | qk_rounding | plannedOnly | planned_only |
| g4b_u05_4b05 | 統計圖表 | domain_data | statistics_chart | qk_chart_data | requiresChartDataEngine | future_priority |
| g4b_u06_4b06 | 小數乘法 | domain_decimal | decimal_multiplication | domain_decimal | futureDecimalDomain | future_priority |
| g4b_u07_4b07 | 周長與面積 | domain_geometry | geometry_perimeter, geometry_area | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine, requiresVisualGenerator | future_priority |
| g4b_u08_4b08 | 等值分數 | domain_fraction | equivalent_fraction | domain_fraction | futureFractionDomain | future_priority |
| g4b_u09_4b09 | 時間的計算 | domain_measurement | measurement_time | qk_measurement_conversion, qk_word_problem | futureMeasurementEngine | future_priority |
| g4b_u10_4b10 | 立方公分 | domain_measurement, domain_geometry | volume_cm3, volume | qk_geometry_formula, qk_measurement_conversion | futureMeasurementEngine, futureGeometryFormulaEngine | future_priority |

### G5A (14 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g5a_u01_5a01 | 多位小數與加減 | domain_decimal | decimal_add_sub, decimal_place_value | domain_decimal | futureDecimalDomain | future_priority |
| g5a_u02_5a02a | 因數 | domain_number_sense | factor | qk_factor_multiple | plannedOnly | planned_only |
| g5a_u02_5a02a1 | 因數 | domain_number_sense | factor | qk_factor_multiple | plannedOnly | planned_only |
| g5a_u03_5a03a | 倍數 | domain_number_sense | multiple | qk_factor_multiple | plannedOnly | planned_only |
| g5a_u03_5a03a1 | 公倍數 | domain_number_sense | common_multiple | qk_factor_multiple | plannedOnly | planned_only |
| g5a_u04_5a04 | 擴分約分通分 | domain_fraction | equivalent_fraction, simplify_fraction, common_denominator | domain_fraction | futureFractionDomain | future_priority |
| g5a_u05_5a05a | 多邊形與平面圖形 | domain_geometry | polygon, plane_geometry | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g5a_u05_5a05a1 | 扇形與圓心角 | domain_geometry | sector, central_angle | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g5a_u06_5a06 | 異分母分數加減 | domain_fraction | unlike_denominator_fraction_add_sub | domain_fraction | futureFractionDomain | future_priority |
| g5a_u07_5a07 | 線對稱圖形 | domain_geometry | line_symmetry | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g5a_u08_5a08 | 整數四則 | domain_operation | integer_mixed_operations, operation_precedence | qk_expression | v1ExpressionSupported | v1_priority |
| g5a_u09_5a09 | 面積 | domain_geometry | geometry_area | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine | future_priority |
| g5a_u10_5a10a | 柱體錐體和球 | domain_geometry | solid_geometry, prism_cone_sphere | qk_visual_geometry | requiresVisualGenerator | future_priority |
| g5a_u10_5a10a1 | 正方體和長方體 | domain_geometry | cube_cuboid, volume | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine, requiresVisualGenerator | future_priority |

### G5B (11 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g5b_u01_5b01 | 體積 | domain_geometry | volume | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine | future_priority |
| g5b_u02_5b02 | 分數的計算 | domain_fraction | fraction_operations | domain_fraction | futureFractionDomain | future_priority |
| g5b_u03_5b03 | 容積 | domain_measurement | capacity_volume | qk_measurement_conversion, qk_geometry_formula | futureMeasurementEngine | future_priority |
| g5b_u04_5b04 | 小數的乘法 | domain_decimal | decimal_multiplication | domain_decimal | futureDecimalDomain | future_priority |
| g5b_u05_5b05a | 數的十進位結構 | domain_number_sense, domain_decimal | decimal_place_value, base10_structure | qk_number_sense, qk_decimal | futureDecimalDomain | future_priority |
| g5b_u06_5b06 | 整數小數除以整數 | domain_decimal | decimal_division_by_integer, integer_division | domain_decimal | futureDecimalDomain | future_priority |
| g5b_u07_5b07 | 表面積 | domain_geometry | surface_area | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine | future_priority |
| g5b_u08_5b08 | 比率與百分率 | domain_ratio_speed | ratio_percent | qk_ratio_percent | plannedOnly | planned_only |
| g5b_u09_5b09 | 時間的乘除 | domain_measurement | time_multiplication_division | qk_measurement_conversion, qk_word_problem | futureMeasurementEngine | future_priority |
| g5b_u10_5b10a | 生活中的大單位 | domain_measurement | large_units | qk_measurement_conversion | futureMeasurementEngine | future_priority |
| g5b_u11_5b11 | 長條圖與折線圖 | domain_data | bar_chart, line_graph | qk_chart_data | requiresChartDataEngine | future_priority |

### G6A (9 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g6a_u01_6a01 | 最大公因數與最小公倍數 | domain_number_sense | gcd, lcm | qk_factor_multiple | plannedOnly | planned_only |
| g6a_u02_6a02 | 分數除法 | domain_fraction | fraction_division | domain_fraction | futureFractionDomain | future_priority |
| g6a_u03_6a03 | 數量關係規律問題 | domain_pattern_relationship | quantity_relationship, pattern_sequence | qk_relationship, qk_pattern_sequence, qk_word_problem | requiresWordProblemTemplate | future_priority |
| g6a_u04_6a04 | 小數除法 | domain_decimal | decimal_division | domain_decimal | futureDecimalDomain | future_priority |
| g6a_u05_6a05 | 比和比值 | domain_ratio_speed | ratio_value | qk_ratio_percent | plannedOnly | planned_only |
| g6a_u06_6a06 | 圓周長與扇形周長 | domain_geometry | geometry_perimeter, circle_circumference, sector_arc_length | qk_geometry_formula | futureGeometryFormulaEngine | future_priority |
| g6a_u07_6a07 | 圓面積和扇形面積 | domain_geometry | circle_area, sector_area | qk_geometry_formula | futureGeometryFormulaEngine | future_priority |
| g6a_u08_6a08 | 速率 | domain_ratio_speed, domain_measurement | speed | qk_word_problem, qk_relationship | requiresWordProblemTemplate | future_priority |
| g6a_u09_6a09 | 縮圖放大圖與比例尺 | domain_ratio_speed, domain_geometry | scale_drawing, scale | qk_visual_geometry, qk_ratio_percent | requiresVisualGenerator | future_priority |

### G6B (6 nodes)

| ID | sourceTitle | domainTags | canonicalSkillTags | questionKindTags | supportStatus | priority |
|---|---|---|---|---|---|---|
| g6b_u01_6b01 | 小數與分數的計算 | domain_decimal, domain_fraction | decimal_fraction_operations, fraction_operations | qk_decimal, qk_fraction | futureDecimalDomain, futureFractionDomain | future_priority |
| g6b_u02_6b02 | 速率 | domain_ratio_speed, domain_measurement | speed | qk_word_problem, qk_relationship | requiresWordProblemTemplate | future_priority |
| g6b_u03_6b03 | 柱體體積與表面積 | domain_geometry | prism_volume, volume, surface_area | qk_geometry_formula, qk_visual_geometry | futureGeometryFormulaEngine | future_priority |
| g6b_u04_6b04 | 基準量與比較量 | domain_ratio_speed | base_quantity, comparison_quantity | qk_ratio_percent, qk_word_problem | requiresWordProblemTemplate | future_priority |
| g6b_u05_6b05 | 怎樣解題康軒版 | domain_word_problem_strategy | problem_solving_strategy | qk_word_problem | requiresWordProblemTemplate | future_priority |
| g6b_u06_6b06 | 圓形圖 | domain_data | pie_chart | qk_chart_data | requiresChartDataEngine | future_priority |