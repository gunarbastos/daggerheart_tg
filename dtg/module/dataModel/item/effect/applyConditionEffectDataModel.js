import {EffectDataModel} from "../effectDataModel";

export class ApplyConditionEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'applyCondition';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            condition: new fields.StringField({required: true, blank: false}),
            duration: new fields.StringField({required: true, blank: false}),
        }
    }
}