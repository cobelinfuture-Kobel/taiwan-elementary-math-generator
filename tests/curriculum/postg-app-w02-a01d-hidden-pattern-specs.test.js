import assert from 'node:assert/strict';
import test from 'node:test';

import { materializeW02HiddenPatternSpecs, validateW02HiddenPatternSpecs } from '../../src/curriculum/application/w02-hidden-pattern-specs.mjs';
import { runPOSTGAPPW02A01DValidation } from '../../tools/curriculum/validate-postg-app-w02-a01d-hidden-pattern-specs.mjs';

const materialized = materializeW02HiddenPatternSpecs();
const codes = (result) => result.issues.map((row) => row.code);

test('A01D materializes one hidden numeric PatternSpec per answer-bearing unknown role', () => {
  const result = runPOSTGAPPW02A01DValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A01D_HIDDEN_PATTERNSPECS_MATERIALIZED');
  assert.deepEqual(result.counts, {
    sourceNodeCount: 13, uniquePdfContentCount: 12, knowledgePointCount: 90,
    uniqueContentKnowledgePointCount: 84, numericPatternSpecCount: 134,
    applicationPatternSpecCount: 61, hiddenPatternSpecCount: 195, visiblePatternSpecCount: 0
  });
});

test('A01D gives applicable KPs separate numeric and application specs without forcing stories', () => {
  for (const { actual } of materialized.records) {
    for (const kp of actual.knowledgePoints) {
      const numeric = kp.patternSpecs.filter((spec) => spec.mode === 'NUMERIC');
      const application = kp.patternSpecs.filter((spec) => spec.mode === 'APPLICATION');
      assert.ok(numeric.length > 0);
      if (kp.applicationClassification === 'APPLICATION_NOT_APPLICABLE') assert.equal(application.length, 0);
      else assert.equal(application.length, numeric.length);
      assert.ok(kp.patternSpecs.every((spec) => spec.lifecycle.selectorVisibility === 'hidden'));
    }
    assert.equal(actual.productionBoundary.storyTemplatesAuthored, false);
    assert.equal(actual.productionBoundary.contextBindingsAuthored, false);
  }
});

test('each PatternSpec locks one unknown role and preserves operation semantics', () => {
  for (const { actual } of materialized.records) {
    for (const kp of actual.knowledgePoints) {
      for (const spec of kp.patternSpecs) {
        assert.equal(spec.operationModelId, kp.operationModelId);
        assert.equal(spec.givenRoles.includes(spec.requestedUnknownRole), false);
        assert.ok(spec.operationContract.canonicalExpressions.length > 0);
        assert.deepEqual(spec.presentationContract.forbiddenWorksheetLabels, ['算式', '_____', '答']);
      }
    }
  }
});

test('materialization drift, forced story and premature routing fail closed', () => {
  const drift = structuredClone(materialized);
  drift.records[0].actual.knowledgePoints[0].patternSpecs[0].answerType = 'anything';
  assert.ok(codes(validateW02HiddenPatternSpecs(drift)).includes('POSTG_APP_W02_A01D_MATERIALIZATION_DRIFT'));

  const story = structuredClone(materialized);
  story.records[0].actual.knowledgePoints[0].patternSpecs.push({
    ...story.records[0].actual.knowledgePoints[0].patternSpecs[0],
    patternSpecId: 'ps_forced_story', mode: 'APPLICATION',
    presentationContract: { ...story.records[0].actual.knowledgePoints[0].patternSpecs[0].presentationContract, contextRequired: true }
  });
  assert.ok(codes(validateW02HiddenPatternSpecs(story)).includes('POSTG_APP_W02_A01D_APPLICATION_CLASSIFICATION_VIOLATION'));

  const routed = structuredClone(materialized);
  routed.records[0].actual.knowledgePoints[0].patternSpecs[0].lifecycle.canonicalRouting = 'enabled';
  assert.ok(codes(validateW02HiddenPatternSpecs(routed)).includes('POSTG_APP_W02_A01D_PATTERN_SPEC_INVALID'));
});
