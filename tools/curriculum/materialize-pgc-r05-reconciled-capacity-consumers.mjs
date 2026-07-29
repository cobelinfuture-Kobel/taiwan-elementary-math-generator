import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const routeCsvPath = path.join(repoRoot, "data/curriculum/public-generation/route_capacity_matrix.csv");
const diversityCsvPath = path.join(repoRoot, "data/curriculum/public-generation/cross_seed_diversity_report.csv");
const registryPath = path.join(repoRoot, "site/modules/curriculum/public/public-generator-capacity-registry.js");

const safeArray = (value) => Array.isArray(value) ? value : [];
const pipe = (values) => safeArray(values).join("|");

function csv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, header, rows) {
  const content = [header, ...rows.map((row) => row.map(csv).join(","))].join("\n");
  fs.writeFileSync(filePath, `${content}\n`);
}

function routeMatrixRow(route) {
  return [
    route.routeId,
    route.caseId,
    route.sourceId,
    route.selectionMode,
    pipe(route.selectedKnowledgePointIds),
    route.questionType,
    route.setKind,
    pipe(route.publicPatternGroupIds),
    pipe(route.generationPatternGroupIds),
    route.depthMode ?? "",
    route.contextMode ?? "",
    route.legalRouteStatus,
    route.verifiedMaxQuestionCount,
    route.capacityStatus,
    route.qualityStatus,
    route.uniqueItemSetCount,
    route.uniqueOrderedWorksheetCount,
    pipe(route.reconciliationCodes),
    pipe(route.downstreamGapCodes),
  ];
}

function diversityRow(route) {
  const passed = route.qualityStatus === "DIVERSE_PARAMETER_GENERATOR"
    && Number(route.uniqueItemSetCount) > 1;
  return [
    route.routeId,
    route.sourceId,
    route.questionType,
    route.verifiedMaxQuestionCount,
    route.qualityStatus,
    route.uniqueItemSetCount,
    route.uniqueOrderedWorksheetCount,
    passed,
  ];
}

function registryRow(route) {
  return [
    route.sourceId,
    route.selectionMode,
    pipe(route.selectedKnowledgePointIds),
    route.questionType,
    pipe(route.generationPatternGroupIds),
    route.depthMode ?? "",
    route.contextMode ?? "",
    route.verifiedMaxQuestionCount,
    route.legalRouteStatus,
    route.qualityStatus,
    route.routeId,
  ];
}

export function materializePgcR05ReconciledCapacityConsumers() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R05_RECONCILED_CAPACITY_CONTRACT_MISSING");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") {
    throw new Error(`PGC_R05_RECONCILED_CAPACITY_SCHEMA_INVALID:${contract.schemaName}`);
  }
  if (contract.lastReconciliation?.taskId !== "PGC-R05_CapacityContractReconciliationAndD0Closeout") {
    throw new Error("PGC_R05_RECONCILIATION_MARKER_REQUIRED");
  }

  const routes = safeArray(contract.routes);
  writeCsv(
    routeCsvPath,
    "routeId,caseId,sourceId,selectionMode,selectedKnowledgePointIds,questionType,setKind,publicPatternGroupIds,generationPatternGroupIds,depthMode,contextMode,legalRouteStatus,verifiedMaxQuestionCount,capacityStatus,qualityStatus,uniqueItemSetCount,uniqueOrderedWorksheetCount,reconciliationCodes,downstreamGapCodes",
    routes.map(routeMatrixRow),
  );

  const exposedRoutes = routes.filter((route) => route.legalRoute === true && route.verifiedMaxQuestionCount > 0);
  writeCsv(
    diversityCsvPath,
    "routeId,sourceId,questionType,verifiedMaxQuestionCount,qualityStatus,uniqueItemSetCount,uniqueOrderedWorksheetCount,crossSeedDiversityPassed",
    exposedRoutes.map(diversityRow),
  );

  const registryRows = routes.map(registryRow);
  const registrySource = [
    'export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";',
    `export const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(registryRows)});`,
    "",
  ].join("\n");
  fs.writeFileSync(registryPath, registrySource);

  const result = Object.freeze({
    status: "PASS_PGC_R05_RECONCILED_CAPACITY_CONSUMERS_MATERIALIZED",
    routeMatrixRowCount: routes.length,
    diversityRowCount: exposedRoutes.length,
    runtimeRegistryRowCount: registryRows.length,
    routeMatrixPath: path.relative(repoRoot, routeCsvPath).replaceAll(path.sep, "/"),
    diversityPath: path.relative(repoRoot, diversityCsvPath).replaceAll(path.sep, "/"),
    registryPath: path.relative(repoRoot, registryPath).replaceAll(path.sep, "/"),
  });
  console.log(`PGC_R05_RECONCILED_CAPACITY_CONSUMERS=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) materializePgcR05ReconciledCapacityConsumers();
