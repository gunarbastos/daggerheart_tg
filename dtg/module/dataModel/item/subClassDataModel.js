import {BaseDataModel, CONSTANTS, Utils} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

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
            spellcastTrait: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.TRAITS}),
            foundationFeatures: new fields.EmbeddedCollectionField(FeatureDataModel),
            specializationFeatures: new fields.EmbeddedCollectionField(FeatureDataModel),
            masteryFeatures: new fields.EmbeddedCollectionField(FeatureDataModel),
        }
    }

    #class = null;
    get domainCards() {
        if(!this.#class) { this.#class = Utils.getCachedDocument(this.classUUID); }
        return this.#class;
    }
}