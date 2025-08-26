console.log(`Loaded: ${import.meta.url}`);

import { CONSTANTS } from './constants.js';

export class TargetDataModel extends foundry.abstract.DataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.TARGETS, initial: CONSTANTS.DEFAULTS.TARGETS}),
            numberOfTargets: new fields.StringField({required: false}),
            range: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.RANGE, initial: CONSTANTS.DEFAULTS.RANGE}),
        }
    }
}