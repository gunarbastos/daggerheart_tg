import {CONSTANTS, BaseDataModel, Utils} from '../../common';
import { FeatureDataModel } from "../item";

export class EnvironmentDataModel extends BaseDataModel {


    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            tier: new fields.NumberField({required: true, integer: true, min: 1, initial: 1, max: 4}),
            type: new fields.StringField({required: true, blank: false, choices : CONSTANTS.CHOICES.ENVIRONMENT}),
            impulses: new fields.StringField({required: true, blank: false}),
            difficulty: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            potentialAdversariesUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()), //UUIDs of adversary type Actors
            features: new fields.EmbeddedCollectionField(FeatureDataModel)
        }
    }

    #potentialAdversaries = null;
    get potentialAdversaries() {
        if(!this.#potentialAdversaries) { this.#potentialAdversaries = this._buildCacheMap(this.potentialAdversariesUUIDs); }
        return this.#potentialAdversaries;
    }
}