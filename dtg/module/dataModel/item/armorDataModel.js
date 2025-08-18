console.log(`Loaded: ${import.meta.url}`);

import {InventoryItemDataModel} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class ArmorDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            baseScore: new fields.NumberField({required: true, integer: true, initial: 0}),
            baseMajorThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            baseSevereThreshold: new fields.NumberField({required: true, integer: true, min: 1, initial: 1}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
            materiaSlots: new fields.NumberField({required: true, initial: 0, min: 0}),
            equippedMateriasUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()),
        }
    }

    #equippedMaterias = null;
    get equippedMaterias() {
        if(!this.#equippedMaterias) { this.#equippedMaterias = this._buildCacheMap(this.equippedMateriasUUIDs); }
        return this.#equippedMaterias;
    }
}