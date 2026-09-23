import {
  G5A_U10A1_P05F18_EDGE_GROUP_ID,
  G5A_U10A1_P05F18_EDGE_KP_ID,
  G5A_U10A1_P05F18_EDGE_SPEC_IDS,
  G5A_U10A1_P05F18_FACE_GROUP_ID,
  G5A_U10A1_P05F18_FACE_KP_ID,
  G5A_U10A1_P05F18_FACE_SPEC_IDS,
  G5A_U10A1_P05F18_PATTERN_SPECS,
  G5A_U10A1_P05F18_SOURCE_ID,
  G5A_U10A1_P05F18_SPEC_IDS,
} from "../registry/g5a-u10a1-cube-cuboid-edge-face-selector-projection-p05f18.js";

export const G5A_U10A1_P05F18_MAX_QUESTION_COUNT = 240;

const PROFILES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const SCALES = Object.freeze([0.82, 0.86, 0.90, 0.94, 0.98, 1.02, 1.06, 1.10]);
const SHIFTS = Object.freeze([-12, 0, 12]);
const TARGET_ELEMENTS = Object.freeze(new Set(["EDGE", "FACE"]));
const SPEC_BY_ID = new Map(G5A_U10A1_P05F18_PATTERN_SPECS.map((spec) => [spec.patternSpecId, spec]));
const FORBIDDEN = Object.freeze(["展開圖", "體積", "表面積", "切割", "塗色", "應用題"]);

