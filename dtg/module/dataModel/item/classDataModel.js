import {BaseDataModel, CONSTANTS} from "../../common";
import {FeatureDataModel} from "./featureDataModel";

export class ClassDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            domainsUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()), //UUIDs of Items type Domain
            startingEvasion: new fields.NumberField({required: true, min: 1}),
            startingHitPoints: new fields.NumberField({required: true, min: 1}),
            classItemsOptions: new fields.ArrayField(/** @type any */ new fields.ArrayField(/** @type any */ new fields.SchemaField({itemsUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField())}))), //2 level array of Sets of UUIDs of Items type Weapon, Armor, Consumable or CommonItem
            features: new fields.EmbeddedCollectionField(FeatureDataModel),
            hopeFeatures: new fields.EmbeddedCollectionField(FeatureDataModel),
            subclassesUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()),//UUIDs of Item type Subclasses
        }
    }

    #domains = null;
    get domains() {
        if(!this.#domains) { this.#domains = this._buildCacheMap(this.domainsUUIDs); }
        return this.#domains;
    }

    #subclasses = null;
    get subclasses() {
        if(!this.#subclasses) { this.#subclasses = this._buildCacheMap(this.subclassesUUIDs); }
        return this.#subclasses;
    }
}