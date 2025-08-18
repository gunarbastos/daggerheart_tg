console.log(`Loaded: ${import.meta.url}`);

import {Utils} from "./utils.js";

export class BaseDataModel extends foundry.abstract.TypeDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @type any */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: false}),
            automation: new fields.ObjectField({required: true, initial : { enabled: true }}),
        }
    }

    _buildCacheMap(setOfUUIDs) {
        const map = new Map();
        for (const uuid of setOfUUIDs)
            map.set(uuid, Utils.getCachedDocument(uuid));
        return map;
    }
}

export class EmbedBaseDataModel extends foundry.abstract.DataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @type any */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: false}),
            automation: new fields.ObjectField({required: true, initial : { enabled: true }}),
        }
    }

    _buildCacheMap(setOfUUIDs) {
        const map = new Map();
        for (const uuid of setOfUUIDs)
            map.set(uuid, Utils.getCachedDocument(uuid));
        return map;
    }
}