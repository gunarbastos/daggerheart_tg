import {EffectDataModel} from "../";
import {CONSTANTS} from "../../../common";

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
            formula: new fields.StringField({required: true, blank: false}),
            toHitTrait: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.TRAITS}),
            damageType: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.DAMAGE_TYPES})
        }
    }
}