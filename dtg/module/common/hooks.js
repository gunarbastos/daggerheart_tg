console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";
import {DtgEngine} from "./dtgEngine.js";
import {ChatLogPatch} from "../patches/index.js";
import {BaseDataModel} from "./baseDataModel.js";
import {InventoryItemDataModel} from "./inventoryItemDataModel.js";
import {_DO_NOT_USE_LANG} from "./language.js";
import {
    DTGActorDocument,
    AdversaryDocument,
    EnvironmentDocument,
    PlayerDocument} from "../document/actor/index.js";
import {
    ClassDocument,
    DomainCardDocument,
    DomainDocument,
    DTGItemDocument, FeatureDocument,
    FeatureItemDocument,
    InventoryItemDocument,
    SubclassDocument
} from "../document/item/index.js";
import {FearTrackerApp} from "../app/index.js";

export class DTGHooks {

    static registerHooks(){
        DTGHooks.#registerInitHooks();
        DTGHooks.#registerDocumentHooks();
    }

    //#region Individual Registrations
    static #registerInitHooks() {
        Hooks.once("init", DTGHooks.#onInit);
        Hooks.once("ready", DTGHooks.#onReady);
        Hooks.on("getSceneControlButtons", DTGHooks.#getSceneControlButtons);
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

        DTGHooks.#registerSettings();

        game.dtg.apps.fearTracker = new FearTrackerApp();

        Utils.log(`#onInit end`);
    }
    
    static async #onReady(){
        Utils.log(`#onReady`);
        Utils.log(`registering handlebar helpers`);
        Utils.registerCommonHelpers();

        Utils.log('registering Document Classes');
        game.dtg.documents = {};
        game.dtg.documents.FeatureItemDocument = FeatureItemDocument;
        game.dtg.documents.FeatureDocument = FeatureDocument;
        game.dtg.documents.InventoryItemDocument = InventoryItemDocument;
        game.dtg.documents.ClassDocument = ClassDocument;
        game.dtg.documents.DomainDocument = DomainDocument;
        game.dtg.documents.DomainCardDocument = DomainCardDocument;
        game.dtg.documents.SubclassDocument = SubclassDocument;

        game.dtg.documents.PlayerDocument = PlayerDocument;
        game.dtg.documents.AdversaryDocument = AdversaryDocument;
        game.dtg.documents.EnvironmentDocument = EnvironmentDocument;


        Utils.log('preloading templates');
        for(const template of Object.values(CONSTANTS.TEMPLATES) ) {
            if( typeof template !== 'object' || Array.isArray(template)) { continue; }
            if(template.hasOwnProperty('PRELOAD') && template.PRELOAD === true) {
                foundry.applications.handlebars.getTemplate(template.PATH).then( result => {
                    Utils.log('preloaded ', template.PATH);
                    if(template.hasOwnProperty('ALIAS')) {
                        Handlebars.registerPartial(template.ALIAS, result);
                        Utils.log(`Alias ${template.ALIAS} created for ${template.PATH}`);
                    }
                });
            }
        }

        if(game.dtg.apps.fearTracker.userCanSee()) {
            ui.controls.controls.dtg.tools.fearTracker = await DTGHooks.#getFearTrackerToolsEntry();
            if(await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_IS_OPEN.id) === true)
                await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }

        if(ui.controls.controls.dtg?.tools?.fearTracker ?? false){
            ui.controls.controls.dtg.tools.fearTracker.active = game.dtg.apps.fearTracker.rendered;
        }
        ui.controls.render({force : true});

        //DTGHooks.#registerSheetHooks();
        Utils.log(`#onReady end`);
    }

    static async #getSceneControlButtons(controls = []){
        if (!game?.user) return;

        controls[CONSTANTS.SYSTEM_ID] = {
            name: CONSTANTS.SYSTEM_ID,
            title: CONSTANTS.SYSTEM_ID,
            icon: "fas fa-dragon",     // pick any FA icon you like
            tools: {
                ph: {
                    name: "placeholder",
                    title: "placeholder",
                    icon: "fas fa-search",
                    button: true,
                }
            },
            order: 0,
        };

