console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, Utils} from "../../common/index.js";

export class DtgActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
    static get PARTS() {
        return {
            //content: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/missing.hbs` }
            content: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/base.hbs` },
            debug: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/debug.hbs` },
        };
    }

    static get DEFAULT_OPTIONS() {
        // merge with parent defaults at access time (safe for CONSTANTS)
        const base = super.DEFAULT_OPTIONS;
        return Utils.mergeObjects(
            base,
            {
                id: `${CONSTANTS.SYSTEM_ID}-${this.name}-{id}`,
                classes: Utils.unique([...base.classes ?? [], 'application', 'sheet', 'actor', CONSTANTS.SYSTEM_ID]),
                tag: 'form',
                frame: true,
                positioned: true,
                window: { contentClasses: Utils.unique([...(base.window ?? {}).contentClasses ?? [], 'standard-form']), title: 'Missing Title' },
                form: { submitOnChange: true, closeOnSubmit: false }
            }
        );
    }

    get title(){
        return Utils.localize(this.options.window.title ?? 'Missing Title');
    }

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        return {
            ...ctx,
            system: this.document.system,
            systemFields: this.document.system.schema.fields,
            debug: false
        };
    }
}