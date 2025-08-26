console.log(`Loaded: ${import.meta.url}`);

import {BaseDataModel, CONSTANTS, Utils} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class SubClassDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            classUUID: new fields.DocumentUUIDField(), //UUID of Item type Class
            spellcastTrait: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.TRAITS, initial: CONSTANTS.DEFAULTS.TRAITS}),
            foundationFeatures: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
            specializationFeatures: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
            masteryFeatures: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }

    #class = null;
    get class() {
        if(!this.#class) { this.#class = Utils.getCachedDocument(this.classUUID); }
        return this.#class;
    }
}