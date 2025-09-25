import {BaseDataModel, InventoryItemDataModel} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

console.log(`Loaded: ${import.meta.url}`);

export class SpellDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            equipable: new fields.BooleanField({required: true, initial: true}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }
}