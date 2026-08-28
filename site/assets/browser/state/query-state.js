import {parseQueryState as parseP04F9QueryState,writeQueryStateFromState} from "./query-state-p04f9.js";
import {BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,getVisiblePatternGroupsForKnowledgePoint} from "../../../modules/curriculum/registry/batch-a-selector-p04f10-extension.js";
const latestSelectorAccess=Object.freeze({getSelectorAvailability:()=>BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,getVisiblePatternGroupsForKnowledgePoint});
export function parseQueryState(search=window.location.search,options={}){return parseP04F9QueryState(search,{...options,selectorAccess:options.selectorAccess??latestSelectorAccess});}
export{writeQueryStateFromState};
