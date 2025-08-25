import {CONSTANTS, Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

import {DtgItemSheet} from "./dtgItemSheet.js";

export class WeaponSheet extends DtgItemSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ITEM_TYPES.WEAPON}`]),

        };
    }

    static get DOCTYPE() {
        return CONSTANTS.ITEM_TYPES.WEAPON;
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        return {
            ...base,
            TRAIT_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.TRAITS.map(v => [v, v])),
            SLOT_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.WEAPON_SLOT.map(v => [v, v])),
            RANGE_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.RANGE.map(v => [v, v])),
            DAMAGETYPE_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.DAMAGE_TYPES.map(v => [v, v])),
        };
    }
}