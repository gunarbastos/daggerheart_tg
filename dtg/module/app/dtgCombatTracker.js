import {CONSTANTS, Utils} from '../common/index.js';
import {AdversaryDocument, PlayerDocument} from "../document/actor/index.js";

Utils.log('Loaded:', import.meta.url);

export class DTGCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    //#region overrides
    static DEFAULT_OPTIONS = {
        classes: ["dtg", "combat-tracker"],
        actions: {
            toggleCombat: DTGCombatTracker.#toggleCombat,
            setResource: DTGCombatTracker.#setResource,
            toggleSpotlight: DTGCombatTracker.#toggleSpotlight,
        }
    };

    static PARTS = {
        header: { template: "systems/dtg/template/app/dtgCombatTracker/part/header.hbs" },
        spotlight: { template: "systems/dtg/template/app/dtgCombatTracker/part/spotlight.hbs" },
        players: { template: "systems/dtg/template/app/dtgCombatTracker/part/players.hbs" },
        adversaries: { template: "systems/dtg/template/app/dtgCombatTracker/part/adversaries.hbs" },
        footer: { template: "systems/dtg/template/app/dtgCombatTracker/part/footer.hbs" },
    };

    static classToParts = {
        [AdversaryDocument.name]: 'adversaries',
        [PlayerDocument.name]: 'players',
    };

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        return {
            ...base,
            iconSetting: Utils.getGameSetting(CONSTANTS.SETTINGS.SMALL_ICONS_STYLE),
            inCombat: this._isSceneCombatActive()
        }
    }

    async _preparePartContext(partId, context, options){
        const part = {};
        switch(partId){
            case 'header':
                part.state = context.inCombat ? "IN COMBAT" : "NOT IN COMBAT!";
                break;
            case 'spotlight':
                part.canGrabSpotlight = game.user && game.user.isGM;
                const spotlight = Utils.getGameSetting(CONSTANTS.SETTINGS.SPOTLIGHT);
                switch (spotlight){
                    case CONSTANTS.SPOTLIGHT.GM:
                        part.class = 'with-gm';
                        part.text = 'GM';
                        break;
                    case CONSTANTS.SPOTLIGHT.PLAYERS:
                        part.class = 'with-players';
                        part.text = 'Players';
                        break;
                }
                break;
            case 'players':
                const playerTokens = canvas.scene?.tokens.filter(td => td.actor?.type === CONSTANTS.ACTOR_TYPES.PLAYER) ?? [];
                part.players = [];
                for(const player of playerTokens){
                    const resources = [];
                    const usedHp = player.actor.system.resources.hp.max - player.actor.system.resources.hp.value;
                    const usedArmor = player.actor.system.resources.armor.max - player.actor.system.resources.armor.value;
                    const usedStress = player.actor.system.resources.stress.max - player.actor.system.resources.stress.value;
                    const maxFinalHope = player.actor.system.resources.hope.max - player.actor.system.scars;
                    const usedHope = maxFinalHope - player.actor.system.resources.hope.value;

                    resources.push(
                        [...Utils.getListOfResources(
                            player.actor.system.resources.hp.max,
                            usedHp,
                            "hp",
                            CONSTANTS.ASSETS.ICONS.HP.USED[context.iconSetting],
                            CONSTANTS.ASSETS.ICONS.HP.AVAILABLE
                        )]
                    );

                    resources.push(
                        [...Utils.getListOfResources(
                            player.actor.system.resources.armor.max,
                            usedArmor,
                            "armor",
                            CONSTANTS.ASSETS.ICONS.ARMOR.USED[context.iconSetting],
                            CONSTANTS.ASSETS.ICONS.ARMOR.AVAILABLE
                        )]
                    );

                    resources.push(
                        [...Utils.getListOfResources(
                            player.actor.system.resources.stress.max,
                            usedStress,
                            "stress",
                            CONSTANTS.ASSETS.ICONS.STRESS.USED,
                            CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE
                        )]
                    );

                    const scars = Utils.getListOfResources(
                        player.actor.system.scars,
                        0,
                        "scar",
                        CONSTANTS.ASSETS.ICONS.SCAR,
                        CONSTANTS.ASSETS.ICONS.SCAR,
                        {invertValues: true, canClick: false}
                    );

                    for(const scar of scars){
                        scar.value += maxFinalHope;
                    }

                    resources.push(
                        [...Utils.getListOfResources(
                            maxFinalHope,
                            usedHope,
                            "hope",
                            CONSTANTS.ASSETS.ICONS.HOPE.USED,
                            CONSTANTS.ASSETS.ICONS.HOPE.AVAILABLE,
                            {invertValues: true}
                        ),
                        ...scars]
                    );

                    part.players.push({
                        name: player.name,
                        img: player.texture.src,
                        uuid: player.uuid,
                        resources: resources,
                        isOwner: player.isOwner,
                        shouldShow: !player.hidden || player.isOwner,
                        shouldShowResource: player.isOwner,
                    });
                }
                break;
            case 'adversaries':
                const adversaryTokens = canvas.scene?.tokens.filter(td => td.actor?.type === CONSTANTS.ACTOR_TYPES.ADVERSARY) ?? [];
                part.adversaries = [];
                for(const adversary of adversaryTokens){
                    const resources = [];
                    const usedHp = adversary.actor.system.resources.hp.max - adversary.actor.system.resources.hp.value;
                    const usedStress = adversary.actor.system.resources.stress.max - adversary.actor.system.resources.stress.value;

                    resources.push(
                        [...Utils.getListOfResources(
                            adversary.actor.system.resources.hp.max,
                            usedHp,
                            "hp",
                            CONSTANTS.ASSETS.ICONS.HP.USED[context.iconSetting],
                            CONSTANTS.ASSETS.ICONS.HP.AVAILABLE
                        )]
                    );

                    resources.push(
                        [...Utils.getListOfResources(
                            adversary.actor.system.resources.stress.max,
                            usedStress,
                            "stress",
                            CONSTANTS.ASSETS.ICONS.STRESS.USED,
                            CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE
                        )]
                    );

                    part.adversaries.push({
                        name: adversary.name,
                        img: adversary.texture.src,
                        uuid: adversary.uuid,
                        isOwner: adversary.isOwner,
                        resources: resources,
                        hidden: adversary.hidden,
                    });
                }
                break;
            case 'footer':
                part.canToggleCombat = game.user && game.user.isGM;
                part.text = context.inCombat ? "End Combat" : "Start Combat";
                break;
        }

        return Utils.mergeObjects(context, part);
    }
    //#endregion

    static #rerender(event) {
        this.render();
    }

    static async #toggleCombat(event) {
        if (!game.user.isGM) return ui.notifications.warn("GM only");
        const sid = canvas.scene?.id;
        if (!sid) return;

        let combat = game.combats.contents.find(c => c.scene?.id === sid);
        if (!combat) {
            combat = await Combat.create({ scene: sid });
            await combat.startCombat();
        } else {
            combat.delete();
        }

        this.render({parts:['header', 'footer']});
    }

    _isSceneCombatActive() {
        const sid = canvas.scene?.id;
        return !!game.combats.contents.find(c => c.scene?.id === sid);
    }

    static async changeOnToken(uuid, changes){
        const tokens = canvas.scene?.tokens.filter(td => td.actor?.uuid === uuid) ?? [];
        if(tokens && tokens.length && tokens.length === 1 && tokens[0]){
            const token = tokens[0];
            const className = Object.getPrototypeOf(token.actor).constructor.name;
            if(DTGCombatTracker.classToParts[className]){

                const flat  = foundry.utils.flattenObject(changes);            // "a.b.c": value
                const listOfPaths = Object.keys(flat);

                if(listOfPaths.some(v => typeof v === "string" && v.startsWith('system.resources.hp.'))){
                    DTGCombatTracker.#updatePips(token, CONSTANTS.RESOURCE_TYPES.HP);
                }

                if(listOfPaths.some(v => typeof v === "string" && v.startsWith('system.resources.armor.'))){
                    DTGCombatTracker.#updatePips(token, CONSTANTS.RESOURCE_TYPES.ARMOR);
                }

                if(listOfPaths.some(v => typeof v === "string" && v.startsWith('system.resources.stress.'))){
                    DTGCombatTracker.#updatePips(token, CONSTANTS.RESOURCE_TYPES.STRESS);
                }

                if(listOfPaths.some(v => typeof v === "string" && v.startsWith('system.resources.hope.')) || listOfPaths.some(v => typeof v === "string" && v.startsWith('system.scars'))){
                    DTGCombatTracker.#updatePips(token, CONSTANTS.RESOURCE_TYPES.HOPE);
                }

            }
        }
    }

    static #updatePips(token, resource){
        const id = `${token.uuid}-${resource}`;
        let value = 0;
        let usedImage = '';
        let availableImage = '';
        let scarImage = '';
        const iconSetting = Utils.getGameSetting(CONSTANTS.SETTINGS.SMALL_ICONS_STYLE);

        switch(resource){
            case CONSTANTS.RESOURCE_TYPES.HP:
                value = token.actor.system.resources.hp.value;
                usedImage = CONSTANTS.ASSETS.ICONS.HP.USED[iconSetting];
                availableImage = CONSTANTS.ASSETS.ICONS.HP.AVAILABLE;
                break;
            case CONSTANTS.RESOURCE_TYPES.ARMOR:
                value = token.actor.system.resources.armor.value;
                usedImage = CONSTANTS.ASSETS.ICONS.ARMOR.USED[iconSetting];
                availableImage = CONSTANTS.ASSETS.ICONS.ARMOR.AVAILABLE;
                break;
            case CONSTANTS.RESOURCE_TYPES.STRESS:
                value = token.actor.system.resources.stress.value;
                usedImage = CONSTANTS.ASSETS.ICONS.STRESS.USED;
                availableImage = CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE;
                break;
            case CONSTANTS.RESOURCE_TYPES.HOPE:
                value = token.actor.system.resources.hope.value;
                usedImage = CONSTANTS.ASSETS.ICONS.HOPE.USED;
                availableImage = CONSTANTS.ASSETS.ICONS.HOPE.AVAILABLE;
                scarImage = CONSTANTS.ASSETS.ICONS.SCAR;
                break;
        }

        usedImage = `${CONSTANTS.ASSETS.ICON_DIR}/${usedImage}`;
        availableImage = `${CONSTANTS.ASSETS.ICON_DIR}/${availableImage}`;
        scarImage = `${CONSTANTS.ASSETS.ICON_DIR}/${scarImage}`;

        const roots = [ui.combat.element];
        if(ui.combat.popout?.element){
            roots.push(ui.combat.popout.element);
        }

        for(const root of roots) {
            const row = root.querySelector(`.actor-resource-row[id="${id}"]`);
            if (row) {
                const imgs = row.querySelectorAll(".actor-resource-button");

                if(resource !== CONSTANTS.RESOURCE_TYPES.HOPE) {
                    imgs.forEach(img => {
                        img.src = Number(img.dataset.value) >= value ? usedImage : availableImage;
                    });
                } else {
                    imgs.forEach(img => {
                        const datasetValue = Number(img.dataset.value);
                        if(datasetValue <=  value){
                            img.src = availableImage;
                            img.dataset.action = "setResource";
                            img.removeAttribute('style');
                        } else if(datasetValue <= token.actor.system.resources.hope.max - token.actor.system.scars){
                            img.src = usedImage;
                            img.dataset.action = "setResource";
                            img.removeAttribute('style');
                        } else {
                            img.src = scarImage;
                            img.removeAttribute('data-action');
                            img.style = "cursor: not-allowed;";
                        }
                    });
                }
            }
        }
    }

    static async #setResource(event) {
        event.preventDefault();
        const uuid = event.target.closest("[data-actor-uuid]").dataset.actorUuid;
        const actor = (await Utils.fromUuid(uuid)).actor;
        //time to divine intentions.
        // if current is lower than new, then new value = dataset value
        // if current is higher than new, then new value = dataset value - 1
        // if current is the same as nwe, then new value = dataset value - 1
        let newValue = Number(event.target.dataset.value);
        if(event.target.dataset.resource !== "hope" && actor.system.resources[event.target.dataset.resource].value <= newValue) newValue += 1;
        if(event.target.dataset.resource === "hope" && actor.system.resources[event.target.dataset.resource].value === newValue) newValue -= 1;
        await actor.update({[`system.resources.${event.target.dataset.resource}.value`]:newValue}, {render: false, skipRequester: true, appId: this.id});
    }

    static async #toggleSpotlight(event) {
        const currValue = Utils.getGameSetting(CONSTANTS.SETTINGS.SPOTLIGHT);
        switch(currValue) {
            case CONSTANTS.SPOTLIGHT.GM:
                await Utils.setGameSetting(CONSTANTS.SETTINGS.SPOTLIGHT, CONSTANTS.SPOTLIGHT.PLAYERS);
                break;
            case CONSTANTS.SPOTLIGHT.PLAYERS:
                await Utils.setGameSetting(CONSTANTS.SETTINGS.SPOTLIGHT, CONSTANTS.SPOTLIGHT.GM);
                break;
        }
    }

}