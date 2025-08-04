import {BaseDataModel, Utils} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class DomainCardDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            domainUUID: new fields.DocumentUUIDField(), //UUID of Item type Domain
            level: new fields.NumberField({required: true, min: 1, max: 10}),
            recallCost: new fields.NumberField({required: true, min: 0}),
            features: new fields.EmbeddedCollectionField(FeatureDataModel),
        }
    }

    #domain = null;
    get domains() {
        if(!this.#domain) { this.#domain = Utils.getCachedDocument(this.domainUUID); }
        return this.#domain;
    }
}