        // Add the Fear Tracker toggle
        /*const fearTracker = {
            name: "fearTracker",
            title: "Fear Tracker",
            icon: "fas fa-skull",
            toggle: true,
            visible: game.user.hasRole(CONST.USER_ROLES.GAMEMASTER) || (await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_ASSISTANT_CAN_EDIT.id) && game.user.hasRole(CONST.USER_ROLES.ASSISTANT)) ||  await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.id),
            active: game.dtg.apps.fearTracker.rendered,
            onChange: (event, active) => {
                const app = game.dtg.apps.fearTracker;
                if (active) {
                    app.render(true);
                } else {
                    app.close();
                }
            },
        };
        controls.dtg.tools.fearTracker = fearTracker;
         */
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
        Utils.log(`#registerSettings`);
        for(const setting of Object.values(CONSTANTS.SETTINGS)) {
            Utils.log(`registering setting`, setting.id);
            const finalSetting = Utils.deepClone(setting);
            delete finalSetting.id;
            const hasMethod = typeof this[`${setting.id}OnChange`] === 'function';
            if(hasMethod === true) {
                finalSetting.onChange = this[`${setting.id}OnChange`];
            }
            game.settings.register(CONSTANTS.SYSTEM_ID, setting.id, finalSetting);
        }
    }

    static async FEAR_MAXIMUMOnChange(value){
        const currFear = await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id);
        if(currFear > value){
            await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id, value);
        }

        if(game.dtg.apps.fearTracker.rendered){
            game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }
    }

    static async FEAR_CURRENTOnChange(value){
        const maxFear = await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_MAXIMUM.id);
        if(value > maxFear){
            await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id, maxFear);
        }

        if(game.dtg.apps.fearTracker.rendered){
            await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }
    }

    static async FEAR_ASSISTANT_CAN_EDITOnChange(value){
        if(game.dtg.apps.fearTracker.rendered){
            await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }
    }

    static async FEAR_PLAYERS_CAN_SEEOnChange(value){
        if(game.dtg.apps.fearTracker.userCanSee()){
            ui.controls.controls.dtg.tools.fearTracker = await DTGHooks.#getFearTrackerToolsEntry();

            if(game.dtg.apps.fearTracker.rendered){
                await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
            }
        } else {
            if(value === false) {
                delete ui.controls.controls.dtg.tools.fearTracker;
                if(game.dtg.apps.fearTracker.rendered){
                    await game.dtg.apps.fearTracker.close({persistConfigs: false});
                }
            }
            if(value === true){
                ui.controls.controls.dtg.tools.fearTracker = await DTGHooks.#getFearTrackerToolsEntry();
                if(game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_IS_OPEN.id) === true){
                    await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
                }
            }
        }

        ui.controls.render();
    }

    static async #getFearTrackerToolsEntry(){
        return  {
            name: "fearTracker",
            title: "Fear Tracker",
            icon: "fas fa-skull",
            toggle: true,
            visible: game.dtg.apps.fearTracker.userCanSee(),
            active: game.dtg.apps.fearTracker.rendered,
            onChange: (event, active) => {
                const app = game.dtg.apps.fearTracker;
                if (active) {
                    app.render({force: true}, {});
                } else {
                    app.close({});
                }
            },
        }
    }

    static #registerSheets(collection, sheetList) {
        if(collection.sheetClasses && collection.sheetClasses[CONSTANTS.CORE_ID]){
            for (const sheetId in collection.sheetClasses[CONSTANTS.CORE_ID]) {
                collection.unregisterSheet(CONSTANTS.CORE_ID, collection.sheetClasses[CONSTANTS.CORE_ID][sheetId].cls);
            }
        }
        for(const sheet of sheetList ?? []){
            collection.registerSheet(CONSTANTS.SYSTEM_ID, sheet.class, {
                types: sheet.types,
                label: sheet.label.en,
                makeDefault: sheet.default,
            });
        }
    }
    //#endregion
}