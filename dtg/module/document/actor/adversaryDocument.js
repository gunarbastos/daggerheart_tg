import {CombatActorDocument} from "./combatActorDocument.js";
import {Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class AdversaryDocument extends CombatActorDocument {

    get defaultPrototypeToken(){
        return {
            actorLink: false,
            disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
            displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
            appendNumber: true,
            bar1: { attribute: "resources.hp" },
            bar2: { attribute: "resources.stress" }
        };

    }

    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        ui.combat.constructor.changeOnToken(this.uuid, changed).then(r => null);
    }

}