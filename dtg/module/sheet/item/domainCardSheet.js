import {CONSTANTS, Utils} from "../../common/index.js";
import {DtgItemSheet} from "./dtgItemSheet.js";

console.log(`Loaded: ${import.meta.url}`);

export class DomainCardSheet extends DtgItemSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ITEM_TYPES.DOMAIN_CARD}`]),

        };
    }

    static get DOCTYPE() {
        return CONSTANTS.ITEM_TYPES.DOMAIN_CARD;
    }
}