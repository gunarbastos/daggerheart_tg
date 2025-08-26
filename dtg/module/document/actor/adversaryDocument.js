console.log(`Loaded: ${import.meta.url}`);

import {CombatActorDocument} from "./combatActorDocument.js";

export class AdversaryDocument extends CombatActorDocument {

    _modifyDataObject(data, options, userId){
        const seed = {
            actorLink: false,
            disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
            displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
            appendNumber: true,
            name: data.name ?? this.name,
            bar1: { attribute: "resources.hp" },
            bar2: { attribute: "resources.stress" }
        };

        data.prototypeToken ??= {};
        return foundry.utils.mergeObject(data.prototypeToken, seed, { inplace: true, insertKeys: true, overwrite: false });
    }

}