console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, BaseDataModel} from '../../common/index.js';
import {EmbedFeatureDataModel} from "../item/index.js";

export class EnvironmentDataModel extends BaseDataModel {


    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            tier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1, max: 4}),
            type: new fields.StringField({required: true, blank: false, choices : CONSTANTS.CHOICES.ENVIRONMENT, initial: CONSTANTS.DEFAULTS.ENVIRONMENT}),
            impulses: new fields.StringField({required: true, blank: true, initial: ""}),
            difficulty: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            potentialAdversariesUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()), //UUIDs of adversary type Actors
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] })
        }
    }

    #potentialAdversaries = null;
    get potentialAdversaries() {
        if(!this.#potentialAdversaries) { this.#potentialAdversaries = this._buildCacheMap(this.potentialAdversariesUUIDs); }
        return this.#potentialAdversaries;
    }
}