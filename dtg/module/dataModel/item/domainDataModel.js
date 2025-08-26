console.log(`Loaded: ${import.meta.url}`);

import {BaseDataModel} from "../../common/index.js";

export class DomainDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const base = super.defineSchema();
        return {
            ...base,
            domainCardsUUIDs: new fields.SetField(/** @type any */new fields.DocumentUUIDField()), //UUIDs of Items type DomainCard
        }
    }

    #domainCards = null;
    get domainCards() {
        if(!this.#domainCards) { this.#domainCards = this._buildCacheMap(this.domainCardsUUIDs); }
        return this.#domainCards;
    }
}