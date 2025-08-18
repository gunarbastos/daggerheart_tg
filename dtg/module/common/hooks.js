
console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";
import {DtgEngine} from "./dtgEngine.js";
import {ChatLogPatch} from "../patches/index.js";
import {BaseDataModel} from "./baseDataModel.js";
import {InventoryItemDataModel} from "./inventoryItemDataModel.js";
import {_DO_NOT_USE_LANG} from "./language.js";
import {DTGActorDocument} from "../document/actor/index.js";
import {DTGItemDocument} from "../document/item/index.js";

export class DTGHooks {

    static registerHooks(){
        DTGHooks.#registerInitHooks();
        DTGHooks.#registerDocumentHooks();
    }

    //#region Individual Registrations
    static #registerInitHooks() {
        Hooks.once("init", DTGHooks.#onInit);
        Hooks.once("ready", DTGHooks.#onReady);
    }

    static #registerDocumentHooks() {
        // Actor lifecycle
        Hooks.on("createActor", DTGHooks.#onActorCreated);
        Hooks.on("updateActor", DTGHooks.#onActorUpdated);
        Hooks.on("deleteActor", DTGHooks.#onActorDeleted);

        // Item lifecycle
        Hooks.on("createItem", DTGHooks.#onItemCreated);
        Hooks.on("updateItem", DTGHooks.#onItemUpdated);
        Hooks.on("deleteItem", DTGHooks.#onItemDeleted);
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
        Utils.log(`#onInit`);
        //Internal Setup
        Utils.log('initializing internal data');
        Utils.localizeLangTree(_DO_NOT_USE_LANG, game.i18n.lang);
        Utils.deepFreeze(_DO_NOT_USE_LANG);
        Utils.deepFreeze(CONSTANTS);

        game.dtg ??= {};
        game.dtg.dualityRoll = async (opts = {}) => await DtgEngine.dualityRoll(opts);
        game.dtg.dualityDice = async (opts = {}) => await DtgEngine.dualityDice(opts);
        game.dtg.constants = CONSTANTS;
        game.dtg.apps ??= {};

        ChatLogPatch.enableDdSlash();

        // Document overrides
        CONFIG.Actor.documentClass = DTGActorDocument;
        CONFIG.Item.documentClass = DTGItemDocument;

        //Not sure if needed
        CONFIG.Actor.DataModel = BaseDataModel;
        CONFIG.Item.DataModel = BaseDataModel;

        Utils.log('registering data models');
        // Data Model registrations
        Object.assign(CONFIG.Actor.dataModels, CONSTANTS.DATA_MODELS.ACTORS);
        Object.assign(CONFIG.Item.dataModels, CONSTANTS.DATA_MODELS.ITEMS);

        Utils.log('registering sheets');
        // Sheet registrations
        const actors = foundry.documents.collections.Actors;
        const items = foundry.documents.collections.Items;

        DTGHooks.#registerSheets(actors, CONSTANTS.SHEETS.ACTORS);
        DTGHooks.#registerSheets(items, CONSTANTS.SHEETS.ITEMS);

        //Hooks.on("chatMessage", DTGHooks.#onChatMessage);

        //DTGHooks.#registerSettings();
        Utils.log(`#onInit end`);
    }
    
    static #onReady(){
        Utils.log(`#onReady`);
        Utils.log(`registering handlebar helpers`);
        Utils.registerCommonHelpers();

        //DTGHooks.#registerSheetHooks();
        Utils.log(`#onReady end`);
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

    static async #onChatMessage (_log, messageText, chatData) {
        if (/^\/dd\b/i.test(messageText)) {
            const options = {};
            const roll = await DtgEngine.dualityRoll({...options, postToChat: false});
            const content = await foundry.applications.handlebars.renderTemplate(roll.template, {
                roll: roll
            });

            ChatLog.prototype.processMessage

            await ChatMessage.create({
                content
            });

            return false; // prevent default handling
        }

        return true;
    }

    static #registerSheets(collection, sheetList) {
        console.log(`registerSheets start`);
        if(collection.sheetClasses && collection.sheetClasses[CONSTANTS.CORE_ID]){
            console.log(`unregistering Sheets`);
            for (const sheetId in collection.sheetClasses[CONSTANTS.CORE_ID]) {
                collection.unregisterSheet(CONSTANTS.CORE_ID, collection.sheetClasses[CONSTANTS.CORE_ID][sheetId].cls);
            }
        }
        for(const sheet of sheetList ?? []){
            console.log(`registering Sheet ${sheet.class.name} for ${sheet.types} with label ${sheet.label}`);
            collection.registerSheet(CONSTANTS.SYSTEM_ID, sheet.class, {
                types: sheet.types,
                label: sheet.label.en,
                makeDefault: sheet.default,
            });
        }
        console.log(`registerSheets end`);
    }
    //#endregion
}