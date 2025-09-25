import {CONSTANTS, Utils} from "../../common/index.js";
import {DtgItemSheet} from "./dtgItemSheet.js";
import {ClassDocument, FeatureDocument} from "../../document/item/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class SubclassSheet extends DtgItemSheet {
    static get PARTS() { return super.PARTS; }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ITEM_TYPES.SUBCLASS}`]),

        };
    }

    static get DOCTYPE() {
        return CONSTANTS.ITEM_TYPES.SUBCLASS;
    }

    async _onDropItem(event, item) {
        // If dragging within the same actor, ignore for now (no sort behavior yet)
        if (item.parent?.id === this.document.id) return undefined;

        // Ensure we have a full Item document (handles compendium/UUID drops)
        if (typeof item?.toObject !== "function" && item?.uuid && !await Utils.fromUuid(item.uuid)) {
            ui.notifications.warn("Could not resolve dropped item.");
            return undefined;
        }

        if(item instanceof ClassDocument) {
            const paths = {
                "system.classUUID": item.uuid,
            };
            await this.document.update(paths, { render: false })
            await this.render();
            return undefined;
        //} else if (item instanceof FeatureDocument) {

        } else {
            ui.notifications.warn('this item is not supported for this sheet yet.');
            event.preventDefault();
            return undefined;

        }

    }
}