console.log(`Loaded: ${import.meta.url}`);

import {TargetDataModel} from "../../common/index.js";

export class EffectDataModel extends foundry.abstract.DataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'not_set';

    /** @type any */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({required: true, initial: this._internalType}),
            target: new fields.EmbeddedDataField(TargetDataModel),
        }
    }
}