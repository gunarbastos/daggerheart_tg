console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, DtgEngine, Utils} from "../../common/index.js";

export class DtgItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    /** lazily computed on first render */
    static _hasSpecific = undefined;

    static get PARTS() {
        let specific = {}
        if(this._hasSpecific){ specific = {specific: { template: this.SPECIFIC_PATH }} }
        return {
            ...specific,
            base: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/base.hbs` },
            debug: { template: `systems/${CONSTANTS.SYSTEM_ID}/template/debug.hbs` },
        }
    }

    static get SPECIFIC_PATH() {
        let doctype = this.DOCTYPE ?? "";
        if(!(doctype === "")) {
            doctype = doctype.charAt(0).toLowerCase() + doctype.slice(1);
        }
        return `systems/${CONSTANTS.SYSTEM_ID}/template/${doctype}.hbs`;
    }

    static get DEFAULT_OPTIONS() {
        // merge with parent defaults at access time (safe for CONSTANTS)
        const base = super.DEFAULT_OPTIONS;
        return Utils.mergeObjects(
            base,
            {
                id: `${CONSTANTS.SYSTEM_ID}-${this.name}-{id}`,
                classes: Utils.unique([...base.classes ?? [], 'base-sheet', 'application', 'sheet', 'item', CONSTANTS.SYSTEM_ID]),
                actions: {
                    rollDuality: DtgItemSheet.#onClickDualityBasic,
                },
                tag: 'form',
                frame: true,
                positioned: true,
                window: { contentClasses: [...(base.window ?? {}).contentClasses ?? [], 'standard-form'], title: 'Missing Title', resizable: true, },
                form: { submitOnChange: true, closeOnSubmit: false },
            }
        );
    }

    async templateExists(path) {
        if (!path) return false;
        try { await foundry.applications.handlebars.getTemplate(path); return true; }  // compiles & caches
        catch { return false; }
    }

    async render(opts = {}) {
        //checking before render if file exists
        if (this.constructor._hasSpecific === undefined) {
            const specPath = this.constructor.SPECIFIC_PATH;
            this.constructor._hasSpecific = await this.templateExists(specPath);
        }
        return super.render(opts);
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // DOM order = visual order (CSS grid will place them)
        options.parts = ["base"];
        if (this.constructor._hasSpecific) {options.parts.push("specific");}
        options.parts.push("debug");
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

    static async #onClickDualityBasic(event) {
        event.preventDefault();

        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice empty');
        await DtgEngine.dualityRoll({});
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus number');
        await DtgEngine.dualityRoll({bonus: 5});
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus formula');
        await DtgEngine.dualityRoll({bonus: "4d4"});
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus object');
        await DtgEngine.dualityRoll({
            bonus: {
                ['primeiro bonus']: 5,
                ['segundo bonus']: "2d10",
            }
        });
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus array');
        await DtgEngine.dualityRoll({
            bonus: [
                25,
                "4d8",
                {formula: "2d12kh1", description: "terceiro bonus"},
            ]
        });
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus array + advantage');
        await DtgEngine.dualityRoll({
            bonus: [
                25,
                "4d8",
                {formula: "2d12kh1", description: "terceiro bonus"},
            ],
            advDisad: CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE
        });
        Utils.log('---------------------------------------------------------------------------------------------------');
        Utils.log('DtgEngine.dualityDice bonus array + disadvantage');
        await DtgEngine.dualityRoll({
            bonus: [
                25,
                "4d8",
                {formula: "2d12kh1", description: "terceiro bonus"},
            ],
            advDisad: CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE
        });
    }

}