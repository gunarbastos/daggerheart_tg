import {
    CONSTANTS,
    InventoryItemDataModel,
    EmbedInventoryItemDataModel,
    PolymorphicEmbeddedField
} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class FeatureDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            equipable: new fields.BooleanField({required: true, initial: false}),
            isGrantedToUser: new fields.BooleanField({required: true, initial: false}),
            effects: new fields.ArrayField(/** @type any*/ new PolymorphicEmbeddedField(
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.BASE,
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.MAP,
                {}))
        }
    }
}

export class EmbedFeatureDataModel extends EmbedInventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            isGrantedToUser: new fields.BooleanField({required: true, initial: false}),
            effects: new fields.ArrayField(/** @type any*/ new PolymorphicEmbeddedField(
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.BASE,
                CONSTANTS.POLYMORPHIC_TYPES.EFFECTS.MAP,
                {}))
        }
    }
}