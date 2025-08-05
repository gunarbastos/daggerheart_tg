import {InventoryItemDataModel} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class MaterialDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            accepts: new fields.StringField({required: true, blank: true}),
            features: new fields.EmbeddedCollectionField(FeatureDataModel),
        }
    }

}