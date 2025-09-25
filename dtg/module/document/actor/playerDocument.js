import {CONSTANTS, Utils} from "../../common/index.js";
import {CombatActorDocument} from "./combatActorDocument.js";

console.log(`Loaded: ${import.meta.url}`);

export class PlayerDocument extends CombatActorDocument {

    get defaultPrototypeToken() {
        return {
            actorLink: true,
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            bar1: { attribute: "resources.hp" },
            bar2: { attribute: "resources.armor" }
        };
    }

    async _preUpdate(changes, options, userId) {
        await super._preUpdate(changes, options, userId);

        //check resources boundaries
        for(const resource of [CONSTANTS.RESOURCE_TYPES.HP, CONSTANTS.RESOURCE_TYPES.ARMOR, CONSTANTS.RESOURCE_TYPES.STRESS]) {
            if (changes?.system?.resources && changes.system.resources.hasOwnProperty(resource)) {
                const validMax = changes.system.resources[resource].max ?? this.system.resources[resource].max;
                const currValue = changes.system.resources[resource].value ?? this.system.resources[resource].value;
                if (validMax < currValue) {
                    foundry.utils.setProperty(changes, `system.resources.${resource}.value`, validMax);
                    if(this.system.resources[resource].value === validMax) {
                        this._updateApps(changes, userId, false);
                    } else {
                        options.skipRequester = false; //force to update on the renderer that set the false info
                    }
                }
            }
        }

        if (changes?.system?.resources?.hope || changes?.system?.scars) {
            const hopeMax = changes?.system?.resources?.hope?.max ?? this.system.resources.hope.max;
            let scars = changes?.system?.scars ?? this.system.scars;
            const currValue = changes?.system?.resources?.hope?.value ?? this.system.resources.hope.value;

            if(scars > hopeMax) {
                foundry.utils.setProperty(changes, `system.scars`, hopeMax);
                options.skipRequester = false; //force to update on the renderer that set the false info
                scars = hopeMax;
            }

            const validMax = hopeMax - scars;

            if (validMax < currValue) {
                foundry.utils.setProperty(changes, `system.resources.hope.value`, validMax);
                options.skipRequester = false; //force to update on the renderer that set the false info
            }

            if(this.system.resources.hope.value !== validMax || this.system.scars !== scars) {
                this._updateApps(changes, userId, options.skipRequester, options.appId);
            }

        }

        //Check
    }

    _updateApps(changed, userId, skipRequester, requesterApp){
        for (const app of Object.values(this.apps)){
            if(!app.rendered) continue;
            if(skipRequester === true && requesterApp && app.id === requesterApp) continue;
            if(typeof app.constructor.requiresRender === 'function'){
                const { requires, options } = app.constructor.requiresRender(changed);
                if(requires === true) app.render(options);
            }
            else
                app.render();
        }
    }

    _onUpdate(changed, options, userId) {
        const skipRequester = options && typeof options === "object" && options.hasOwnProperty('skipRequester') && options.skipRequester === true && userId === game.user.id;
        const requesterApp = options && typeof options === "object" && options.hasOwnProperty('appId') ? options.appId : undefined;
        if(skipRequester === true) options.render = false;
        super._onUpdate(changed, options, userId);
        ui.combat.constructor.changeOnToken(this.uuid, changed).then(r => null);

        //re-renders only what is needed if update was not made to re-render all
        if(options.render !== true && options.force !== true && this.apps && typeof this.apps === "object"){
            this._updateApps(changed, userId, skipRequester, requesterApp);
        }
    }

    _onDelete(options, userId) {
        delete this.apps[game.dtg.apps.resourceManager?.id];
        super._onDelete(options, userId);
        game.dtg.apps.resourceManager?.invalidateSelectionObject();
        game.dtg.apps.resourceManager?.render({force: true}).then(r => null);
    }

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        game.dtg.apps.resourceManager?.render({force: true}).then(r => null);
    }

    _onCreateDescendantDocuments(parent, collection, documents, data, options, userId){
        if(parent !== this) return null;
        this._updateApps({'items': true}, userId,  false, undefined);
    }

    _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId){
        if(parent !== this) return null;
        this._updateApps({'items': true}, userId,  false, undefined);
    }

    _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId){
        if(parent !== this) return null;
        this._updateApps({'items': true}, userId,  false, undefined);
    }

}