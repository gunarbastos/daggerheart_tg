console.log(`Loaded: ${import.meta.url}`);

import {BaseDataModel} from "./baseDataModel.js";

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
            equipable: new fields.BooleanField({required: true, initial: false}),
            consumable: new fields.BooleanField({required: true, initial: false}),
            activatable: new fields.BooleanField({required: true, initial: false}),
            attachable: new fields.BooleanField({required: true, initial: false}),
        }
    }
}