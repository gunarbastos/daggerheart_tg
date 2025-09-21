import {CONSTANTS, Mixins} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class DtgActorSheet extends Mixins.DtgSheet(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)) {
    static get PARTS() {
        return {
            content: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/base.hbs` },
            debug: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/debug.hbs` },
        };
    }

    static get DEFAULT_OPTIONS() {
        return {
                classes: ['actor'],
            };
    }
}