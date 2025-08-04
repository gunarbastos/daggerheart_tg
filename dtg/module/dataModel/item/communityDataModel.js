import {BaseDataModel} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class CommunityDataModel extends BaseDataModel {

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