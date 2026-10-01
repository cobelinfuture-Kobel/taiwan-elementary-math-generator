import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function listFilesRecursive(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

function addEvidence(map, patternSpecId, evidence) {
  if (!patternSpecId) return;
  const row = map.get(patternSpecId) ?? [];
  row.push(evidence);
  map.set(patternSpecId, row);
}

function addAuthority(map, patternSpecId, data) {
  if (!patternSpecId) return;
  const existing = map.get(patternSpecId) ?? {
    patternSpecId,
    sourceIds: new Set(),
    unitCodes: new Set(),
    knowledgePointIds: new Set(),
    origins: [],
  };
  if (data.sourceId) existing.sourceIds.add(data.sourceId);
  if (data.unitCode) existing.unitCodes.add(data.unitCode);
  if (data.knowledgePointId) existing.knowledgePointIds.add(data.knowledgePointId);
  existing.origins.push(data.origin);
  map.set(patternSpecId, existing);
}

function plainAuthority(row) {
  return {
    patternSpecId: row.patternSpecId,
    sourceIds: [...row.sourceIds].sort(),
    unitCodes: [...row.unitCodes].sort(),
    knowledgePointIds: [...row.knowledgePointIds].sort(),
    origins: [...new Set(row.origins)].sort(),
  };
}

function acceptedPromotion(json) {
  const productionUse = String(json?.lifecycle?.productionUse ?? json?.productionUse ?? "").toLowerCase();
  const activation = String(json?.activation?.status ?? "").toLowerCase();
  return productionUse.includes("allowed")
    || activation.includes("accepted")
    || activation.includes("production_promotion");
}

async function loadClassicPublicSurface() {
  const sourceUnitsUrl = pathToFileURL(path.join(
    ROOT,
    "site/modules/curriculum/batch-a/source-units.js",
  )).href;
  const sourceModule = await import(sourceUnitsUrl);
  const publicUnits = sourceModule.listBatchASourceUnits({
    includeCurrentFullProductPublic: true,
    includePublicCandidates: true,
    includeFullProductPublic: true,
  });

  globalThis.document = {};
  const selectorUrl = pathToFileURL(path.join(
    ROOT,
    "site/modules/curriculum/registry/batch-a-selector-extension.js",
  )).href;
  const selector = await import(selectorUrl);
  const visibleKps = selector.listVisibleBatchAKnowledgePoints();
  const visibleGroups = [];
  const exactPatternIds = new Set();

  for (const kp of visibleKps) {
    const groups = selector.getVisiblePatternGroupsForKnowledgePoint(kp.knowledgePointId) ?? [];
    for (const group of groups) {
      visibleGroups.push(group);
      for (const id of group.patternSpecIds ?? []) exactPatternIds.add(id);
    }
    try {
      const ids = selector.resolveVisiblePatternSpecIdsForKnowledgePoint(kp.knowledgePointId) ?? [];
      for (const id of ids) exactPatternIds.add(id);
    } catch {
      // Some specialized projections require a mode. The visible group rows above remain authoritative.
    }
  }

  delete globalThis.document;
  const publicUnitBySourceId = new Map(publicUnits.map((row) => [row.sourceId, row]));
  const byGrade = {};
  for (const grade of [3, 4, 5, 6]) {
    const sourceIds = new Set(
      publicUnits.filter((row) => Number(row.grade) === grade).map((row) => row.sourceId),
    );
    const gradeKps = visibleKps.filter((row) => sourceIds.has(row.sourceId));
    const gradeGroups = visibleGroups.filter((row) => sourceIds.has(row.sourceId));
    const gradePatternIds = new Set(gradeGroups.flatMap((row) => row.patternSpecIds ?? []));
    byGrade[grade] = {
      publicSourceCount: sourceIds.size,
      visibleKnowledgePointCount: gradeKps.length,
      visiblePatternGroupCount: gradeGroups.length,
      visiblePatternSpecCount: gradePatternIds.size,
      visiblePatternSpecIds: [...gradePatternIds].sort(),
    };
  }

  return {
    publicSourceIds: new Set(publicUnits.map((row) => row.sourceId)),
    publicUnitBySourceId,
    visibleKnowledgePointIds: new Set(visibleKps.map((row) => row.knowledgePointId)),
    visibleGroups,
    exactPatternIds,
    byGrade,
  };
}

async function auditPublicPatternReachability() {
  const authority = new Map();
  const bindingEvidence = new Map();
  const publicEvidence = new Map();

  const knowledgeDir = path.join(ROOT, "data/curriculum/knowledge/units");
  const knowledgeFiles = (await listFilesRecursive(knowledgeDir))
    .filter((file) => file.endsWith(".knowledge-operation.json"));

  const completedUnits = [];
  for (const file of knowledgeFiles) {
    const json = await readJson(file);
    const grade = Number(json.grade);
    if (!(grade >= 3 && grade <= 6)) continue;
    if (json.knowledgeRegistryState !== "VALIDATED_COMPLETE") continue;
    completedUnits.push({
      sourceId: json.sourceId,
      unitCode: json.unitCode,
      grade,
      conformanceState: json.conformanceState,
    });
    for (const binding of json.existingQuestionBindings ?? []) {
      addAuthority(authority, binding.questionId, {
        sourceId: json.sourceId,
        unitCode: json.unitCode,
        knowledgePointId: binding.knowledgePointId,
        origin: `knowledge-binding:${path.relative(ROOT, file)}`,
      });
      addEvidence(bindingEvidence, binding.questionId, {
        type: "VALIDATED_EXISTING_BINDING",
        sourceId: json.sourceId,
        unitCode: json.unitCode,
        knowledgePointId: binding.knowledgePointId,
        sourcePath: binding.sourcePath ?? null,
      });
    }
  }

  const patternDir = path.join(ROOT, "data/curriculum/pattern_specs");
  const patternFiles = (await listFilesRecursive(patternDir)).filter((file) => file.endsWith(".json"));
  const path1FileToBlock = new Map([
    ["PATH1_P1_03_MultiplicativeModelingPatternSpecRegistry.json", "P1-03"],
    ["PATH1_P1_04_MultiplicativeModelingPatternSpecRegistry.json", "P1-04"],
    ["PATH1_P1_05_ZeroSpecialMultiplicativeModelingPatternSpecRegistry.json", "P1-05"],
    ["PATH1_P1_06_EstimateTrialQuotientPatternSpecRegistry.json", "P1-06"],
    ["PATH1_P1_07_QuotientStartPlacePatternSpecRegistry.json", "P1-07"],
  ]);
  const path1Patterns = new Map();

  for (const file of patternFiles) {
    const json = await readJson(file);
    const specs = Array.isArray(json.patternSpecs) ? json.patternSpecs : [];
    for (const spec of specs) {
      addAuthority(authority, spec.patternSpecId, {
        sourceId: spec.sourceId ?? json.sourceId ?? null,
        unitCode: spec.unitCode ?? json.unitCode ?? null,
        knowledgePointId: spec.knowledgePointId ?? null,
        origin: `pattern-registry:${path.relative(ROOT, file)}`,
      });
      const blockId = path1FileToBlock.get(path.basename(file));
      if (blockId) path1Patterns.set(spec.patternSpecId, blockId);
    }
  }

  const promotionDir = path.join(ROOT, "data/curriculum/registry/promotions");
  const promotionFiles = (await listFilesRecursive(promotionDir)).filter((file) => file.endsWith(".json"));
  for (const file of promotionFiles) {
    const json = await readJson(file);
    if (!acceptedPromotion(json)) continue;
    for (const id of json.patternSpecIds ?? []) {
      addEvidence(publicEvidence, id, {
        type: "PRODUCTION_PROMOTION",
        registry: path.relative(ROOT, file),
        sourceId: json.sourceId ?? null,
        unitCode: json.unitCode ?? null,
      });
    }
  }

  const classic = await loadClassicPublicSurface();
  for (const id of classic.exactPatternIds) {
    addEvidence(publicEvidence, id, { type: "CLASSIC_EXACT_PATTERN_SURFACE" });
  }

  const path1Entry = await fs.readFile(
    path.join(ROOT, "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js"),
    "utf8",
  );
  const path1RouteChecks = new Map([
    ["P1-03", ["buildPath1P103MultiplicativeModelingWorksheet", "PATH1_P103_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1"]],
    ["P1-04", ["buildPath1P104MultiplicativeModelingWorksheet", "PATH1_P104_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1"]],
    ["P1-05", ["buildPath1P105MultiplicativeModelingWorksheet", "PATH1_P105_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1"]],
    ["P1-06", ["buildPath1P106EstimateTrialQuotientWorksheet", "PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_V1"]],
    ["P1-07", ["buildPath1P107QuotientStartPlaceWorksheet", "PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_V1"]],
  ]);
  for (const [id, blockId] of path1Patterns) {
    const tokens = path1RouteChecks.get(blockId) ?? [];
    if (tokens.length > 0 && tokens.every((token) => path1Entry.includes(token))) {
      addEvidence(publicEvidence, id, { type: "PATH1_PUBLIC_ROUTE", blockId });
    }
  }

  for (const [id, evidences] of bindingEvidence) {
    for (const evidence of evidences) {
      if (classic.publicSourceIds.has(evidence.sourceId)) {
        addEvidence(publicEvidence, id, {
          type: "CLASSIC_PUBLIC_SOURCE_BINDING",
          sourceId: evidence.sourceId,
          unitCode: evidence.unitCode,
          knowledgePointId: evidence.knowledgePointId,
        });
      }
    }
  }

  const rows = [...authority.values()].map((row) => {
    const plain = plainAuthority(row);
    const evidence = publicEvidence.get(row.patternSpecId) ?? [];
    const exact = evidence.some((item) =>
      item.type === "CLASSIC_EXACT_PATTERN_SURFACE"
      || item.type === "PRODUCTION_PROMOTION"
      || item.type === "PATH1_PUBLIC_ROUTE"
    );
    const sourceBindingOnly = !exact && evidence.some((item) => item.type === "CLASSIC_PUBLIC_SOURCE_BINDING");
    const status = exact
      ? "PUBLIC_EXACT"
      : sourceBindingOnly
        ? "PUBLIC_SOURCE_BINDING_ONLY"
        : "UNREACHABLE_CANDIDATE";
    return { ...plain, status, publicEvidence: evidence };
  }).sort((a, b) => a.patternSpecId.localeCompare(b.patternSpecId));

  const counts = {
    authorityPatternSpecCount: rows.length,
    publicExactCount: rows.filter((row) => row.status === "PUBLIC_EXACT").length,
    publicSourceBindingOnlyCount: rows.filter((row) => row.status === "PUBLIC_SOURCE_BINDING_ONLY").length,
    unreachableCandidateCount: rows.filter((row) => row.status === "UNREACHABLE_CANDIDATE").length,
    completedUnitCount: completedUnits.length,
    classicPublicSourceCount: classic.publicSourceIds.size,
    classicVisibleKnowledgePointCount: classic.visibleKnowledgePointIds.size,
    classicVisiblePatternGroupCount: classic.visibleGroups.length,
    classicByGrade: classic.byGrade,
  };

  return {
    schemaName: "PublicPatternReachabilityAuditV1",
    schemaVersion: 1,
    scope: "grades_3_to_6_current_completed_knowledge_units_plus_authoritative_pattern_registries",
    rule: {
      publicExact: "visible Classic PatternGroup/resolver, accepted production promotion, or explicit Path1 public cutover",
      publicSourceBindingOnly: "validated existingQuestionBinding under a public Classic source unit but no exact public PatternGroup/Path1/promotion evidence",
      unreachableCandidate: "no current public-route evidence found; requires focused runtime/browser confirmation before declaring truly unreachable",
    },
    counts,
    completedUnits,
    rows,
    publicSourceBindingOnly: rows.filter((row) => row.status === "PUBLIC_SOURCE_BINDING_ONLY"),
    unreachableCandidates: rows.filter((row) => row.status === "UNREACHABLE_CANDIDATE"),
  };
}

export { auditPublicPatternReachability };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await auditPublicPatternReachability();
  console.log("PUBLIC_PATTERN_REACHABILITY_AUDIT=" + JSON.stringify(report));
}
