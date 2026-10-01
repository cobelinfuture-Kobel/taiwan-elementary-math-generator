import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";

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
    authorityKinds: new Set(),
    explicitNonPublicReasons: new Set(),
  };
  if (data.sourceId) existing.sourceIds.add(data.sourceId);
  if (data.unitCode) existing.unitCodes.add(data.unitCode);
  if (data.knowledgePointId) existing.knowledgePointIds.add(data.knowledgePointId);
  if (data.authorityKind) existing.authorityKinds.add(data.authorityKind);
  if (data.explicitNonPublicReason) existing.explicitNonPublicReasons.add(data.explicitNonPublicReason);
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
    authorityKinds: [...row.authorityKinds].sort(),
    explicitNonPublicReasons: [...row.explicitNonPublicReasons].sort(),
  };
}

function acceptedPromotion(json) {
  const productionUse = String(json?.lifecycle?.productionUse ?? json?.productionUse ?? "").toLowerCase();
  const activation = String(json?.activation?.status ?? "").toLowerCase();
  return productionUse.includes("allowed")
    || activation.includes("accepted")
    || activation.includes("production_promotion");
}

function explicitNonPublicReasons(spec, inherited = {}) {
  const lifecycle = spec?.lifecycle ?? {};
  const reasons = [];
  const selectorVisibility = String(lifecycle.selectorVisibility ?? inherited.selectorVisibility ?? "").toLowerCase();
  const productionUse = String(lifecycle.productionUse ?? inherited.productionUse ?? "").toLowerCase();
  const generatorStatus = String(lifecycle.generatorStatus ?? inherited.generatorStatus ?? "").toLowerCase();
  const validatorStatus = String(lifecycle.validatorStatus ?? inherited.validatorStatus ?? "").toLowerCase();
  const rendererStatus = String(lifecycle.rendererStatus ?? inherited.rendererStatus ?? "").toLowerCase();
  const canonicalRouting = String(lifecycle.canonicalRouting ?? inherited.canonicalRouting ?? "").toLowerCase();

  if (selectorVisibility === "hidden") reasons.push("SELECTOR_VISIBILITY_HIDDEN");
  if (productionUse.includes("forbidden")) reasons.push("PRODUCTION_USE_FORBIDDEN");
  if (generatorStatus.includes("not_implemented")) reasons.push("GENERATOR_NOT_IMPLEMENTED");
  if (validatorStatus.includes("contract_only")) reasons.push("VALIDATOR_CONTRACT_ONLY");
  if (rendererStatus.includes("not_connected")) reasons.push("RENDERER_NOT_CONNECTED");
  if (canonicalRouting.includes("disabled")) reasons.push("CANONICAL_ROUTING_DISABLED");
  return reasons;
}

function addPatternDefinition(authority, spec, context = {}) {
  if (!spec || typeof spec.patternSpecId !== "string") return;
  const reasons = explicitNonPublicReasons(spec, context);
  addAuthority(authority, spec.patternSpecId, {
    sourceId: spec.sourceId ?? context.sourceId ?? null,
    unitCode: spec.unitCode ?? context.unitCode ?? null,
    knowledgePointId: spec.knowledgePointId ?? null,
    origin: context.origin,
    authorityKind: context.authorityKind ?? "MATERIALIZED_PATTERN_SPEC",
    explicitNonPublicReason: reasons.join("+") || context.explicitNonPublicReason || null,
  });
}

