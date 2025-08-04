import {InventoryItemDataModel} from "../../common";

export class CommonItemDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            stackable: new fields.BooleanField({required: true, initial: true}),
            quantity: new fields.NumberField({required: true, min: 0, initial: 1})
        }
    }
}