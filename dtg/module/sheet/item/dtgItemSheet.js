import {CONSTANTS, Mixins} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class DtgItemSheet extends Mixins.DtgSheet(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)) {
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
        return `systems/${CONSTANTS.SYSTEM_ID}/template/sheet/${doctype}.hbs`;
    }

    static get DEFAULT_OPTIONS() {
        return { classes: ['item'] };
    }

    async templateExists(path) {
        if (!path) return false;
        try { await foundry.applications.handlebars.getTemplate(path); return true; }  // compiles & caches
        catch { return false; }
    }

    async render(opts = {}) {
        if (this.constructor._hasSpecific === undefined) {
            const specPath = this.constructor.SPECIFIC_PATH;
            this.constructor._hasSpecific = await this.templateExists(specPath);
        }
        return super.render(opts);
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        options.parts = ["base"];
        if (this.constructor._hasSpecific) {options.parts.push("specific");}
        if(game.user && game.user.isGM) {
            options.parts.push("debug");
        }
    }

}