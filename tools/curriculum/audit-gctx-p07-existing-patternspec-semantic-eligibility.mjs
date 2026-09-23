import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-composer.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = path.resolve(
  HERE,
  "../../data/curriculum/contracts/GCTX_P07_ExistingPatternSpecSemanticEligibilityAudit.json",
);

const clone = (value) => JSON.parse(JSON.stringify(value));
const sortStrings = (values) => [...new Set(values.filter(Boolean))].sort();

export function loadGctxP07Contract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
}

function normalizedTokens(...values) {
  return values
    .flat(Infinity)
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim().toLowerCase());
}

function semanticSignals(group, contract) {
  const signals = [];
  const modes = normalizedTokens(group.mode, group.publicQuestionMode, group.questionMode);
  const modeTokens = contract.controlledSemanticSignals.modeTokens.map((token) => token.toLowerCase());
  if (modes.some((mode) => modeTokens.some((token) => mode.includes(token)))) {
    signals.push("application_mode");
  }

  for (const field of contract.controlledSemanticSignals.booleanFields) {
    if (group[field] === true) signals.push(`boolean:${field}`);
  }

  const representationTags = normalizedTokens(group.representationTag, group.representationTags);
  const approvedRepresentationTags = new Set(
    contract.controlledSemanticSignals.representationTags.map((tag) => tag.toLowerCase()),
  );
  const matchingRepresentationTags = representationTags.filter((tag) => approvedRepresentationTags.has(tag));
  for (const tag of matchingRepresentationTags) signals.push(`representation:${tag}`);

  const contextTypes = normalizedTokens(group.contextTypes);
  const numericOnlyModes = new Set([
    "numeric",
    "concept",
    "representation",
    "reasoning",
    "operation_estimation",
  ]);
  const hasNonNumericMode = modes.some((mode) => !numericOnlyModes.has(mode));
  if (contextTypes.length > 0 && (hasNonNumericMode || matchingRepresentationTags.length > 0 || group.contextualReasoning === true)) {
    signals.push("controlled_context_types");
  }

  return sortStrings(signals);
}

function eligibilityDecision(sourceId, signals, existingAuthoritySet) {
  if (signals.length === 0) return "not_applicable_non_semantic";
  return existingAuthoritySet.has(sourceId)
    ? "eligible_existing_authority"
    : "eligible_binding_backfill";
}

function summarizeEntries(entries) {
  const decisionCounts = {};
  for (const entry of entries) {
    decisionCounts[entry.decision] = (decisionCounts[entry.decision] ?? 0) + 1;
  }
  return {
    patternSpecCount: entries.length,
    eligiblePatternSpecCount:
      (decisionCounts.eligible_existing_authority ?? 0)
      + (decisionCounts.eligible_binding_backfill ?? 0),
    nonSemanticPatternSpecCount: decisionCounts.not_applicable_non_semantic ?? 0,
    decisionCounts,
  };
}

