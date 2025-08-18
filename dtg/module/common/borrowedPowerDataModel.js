console.log(`Loaded: ${import.meta.url}`);

import {EmbedFeatureDataModel} from "../dataModel/item/featureDataModel.js";
import {CONSTANTS} from "./constants.js";

export class BorrowedPowerDataModel extends foundry.abstract.DataModel {
    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            feature: new fields.EmbeddedDataField(EmbedFeatureDataModel),
            usesLeft: new fields.NumberField({required: false, min: 0}),
            expiresOnRest: new fields.StringField({required: false, choices: CONSTANTS.CHOICES.REST_TYPE})
        }
    }
}