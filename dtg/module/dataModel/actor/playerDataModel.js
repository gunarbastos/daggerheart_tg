console.log(`Loaded: ${import.meta.url}`);

import {
    CONSTANTS,
    ResourceDataModel,
    ExperienceDataModel,
    BaseDataModel,
    Utils,
    BorrowedPowerDataModel
} from "../../common/index.js";
import {EmbedFeatureDataModel} from "../item/index.js";

export class PlayerDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            resources: new fields.SchemaField({
                hp: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 0, default: 0})),
                stress: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 6, default: 6})),
                armor: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 0, default: 0, overflows: true})),
                hope: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 6, default: 2})),
                scars: new fields.EmbeddedDataField(ResourceDataModel({min: 0, max: 6, default: 0})),
            }),
            level: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1, max: 10 }),
            majorDamageThreshold: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
            severeDamageThreshold: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
            proficiency: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
            ancestryUUIDs: new fields.SetField(/** @type {any} */new fields.DocumentUUIDField()), //UUID of Item type Ancestry
            communityUUIDs: new fields.SetField(/** @type {any} */new fields.DocumentUUIDField()), //UUID of Item type community
            traits: new fields.SchemaField({
                agility: new fields.NumberField({ required: true, integer: true, initial: 0 }),
                strength: new fields.NumberField({ required: true, integer: true, initial: 0 }),
                finesse: new fields.NumberField({ required: true, integer: true, initial: 0 }),
                knowledge: new fields.NumberField({ required: true, integer: true, initial: 0 }),
                presence: new fields.NumberField({ required: true, integer: true, initial: 0 }),
                instinct: new fields.NumberField({ required: true, integer: true, initial: 0 }),
            }),
            experiences: new fields.ArrayField(new fields.EmbeddedDataField(ExperienceDataModel), {initial: []}),
            playerClassesUUIDs: new fields.SetField(/** @type {any} */new fields.DocumentUUIDField()), //UUID of Item type Class
            playerSubclasses: new fields.ArrayField(/** @type {any} */new fields.SchemaField({
                UUID: new fields.DocumentUUIDField(),
                masteryLevel: new fields.StringField({required: true, choices: CONSTANTS.CHOICES.SUBCLASS_MASTERY_LEVEL, initial: CONSTANTS.DEFAULTS.SUBCLASS_MASTERY_LEVEL}),
            })),
            domainCardsUUIDs: new fields.SetField(/** @type {any} */new fields.DocumentUUIDField()), //UUID of Item type DomainCard
            equippedDomainCardsUUIDs: new fields.SetField(/** @type {any} */new fields.DocumentUUIDField()), //UUID of Item type DomainCard
            levelUpOptionsTaken: new fields.ObjectField({}), //same structure of CONSTANTS.LEVEL_UP_OPTIONS, but holds integers as values, representing the # of times the option was taken
            borrowedPowers: new fields.ArrayField(new fields.EmbeddedDataField(BorrowedPowerDataModel),{ initial: [] })
        }
    }

    #ancestries = null;
    get ancestries() {
        if(!this.#ancestries) { this.#ancestries = this._buildCacheMap(this.ancestryUUIDs); }
        return this.#ancestries;
    }

    #communities = null;
    get communities() {
        if(!this.#communities) { this.#communities = this._buildCacheMap(this.communityUUIDs); }
        return this.#communities;
    }

    #classes = null;
    get classes() {
        if(!this.#classes) { this.#classes = this._buildCacheMap(this.playerClassesUUIDs); }
        return this.#classes;
    }

    #subclasses = null;
    get subclasses() {
        if(!this.#subclasses) {
            this.#subclasses = new Map();
            for(const subclass in this.playerSubclasses) {
                this.#subclasses.set(subclass.UUID, { document: Utils.getCachedDocument(subclass.UUID), masteryLevel: subclass.masteryLevel });
            }
        }
        return this.#subclasses;
    }

    #domainCards = null;
    get domainCards() {
        if(!this.#domainCards) { this.#domainCards = this._buildCacheMap(this.domainCardsUUIDs); }
        return this.#domainCards;
    }

    #equippedDomainCards = null;
    get equippedDomainCards() {
        if(!this.#equippedDomainCards) { this.#equippedDomainCards = this._buildCacheMap(this.equippedDomainCardsUUIDs); }
        return this.#equippedDomainCards;
    }
}