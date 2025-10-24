import {BaseDataModel} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

console.log(`Loaded: ${import.meta.url}`);

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
            startingEvasion: new fields.NumberField({required: true, min: 1, initial: 1}),
            startingHitPoints: new fields.NumberField({required: true, min: 1, initial: 1}),
            classItemsOptions: new fields.ArrayField(/** @type any */ new fields.ArrayField(/** @type any */ new fields.SchemaField({itemsUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField())}))), //2 level array of Sets of UUIDs of Items type Weapon, Armor, Consumable or CommonItem
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
            hopeFeatures: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
        }
    }

    #domains = null;
    get domains() {
        if(!this.#domains) { this.#domains = this._buildCacheMap(this.domainsUUIDs); }
        return this.#domains;
    }

    get subclasses() {
        return game.items.filter(doc => doc instanceof game.dtg.documents.SubclassDocument && doc.system.classUUID === this.uuid);
    }
}