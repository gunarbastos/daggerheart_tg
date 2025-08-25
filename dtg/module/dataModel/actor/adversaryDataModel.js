console.log(`Loaded: ${import.meta.url}`);

import { CONSTANTS, ResourceDataModel, ExperienceDataModel, BaseDataModel } from "../../common/index.js";
import { EmbedFeatureDataModel } from "../item/index.js";

export class AdversaryDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            resources: new fields.SchemaField({
                hp: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 0, default: 0})),
                stress: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 0, default: 0})),
            }),
            experiences: new fields.EmbeddedDataField(ExperienceDataModel),
            tier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1, max: 4}),
            type: new fields.StringField({required: false, blank: true, choices: CONSTANTS.CHOICES.ADVERSARY}),
            tactics: new fields.StringField({required: false, blank: true}),
            difficulty: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            majorDamageThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            severeDamageThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            attackModifier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            standardAttack: new fields.SchemaField({
                name: new fields.StringField({required: true, blank: false, initial: "Attack"}),
                range: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.RANGE, initial: CONSTANTS.DEFAULTS.RANGE}),
                damage: new fields.StringField({required: true, blank: false, initial: "0"}),
                damageType: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.DAMAGE_TYPES, initial: CONSTANTS.DEFAULTS.DAMAGE_TYPES}),
            }),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] })
        }
    }
}