console.log(`Loaded: ${import.meta.url}`);

import {InventoryItemDataModel} from "../../common/inventoryItemDataModel.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class MateriaDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            accepts: new fields.StringField({required: true, blank: true, initial: ""}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }

}