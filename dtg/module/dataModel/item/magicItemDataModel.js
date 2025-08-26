console.log(`Loaded: ${import.meta.url}`);

import {InventoryItemDataModel} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class MagicItemDataModel extends InventoryItemDataModel {
    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            activatable: new fields.BooleanField({required: true, initial: true}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }
}