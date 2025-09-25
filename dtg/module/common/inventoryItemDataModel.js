import {BaseDataModel, EmbedBaseDataModel} from "./baseDataModel.js";

console.log(`Loaded: ${import.meta.url}`);

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

export class EmbedInventoryItemDataModel extends EmbedBaseDataModel {

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