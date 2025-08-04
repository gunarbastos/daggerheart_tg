export class ExperienceDataModel extends foundry.abstract.TypeDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: true, blank: false}),
            bonus: new fields.NumberField({required: true, initial: 2}),
        }
    }
}