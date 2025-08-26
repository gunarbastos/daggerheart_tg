console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, Utils} from "../common/index.js";

export class FearTrackerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static get PARTS() {
        return {
            content: { template: `${CONSTANTS.TEMPLATES.ROOT_DIR}/app/fearTracker.hbs` },
        };
    }

    static get DEFAULT_OPTIONS() {
        // merge with parent defaults at access time (safe for CONSTANTS)
        const base = super.DEFAULT_OPTIONS;

        const options = Utils.mergeObjects(
            base,
            {
                position: {width: 270, height: 120, top: 55, left: 105 },
                id: `${CONSTANTS.SYSTEM_ID}-${this.name}`,
                classes: Utils.unique([...base.classes ?? [], 'application', CONSTANTS.SYSTEM_ID, 'fear-tracker']),
                tag: 'div',
                positioned: true,
                window: {
                    contentClasses: Utils.unique([...(base.window ?? {}).contentClasses ?? [], 'standard-form']),
                    frame: true,
                    title: 'Fear Tracker',
                    resizable: true,
                },
                actions: {
                    addFear: FearTrackerApp.#addFear,
                    removeFear: FearTrackerApp.#removeFear,
                    togglePlayersVisibility: FearTrackerApp.#togglePlayersVisibility,
                }
            }
        );

        const position = game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_POSITION.id);
        if(position && typeof position === 'object')
            options.position = Utils.mergeObjects(options.position, position);

        return options;
    }

    get title(){
        return Utils.localize(this.options.window.title ?? 'Missing Title');
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        const perms = this.getRelatedPermissions();
        const render = perms.isFullGM || (perms.assistantCanEdit && perms.isAssistantGM);
        let toggleIcon = '';
        let toggleHint = '';

        if(perms.playersCanSee) {
            toggleIcon = 'bi-eye';
            toggleHint = 'Players currently CAN see fear';
        } else {
            toggleIcon = 'bi-eye-slash-fill';
            toggleHint = 'Players currently CANNOT see fear';
        }

        return {
            ...base,
            current: await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id),
            max: await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_MAXIMUM.id),
            renderButtons: render,
            icon: toggleIcon,
            hint: toggleHint
        };
    }

    static async #addFear(event) {
        await FearTrackerApp.#changeValue(+1);
    }

    static async #removeFear(event) {
        await FearTrackerApp.#changeValue(-1);
    }

    static async #changeValue(delta){
        const maxFear = await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_MAXIMUM.id);
        let newFear = await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id);
        newFear += delta;
        if(newFear < 0 || newFear > maxFear) return;

        await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_CURRENT.id, newFear);
        await game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
    }

    static async #togglePlayersVisibility(event){
        const currValue = await game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.id) ?? CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.default;
        await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.id, !currValue);
    }

    async render({ persistConfigs = true, ...options} = {}, _options={}) {
        if(persistConfigs) await this.setConfigs({show: true});
        const base = await super.render(options, _options);
/*        const position = game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_POSITION.id);

        if(position && typeof position === 'object' && position.hasOwnProperty('top') && position.hasOwnProperty('left') && position.hasOwnProperty('top') && position.hasOwnProperty('right'))
            this.position = Utils.mergeObjects(this.position, position);*/
        return base;
    }

    async close({ persistConfigs = true, ...options} = {}) {
        if(persistConfigs) await this.setConfigs({show: false, position: this.position ?? {}});
        return await super.close(options);
    }

    getRelatedPermissions() {
        return {
            isAssistantGM: game.user.hasRole(CONST.USER_ROLES.ASSISTANT) ?? false,
            isFullGM: game.user.hasRole(CONST.USER_ROLES.GAMEMASTER) ?? false,
            assistantCanEdit: game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_ASSISTANT_CAN_EDIT.id),
            playersCanSee: game.settings.get(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.id),
        }
    }

    userCanSee(){
        const perms = this.getRelatedPermissions();
        return perms.isFullGM || (perms.assistantCanEdit && perms.isAssistantGM) || perms.playersCanSee;
    }

    /**
     *
     * @param {boolean|undefined} show
     * @param {object|undefined} position
     * @returns {Promise<void>}
     */
    async setConfigs({show = undefined, position = undefined}){
        if(typeof show === 'boolean') await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_IS_OPEN.id, show);
        if(position) await game.settings.set(CONSTANTS.SYSTEM_ID, CONSTANTS.SETTINGS.FEAR_WINDOW_POSITION.id, position);
    }
}