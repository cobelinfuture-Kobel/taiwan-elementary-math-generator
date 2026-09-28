import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const candidate = readJson("data/curriculum/contracts/G4A_U04_ExamDerived_LongDivisionStepReconstructionCandidate.json");
const contract = readJson("data/curriculum/contracts/G4A_U04_LongDivisionStepReconstruction_PatternSpecContract.json");

const expected = [
  "G1_STEP_SEQUENCE_ORDERING",
  "G2_WHOLE_EXPRESSION_RECONSTRUCTION",
  "G3_INTERMEDIATE_STEP_IDENTIFICATION",
  "G4_ERROR_DIAGNOSIS",
  "G5_COMPOSITE_2SUB",
  "G6_FILL_IN_RECONSTRUCTION",
];

const actual = contract.approvedQuestionGroups.map((group) => group.id);
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`G4A_U04_GROUP_SET_MISMATCH:${JSON.stringify(actual)}`);
}
if (candidate.questionGroupReview?.status !== "OPERATOR_APPROVED") {
  throw new Error("G4A_U04_HUMAN_REVIEW_NOT_APPROVED");
}
if (contract.runtimeGate?.productionUse !== "forbidden") {
  throw new Error("G4A_U04_CONTRACT_LEAKED_TO_PRODUCTION");
}
if (contract.runtimeGate?.generatorImplementation !== "forbidden_in_this_contract_task") {
  throw new Error("G4A_U04_GENERATOR_SCOPE_LEAK");
}
if (contract.runtimeGate?.validatorImplementation !== "forbidden_in_this_contract_task") {
  throw new Error("G4A_U04_VALIDATOR_SCOPE_LEAK");
}

const report = {
  schemaName: "G4AU04LongDivisionStepReconstructionContractReadbackV1",
  status: "PASS",
  sourceId: contract.sourceId,
  patternFamilyId: contract.patternFamilyId,
  approvedQuestionGroups: actual,
  fillInAllowed: candidate.questionGroupReview.fillInPolicy.allowed === true,
  compositeMaxSubitems: contract.approvedQuestionGroups.find((group) => group.id === "G5_COMPOSITE_2SUB")?.maxSubitems,
  runtimeImplementationStarted: false,
};
process.stdout.write(`G4A_U04_STEP_RECONSTRUCTION_CONTRACT_READBACK=${JSON.stringify(report)}\n`);
