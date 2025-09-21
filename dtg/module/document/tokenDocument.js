import {Utils} from '../common/index.js';
import {AdversaryDocument, PlayerDocument} from "./actor/index.js";
import {DTGCombatTracker} from "../app/index.js";

Utils.log('Loaded:', import.meta.url);

export class DTGTokenDocument extends TokenDocument {

    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        if(changed.hasOwnProperty('hidden') || changed.hasOwnProperty('name') || changed.hasOwnProperty('texture')){
            const className = Object.getPrototypeOf(this.actor).constructor.name;
            if(DTGCombatTracker.classToParts[className]){
                ui.combat.render({parts:[DTGCombatTracker.classToParts[className]]});
            }
        }
    }

    _onDelete(options, userId) {
        super._onDelete(options, userId);
        const className = Object.getPrototypeOf(this.actor).constructor.name;
        if(DTGCombatTracker.classToParts[className]){
            ui.combat.render({parts:[DTGCombatTracker.classToParts[className]]});
        }
    }

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        const className = Object.getPrototypeOf(this.actor).constructor.name;
        if(DTGCombatTracker.classToParts[className]){
            ui.combat.render({parts:[DTGCombatTracker.classToParts[className]]});
        }
    }

}