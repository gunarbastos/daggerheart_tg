console.log(`Loaded: ${import.meta.url}`);

import {CombatActorDocument} from "./combatActorDocument.js";

export class PlayerDocument extends CombatActorDocument {

    _modifyDataObject(data, options, userId){
        const seed = {
            actorLink: true,
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            bar1: { attribute: "resources.hp" },
            bar2: { attribute: "resources.armor" }
        };

        data.prototypeToken ??= {};
        return foundry.utils.mergeObject(data.prototypeToken, seed, { inplace: true, insertKeys: true, overwrite: false });
    }

}