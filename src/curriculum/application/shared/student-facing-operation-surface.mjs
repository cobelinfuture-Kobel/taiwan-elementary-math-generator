// Authoritative student-facing surface entry point.
// Numeric items use W02 A08R3 semantic revision 4 with full-cohort operation-role contracts.
// Application and PBL surfaces retain revision 3.
export {
  applyStudentFacingOperationSurface,
  validateStudentFacingOperationSurface,
  instantiateStudentFacingPblTaskSet,
  validateStudentFacingPblTaskSet
} from './student-facing-numeric-full-cohort-adapter-v4.mjs';
