console.log(`Loaded: ${import.meta.url}`);

import {
    BaseDataModel,
    CONSTANTS,
    EmbedBaseDataModel,
    PolymorphicEmbeddedField
} from "../../common/index.js";

export class FeatureDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            effects: new fields.ArrayField(/** @type any*/ new PolymorphicEmbeddedField(
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.BASE,
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.MAP,
                {}))
        }
    }
}

export class EmbedFeatureDataModel extends EmbedBaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            effects: new fields.ArrayField(/** @type any*/ new PolymorphicEmbeddedField(
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.BASE,
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.MAP,
                {}))
        }
    }
}