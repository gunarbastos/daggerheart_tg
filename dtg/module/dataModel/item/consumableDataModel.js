console.log(`Loaded: ${import.meta.url}`);

import {InventoryItemDataModel} from "../../common/index.js";
import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class ConsumableDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            stackable: new fields.BooleanField({required: true, initial: true}),
            quantity: new fields.NumberField({required: true, min: 0, initial: 1}),
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