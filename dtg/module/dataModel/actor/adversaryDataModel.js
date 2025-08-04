import { CONSTANTS, ResourceDataModel, ExperienceDataModel, BaseDataModel } from "../../common";
import { FeatureDataModel } from "../item";

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
            experiences: new fields.EmbeddedCollectionField(ExperienceDataModel),
            tier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1, max: 4}),
            type: new fields.StringField({required: false, blank: true, choices: CONSTANTS.CHOICES.ADVERSARY}),
            tactics: new fields.StringField({required: false, blank: true}),
            difficulty: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            majorDamageThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            severeDamageThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            attackModifier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            standardAttack: new fields.SchemaField({
                name: new fields.StringField({required: true, blank: false}),
                range: new fields.StringField({required: true, blank: false}),
                damage: new fields.StringField({required: true, blank: false})
            }),
            features: new fields.EmbeddedCollectionField(FeatureDataModel)
        }
    }
}