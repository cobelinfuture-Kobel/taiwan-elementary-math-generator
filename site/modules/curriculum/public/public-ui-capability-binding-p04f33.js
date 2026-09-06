export * from "./public-ui-capability-binding-p04f33-base.js";
import * as base from "./public-ui-capability-binding-p04f33-base.js";
import * as current from "./public-ui-capability-binding-p05f11.js";
const currentBrowserBindingActive=()=>typeof document!=="undefined";
export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION=base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT=base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES=base.PUBLIC_UI_SURFACES;
export function resolvePublicUiCapabilityBinding(input={}){return currentBrowserBindingActive()?current.resolvePublicUiCapabilityBinding(input):base.resolvePublicUiCapabilityBinding(input);}
export function auditPublicUiCapabilityBinding(){return currentBrowserBindingActive()?current.auditPublicUiCapabilityBinding():base.auditPublicUiCapabilityBinding();}
