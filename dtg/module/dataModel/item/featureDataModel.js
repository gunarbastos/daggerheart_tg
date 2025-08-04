import {BaseDataModel, CONSTANTS, PolymorphicEmbeddedField} from "../../common";

export class FeatureDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            effects: new fields.ArrayField(/** @type any*/ new PolymorphicEmbeddedField(
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.BASE,
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.MAP,
                {}))
        }
    }
}