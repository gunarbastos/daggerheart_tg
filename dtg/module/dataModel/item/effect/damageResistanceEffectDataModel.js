console.log(`Loaded: ${import.meta.url}`);

import {EffectDataModel} from "../effectDataModel.js";
import {CONSTANTS} from "../../../common/index.js";

export class DamageResistanceEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'damageResistance';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            damageType: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.DAMAGE_TYPES, initial: CONSTANTS.DEFAULTS.DAMAGE_TYPES}),
            resistsFully: new fields.BooleanField({required: true, initial: false}),
        }
    }

}