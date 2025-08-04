import {CONSTANTS, InventoryItemDataModel} from "../../common";
import {FeatureDataModel} from "./";

export class WeaponDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            trait: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.TRAITS}),
            range: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.RANGE}),
            damage: new fields.StringField({required: true, blank: false}),
            burden: new fields.NumberField({required: true, integer: true}),
            features: new fields.EmbeddedCollectionField(FeatureDataModel)
        }
    }
}