async function loadAdditionalMaterializedPatternAuthorities(authority) {
  const before = authority.size;

  const batchAPath = path.join(ROOT, "data/curriculum/registry/pattern_specs.batch_a.json");
  try {
    const batchA = await readJson(batchAPath);
    for (const source of batchA.sourceUnits ?? []) {
      for (const bucket of ["ready", "partial"]) {
        for (const row of source[bucket] ?? []) {
          const spec = typeof row === "string" ? { patternSpecId: row } : row;
          addPatternDefinition(authority, spec, {
            sourceId: source.sourceId,
            origin: `registry:${path.relative(ROOT, batchAPath)}:${bucket}`,
            authorityKind: "LEGACY_BATCH_A_MATERIALIZED_PATTERN_SPEC",
            productionUse: batchA.productionUse,
            explicitNonPublicReason: String(batchA.productionUse ?? "").toLowerCase().includes("forbidden")
              ? "LEGACY_BATCH_A_REGISTRY_PRODUCTION_FORBIDDEN"
              : null,
          });
        }
      }
    }
  } catch {
    // Registry may not exist in older snapshots.
  }

  const registryDir = path.join(ROOT, "data/curriculum/registry");
  for (const file of (await listFilesRecursive(registryDir))
    .filter((entry) => /S43F.*PatternSpecMaterialization\.json$/.test(path.basename(entry)))) {
    const json = await readJson(file);
    for (const spec of json.patternSpecs ?? []) {
      addPatternDefinition(authority, spec, {
        origin: `registry:${path.relative(ROOT, file)}`,
        authorityKind: "S43F_MATERIALIZED_PATTERN_SPEC",
      });
    }
  }

  const appPatternDir = path.join(ROOT, "data/curriculum/application/pattern-specs");
  try {
    for (const file of (await listFilesRecursive(appPatternDir)).filter((entry) => entry.endsWith(".json"))) {
      const json = await readJson(file);
      for (const kp of json.knowledgePoints ?? []) {
        for (const spec of kp.patternSpecs ?? []) {
          addPatternDefinition(authority, spec, {
            sourceId: json.sourceNodeId ?? null,
            origin: `application-pattern-registry:${path.relative(ROOT, file)}`,
            authorityKind: "APPLICATION_MATERIALIZED_PATTERN_SPEC",
          });
        }
      }
    }
  } catch {
    // Application pattern registry may not exist in older snapshots.
  }

  return authority.size - before;
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
        authorityKind: "VALIDATED_EXISTING_BINDING",
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
        authorityKind: "CANONICAL_PATTERN_REGISTRY",
      });
      const blockId = path1FileToBlock.get(path.basename(file));
      if (blockId) path1Patterns.set(spec.patternSpecId, blockId);
    }
  }

  const additionalMaterializedDefinitionIdCount = await loadAdditionalMaterializedPatternAuthorities(authority);

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
    const explicitNonPublic = !exact && plain.explicitNonPublicReasons.length > 0;
    const status = exact
      ? "PUBLIC_EXACT"
      : sourceBindingOnly
        ? "PUBLIC_SOURCE_BINDING_ONLY"
        : explicitNonPublic
          ? "NONPUBLIC_INTENTIONAL_OR_LEGACY"
          : "UNREACHABLE_CANDIDATE";
    return { ...plain, status, publicEvidence: evidence };
  }).sort((a, b) => a.patternSpecId.localeCompare(b.patternSpecId));

  const counts = {
    authorityPatternSpecCount: rows.length,
    publicExactCount: rows.filter((row) => row.status === "PUBLIC_EXACT").length,
    publicSourceBindingOnlyCount: rows.filter((row) => row.status === "PUBLIC_SOURCE_BINDING_ONLY").length,
    nonPublicIntentionalOrLegacyCount: rows.filter((row) => row.status === "NONPUBLIC_INTENTIONAL_OR_LEGACY").length,
    unreachableCandidateCount: rows.filter((row) => row.status === "UNREACHABLE_CANDIDATE").length,
    nonPublicExactReachabilityCount: rows.filter((row) => row.status !== "PUBLIC_EXACT").length,
    additionalMaterializedDefinitionIdCount,
    completedUnitCount: completedUnits.length,
    classicPublicSourceCount: classic.publicSourceIds.size,
    classicVisibleKnowledgePointCount: classic.visibleKnowledgePointIds.size,
    classicVisiblePatternGroupCount: classic.visibleGroups.length,
    classicByGrade: classic.byGrade,
  };

  return {
    schemaName: "PublicPatternReachabilityAuditV1",
    schemaVersion: 2,
    scope: "grades_3_to_6_completed_bindings_plus_canonical_legacy_s43f_and_application_materialized_pattern_registries",
    rule: {
      publicExact: "visible Classic PatternGroup/resolver, accepted production promotion, or explicit Path1 public cutover",
      publicSourceBindingOnly: "validated existingQuestionBinding under a public Classic source unit but no exact public PatternGroup/Path1/promotion evidence",
      nonPublicIntentionalOrLegacy: "no exact public route and a materialized registry explicitly records hidden/forbidden/not-implemented runtime state",
      unreachableCandidate: "materialized PatternSpec has no exact public-route evidence and no explicit non-public lifecycle reason; requires focused runtime/browser confirmation",
    },
    counts,
    completedUnits,
    rows,
    publicSourceBindingOnly: rows.filter((row) => row.status === "PUBLIC_SOURCE_BINDING_ONLY"),
    nonPublicIntentionalOrLegacy: rows.filter((row) => row.status === "NONPUBLIC_INTENTIONAL_OR_LEGACY"),
    unreachableCandidates: rows.filter((row) => row.status === "UNREACHABLE_CANDIDATE"),
  };
}


