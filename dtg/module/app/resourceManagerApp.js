import {CONSTANTS, Mixins, Utils} from "../common/index.js";
import {DTGActorDocument, PlayerDocument} from "../document/actor/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class ResourceManagerApp extends Mixins.DtgApp(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)){

    static get PARTS() {
        const basePartPath = `${CONSTANTS.TEMPLATES.ROOT_DIR}/app/resourceManager/part`;
        return {
            selector: { template: `${basePartPath}/selector.hbs` },
            hp: { template: `${basePartPath}/resources.hbs` },
            armor: { template: `${basePartPath}/resources.hbs` },
            stress: { template: `${basePartPath}/resources.hbs` },
            hope: { template: `${basePartPath}/resources.hbs` },
        };
    }

    static get SETTINGS_NAME() {
        return {
            ...super.SETTINGS_NAME,
            IS_OPENED: CONSTANTS.SETTINGS.RESOURCEMANAGER_WINDOW_IS_OPEN,
            POSITION: CONSTANTS.SETTINGS.RESOURCEMANAGER_WINDOW_POSITION,
            SHOW_FOLDER_IN_NAME: CONSTANTS.SETTINGS.RESOURCEMANAGER_SHOW_FOLDER_IN_NAME,
            SHOW_NOT_OWNED: CONSTANTS.SETTINGS.RESOURCEMANAGER_SHOW_NOT_OWNED,
            SELECTED_DOCUMENT: CONSTANTS.SETTINGS.RESOURCEMANAGER_SELECTED_DOCUMENT
        }
    }

    static get DEFAULT_OPTIONS() {
        const options = {
            id: `${game.dtg.constants.SYSTEM_ID}-${this.name}`,
            position: {width: 400, height: 400, top: 100, left: 230 },
            classes: ['resource-manager'],
            window: {
                icon: 'fa-solid fa-address-card',
                title: 'Resource Manager',
                controls: [
                    {
                        action: 'toggleShowFolderInName',
                        icon: Utils.getCheckIcon(Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_FOLDER_IN_NAME)),
                        label: 'Show folder name',
                        visible: true,
                    },
                    {
                        action: 'toggleeShowNotOwned',
                        icon: Utils.getCheckIcon(Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_NOT_OWNED)),
                        label: 'Show only controlled',
                        visible: true,
                    },
                ],
            },
            actions: {
                notYetImplemented: Utils.actionNotYetImplemented,
                toggleShowFolderInName: ResourceManagerApp.#toggleShowFolderInName,
                toggleeShowNotOwned: ResourceManagerApp.#toggleeShowNotOwned,
                setResource: ResourceManagerApp.#setResource,
                selectDocument: ResourceManagerApp.#selectDocument,
            },
        };

        options.position.top = window.innerHeight - options.position.height - options.position.top;
        return options;
    }

    #document = undefined;

    get document() {
        if(!this.#document) {
            this.#document = Utils.fromUuidSync(Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SELECTED_DOCUMENT));
        }
        return this.#document;
    }

    //#region overrides
    async close({ persistConfigs = true, ...options} = {}) {
        ui.controls.controls.dtg.tools.resourceManager.active = false;
        await ui.controls.render();
        await super.close(options);
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        return {
            iconSetting: Utils.getGameSetting(CONSTANTS.SETTINGS.MEDIUM_ICONS_STYLE),
            ...base,
        }
    }

    async _preparePartContext(partId, context, options) {
        const showFolderInName = Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_FOLDER_IN_NAME);
        let selectedDocument = await Utils.fromUuid(Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SELECTED_DOCUMENT));
        const availableDocuments = Utils.filterByOwnership(game.actors, Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_NOT_OWNED) === true ? CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED : CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
        if(availableDocuments.length === 1){
            selectedDocument = availableDocuments[0];
            await Utils.setGameSetting(ResourceManagerApp.SETTINGS_NAME.SELECTED_DOCUMENT, selectedDocument.uuid);
            this.#document = selectedDocument;
        }
        let part = {};
        if(partId === 'selector'){
            part.documents = [];
            for(const doc of availableDocuments){
                if(!(doc instanceof PlayerDocument)) continue;
                doc.apps[this.id] = this;
                let docFolder = '';
                if(showFolderInName === true && doc.folder) docFolder = `${doc.folder}\\`;
                part.documents.push({
                    uuid: doc.uuid,
                    name: `${docFolder}${doc.name}`,
                    img: doc.img,
                    viewOnly: !doc.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER),
                    selected: doc.uuid === selectedDocument?.uuid ?? '',
                });
            }
        }

        if(partId === 'hp' || partId === 'armor' || partId === 'stress' || partId === 'hope'){
            part = {
                ...part,
                resourceName: partId.capitalize(),
                resourceList: []
            };
            if(selectedDocument){
                switch(partId){
                    case 'hp':
                        const usedHp = selectedDocument.system.resources.hp.max - selectedDocument.system.resources.hp.value;
                        part.resourceList = [...Utils.getListOfResources(selectedDocument.system.resources.hp.max, usedHp, "hp", CONSTANTS.ASSETS.ICONS.HP.USED[context.iconSetting], CONSTANTS.ASSETS.ICONS.HP.AVAILABLE)];
                        break;
                    case 'armor':
                        const usedArmor = selectedDocument.system.resources.armor.max - selectedDocument.system.resources.armor.value;
                        part.resourceList = [...Utils.getListOfResources(selectedDocument.system.resources.armor.max, usedArmor, "armor", CONSTANTS.ASSETS.ICONS.ARMOR.USED[context.iconSetting], CONSTANTS.ASSETS.ICONS.ARMOR.AVAILABLE)];
                        break;
                    case 'stress':
                        const usedStress = selectedDocument.system.resources.stress.max - selectedDocument.system.resources.stress.value;
                        part.resourceList = [...Utils.getListOfResources(selectedDocument.system.resources.stress.max, usedStress, "stress", CONSTANTS.ASSETS.ICONS.STRESS.USED, CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE)];
                        break;
                    case 'hope':
                        const maxFinalHope = selectedDocument.system.resources.hope.max - selectedDocument.system.scars;
                        const usedHope = maxFinalHope - selectedDocument.system.resources.hope.value;
                        part.resourceList =  [...Utils.getListOfResources(maxFinalHope, usedHope, "hope", CONSTANTS.ASSETS.ICONS.HOPE.USED, CONSTANTS.ASSETS.ICONS.HOPE.AVAILABLE, {invertValues: true}),
                            ...Utils.getListOfResources(selectedDocument.system.scars, 0, "hope", CONSTANTS.ASSETS.ICONS.SCAR, CONSTANTS.ASSETS.ICONS.SCAR, {canClick: false})]
                        break;
                }
            }
        }

        return Utils.mergeObjects(context, part);
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        if (!this.document) {
            if(options.parts.includes('hp')) options.parts.splice(options.parts.indexOf('hp'), 1);
            if(options.parts.includes('armor')) options.parts.splice(options.parts.indexOf('armor'), 1);
            if(options.parts.includes('stress')) options.parts.splice(options.parts.indexOf('stress'), 1);
            if(options.parts.includes('hope')) options.parts.splice(options.parts.indexOf('hope'), 1);
        } else if(!(this.document instanceof PlayerDocument)){
            if(options.parts.includes('stress')) options.parts.splice(options.parts.indexOf('stress'), 1);
            if(options.parts.includes('hope')) options.parts.splice(options.parts.indexOf('hope'), 1);
        }
    }

    async _preFirstRender(context, options) {
        super._configureRenderOptions(options);

        options.parts = ["selector"];
        if (this.document) {
            options.parts.push("hp");
            options.parts.push("armor");
            if(this.document instanceof PlayerDocument){
                options.parts.push("stress");
                options.parts.push("hope");
            }
        }
    }
    //#endregion

    //#region actions
    /**
     * @this {ResourceManagerApp}
     */
    static async #setResource(event) {
        event.preventDefault();
        const document = await Utils.fromUuid(Utils.getGameSetting(ResourceManagerApp.SETTINGS_NAME.SELECTED_DOCUMENT));
        //time to divine intentions.
        // if current is lower than new, then new value = dataset value
        // if current is higher than new, then new value = dataset value - 1
        // if current is the same as nwe, then new value = dataset value - 1
        let newValue = Number(event.target.dataset.value);
        if(event.target.dataset.resource !== "hope" && document.system.resources[event.target.dataset.resource].value <= newValue) newValue += 1;
        if(event.target.dataset.resource === "hope" && document.system.resources[event.target.dataset.resource].value === newValue) newValue -= 1;
        await document.update({[`system.resources.${event.target.dataset.resource}.value`]:newValue}, {render: false, skipRequester: true, appId: this.id});
        await this.render({parts: [event.target.dataset.resource]});
    }

    /**
     * @this {ResourceManagerApp}
     */
    static async #selectDocument(event) {
        event.preventDefault();
        await Utils.setGameSetting(ResourceManagerApp.SETTINGS_NAME.SELECTED_DOCUMENT, event.target.closest('[data-uuid]').dataset.uuid);
        this.#document = undefined;
        await this.render();
    }

    /**
     * @this {ResourceManagerApp}
     */
    static async #toggleShowFolderInName(event){
        event.preventDefault();
        await this.toggleSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_FOLDER_IN_NAME, 'toggleShowFolderInName');
    }

    /**
     * @this {ResourceManagerApp}
     */
    static async #toggleeShowNotOwned(event){
        event.preventDefault();
        await this.toggleSetting(ResourceManagerApp.SETTINGS_NAME.SHOW_NOT_OWNED, 'toggleeShowNotOwned');
    }
    //#endregion

    async toggleSetting(setting, action){
        const newValue = !Utils.getGameSetting(setting);
        await Utils.setGameSetting(setting, newValue);
        this.getControl(action).icon = Utils.getCheckIcon(newValue);
        await this.render({ window: { controls: true }, parts: ['selector'] });
    }

    static requiresRender(path){
        const flat  = foundry.utils.flattenObject(path);            // "a.b.c": value
        const listOfPaths = Object.keys(flat);
        const parts = new Set();
        for (const path of listOfPaths) for (const part of ResourceManagerApp.#partsForPath(path)) parts.add(part);
        const result = {
            requires: parts.size && parts.size > 0,
            options: {}
        }
        if(result.requires === false) return result;

        if(parts.size && !parts.has('full'))
            result.options.parts = [...parts];
        else
            result.options.force = true;
        return result;
    }

    static #partsForPath(path){
        const result = [];
        if (!path) return [];
        if (path === "name" ||
            path === "img" ||
            path === "ownership" ||
            path === "permission" ||
            path === "folder"
        ) result.push('selector');

        if (path.startsWith("system.resources.") && (path.endsWith(".max") || path.endsWith(".value"))) {
            const pieces = path.split(".");
            result.push(pieces[2]);
        }

        if(path === "system.scars") result.push("hope");

        return Utils.unique(result);
    }

    invalidateSelectionObject(){
        this.#document = undefined;
    }

}