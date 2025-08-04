import {EffectDataModel} from "../effectDataModel";

export class HealEffectDataModel extends EffectDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    static _internalType = 'heal';

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            type: new fields.StringField({required: true, initial: this._internalType}),
            amount: new fields.StringField({required: true, blank: false}),
        }
    }
}
