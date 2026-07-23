#!/usr/bin/env node

import { materializeW02HiddenPatternSpecs } from '../../src/curriculum/application/w02-hidden-pattern-specs.mjs';

const materialized = materializeW02HiddenPatternSpecs();
const rows = materialized.records.flatMap(({ actual }) => actual.knowledgePoints.flatMap((kp) => (
  kp.patternSpecs.map((spec) => ({
    sourceNodeId: actual.sourceNodeId,
    sourceTitle: actual.sourceTitle,
    knowledgePointId: kp.knowledgePointId,
    knowledgePointName: kp.knowledgePointName,
    applicationClassification: kp.applicationClassification,
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    operationFamilyId: spec.operationFamilyId,
    mode: spec.mode,
    requestedUnknownRole: spec.requestedUnknownRole,
    givenRoles: spec.givenRoles,
    answerType: spec.answerType,
    canonicalExpressions: spec.operationContract.canonicalExpressions,
    numberConstraints: spec.operationContract.numberConstraints,
    validationInvariants: spec.operationContract.validationInvariants
  }))
)));
const familyMap = new Map();
for (const row of rows) {
  if (!familyMap.has(row.operationFamilyId)) familyMap.set(row.operationFamilyId, []);
  familyMap.get(row.operationFamilyId).push(row);
}
const families = [...familyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([operationFamilyId, familyRows]) => ({
  operationFamilyId,
  patternSpecCount: familyRows.length,
  sourceNodeIds: [...new Set(familyRows.map((row) => row.sourceNodeId))].sort(),
  answerTypes: [...new Set(familyRows.map((row) => row.answerType))].sort(),
  requestedUnknownRoles: [...new Set(familyRows.map((row) => row.requestedUnknownRole))].sort(),
  variants: familyRows.map((row) => ({
    patternSpecId: row.patternSpecId,
    mode: row.mode,
    requestedUnknownRole: row.requestedUnknownRole,
    givenRoles: row.givenRoles,
    canonicalExpressions: row.canonicalExpressions,
    numberConstraints: row.numberConstraints
  }))
}));
console.log(JSON.stringify({
  counts: {
    sourceNodeCount: new Set(rows.map((row) => row.sourceNodeId)).size,
    numericPatternSpecCount: rows.filter((row) => row.mode === 'NUMERIC').length,
    applicationPatternSpecCount: rows.filter((row) => row.mode === 'APPLICATION').length,
    totalPatternSpecCount: rows.length,
    operationFamilyCount: families.length
  },
  families,
  rows
}, null, 2));
