# GS04 Focused Runtime Diagnostic

```text
# Subtest: GS04 browser descriptor matches the frozen G5AU08_GOLDEN_V1 identity and counts
ok 1 - GS04 browser descriptor matches the frozen G5AU08_GOLDEN_V1 identity and counts
not ok 3 - GS04 public sourceUnit path consumes Golden runtime without copying generator validator or renderer
  failureType: 'testCodeFailure'
  error: |-
    - 'G5AU08_GOLDEN_V1'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 'G5AU08_GOLDEN_V1'
```

STATUS = FAIL_DIAGNOSTIC_ONLY
NEXT = Fix inside PR 286 without changing frozen runtime authorities.
