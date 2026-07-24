import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_PATH = "data/curriculum/global/candidates/r02/source-authority-reconciliation-index.json";
const REVIEWED_PACK_PATH = "data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.manifest.json";
const SOURCE_REGISTRY_PATH = "data/curriculum/application/controller/postg-app-79-unit-registry.json";
const PRODUCT_BASELINE_SHA = "9846627e1263d9dfb3e9e2318989cc5ae94c35dd";
const EXISTING_CONSUMER = "site/assets/browser/pipeline/build-worksheet-document.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
function loadReviewedPack(root, manifestPath = REVIEWED_PACK_PATH) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
  const chunkPaths = manifest.chunkPaths ?? manifest.shardPaths ?? [];
  const sourceRecords = chunkPaths.flatMap((repoPath) => {
    const chunk = JSON.parse(fs.readFileSync(path.join(root, repoPath), "utf8"));
    return chunk.sourceRecords ?? [];
  });
  return { ...manifest, sourceRecords };
}
const unique = (values) => [...new Set(values)];
const slug = (value) => String(value ?? "")
  .replace(/^kp_/, "")
  .replace(/[^a-zA-Z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .toLowerCase();

function evidenceRef(ref) {
  return `${ref.sourceNodeId}|${ref.evidenceRole}|${(ref.evidenceRefs ?? []).join("|")}`;
}

function mergeSourceRefs(left = [], right = []) {
  return [...new Map([...left, ...right].map((ref) => [evidenceRef(ref), clone(ref)])).values()];
}

function candidateBoundary() {
  return {
    prerequisiteDeclaration: {
      mode: "DEFERRED_TO_R03",
      directPrerequisiteKnowledgePointIds: [],
    },
    runtimeCapabilityDeclaration: {
      mode: "DEFERRED_TO_R04",
      requiredRuntimeCapabilityIds: [],
    },
    mainlineBinding: {
      productBaselineMergeSha: PRODUCT_BASELINE_SHA,
      existingConsumerEntryPoint: EXISTING_CONSUMER,
      productionCutoverAllowed: false,
    },
  };
}

const REVIEWED_PROFILES = Object.freeze({
  measurement: {
    indispensableConcepts: ["量綱與單位", "等值換算", "數量角色"],
    misconceptionFamilies: ["混淆量綱或單位", "未先統一單位就直接運算"],
    allowedVariationAxes: ["unknown_shift", "representation_transfer", "same_unit_fusion", "context_projection", "difficulty_parameterization"],
  },
  geometry: {
    indispensableConcepts: ["圖形構成要素", "幾何關係", "測量或公式條件"],
    misconceptionFamilies: ["忽略圖形成立條件", "套用公式但未保持幾何關係"],
    allowedVariationAxes: ["representation_transfer", "error_detection", "constraint_extension", "context_projection", "difficulty_parameterization"],
  },
  pattern: {
    indispensableConcepts: ["序列或圖樣規則", "位置與數量對應", "規律延伸"],
    misconceptionFamilies: ["只看表面數字未辨識規則", "延伸規律時位置索引錯誤"],
    allowedVariationAxes: ["unknown_shift", "representation_transfer", "reasoning_extension", "context_projection", "difficulty_parameterization"],
  },
  data: {
    indispensableConcepts: ["資料欄位", "表圖對應", "比較與彙整"],
    misconceptionFamilies: ["讀錯表格或圖表尺度", "混淆類別、數值或總量"],
    allowedVariationAxes: ["unknown_shift", "representation_transfer", "error_detection", "context_projection", "difficulty_parameterization"],
  },
  number: {
    indispensableConcepts: ["數的表示", "位值或等值結構", "大小與順序"],
    misconceptionFamilies: ["位值或等值表示錯誤", "只依表面數字判斷大小"],
    allowedVariationAxes: ["direction_reversal", "unknown_shift", "representation_transfer", "error_detection", "difficulty_parameterization"],
  },
  arithmetic: {
    indispensableConcepts: ["運算意義", "數量角色", "演算法成立條件"],
    misconceptionFamilies: ["運算角色或順序錯誤", "答案未滿足逆運算或範圍條件"],
    allowedVariationAxes: ["direction_reversal", "unknown_shift", "error_detection", "constraint_extension", "context_projection", "difficulty_parameterization"],
  },
  ratio: {
    indispensableConcepts: ["兩量關係", "基準量與比較量", "等值比或率"],
    misconceptionFamilies: ["混淆基準量與比較量", "以加法差異取代乘法比例關係"],
    allowedVariationAxes: ["direction_reversal", "unknown_shift", "representation_transfer", "reasoning_extension", "context_projection", "difficulty_parameterization"],
  },
  problem: {
    indispensableConcepts: ["條件關係", "未知量角色", "多步推理與驗證"],
    misconceptionFamilies: ["漏用或誤用題目條件", "只算局部結果未驗證最終要求"],
    allowedVariationAxes: ["unknown_shift", "constraint_extension", "reasoning_extension", "spiral_fusion", "context_projection", "difficulty_parameterization"],
  },
});

function projectionFromReviewedSource(sourceRecord) {
  return (sourceRecord.candidates ?? []).map((row) => {
    const profile = REVIEWED_PROFILES[row.category] ?? REVIEWED_PROFILES.problem;
    const suffix = slug(row.knowledgePointId);
    return {
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      indispensableConcepts: clone(profile.indispensableConcepts),
      reasoningInvariant: row.reasoningInvariant,
      misconceptionFamilies: clone(profile.misconceptionFamilies),
      validatorCapability: {
        validatorCapabilityId: `valcap_${suffix}`,
        acceptanceCriteria: [
          `結果符合「${String(row.reasoningInvariant).replace(/[。.]$/, "")}」`,
          "使用的數量角色、單位、圖形或資料條件與來源題意一致",
        ],
        rejectionCodes: [
          `GKP_${suffix.toUpperCase()}_RELATION_INVALID`,
          `GKP_${suffix.toUpperCase()}_ROLE_OR_CONDITION_INVALID`,
        ],
      },
      allowedVariationAxes: clone(profile.allowedVariationAxes),
      sourceRefs: [{
        sourceNodeId: sourceRecord.sourceNodeId,
        evidenceRole: "PRIMARY_EVIDENCE",
        evidenceRefs: unique([
          `driveFileId:${sourceRecord.driveFileId}`,
          `sourcePdf:${sourceRecord.sourcePdfTitle}`,
          "reviewMethod:FULL_PAGE_VISUAL_READBACK",
          ...(row.evidencePages ?? []).map((page) => `page:${page}`),
        ]),
      }],
      legacyBatchRefs: [sourceRecord.legacyBatchId],
      candidateStatus: "CANDIDATE_ONLY",
      ...candidateBoundary(),
    };
  });
}

function operationModelsOf(row) {
  return Array.isArray(row.operationModels) ? row.operationModels : [];
}

function acceptanceCriteriaFromOperationModels(row) {
  const invariants = operationModelsOf(row).flatMap((model) => model.validationInvariants ?? []);
  return unique(invariants.length > 0 ? invariants : [
    `結果符合能力範圍：${row.scope ?? row.knowledgePointName ?? row.name}`,
    "答案與來源數量角色、表示法及限制一致",
  ]);
}

function conceptsFromOperationModels(row) {
  const models = operationModelsOf(row);
  const roleLabels = models.flatMap((model) => Object.values(model.operandRoles ?? {}));
  const answerTypes = models.map((model) => model.answerType).filter(Boolean);
  const concepts = unique([...roleLabels, ...answerTypes].map(String).filter((value) => value.length >= 2));
  return concepts.length > 0 ? concepts.slice(0, 8) : ["來源能力定義", "數量角色", "答案成立條件"];
}

function projectionFromProductionAuthority(entry, authority) {
  const readbacks = authority.authority?.readbackPaths ?? [];
  return (authority.knowledgePoints ?? []).map((row) => {
    const id = row.knowledgePointId;
    const name = row.knowledgePointName ?? id;
    const scope = row.scope ?? `學生能完成 ${name}。`;
    const suffix = slug(id);
    return {
      knowledgePointId: id,
      canonicalNameZh: name,
      capabilityStatement: scope.startsWith("學生能") ? scope : `學生能${scope.replace(/[。.]$/, "")}。`,
      indispensableConcepts: conceptsFromOperationModels(row),
      reasoningInvariant: `${scope.replace(/[。.]$/, "")}；所有等值題型必須維持相同數學關係與答案成立條件。`,
      misconceptionFamilies: [
        `${name}的數量角色或表示法判讀錯誤`,
        `${name}的答案未通過來源 operation model 成立條件`,
      ],
      validatorCapability: {
        validatorCapabilityId: `valcap_${suffix}`,
        acceptanceCriteria: acceptanceCriteriaFromOperationModels(row),
        rejectionCodes: [
          `GKP_${suffix.toUpperCase()}_RELATION_INVALID`,
          `GKP_${suffix.toUpperCase()}_ROLE_OR_REPRESENTATION_INVALID`,
        ],
      },
      allowedVariationAxes: [
        "direction_reversal",
        "unknown_shift",
        "error_detection",
        "constraint_extension",
        "context_projection",
        "difficulty_parameterization",
      ],
      sourceRefs: [{
        sourceNodeId: entry.sourceNodeId,
        evidenceRole: "PRIMARY_EVIDENCE",
        evidenceRefs: unique([
          `authorityPath:${entry.authorityPath}`,
          `authoritySchema:${authority.schemaName}`,
          ...readbacks.map((value) => `readback:${value}`),
        ]),
      }],
      legacyBatchRefs: [entry.legacyBatchId],
      candidateStatus: "RECONCILED_EXISTING_KP",
      ...candidateBoundary(),
    };
  });
}

function projectionFromW02Authority(entry, authority, aliases) {
  const sourceEvidence = authority.sourceEvidence ?? {};
  return (authority.knowledgePoints ?? []).map((row) => {
    const id = aliases[row.candidateId] ?? row.candidateId;
    const suffix = slug(id);
    const scope = row.scope ?? `學生能完成 ${row.name}。`;
    return {
      knowledgePointId: id,
      canonicalNameZh: row.name,
      capabilityStatement: scope.startsWith("學生能") ? scope : `學生能${scope.replace(/[。.]$/, "")}。`,
      indispensableConcepts: unique([
        row.name,
        ...(String(scope).match(/[一-龥A-Za-z0-9]+/g) ?? []).filter((value) => value.length >= 2).slice(0, 5),
      ]),
      reasoningInvariant: `${scope.replace(/[。.]$/, "")}；改變數值或題面時必須保留相同核心判定或運算關係。`,
      misconceptionFamilies: [
        `${row.name}的核心關係判讀錯誤`,
        `${row.name}的表徵、數量角色或答案形式不一致`,
      ],
      validatorCapability: {
        validatorCapabilityId: `valcap_${suffix}`,
        acceptanceCriteria: [
          `結果符合「${scope.replace(/[。.]$/, "")}」`,
          "答案與來源頁面所示的數量角色、表徵和限制一致",
        ],
        rejectionCodes: [
          `GKP_${suffix.toUpperCase()}_RELATION_INVALID`,
          `GKP_${suffix.toUpperCase()}_SOURCE_CONSTRAINT_INVALID`,
        ],
      },
      allowedVariationAxes: [
        "unknown_shift",
        "representation_transfer",
        "error_detection",
        "context_projection",
        "difficulty_parameterization",
      ],
      sourceRefs: [{
        sourceNodeId: entry.sourceNodeId,
        evidenceRole: "PRIMARY_EVIDENCE",
        evidenceRefs: unique([
          `authorityPath:${entry.authorityPath}`,
          `sha256:${sourceEvidence.sha256 ?? "unknown"}`,
          `contentIdentityGroup:${sourceEvidence.contentIdentityGroup ?? "unknown"}`,
          ...(row.evidencePages ?? []).map((page) => `page:${page}`),
          `reviewMethod:${sourceEvidence.reviewMethod ?? "PAGE_EVIDENCED_AUTHORITY"}`,
        ]),
      }],
      legacyBatchRefs: [entry.legacyBatchId],
      candidateStatus: "CANDIDATE_ONLY",
      ...candidateBoundary(),
    };
  });
}

function semanticComparable(candidate) {
  return {
    canonicalNameZh: candidate.canonicalNameZh,
    capabilityStatement: candidate.capabilityStatement,
    indispensableConcepts: candidate.indispensableConcepts,
    reasoningInvariant: candidate.reasoningInvariant,
    validatorCapabilityId: candidate.validatorCapability?.validatorCapabilityId,
  };
}

function statusRank(value) {
  return value === "RECONCILED_EXISTING_KP" ? 2 : value === "CANDIDATE_ONLY" ? 1 : 0;
}

function mergeCandidate(target, incoming, conflicts) {
  if (JSON.stringify(semanticComparable(target)) !== JSON.stringify(semanticComparable(incoming))) {
    conflicts.push({
      code: "R02_SEMANTIC_IDENTITY_CONFLICT",
      knowledgePointId: target.knowledgePointId,
      existing: semanticComparable(target),
      incoming: semanticComparable(incoming),
    });
    return target;
  }
  return {
    ...target,
    sourceRefs: mergeSourceRefs(target.sourceRefs, incoming.sourceRefs),
    legacyBatchRefs: unique([...(target.legacyBatchRefs ?? []), ...(incoming.legacyBatchRefs ?? [])]).sort(),
    candidateStatus: statusRank(incoming.candidateStatus) > statusRank(target.candidateStatus)
      ? incoming.candidateStatus
      : target.candidateStatus,
  };
}

export function materializeR02GlobalKnowledgePointRegistry({ root = ROOT } = {}) {
  const index = JSON.parse(fs.readFileSync(path.join(root, INDEX_PATH), "utf8"));
  const reviewedPack = loadReviewedPack(root);
  const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, SOURCE_REGISTRY_PATH), "utf8"));
  const aliases = index.semanticIdentityRules?.canonicalKnowledgePointAliases ?? {};
  const conflicts = [];
  const byKnowledgePoint = new Map();
  const sourceViews = [];

  const addCandidate = (candidate) => {
    const current = byKnowledgePoint.get(candidate.knowledgePointId);
    byKnowledgePoint.set(
      candidate.knowledgePointId,
      current ? mergeCandidate(current, candidate, conflicts) : clone(candidate),
    );
  };

  for (const entry of index.existingAuthoritySources ?? []) {
    const authority = JSON.parse(fs.readFileSync(path.join(root, entry.authorityPath), "utf8"));
    const candidates = entry.projectionMode === "PRODUCTION_AUTHORITY_RECONCILIATION"
      ? projectionFromProductionAuthority(entry, authority)
      : projectionFromW02Authority(entry, authority, aliases);
    for (const candidate of candidates) addCandidate(candidate);
    sourceViews.push({
      sourceNodeId: entry.sourceNodeId,
      legacyBatchId: entry.legacyBatchId,
      evidenceClass: entry.projectionMode,
      authorityPath: entry.authorityPath,
      knowledgePointIds: unique(candidates.map((row) => row.knowledgePointId)).sort(),
      candidateProjectionCount: candidates.length,
    });
  }

  for (const sourceRecord of reviewedPack.sourceRecords ?? []) {
    const candidates = projectionFromReviewedSource(sourceRecord);
    for (const candidate of candidates) addCandidate(candidate);
    sourceViews.push({
      sourceNodeId: sourceRecord.sourceNodeId,
      legacyBatchId: sourceRecord.legacyBatchId,
      evidenceClass: "FULL_PAGE_REVIEWED_SOURCE_CANDIDATES",
      driveFileId: sourceRecord.driveFileId,
      sourcePdfTitle: sourceRecord.sourcePdfTitle,
      pageCount: sourceRecord.pageCount,
      reviewedPages: clone(sourceRecord.reviewedPages),
      knowledgePointIds: unique(candidates.map((row) => row.knowledgePointId)).sort(),
      candidateProjectionCount: candidates.length,
    });
  }

  const sourceNodeIds = (sourceRegistry.batches ?? []).flatMap((batch) => batch.sourceNodeIds ?? []);
  const knowledgePoints = [...byKnowledgePoint.values()]
    .map((row) => ({
      ...row,
      sourceRefs: [...row.sourceRefs].sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId)),
      legacyBatchRefs: [...row.legacyBatchRefs].sort(),
    }))
    .sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));

  return Object.freeze({
    schemaName: "R02GlobalKnowledgePointReconciledRegistryV1",
    schemaVersion: 1,
    programId: index.programId,
    taskId: index.taskId,
    status: conflicts.length === 0
      ? "ALL_79_SOURCE_NODES_RECONCILED_CANDIDATE_AUTHORITY_READY"
      : "BLOCKED_BY_SEMANTIC_IDENTITY_CONFLICT",
    productBaselineMergeSha: PRODUCT_BASELINE_SHA,
    sourceRegistryPath: SOURCE_REGISTRY_PATH,
    sourceViews: Object.freeze(sourceViews.sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId))),
    knowledgePoints: Object.freeze(knowledgePoints),
    conflicts: Object.freeze(conflicts),
    counts: Object.freeze({
      sourceNodeCount: sourceNodeIds.length,
      sourceViewCount: sourceViews.length,
      existingProductionAuthoritySourceCount: index.sourceScope.existingProductionAuthoritySourceCount,
      existingW02CandidateAuthoritySourceCount: index.sourceScope.existingW02CandidateAuthoritySourceCount,
      fullPageReviewedSourceCount: reviewedPack.sourceRecords.length,
      reviewedPdfCount: reviewedPack.sourcePolicy.sourcePdfCount,
      reviewedPageCount: reviewedPack.sourcePolicy.renderedPageCount,
      reviewedCandidateProjectionCount: reviewedPack.counts.candidateProjectionCount,
      reviewedUniqueKnowledgePointCount: reviewedPack.counts.uniqueKnowledgePointIdCount,
      globalKnowledgePointCount: knowledgePoints.length,
      reconciledExistingKnowledgePointCount: knowledgePoints.filter((row) => row.candidateStatus === "RECONCILED_EXISTING_KP").length,
      candidateOnlyKnowledgePointCount: knowledgePoints.filter((row) => row.candidateStatus === "CANDIDATE_ONLY").length,
      semanticIdentityConflictCount: conflicts.length,
    }),
    mainlineBoundary: Object.freeze({
      currentProductionConsumer: EXISTING_CONSUMER,
      productionCutoverAllowed: false,
      parallelAuthorityAllowed: false,
      parallelRuntimePipelineAllowed: false,
      prerequisiteEdgesMaterialized: false,
      runtimeCapabilityMappingsMaterialized: false,
      nextTask: "R03_GlobalPrerequisiteGraph",
    }),
  });
}

export function listR02GlobalKnowledgePoints(options = {}) {
  const registry = materializeR02GlobalKnowledgePointRegistry(options);
  return clone(registry.knowledgePoints);
}

export function getR02SourceCandidateView(sourceNodeId, options = {}) {
  const registry = materializeR02GlobalKnowledgePointRegistry(options);
  const view = registry.sourceViews.find((row) => row.sourceNodeId === sourceNodeId);
  if (!view) return null;
  const ids = new Set(view.knowledgePointIds);
  return {
    ...clone(view),
    candidates: clone(registry.knowledgePoints.filter((row) => ids.has(row.knowledgePointId))),
  };
}
