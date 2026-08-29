import {parseQueryState as parseP04F10QueryState,writeQueryStateFromState} from "./query-state-p04f10.js";
import {BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,getVisiblePatternGroupsForKnowledgePoint} from "../../../modules/curriculum/registry/batch-a-selector-p04f26-extension.js";
const latestSelectorAccess=Object.freeze({getSelectorAvailability:()=>BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,getVisiblePatternGroupsForKnowledgePoint});
export function parseQueryState(search=window.location.search,options={}){return parseP04F10QueryState(search,{...options,selectorAccess:options.selectorAccess??latestSelectorAccess});}
export{writeQueryStateFromState};
