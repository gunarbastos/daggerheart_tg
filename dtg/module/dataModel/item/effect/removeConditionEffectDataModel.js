import {EffectDataModel} from "../effectDataModel.js";

console.log(`Loaded: ${import.meta.url}`);

export class RemoveConditionEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'removeCondition';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            condition: new fields.StringField({required: true, blank: true, initial: ""})
        }
    }
}