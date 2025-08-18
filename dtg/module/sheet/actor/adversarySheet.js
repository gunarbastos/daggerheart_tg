import {CONSTANTS, Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

import {DtgActorSheet} from "./dtgActorSheet.js";

export class AdversarySheet extends DtgActorSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.ADVERSARY}`]),

        };
    }
}