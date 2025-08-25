console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, DtgEngine, Utils} from "../../common/index.js";

export class DtgActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
    static get PARTS() {
        return {
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
                actions: {
                    rollDuality: DtgActorSheet.#onClickDualityBasic,
                    notYetImplemented: DtgActorSheet._notYetImplemented,
                    rollDamage: DtgActorSheet.#rollDamage,
                },
                tag: 'form',
                frame: true,
                positioned: true,
                window: {
                    contentClasses: Utils.unique([...(base.window ?? {}).contentClasses ?? [], 'standard-form']),
                    title: 'Missing Title' },
                form: { submitOnChange: true, closeOnSubmit: false }
            }
        );
    }

    get title(){
        return Utils.localize(this.options.window.title ?? 'Missing Title');
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        return {
            ...base,
            system: this.document.system,
            systemFields: this.document.system.schema.fields,
            CONSTANTS: CONSTANTS,
        };
    }

    static async #onClickDualityBasic(event) {
        event.preventDefault();
        const rolledTrait = event.target.dataset.trait;
        const rollMod = this.document.getFlag(CONSTANTS.SYSTEM_ID, "rollMod") ?? "";
        return await DtgEngine.dualityRoll({
            bonus:{
                [rolledTrait]: this.document.system.traits[rolledTrait],
            },
            advDisad: rollMod
        });
    }

    static async #rollDamage(event) {
        event.preventDefault();
        const rollFormula = event.target.dataset.formula;
        const rollType = event.target.dataset.type;
        return await DtgEngine.damageRoll(rollFormula, rollType);
    }

    static async _notYetImplemented(event) {
        ui.notifications.warn("Not implemented yet.");
    }
}