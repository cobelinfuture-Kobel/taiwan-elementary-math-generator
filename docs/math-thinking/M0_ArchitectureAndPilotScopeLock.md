# MathThinking M0 — Architecture and Scope Lock

## Frozen goal
Introduce an independent 「數學思維」 route beside Classic and 考券模板, without replacing or mutating Taiwan curriculum source/KP authority. Ship a tiny **original**, independently validated sum–difference prototype as an engineering vertical slice. M0 is an architecture contract; the pilot does **not** grant curricular admission.

## Three hard rules
1. **Development order != learning order**. We can implement 和差 first, but the default learner journey begins with quantity comparison / bar representation and equalising transfer. Subsequent unlocks require verified prerequisite capabilities; labels alone must not unlock.
2. **Model-based original generation**. The third-party Drive PDFs are supplementary mathematical evidence only. Never copy a question, answer diagram, answer-page arrangement, wording, branded layout, or images into the public website. Regenerate original scenarios from a clean canonical invariant, retain source provenance separately, and run similarity / rights review before any wider release.
3. **Parameterised SVG**. A single validated model drives the problem statement, solution witness, and diagram widths. Generative bitmap artwork is not a source of measurement or mathematical truth. Question and answer must remain correct for every seed and print mode.

## Isolation / ownership
- Existing curriculum files and existing canonical KP IDs remain authoritative, unmodified.
- New M0 contract lives under data/math-thinking/. New route lives under site/math-thinking/.
- Only site/index.html gains a new navigation link.
- This pilot uses its own leaf generator / validator / SVG projection. It does not silently register routes in the shared Taiwan curriculum selector, copy the school-exam renderer, or update shared runtime.
- Future reuse of common worksheet mechanisms requires an explicit compatibility contract and a separate scoped task.

## Learning competency path (draft, not publicly unlocked)
- Quantity comparison & equal-size segments
- Transfer equalisation / difference halves
- Sum–difference two-group model (pilot)
- Sum–ratio / difference–ratio
- Equivalent substitution
- Age difference with time invariant

Each transition requires mastered prerequisite nodes or an alternate approved pretest. An available implemented generator is not evidence of learning readiness.

## Pilot mathematical contract
For each question choose positive integers b (small) and d (difference), compute a=b+d, S=a+b.
- Statement: two groups with total S and difference d; solve for a and b.
- Witness: b=(S-d)/2, a=b+d.
- Validator: integer positivity, 0<d<S, parity (S-d)%2=0, a+b=S, a-b=d, label/answer consistency.
- Diagram: two bars share a baseline of width proportional to b; large bar extends by width proportional to d; totals/labels reflect generated numbers.
- Print: A4 questions, optional answer sheet, page-safe blocks.

## Curriculum bridge (future, frozen closed)
Candidate target units: G3B_U04 basic two-step, G4A_U08 integer operations.
Bridge is a separately governed mapping, not a data copy or a KP identity alias. Every admission needs Taiwan curriculum source evidence, prerequisite analysis, original question review, determinstic answer validation, SVG/print QA, rights check, and explicit approval. Zero Taiwan curriculum KP added in this pilot.

## Exclusions
No importing all twelve PDFs, no copy/paste textbook problems, no editing G4A_U08 existing KP, no altering shared Generator/Validator/Renderer/route selectors, no replacing exam-template, no automatic student unlock, no broad grade coverage claims.

## Pilot acceptance
- Pure tests demonstrate reproducible seed, distinct questions, positive integer answers, source-neutral text, correct bars and independent validation.
- New browser route builds and is reachable from Classic. Layout can be printed A4 with optional answer key.
- Existing source/KP data and existing routes remain unchanged. Full-site regression and deployed browser acceptance are separately recorded; do not claim D0 on focused-only evidence.

## Continuation
Once the pilot is green: verify deployed Pages targeted E2E for /math-thinking/, then add a prerequisite readiness check (not the next whole topic), and only then consider adding 移多補少 as a learner-facing prerequisite implementation.
