import {CONSTANTS, Utils} from "./";
import {DTGActorDocument} from "../document/actor";
import {DTGItemDocument} from "../document/item";

export class DTGHooks {

    static registerHooks(){
        this.#registerInitHooks();
        this.#registerDocumentHooks();
    }

    //#region Individual Registrations
    static #registerInitHooks() {
        Hooks.once("init", this.#onInit);
        Hooks.once("ready", this.#onReady);
    }

    static #registerDocumentHooks() {
        // Actor lifecycle
        Hooks.on("createActor", this.#onActorCreated);
        Hooks.on("updateActor", this.#onActorUpdated);
        Hooks.on("deleteActor", this.#onActorDeleted);

        // Item lifecycle
        Hooks.on("createItem", this.#onItemCreated);
        Hooks.on("updateItem", this.#onItemUpdated);
        Hooks.on("deleteItem", this.#onItemDeleted);
    }

    //!!!!These hooks should not be used unless there is no other way to put the behaviour in the Sheet using the default lifecycle methods
    static #registerSheetHooks() {
        for (const sheetDef of [
            ...CONSTANTS.SHEETS.ACTORS,
            ...CONSTANTS.SHEETS.ITEMS
        ]) {
            const cls = sheetDef.class;
            const name = cls.name; // e.g., "FeatureSheet"

            const hookMap = {
                render: "onRender", // Fires after the sheet is rendered
                close: "onClose",   // Fires after the sheet is closed
                getHeaderButtons: "onGetHeaderButtons", // Modifies header buttons before rendering

                // Pre-open/close hooks
                preRender: "onPreRender", // Fires just before rendering (rarely used)
                preClose: "onPreClose",   // Fires just before closing

                // Sheet-specific configuration/data manipulation
                getData: "onGetData",       // Fires before data context is passed to Handlebars
                activateListeners: "onActivateListeners", // Fires after render to bind events
                setPosition: "onSetPosition",             // When setting sheet position
                _render: "onRenderInternal",              // Low-level render
                _renderInner: "onRenderInner",            // Rarely used internal hook
                submit: "onSubmit",                       // When submitting the form
                _getSubmitData: "onGetSubmitData",        // Just before form submission
                _onChangeInput: "onChangeInput",          // On any form input change
                _onChangeTab: "onChangeTab",              // On tab change
            };

            for (const [hook, method] of Object.entries(hookMap)) {
                const hookName = `${hook}${cls.name}`;
                if (typeof cls[method] === "function") {
                    Hooks.on(hookName, (...args) => cls[method](...args));
                }
            }
        }
    }
    //#endregion

    //#region Init Hooks
    static #onInit(){
        // Document overrides
        CONFIG.Actor.documentClass = DTGActorDocument;
        CONFIG.Item.documentClass = DTGItemDocument;

        // Sheet registrations
        const actors = foundry.documents.collections.Actors;
        const items = foundry.documents.collections.Items;

        Utils.registerSheets(actors, CONSTANTS.SHEETS.ACTORS);
        Utils.registerSheets(items, CONSTANTS.SHEETS.ITEMS);

        this.#registerSettings();
    }
    
    static #onReady(){
        this.#registerSheetHooks();
    }
    //#endregion

    //#region Actor Hooks
    /** @param {Actor} actor */
    static #onActorCreated(actor) {
        // Optional: add logic for when actors are created
    }

    /** @param {Actor} actor */
    static #onActorUpdated(actor) {
        Utils.invalidateDocument(actor.uuid);
    }

    /** @param {Actor} actor */
    static #onActorDeleted(actor) {
        Utils.invalidateDocument(actor.uuid);
    }
    //#endregion

    //#region Item Hooks
    static #onItemCreated(item) {
        // Optional: preload or analyze features on creation
    }

    /** @param {Item} item */
    static #onItemUpdated(item) {
        Utils.invalidateDocument(item.uuid);
    }

    /** @param {Item} item */
    static #onItemDeleted(item) {
        Utils.invalidateDocument(item.uuid);
    }
    //#endregion

    //#region Auxiliary Functions
    static #registerSettings(){
        
    }
    //#endregion
}