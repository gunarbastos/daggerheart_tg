import {EffectDataModel} from "../effectDataModel";
import {CONSTANTS} from "../../../common";

export class RestoreResourceEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'restoreResource';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            resource: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.RESOURCES}),
            quantity: new fields.StringField({required: true, blank: false})
        }
    }
}