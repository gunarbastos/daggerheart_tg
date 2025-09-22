import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";
import {DtgEngine} from "./dtgEngine.js";
import {BaseDataModel} from "./baseDataModel.js";
import {InventoryItemDataModel} from "./inventoryItemDataModel.js";
import {_DO_NOT_USE_LANG} from "./language.js";
import {
    DTGActorDocument,
    AdversaryDocument,
    EnvironmentDocument,
    PlayerDocument} from "../document/actor/index.js";
import {
    AncestryDocument,
    ArmorDocument,
    ClassDocument,
    CommonItemDocument,
    CommunityDocument,
    ConsumableDocument,
    DomainCardDocument,
    DomainDocument,
    DTGItemDocument,
    FeatureDocument,
    InventoryItemDocument,
    MagicItemDocument,
    MateriaDocument,
    SpellDocument,
    SubclassDocument, WeaponDocument
} from "../document/item/index.js";
import {DTGCombatTracker, FearTrackerApp, ResourceManagerApp} from "../app/index.js";
import {DtgSockets} from "./sockets.js";
import {DTGTokenDocument} from "../document/index.js";
import {DTGRuler, DTGTokenRuler} from "./dtgRuler.js";
import {DTGMeasuredTemplate} from "./dtgMeasuredTemplate.js";

