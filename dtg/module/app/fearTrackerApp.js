import {CONSTANTS, Utils, Mixins} from "../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class FearTrackerApp extends Mixins.DtgApp(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)) {

    static get PARTS() {
       return {
            content: { template: `${CONSTANTS.TEMPLATES.ROOT_DIR}/app/fearTracker.hbs` },
        };
    }

    static get SETTINGS_NAME() {
        return {
            ...super.SETTINGS_NAME,
            IS_OPENED: CONSTANTS.SETTINGS.FEAR_WINDOW_IS_OPEN,
            POSITION: CONSTANTS.SETTINGS.FEAR_WINDOW_POSITION,
        }
    }

    static get DEFAULT_OPTIONS() {
        return {
            id: `${game.dtg.constants.SYSTEM_ID}-${this.name}`,
            position: {width: 270, height: 120, top: 55, left: 105 },
            classes: ['fear-tracker'],
            window: { icon: 'fa-solid fa-skull', title: 'Fear Tracker' },
            actions: {
                addFear: FearTrackerApp.#addFear,
                removeFear: FearTrackerApp.#removeFear,
                togglePlayersVisibility: FearTrackerApp.#togglePlayersVisibility,
            },
        };
    }

    get title(){
        return Utils.localize(this.options.window.title ?? 'Missing Title');
    }

    async close({ persistConfigs = true, ...options} = {}) {
        ui.controls.controls.dtg.tools.fearTracker.active = false;
        await ui.controls.render();
        await super.close(options);
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
            current: Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_CURRENT),
            max: Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_MAXIMUM),
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
        const maxFear = Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_MAXIMUM);
        let newFear = Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_CURRENT);
        newFear += delta;
        if(newFear < 0 || newFear > maxFear) return;

        await Utils.setGameSetting(CONSTANTS.SETTINGS.FEAR_CURRENT, newFear);
        await  game.dtg.apps.fearTracker.render({persistConfigs: false, force : true});
    }

    static async #togglePlayersVisibility(event){
        const currValue = Utils.getGameSetting(CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE) ?? CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE.default;
        await Utils.setGameSetting(CONSTANTS.SETTINGS.FEAR_PLAYERS_CAN_SEE, !currValue);
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

}