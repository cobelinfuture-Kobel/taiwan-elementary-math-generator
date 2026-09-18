export * from "./public-ui-capability-binding-p04f33-base.js";
import * as base from "./public-ui-capability-binding-p04f33-base.js";
import * as current from "./public-ui-capability-binding-p06f05.js";
const active=()=>typeof document!=="undefined";
export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION=base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT=base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES=base.PUBLIC_UI_SURFACES;
export const resolvePublicUiCapabilityBinding=(input={})=>active()?current.resolvePublicUiCapabilityBinding(input):base.resolvePublicUiCapabilityBinding(input);
export const auditPublicUiCapabilityBinding=()=>active()?current.auditPublicUiCapabilityBinding():base.auditPublicUiCapabilityBinding();