console.log(`Loaded: ${import.meta.url}`);

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
        Hooks.on("chatMessage", DTGHooks.#chatMessage);
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

    //#region Init Hooks
    static #onInit(){
        Utils.log(`#onInit`);
        //Internal Setup
        Utils.log('initializing internal data');
        Utils.localizeLangTree(_DO_NOT_USE_LANG, game.i18n.lang);
        Utils.deepFreeze(_DO_NOT_USE_LANG);
        Utils.deepFreeze(CONSTANTS);

        Utils.log('defining global objects');
        game.dtg ??= {};
        game.dtg.dualityRoll = async (opts = {}) => await DtgEngine.dualityRoll(opts);
        game.dtg.dualityDice = async (opts = {}) => await DtgEngine.dualityDice(opts);
        game.dtg.constants = CONSTANTS;
        game.dtg.apps ??= {};
        /*game.dtg.apps = {
            fearTracker: new FearTrackerApp(),
        };*/

        Utils.log('registering Document Classes');
        game.dtg.documents = {};
        game.dtg.documents.FeatureDocument = FeatureDocument;
        game.dtg.documents.InventoryItemDocument = InventoryItemDocument;
        game.dtg.documents.ClassDocument = ClassDocument;
        game.dtg.documents.DomainDocument = DomainDocument;
        game.dtg.documents.DomainCardDocument = DomainCardDocument;
        game.dtg.documents.SubclassDocument = SubclassDocument;
        game.dtg.documents.AncestryDocument = AncestryDocument;
        game.dtg.documents.CommunityDocument = CommunityDocument;
        game.dtg.documents.SpellDocument = SpellDocument;
        game.dtg.documents.ArmorDocument = ArmorDocument;
        game.dtg.documents.WeaponDocument = WeaponDocument;
        game.dtg.documents.CommonItemDocument = CommonItemDocument;
        game.dtg.documents.ConsumableDocument = ConsumableDocument;
        game.dtg.documents.MagicItemDocument = MagicItemDocument;
        game.dtg.documents.MateriaDocument = MateriaDocument;

        game.dtg.documents.PlayerDocument = PlayerDocument;
        game.dtg.documents.AdversaryDocument = AdversaryDocument;
        game.dtg.documents.EnvironmentDocument = EnvironmentDocument;

        DTGHooks.#registerCustomChatCommands();

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

        Utils.log(`registering handlebar helpers`);
        Utils.registerCommonHelpers();

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

        game.dtg.apps.fearTracker = new FearTrackerApp();
        game.dtg.apps.resourceManager = new ResourceManagerApp();

        CONFIG.ui.combat = DTGCombatTracker;
        CONFIG.Token.documentClass = DTGTokenDocument;
        CONFIG.Canvas.rulerClass = DTGRuler;
        CONFIG.Token.rulerClass = DTGTokenRuler;
        CONFIG.MeasuredTemplate.objectClass = DTGMeasuredTemplate;
        Utils.log(`#onInit end`);
    }
    
    static async #onReady(){
        Utils.log(`#onReady`);

        Utils.log('Ruler');

        Utils.log('Configuring DTG Tools bar');
        if(game.dtg.apps.fearTracker.userCanSee()) {
            ui.controls.controls.dtg.tools.fearTracker = await DTGHooks.#getFearTrackerToolsEntry();
            if(FearTrackerApp.SETTINGS_NAME.IS_OPENED ? Utils.getGameSetting(FearTrackerApp.SETTINGS_NAME.IS_OPENED) === true : false)
                await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }

        if(ResourceManagerApp.SETTINGS_NAME.IS_OPENED ? Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.IS_OPENED) === true : true)
            await game.dtg.apps.resourceManager.render({persistConfigs: false, force : true});

        Utils.log('Setting Socket Hooks');
        game.socket.on(CONSTANTS.SOCKETS.ID, DtgSockets.socketHandler);

        Utils.log(`#onReady end`);
    }

    static async #getSceneControlButtons(controls = []){
        if (!game?.user) return;

        controls[CONSTANTS.SYSTEM_ID] = {
            name: CONSTANTS.SYSTEM_ID,
            title: CONSTANTS.SYSTEM_ID,
            icon: "fas fa-dragon",
            tools: {
                resourceManager: {
                    name: "resourceManager",
                    title: "Resource Manager",
                    icon: "fas fa-address-card",
                    toggle: true,
                    visible: true,
                    active: ResourceManagerApp.SETTINGS_NAME.IS_OPENED ? Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.IS_OPENED) === true : false,
                    onChange: (event, active) => {
                        const app = game.dtg.apps.resourceManager;
                        if (active) {
                            app.render({force: true}, {});
                        } else {
                            app.close({});
                        }
                    },
                }
            },
            order: 0,
        };
    }

    static #chatMessage(chatLog, message, chatData){
        const parsed = foundry.applications.sidebar.tabs.ChatLog.parse(message);
        let command = parsed[0];

        switch ( command ) {
            case "dd":
                const argString = message.replace(/^\/dd\b\s*/i, "");
                const args = DTGHooks.#parseDdArgs(argString);

                DtgEngine.dualityRoll({
                    hopeFormula: args.hope ?? "1d12",
                    fearFormula: args.fear ?? "1d12",
                    bonus: args.bonus,
                    advDisad: args.advDisad ?? "",      // "ADVANTAGE" | "DISADVANTAGE" | ""
                    grantsHopeFear: true
                }).then(r => null);
                return false;
            default:
                return;
        }
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
            await Utils.setGameSetting(CONSTANTS.SETTINGS.FEAR_CURRENT, value); //game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id, value);
        }

        if(game.dtg.apps.fearTracker.rendered){
            game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
        }
    }

    static async FEAR_CURRENTOnChange(value){
        const maxFear = Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_MAXIMUM);
        if(value > maxFear){
            await Utils.setGameSetting(CONSTANTS.SETTINGS.FEAR_CURRENT, maxFear);
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
                if(Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_WINDOW_IS_OPEN)){
                    await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
                }
            }
        }

        ui.controls.render();
    }

    static async SPOTLIGHTOnChange(value){
        ui.combat.render({parts:['spotlight']});
    }

    static async #getFearTrackerToolsEntry(){
        return  {
            name: "fearTracker",
            title: "Fear Tracker",
            icon: "fas fa-skull",
            toggle: true,
            visible: game.dtg.apps.fearTracker.userCanSee(),
            //active: game.dtg.apps.fearTracker.rendered,
            active: FearTrackerApp.SETTINGS_NAME.IS_OPENED ? Utils.getGameSetting(FearTrackerApp.SETTINGS_NAME.IS_OPENED) === true : false,
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

    static #parseDdArgs(str) {
        const out = { bonus: [] }; // { hope?, fear?, tie?, advDisad?, bonus: (numbers/strings/objects)[] }

        const tokens = str.trim() ? str.trim().match(/"[^"]*"|\S+/g) : [];
        for (const raw of tokens ?? []) {
            const tok = raw.replace(/^"(.*)"$/, "$1"); // strip surrounding quotes

            // +N / -N → flat numeric bonus
            if (/^[+-]?\d+$/.test(tok)) {
                out.bonus.push(parseInt(tok, 10));
                continue;
            }

            // adv / dis
            if (/^(adv|advantage)$/i.test(tok)) { out.advDisad = "ADVANTAGE"; continue; }
            if (/^(dis|disad|disadvantage)$/i.test(tok)) { out.advDisad = "DISADVANTAGE"; continue; }

            // key=value (hope=2d12 | fear=1d12 | tie=hope | label=1d4)
            const m = tok.match(/^([A-Za-z_][\w-]*)\s*=\s*(.+)$/);
            if (m) {
                const key = m[1].toLowerCase();
                const val = m[2];
                if (key === "hope")       out.hope = val;
                else if (key === "fear")  out.fear = val;
                else if (key === "tie")   out.tie = val.toLowerCase();
                else                      out.bonus.push({ formula: val, description: m[1] }); // arbitrary label=value → treat as labeled bonus
                continue;
            }

            // Anything else → treat as a bonus formula token (e.g., 1d4)
            out.bonus.push(tok);
        }

        return out;
    }

    static #registerCustomChatCommands(){
        const _invalid = foundry.applications.sidebar.tabs.ChatLog.MESSAGE_PATTERNS.invalid;
        delete foundry.applications.sidebar.tabs.ChatLog.MESSAGE_PATTERNS.invalid;
        const dice = "([^#]+)(?:#(.*))?";
        const any = "([^]*)";
        foundry.applications.sidebar.tabs.ChatLog.MESSAGE_PATTERNS.dd = new RegExp(`^(\\/d(?:uality)?d(?:ice)?)${any}$`, "i");  // Duality dice: /dd or /dualitydice
        foundry.applications.sidebar.tabs.ChatLog.MESSAGE_PATTERNS.invalid = _invalid;
    }
    //#endregion
}