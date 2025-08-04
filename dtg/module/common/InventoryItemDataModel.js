import {BaseDataModel} from "./baseDataModel";

export class InventoryItemDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            stackable: new fields.BooleanField({required: true, initial: false}),
        }
    }
}