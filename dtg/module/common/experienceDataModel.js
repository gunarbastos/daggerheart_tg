import {EmbedBaseDataModel} from "./baseDataModel.js";

console.log(`Loaded: ${import.meta.url}`);

export class ExperienceDataModel extends EmbedBaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            id: new fields.DocumentIdField({required: true, blank: true, initial: ""}),
            description: new fields.HTMLField({required: true, blank: true, initial: ""}),
            bonus: new fields.StringField({required: true, initial: ""}),
            enabled: new fields.BooleanField({required: true, initial: false})
        }
    }
}