function hashSeed(seed = "p05f18") {
  let hash = 2166136261;
  for (const character of String(seed)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function variantFromIndex(index, specIndex, seed) {
  const variant = (hashSeed(seed) + specIndex * 71 + index) % 240;
  return Object.freeze({
    variant,
    profileIndex: PROFILES[variant % 10],
    scale: SCALES[Math.floor(variant / 10) % 8],
    shiftX: SHIFTS[Math.floor(variant / 80) % 3],
    highlightIndex: variant % 8,
  });
}

function targetForSpec(spec) {
  return spec?.knowledgePointId ?? null;
}

function targetElementForSpec(spec) {
  if (spec?.knowledgePointId === G5A_U10A1_P05F18_EDGE_KP_ID) return "EDGE";
  if (spec?.knowledgePointId === G5A_U10A1_P05F18_FACE_KP_ID) return "FACE";
  return null;
}

function groupFor(knowledgePointId) {
  if (knowledgePointId === G5A_U10A1_P05F18_EDGE_KP_ID) return G5A_U10A1_P05F18_EDGE_GROUP_ID;
  if (knowledgePointId === G5A_U10A1_P05F18_FACE_KP_ID) return G5A_U10A1_P05F18_FACE_GROUP_ID;
  return null;
}

function solidFor(spec, variant) {
  if (spec.relation === "RELATE_CUBOID_LENGTH_WIDTH_HEIGHT_TO_THREE_GROUPS_OF_FOUR_EQUAL_EDGES") return "CUBOID";
  if (spec.relation === "RECOGNIZE_CUBE_TWELVE_EQUAL_EDGES") return "CUBE";
  return variant % 2 === 0 ? "CUBE" : "CUBOID";
}

function promptFor(spec, solidType) {
  const solid = solidType === "CUBE" ? "正方體" : "長方體";
  switch (spec.relation) {
    case "RELATE_CUBOID_LENGTH_WIDTH_HEIGHT_TO_THREE_GROUPS_OF_FOUR_EQUAL_EDGES":
      return "觀察圖中的長方體。若把12條稜依長、寬、高分組，每一組有幾條等長稜？";
    case "RECOGNIZE_CUBE_TWELVE_EQUAL_EDGES":
      return "觀察圖中的正方體。12條稜的長度關係是什麼？";
    case "IDENTIFY_OPPOSITE_FACES":
      return `觀察圖中的${solid}。哪一種面關係是不相交、彼此相對的兩個面？`;
    case "IDENTIFY_ADJACENT_FACES":
      return `觀察圖中的${solid}。哪一種面關係是兩個面共用一條稜？`;
    case "RECOGNIZE_OPPOSITE_FACES_PARALLEL":
      return `觀察圖中的${solid}。相對面的方向關係是什麼？`;
    case "RECOGNIZE_ADJACENT_FACES_SHARE_EDGE":
      return `觀察圖中的${solid}。相鄰的兩個面共同有什麼？`;
    case "RECOGNIZE_FACE_PERPENDICULAR_RELATIONSHIP":
      return `觀察圖中的${solid}。相鄰的兩個面形成什麼關係？`;
    default:
      return "";
  }
}

function answerFor(spec) {
  switch (spec.relation) {
    case "RELATE_CUBOID_LENGTH_WIDTH_HEIGHT_TO_THREE_GROUPS_OF_FOUR_EQUAL_EDGES":
      return "每組4條，共3組";
    case "RECOGNIZE_CUBE_TWELVE_EQUAL_EDGES":
      return "12條稜全部等長";
    case "IDENTIFY_OPPOSITE_FACES":
      return "相對面";
    case "IDENTIFY_ADJACENT_FACES":
      return "相鄰面";
    case "RECOGNIZE_OPPOSITE_FACES_PARALLEL":
      return "互相平行且不相交";
    case "RECOGNIZE_ADJACENT_FACES_SHARE_EDGE":
      return "一條稜";
    case "RECOGNIZE_FACE_PERPENDICULAR_RELATIONSHIP":
      return "互相垂直";
    default:
      return "";
  }
}

function diagramFor(spec, variant) {
  const solidType = solidFor(spec, variant.variant);
  return Object.freeze({
    kind: "cube_cuboid_elements_diagram",
    profileIndex: variant.profileIndex,
    scale: variant.scale,
    shiftX: variant.shiftX,
    diagramMode: "DISTINGUISH_CUBE_CUBOID",
    solidType,
    targetElement: targetElementForSpec(spec),
    highlightIndex: variant.highlightIndex,
    faceCount: 6,
    edgeCount: 12,
    vertexCount: 8,
    allEdgesEqual: solidType === "CUBE",
    allFacesSquares: solidType === "CUBE",
  });
}

function signatureFor(question) {
  const diagram = question.geometryDiagram;
  return [
    question.patternSpecId,
    question.relation,
    diagram.profileIndex,
    diagram.scale,
    diagram.shiftX,
    diagram.solidType,
    diagram.highlightIndex,
    question.answerText,
  ].join("|");
}

function targetFromOptions(options = {}) {
  const ids = [
    ...(options.selectedKnowledgePointIds ?? options.knowledgePointIds ?? []),
    ...(options.knowledgePointId ? [options.knowledgePointId] : []),
  ].filter((id) => id === G5A_U10A1_P05F18_EDGE_KP_ID || id === G5A_U10A1_P05F18_FACE_KP_ID);
  const specTargets = (options.patternSpecIds ?? [])
    .map((id) => SPEC_BY_ID.get(id)?.knowledgePointId)
    .filter(Boolean);
  const targets = [...new Set([...ids, ...specTargets])];
  if (targets.length === 1) return targets[0];
  if (targets.length > 1) return "AMBIGUOUS";
  return null;
}

function selectedSpecs(options, target) {
  const allowed = target === G5A_U10A1_P05F18_EDGE_KP_ID
    ? G5A_U10A1_P05F18_EDGE_SPEC_IDS
    : G5A_U10A1_P05F18_FACE_SPEC_IDS;
  const requested = Array.isArray(options.patternSpecIds) && options.patternSpecIds.length
    ? [...new Set(options.patternSpecIds)]
    : [...allowed];
  if (requested.some((id) => !allowed.includes(id) || !SPEC_BY_ID.has(id))) return null;
  return requested.map((id) => SPEC_BY_ID.get(id));
}

function questionFor(spec, sequenceIndex, seed) {
  const specIndex = G5A_U10A1_P05F18_SPEC_IDS.indexOf(spec.patternSpecId);
  const variant = variantFromIndex(sequenceIndex, specIndex, seed);
  const geometryDiagram = diagramFor(spec, variant);
  const promptText = promptFor(spec, geometryDiagram.solidType);
  const answerText = answerFor(spec);
  const knowledgePointId = targetForSpec(spec);
  const patternGroupId = groupFor(knowledgePointId);
  const question = {
    id: `p05f18-q018-${specIndex + 1}-${variant.variant + 1}`,
    generatedItemId: `p05f18-q018-${specIndex + 1}-${variant.variant + 1}`,
    sourceId: G5A_U10A1_P05F18_SOURCE_ID,
    sourceNodeId: G5A_U10A1_P05F18_SOURCE_ID,
    knowledgePointId,
    patternGroupId,
    patternSpecId: spec.patternSpecId,
    relation: spec.relation,
    questionMode: "diagram",
    mode: "diagram",
    promptText,
    prompt: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    geometryDiagram,
    metadata: Object.freeze({
      taskId: "P05F_W5DirectProductVerticalSlice018Implementation",
      authority: "R02_FULL_PAGE_VISUAL_READBACK_REUSE_PLUS_Q018_PREFLIGHT",
      sourcePages: Object.freeze([1, 2]),
      sharedRuntimeScope: "SHARED_RUNTIME_BOUNDED",
      edgeLengthRelationUsed: knowledgePointId === G5A_U10A1_P05F18_EDGE_KP_ID,
      faceRelationshipUsed: knowledgePointId === G5A_U10A1_P05F18_FACE_KP_ID,
      existingElementIdentityCountTargetUsed: false,
      netUsed: false,
      broaderSpatialReasoningUsed: false,
      solidMeasurementOrFormulaUsed: false,
      applicationContextUsed: false,
      q019OrLaterTouched: false,
    }),
  };
  return Object.freeze({ ...question, questionSignature: signatureFor(question) });
}

export function validateG5AU10A1P05F18Question(question) {
  const errors = [];
  const spec = SPEC_BY_ID.get(question?.patternSpecId);
  if (!spec) errors.push("P05F18_PATTERN_SPEC_INVALID");
  if (question?.sourceId !== G5A_U10A1_P05F18_SOURCE_ID || question?.sourceNodeId !== G5A_U10A1_P05F18_SOURCE_ID) {
    errors.push("P05F18_SOURCE_INVALID");
  }
  if (spec && (
    question?.knowledgePointId !== spec.knowledgePointId
    || question?.patternGroupId !== groupFor(spec.knowledgePointId)
    || question?.relation !== spec.relation
  )) {
    errors.push("P05F18_IDENTITY_OR_RELATION_INVALID");
  }
  if (question?.questionMode !== "diagram" || question?.mode !== "diagram") errors.push("P05F18_MODE_INVALID");

  const diagram = question?.geometryDiagram;
  if (!diagram || diagram.kind !== "cube_cuboid_elements_diagram") {
    errors.push("P05F18_DIAGRAM_MISSING");
  } else {
    if (
      !PROFILES.includes(diagram.profileIndex)
      || !SCALES.includes(diagram.scale)
      || !SHIFTS.includes(diagram.shiftX)
      || !Number.isInteger(diagram.highlightIndex)
      || diagram.highlightIndex < 0
      || diagram.highlightIndex > 7
    ) {
      errors.push("P05F18_DIAGRAM_GEOMETRY_INVALID");
    }
    if (diagram.diagramMode !== "DISTINGUISH_CUBE_CUBOID" || !new Set(["CUBE", "CUBOID"]).has(diagram.solidType)) {
      errors.push("P05F18_DIAGRAM_MODE_INVALID");
    }
    const expectedTargetElement = targetElementForSpec(spec);
    if (!TARGET_ELEMENTS.has(diagram.targetElement) || (spec && diagram.targetElement !== expectedTargetElement)) {
      errors.push("P05F18_DIAGRAM_TARGET_ELEMENT_INVALID");
    }
    if (
      diagram.faceCount !== 6
      || diagram.edgeCount !== 12
      || diagram.vertexCount !== 8
      || diagram.allEdgesEqual !== (diagram.solidType === "CUBE")
      || diagram.allFacesSquares !== (diagram.solidType === "CUBE")
    ) {
      errors.push("P05F18_DIAGRAM_STRUCTURE_INVALID");
    }
    if (spec) {
      const requiredSolid = solidFor(spec, 0);
      if (spec.relation.startsWith("RELATE_CUBOID") && diagram.solidType !== requiredSolid) {
        errors.push("P05F18_CUBOID_EDGE_INVARIANT_INVALID");
      }
      if (spec.relation === "RECOGNIZE_CUBE_TWELVE_EQUAL_EDGES" && diagram.solidType !== "CUBE") {
        errors.push("P05F18_CUBE_EDGE_INVARIANT_INVALID");
      }
      if (question.promptText !== promptFor(spec, diagram.solidType)) errors.push("P05F18_PROMPT_INVALID");
      if (question.answerText !== answerFor(spec)) errors.push("P05F18_ANSWER_INVALID");
    }
    if (question.questionSignature !== signatureFor(question)) errors.push("P05F18_SIGNATURE_INVALID");
  }

  for (const term of FORBIDDEN) {
    if (`${question?.promptText ?? ""} ${question?.answerText ?? ""}`.includes(term)) {
      errors.push(`P05F18_FORBIDDEN_TERM:${term}`);
    }
  }

  const metadata = question?.metadata;
  const knowledgePointId = question?.knowledgePointId;
  if (
    !Array.isArray(metadata?.sourcePages)
    || metadata.sourcePages.join(",") !== "1,2"
    || metadata?.edgeLengthRelationUsed !== (knowledgePointId === G5A_U10A1_P05F18_EDGE_KP_ID)
    || metadata?.faceRelationshipUsed !== (knowledgePointId === G5A_U10A1_P05F18_FACE_KP_ID)
    || metadata?.existingElementIdentityCountTargetUsed !== false
    || metadata?.netUsed !== false
    || metadata?.broaderSpatialReasoningUsed !== false
    || metadata?.solidMeasurementOrFormulaUsed !== false
    || metadata?.applicationContextUsed !== false
    || metadata?.q019OrLaterTouched !== false
  ) {
    errors.push("P05F18_PROVENANCE_INVALID");
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function generateG5AU10A1P05F18Questions(options = {}) {
  const target = targetFromOptions(options);
  if (target === "AMBIGUOUS") {
    return Object.freeze({
      ok: false,
      questions: Object.freeze([]),
      errors: Object.freeze(["P05F18_MIXED_KP_NOT_ADMITTED"]),
      warnings: Object.freeze([]),
    });
  }
  if (!target) {
    return Object.freeze({
      ok: false,
      questions: Object.freeze([]),
      errors: Object.freeze(["P05F18_TARGET_KP_REQUIRED"]),
      warnings: Object.freeze([]),
    });
  }

  const count = Number.isInteger(options.questionCount)
    ? options.questionCount
    : Number.isInteger(options.count)
      ? options.count
      : 20;
  if (count < 1 || count > 240) {
    return Object.freeze({
      ok: false,
      questions: Object.freeze([]),
      errors: Object.freeze(["P05F18_QUESTION_COUNT_OUT_OF_RANGE"]),
      warnings: Object.freeze([]),
    });
  }

  const specs = selectedSpecs(options, target);
  if (!specs?.length) {
    return Object.freeze({
      ok: false,
      questions: Object.freeze([]),
      errors: Object.freeze(["P05F18_PATTERN_SPEC_SELECTION_INVALID"]),
      warnings: Object.freeze([]),
    });
  }

  const sequence = new Map(specs.map((spec) => [spec.patternSpecId, 0]));
  const questions = [];
  for (let index = 0; index < count; index += 1) {
    const spec = specs[index % specs.length];
    const sequenceIndex = sequence.get(spec.patternSpecId);
    sequence.set(spec.patternSpecId, sequenceIndex + 1);
    questions.push(questionFor(spec, sequenceIndex, options.generationSeed ?? "p05f18-public"));
  }

  const errors = questions.flatMap((question) => validateG5AU10A1P05F18Question(question).errors);
  const signatures = questions.map((question) => question.questionSignature);
  if (new Set(signatures).size !== signatures.length) errors.push("P05F18_DUPLICATE_QUESTION_SIGNATURE");

  return Object.freeze({
    ok: errors.length === 0,
    questions: Object.freeze(questions),
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    allocation: Object.freeze(specs.map((spec) => Object.freeze({
      patternSpecId: spec.patternSpecId,
      count: questions.filter((question) => question.patternSpecId === spec.patternSpecId).length,
    }))),
    maxQuestionCount: 240,
    targetKnowledgePointId: target,
  });
}
