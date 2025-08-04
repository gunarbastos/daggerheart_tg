import {InventoryItemDataModel} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class ArmorDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            baseScore: new fields.NumberField({required: true}),
            baseMajorThreshold: new fields.NumberField({required: true}),
            baseSevereThreshold: new fields.NumberField({required: true}),
            features: new fields.EmbeddedCollectionField(FeatureDataModel)
        }
    }
}