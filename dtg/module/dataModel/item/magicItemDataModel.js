import {InventoryItemDataModel} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class MagicItemDataModel extends InventoryItemDataModel {
    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            features: new fields.EmbeddedCollectionField(FeatureDataModel),
        }
    }
}