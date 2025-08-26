console.log(`Loaded: ${import.meta.url}`);

import {EffectDataModel} from "../effectDataModel.js";
import {CONSTANTS} from "../../../common/index.js";

export class DamageEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'damage';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            formula: new fields.StringField({required: true, blank: false, initial: "0"}),
            toHitTrait: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.TRAITS, initial: CONSTANTS.DEFAULTS.TRAITS}),
            damageType: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.DAMAGE_TYPES, initial: CONSTANTS.DEFAULTS.DAMAGE_TYPES})
        }
    }
}