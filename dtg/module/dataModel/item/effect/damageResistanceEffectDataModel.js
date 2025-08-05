import {EffectDataModel} from "../effectDataModel";
import {CONSTANTS} from "../../../common";

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
            damageType: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.DAMAGE_TYPES}),
            resistsFully: new fields.BooleanField({required: true, initial: false}),
        }
    }

}