import {CONSTANTS, Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

import {DtgItemSheet} from "./dtgItemSheet.js";

export class CommunitySheet extends DtgItemSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ITEM_TYPES.COMMUNITY}`]),

        };
    }

    static get DOCTYPE() {
        return CONSTANTS.ITEM_TYPES.COMMUNITY;
    }
}