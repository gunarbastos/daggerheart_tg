import { CONSTANTS } from './index';

export class TargetDataModel extends foundry.abstract.TypeDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({required: true, choices: CONSTANTS.TARGETS_VALUES}),
            numberOfTargets: new fields.StringField({required: false}),
            range: new fields.StringField({required: true}),
        }
    }
}