const CONFIRMED_GAP_DISPOSITIONS = Object.freeze({
  ps_g4a_u01_large_number_vertical_calculation: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g4a_u01_4a01",
    successorPatternSpecIds: Object.freeze(["ps_g4a_u01_large_number_add_sub"]),
    sourceAuthorityRef: "g4a_u01_4a01 current canonical authority",
    rationale: "historical S43F31 row duplicates the same one-step large-number add/sub family now owned by ps_g4a_u01_large_number_add_sub",
  }),
  ps_g4a_u02_4digit_by_2digit: Object.freeze({
    disposition: "STALE_OUTSIDE_CURRENT_SOURCE_AUTHORITY",
    sourceId: "g4a_u02_4a02",
    successorPatternSpecIds: Object.freeze([]),
    sourceAuthorityRef: "batchA_02-題型總覽-4a02-整數的乘法.pdf",
    rationale: "current source covers four-digit by one-digit and up to three-digit by two-digit work, not four-digit by two-digit",
  }),
  ps_g4a_u02_multiplier_10_or_100: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g4a_u02_4a02",
    successorPatternSpecIds: Object.freeze([
      "ps_g4a_u02_2digit_by_2digit",
      "ps_g4a_u02_2digit_by_3digit",
      "ps_g4a_u02_3digit_by_2digit",
      "ps_g4a_u02_near_hundred_multiplication_strategy",
    ]),
    sourceAuthorityRef: "batchA_02-題型總覽-4a02-整數的乘法.pdf",
    rationale: "current source-backed 10-multiple and near-100 cases are represented by narrower current multiplication and strategy PatternSpecs",
  }),
  ps_g4a_u04_3digit_by_2digit_exact: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g4a_u04_4a04",
    successorPatternSpecIds: Object.freeze([
      "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
      "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
    ]),
    sourceAuthorityRef: "batchA_02-題型總覽-4a04-整數的除法.pdf",
    rationale: "current canonical split covers both first-place cases and includes remainder_zero, which subsumes the older exact-only family",
  }),
  ps_g4a_u04_4digit_by_2digit_exact: Object.freeze({
    disposition: "STALE_OUTSIDE_CURRENT_SOURCE_AUTHORITY",
    sourceId: "g4a_u04_4a04",
    successorPatternSpecIds: Object.freeze([]),
    sourceAuthorityRef: "batchA_02-題型總覽-4a04-整數的除法.pdf",
    rationale: "current source authority covers four-digit by one-digit and three-digit by two-digit division, not four-digit by two-digit",
  }),
  ps_g4a_u08_add_sub_three_terms: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g4a_u08_4a08",
    successorPatternSpecIds: Object.freeze(["ps_g4a_u08_add_sub_left_to_right"]),
    sourceAuthorityRef: "batchA_02-題型總覽-4a08-整數四則.pdf",
    rationale: "current source explicitly teaches mixed addition/subtraction left-to-right and the current canonical PatternSpec owns that family",
  }),
  ps_g4b_u01_multi_digit_by_2digit: Object.freeze({
    disposition: "STALE_OUTSIDE_CURRENT_SOURCE_AUTHORITY",
    sourceId: "g4b_u01_4b01",
    successorPatternSpecIds: Object.freeze([]),
    sourceAuthorityRef: "batchA_02-題型總覽-4b01-多位數的乘與除.pdf",
    rationale: "current G4B-U01 source advances to three-digit multipliers; two-digit multiplier work belongs to the earlier multiplication source",
  }),
  ps_g4b_u01_multi_digit_by_3digit: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g4b_u01_4b01",
    successorPatternSpecIds: Object.freeze([
      "ps_g4b_u01_3digit_by_3digit",
      "ps_g4b_u01_4digit_by_3digit",
    ]),
    sourceAuthorityRef: "batchA_02-題型總覽-4b01-多位數的乘與除.pdf",
    rationale: "the historical broad family is replaced by the source-backed current three-by-three and four-by-three canonical families",
  }),
  ps_g4b_u01_multi_digit_division_exact: Object.freeze({
    disposition: "STALE_OUTSIDE_CURRENT_SOURCE_AUTHORITY",
    sourceId: "g4b_u01_4b01",
    successorPatternSpecIds: Object.freeze([]),
    sourceAuthorityRef: "batchA_02-題型總覽-4b01-多位數的乘與除.pdf",
    rationale: "the historical row uses a two-digit divisor range while current G4B-U01 authority advances to three-digit divisors",
  }),
  ps_g5a_u08_left_to_right_add_sub: Object.freeze({
    disposition: "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN",
    sourceId: "g5a_u08_5a08",
    successorPatternSpecIds: Object.freeze([
      "ps_g4a_u08_add_sub_left_to_right",
      "ps_g5a_u08_add_sub_signed_regroup",
      "ps_g5a_u08_consecutive_subtraction",
    ]),
    sourceAuthorityRef: "batchA_02-題型總覽-5a08-整數四則.pdf",
    rationale: "left-to-right add/sub is already canonically owned at G4A-U08; G5A-U08 source advances to regrouping and consecutive-subtraction transformations",
  }),
});

