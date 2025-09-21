import {CONSTANTS, Utils} from "../../common/index.js";
import {DtgActorSheet} from "./dtgActorSheet.js";

console.log(`Loaded: ${import.meta.url}`);

export class EnvironmentSheet extends DtgActorSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.ENVIRONMENT}`]),

        };
    }
}