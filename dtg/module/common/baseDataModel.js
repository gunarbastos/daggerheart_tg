import {Utils} from "./utils";

export class BaseDataModel extends foundry.abstract.TypeDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @type any */
    static defineSchema() {
        //this._enableV10Validation = true;
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: false}),
            automation: new fields.ObjectField({required: true, initial : null })
        }
    }

    _buildCacheMap(setOfUUIDs) {
        const map = new Map();
        for (const uuid of setOfUUIDs)
            map.set(uuid, Utils.getCachedDocument(uuid));
        return map;
    }
}