function dispositionForConfirmedGap(patternSpecId) {
  return CONFIRMED_GAP_DISPOSITIONS[patternSpecId] ?? Object.freeze({
    disposition: "PUBLIC_ROUTE_REPAIR_REQUIRED",
    sourceId: null,
    successorPatternSpecIds: Object.freeze([]),
    sourceAuthorityRef: null,
    rationale: "confirmed current source-backed PatternSpec has no accepted successor or intentional retirement evidence",
  });
}

const uniqueSortedRuntime = (values = []) => [...new Set(values.filter(Boolean).map(String))].sort();

function runtimeRouteOptions(route) {
  const verifiedMax = Number(route.verifiedMaxQuestionCount ?? 20);
  const questionCount = Math.max(
    1,
    Math.min(20, Number.isFinite(verifiedMax) && verifiedMax > 0 ? verifiedMax : 20),
  );
  return {
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionMode: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `public-pattern-runtime-replay:${route.routeId}`,
  };
}

function replayPublicRuntimeRoute(route) {
  const options = runtimeRouteOptions(route);
  const result = generateBatchABrowserQuestions(options);
  return {
    routeId: route.routeId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    publicPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    requestedQuestionCount: options.questionCount,
    capacityStatus: route.capacityStatus,
    compatiblePatternSpecIds: uniqueSortedRuntime(route.compatiblePatternSpecIds ?? []),
    ok: result.ok === true,
    generatedQuestionCount: result.questions?.length ?? 0,
    observedPatternSpecIds: uniqueSortedRuntime((result.questions ?? []).map((row) => row.patternSpecId)),
    errorCodes: uniqueSortedRuntime((result.errors ?? []).map((row) => row.code ?? row.message ?? String(row))),
  };
}

