console.log(`Loaded: ${import.meta.url}`);

import {EmbedBaseDataModel} from "./baseDataModel.js";

export class ExperienceDataModel extends EmbedBaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: true, blank: true, initial: ""}),
            bonus: new fields.NumberField({required: true, initial: 2}),
        }
    }
}