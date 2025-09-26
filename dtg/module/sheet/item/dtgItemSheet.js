import {CONSTANTS, Mixins, Utils} from "../../common/index.js";
//import DragDrop from "../../applications/ux/drag-drop.mjs";
//import TextEditor from "../ux/text-editor.mjs";

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

    async _onRender(context, options) {
        await super._onRender(context, options);
        new foundry.applications.ux.DragDrop.implementation({
            dragSelector: ".draggable",
            permissions: {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            },
            callbacks: {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
        }).bind(this.element);
    }

    _canDragStart(selector) {
        return this.isEditable;
    }

    _canDragDrop(selector) {
        return this.isEditable;
    }

    async _onDragStart(event) {
        const target = event.currentTarget;
        if ( "link" in event.target.dataset ) return;
        let dragData;

        // Owned Items
        if ( target.dataset.itemId ) {
            const item = this.actor.items.get(target.dataset.itemId);
            dragData = item.toDragData();
        }

        // Active Effect
        if ( target.dataset.effectId ) {
            const effect = this.actor.effects.get(target.dataset.effectId);
            dragData = effect.toDragData();
        }

        // Set data transfer
        if ( !dragData ) return;
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    _onDragOver(event) {}

    async _onDrop(event) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        // Dropped Documents
        const documentClass = foundry.utils.getDocumentClass(data.type);
        if ( documentClass ) {
            const document = await documentClass.fromDropData(data);
            await this._onDropDocument(event, document);
        }
    }

    async _onDropDocument(event, document) {
        switch ( document.documentName ) {
            case "Item":
                return this._onDropItem(event, /** @type Item */ document);
        }
    }


    async _onDropItem(event, dropped){
        return null;
    }

}