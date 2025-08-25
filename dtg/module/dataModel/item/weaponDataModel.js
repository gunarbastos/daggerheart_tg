import {CONSTANTS, InventoryItemDataModel} from "../../common/index.js";console.log(`Loaded: ${import.meta.url}`);


import {EmbedFeatureDataModel} from "./featureDataModel.js";

export class WeaponDataModel extends InventoryItemDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            equipable: new fields.BooleanField({required: true, initial: true}),
            trait: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.TRAITS, initial: CONSTANTS.DEFAULTS.TRAITS}),
            range: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.RANGE, initial: CONSTANTS.DEFAULTS.RANGE}),
            slot: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.WEAPON_SLOT, initial: CONSTANTS.DEFAULTS.WEAPON_SLOT}),
            damage: new fields.StringField({required: true, blank: false, initial: "0"}),
            damageType: new fields.StringField({required: true, blank: false, choices: CONSTANTS.CHOICES.DAMAGE_TYPES, initial: CONSTANTS.DEFAULTS.DAMAGE_TYPES}),
            burden: new fields.NumberField({required: true, integer: true, initial: 1}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(EmbedFeatureDataModel),{ initial: [] }),
            materiaSlots: new fields.NumberField({required: true, initial: 0, min: 0}),
            equippedMateriasUUIDs: new fields.SetField(/** @type any */ new fields.DocumentUUIDField()), //UUIDs of adversary type Actors
        }
    }

    #equippedMaterias = null;
    get equippedMaterias() {
        if(!this.#equippedMaterias) { this.#equippedMaterias = this._buildCacheMap(this.equippedMateriasUUIDs); }
        return this.#equippedMaterias;
    }

}