export function buildGctxP07EligibilityAudit() {
  const contract = loadGctxP07Contract();
  const expectedSourceIds = new Set(contract.expectedSourceIds);
  const existingAuthoritySet = new Set(contract.existingContextAuthoritySourceIds);
  const allowedDecisions = new Set(Object.keys(contract.eligibilityDecisions));
  const errors = [];
  const rowsByKey = new Map();

  const knowledgePoints = listVisibleBatchAKnowledgePoints();
  for (const knowledgePoint of knowledgePoints) {
    const sourceId = knowledgePoint.sourceId;
    if (!expectedSourceIds.has(sourceId)) {
      errors.push({
        code: "GCTX_P07_UNKNOWN_SOURCE_ID",
        sourceId,
        knowledgePointId: knowledgePoint.knowledgePointId,
      });
      continue;
    }

    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId);
    if (!Array.isArray(groups) || groups.length === 0) {
      errors.push({
        code: "GCTX_P07_EMPTY_PATTERN_GROUPS",
        sourceId,
        knowledgePointId: knowledgePoint.knowledgePointId,
      });
      continue;
    }

    for (const group of groups) {
      const patternSpecIds = Array.isArray(group.patternSpecIds) ? group.patternSpecIds.filter(Boolean) : [];
      if (patternSpecIds.length === 0) {
        errors.push({
          code: "GCTX_P07_EMPTY_PATTERN_SPEC_IDS",
          sourceId,
          knowledgePointId: knowledgePoint.knowledgePointId,
          patternGroupId: group.patternGroupId,
        });
        continue;
      }

      const signals = semanticSignals(group, contract);
      const decision = eligibilityDecision(sourceId, signals, existingAuthoritySet);
      if (!allowedDecisions.has(decision)) {
        errors.push({
          code: "GCTX_P07_UNKNOWN_DECISION",
          sourceId,
          knowledgePointId: knowledgePoint.knowledgePointId,
          patternGroupId: group.patternGroupId,
          decision,
        });
        continue;
      }

      for (const patternSpecId of patternSpecIds) {
        const key = `${sourceId}::${patternSpecId}`;
        const candidate = {
          sourceId,
          unitCode: knowledgePoint.unitCode,
          knowledgePointIds: [knowledgePoint.knowledgePointId],
          patternGroupIds: [group.patternGroupId],
          patternSpecId,
          decision,
          semanticSignals: signals,
          groupModes: sortStrings([group.mode, group.publicQuestionMode, group.questionMode]),
          representationTags: sortStrings([group.representationTag, ...(group.representationTags ?? [])]),
          contextTypes: sortStrings(group.contextTypes ?? []),
          existingContextAuthority: existingAuthoritySet.has(sourceId),
        };

        const prior = rowsByKey.get(key);
        if (!prior) {
          rowsByKey.set(key, candidate);
          continue;
        }
        if (prior.decision !== candidate.decision) {
          errors.push({
            code: "GCTX_P07_CONFLICTING_PATTERN_SPEC_DECISION",
            sourceId,
            patternSpecId,
            priorDecision: prior.decision,
            candidateDecision: candidate.decision,
            patternGroupIds: sortStrings([...prior.patternGroupIds, ...candidate.patternGroupIds]),
          });
          continue;
        }
        prior.knowledgePointIds = sortStrings([...prior.knowledgePointIds, ...candidate.knowledgePointIds]);
        prior.patternGroupIds = sortStrings([...prior.patternGroupIds, ...candidate.patternGroupIds]);
        prior.semanticSignals = sortStrings([...prior.semanticSignals, ...candidate.semanticSignals]);
        prior.groupModes = sortStrings([...prior.groupModes, ...candidate.groupModes]);
        prior.representationTags = sortStrings([...prior.representationTags, ...candidate.representationTags]);
        prior.contextTypes = sortStrings([...prior.contextTypes, ...candidate.contextTypes]);
      }
    }
  }

  const entries = [...rowsByKey.values()].sort((left, right) => (
    left.sourceId.localeCompare(right.sourceId)
    || left.patternSpecId.localeCompare(right.patternSpecId)
  ));
  const sourceIds = sortStrings(entries.map((entry) => entry.sourceId));
  const missingSourceIds = contract.expectedSourceIds.filter((sourceId) => !sourceIds.includes(sourceId));
  for (const sourceId of missingSourceIds) {
    errors.push({ code: "GCTX_P07_EXPECTED_SOURCE_MISSING", sourceId });
  }

  const unexpectedSourceIds = sourceIds.filter((sourceId) => !expectedSourceIds.has(sourceId));
  for (const sourceId of unexpectedSourceIds) {
    errors.push({ code: "GCTX_P07_UNEXPECTED_SOURCE_PRESENT", sourceId });
  }

  const bySource = {};
  for (const sourceId of contract.expectedSourceIds) {
    const sourceEntries = entries.filter((entry) => entry.sourceId === sourceId);
    bySource[sourceId] = {
      ...summarizeEntries(sourceEntries),
      existingContextAuthority: existingAuthoritySet.has(sourceId),
    };
  }

  const summary = {
    sourceCount: sourceIds.length,
    knowledgePointCount: knowledgePoints.length,
    ...summarizeEntries(entries),
    existingAuthoritySourceCount: contract.existingContextAuthoritySourceIds.length,
    bindingBackfillSourceCount: new Set(
      entries
        .filter((entry) => entry.decision === "eligible_binding_backfill")
        .map((entry) => entry.sourceId),
    ).size,
    errorCount: errors.length,
    auditReadyForP08: errors.length === 0
      && entries.some((entry) => entry.decision !== "not_applicable_non_semantic"),
  };

  return clone({
    schemaName: "GCTXExistingPatternSpecSemanticEligibilityAuditResult",
    schemaVersion: 1,
    task: contract.task,
    status: summary.auditReadyForP08 ? "accepted_for_p08_binding_backfill" : "blocked",
    contractRef: "data/curriculum/contracts/GCTX_P07_ExistingPatternSpecSemanticEligibilityAudit.json",
    selectorAuthority: contract.scope.selectorAuthority,
    summary,
    bySource,
    entries,
    errors,
    scopeBoundary: {
      runtimeBehaviorChanged: false,
      registryPopulationChanged: false,
      unitMigrationChanged: false,
      rendererChanged: false,
    },
    nextShortestStep: contract.consumerBoundary.nextConsumer,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stdout.write(`${JSON.stringify(buildGctxP07EligibilityAudit(), null, 2)}\n`);
}
