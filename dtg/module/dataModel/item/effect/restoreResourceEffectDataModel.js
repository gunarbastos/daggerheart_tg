console.log(`Loaded: ${import.meta.url}`);

import {EffectDataModel} from "../effectDataModel.js";
import {CONSTANTS} from "../../../common/index.js";

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
            resource: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.RESOURCES, initial: CONSTANTS.DEFAULTS.RESOURCES}),
            quantity: new fields.StringField({required: true, blank: false, initial: "0"})
        }
    }
}