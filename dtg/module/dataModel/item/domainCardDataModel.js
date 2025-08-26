console.log(`Loaded: ${import.meta.url}`);

import {BaseDataModel, Utils} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

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
            level: new fields.NumberField({required: true, min: 1, max: 10, initial: 1}),
            recallCost: new fields.NumberField({required: true, min: 0, initial: 0}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }

    #domain = null;
    get domains() {
        if(!this.#domain) { this.#domain = Utils.getCachedDocument(this.domainUUID); }
        return this.#domain;
    }
}