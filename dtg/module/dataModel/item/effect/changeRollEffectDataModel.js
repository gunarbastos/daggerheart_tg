console.log(`Loaded: ${import.meta.url}`);

import {EffectDataModel} from "../effectDataModel.js";
import {CONSTANTS} from "../../../common/index.js";

export class ChangeRollEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'changeRoll';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            hopeDie: new fields.StringField({required: false, blank: true}),
            fearDie: new fields.StringField({required: false, blank: true}),
            modifier: new fields.NumberField({required: false, integer: true}),
            changeRoll: new fields.StringField({required: false, blank: true, choices: CONSTANTS.CHOICES.ROLL_MODIFICATIONS}),
        }
    }
}