async function auditPublicPatternRuntimeReplay() {
  const [reachability, capacity, acceptedR09] = await Promise.all([
    auditPublicPatternReachability(),
    readJson(path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json")),
    readJson(path.join(ROOT, "data/curriculum/public-generation/PGC-R09-A02.real-artifact-hash-manifest.json")),
  ]);

  const candidates = reachability.unreachableCandidates ?? [];
  const candidateSourceIds = new Set(candidates.flatMap((row) => row.sourceIds ?? []));
  const legalRoutes = (capacity.routes ?? []).filter((route) => route.legalRoute === true);
  const focusedRoutes = legalRoutes
    .filter((route) => candidateSourceIds.has(route.sourceId))
    .sort((a, b) => a.routeId.localeCompare(b.routeId));
  const routeReplay = focusedRoutes.map(replayPublicRuntimeRoute);
  const routeReplayFailures = routeReplay.filter((row) => !row.ok);

  const candidateRows = candidates.map((candidate) => {
    const authorityRoutes = focusedRoutes.filter((route) =>
      (route.compatiblePatternSpecIds ?? []).includes(candidate.patternSpecId));
    const runtimeRoutes = routeReplay.filter((route) =>
      route.observedPatternSpecIds.includes(candidate.patternSpecId));
    const exactReachable = authorityRoutes.length > 0 || runtimeRoutes.length > 0;
    return {
      patternSpecId: candidate.patternSpecId,
      sourceIds: [...candidate.sourceIds],
      knowledgePointIds: [...candidate.knowledgePointIds],
      origins: [...candidate.origins],
      capacityCompatibleRouteIds: authorityRoutes.map((row) => row.routeId),
      runtimeObservedRouteIds: runtimeRoutes.map((row) => row.routeId),
      classification: exactReachable
        ? "CURRENT_PUBLIC_EXACT_RUNTIME_REACHABLE"
        : "CONFIRMED_NO_CURRENT_PUBLIC_EXACT_ROUTE_OR_RUNTIME_WITNESS",
    };
  });

  const confirmedUnreachable = candidateRows.filter((row) =>
    row.classification === "CONFIRMED_NO_CURRENT_PUBLIC_EXACT_ROUTE_OR_RUNTIME_WITNESS");
  const reachable = candidateRows.filter((row) =>
    row.classification === "CURRENT_PUBLIC_EXACT_RUNTIME_REACHABLE");
  const confirmedGapDispositions = confirmedUnreachable.map((row) => ({
    ...row,
    ...dispositionForConfirmedGap(row.patternSpecId),
  }));
  const superseded = confirmedGapDispositions.filter((row) =>
    row.disposition === "SUPERSEDED_BY_CURRENT_CANONICAL_PATTERN");
  const staleOutsideCurrentSource = confirmedGapDispositions.filter((row) =>
    row.disposition === "STALE_OUTSIDE_CURRENT_SOURCE_AUTHORITY");
  const routeRepairRequired = confirmedGapDispositions.filter((row) =>
    row.disposition === "PUBLIC_ROUTE_REPAIR_REQUIRED");

  return {
    schemaName: "PublicPatternRuntimeReplayAuditV1",
    schemaVersion: 1,
    authority: {
      reachabilitySchemaVersion: reachability.schemaVersion,
      capacityStatus: capacity.status,
      legalRouteCount: legalRoutes.length,
      priorAcceptedBrowserReplay: {
        artifactStatus: acceptedR09.status,
        passRouteCount: acceptedR09.terminalExecution?.passRouteCount ?? null,
        failRouteCount: acceptedR09.terminalExecution?.failRouteCount ?? null,
      },
    },
    counts: {
      reachabilityCandidateCount: candidates.length,
      candidateSourceCount: candidateSourceIds.size,
      focusedLegalRouteCount: focusedRoutes.length,
      focusedRuntimeReplayCount: routeReplay.length,
      focusedRuntimeReplayFailureCount: routeReplayFailures.length,
      confirmedUnreachableCount: confirmedUnreachable.length,
      exactRuntimeReachableCount: reachable.length,
      supersededByCurrentCanonicalCount: superseded.length,
      staleOutsideCurrentSourceAuthorityCount: staleOutsideCurrentSource.length,
      publicRouteRepairRequiredCount: routeRepairRequired.length,
    },
    candidateRows,
    confirmedUnreachable,
    confirmedGapDispositions,
    supersededByCurrentCanonical: superseded,
    staleOutsideCurrentSourceAuthority: staleOutsideCurrentSource,
    publicRouteRepairRequired: routeRepairRequired,
    exactRuntimeReachable: reachable,
    routeReplayFailures,
    routeReplay,
  };
}

export { auditPublicPatternReachability, auditPublicPatternRuntimeReplay };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await auditPublicPatternReachability();
  console.log("PUBLIC_PATTERN_REACHABILITY_AUDIT=" + JSON.stringify(report));
}
