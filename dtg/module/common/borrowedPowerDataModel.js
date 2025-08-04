import {FeatureDataModel} from "../dataModel/item";
import {CONSTANTS} from "./constants";

export class BorrowedPowerDataModel extends foundry.abstract.TypeDataModel {
    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            feature: new fields.EmbeddedDataField(FeatureDataModel),
            usesLeft: new fields.NumberField({required: false, min: 0}),
            expiresOnRest: new fields.StringField({required: false, choices: CONSTANTS.CHOICES.REST_TYPE})
        }
    }
}