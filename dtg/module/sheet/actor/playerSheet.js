import {CONSTANTS, Utils} from "../../common/index.js";
import {DtgActorSheet} from "./dtgActorSheet.js";
import {
    AncestryDocument,
    ClassDocument,
    CommunityDocument,
    DomainCardDocument,
    FeatureDocument,
    InventoryItemDocument,
    SpellDocument,
    SubclassDocument
} from "../../document/item/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class PlayerSheet extends DtgActorSheet {

    static get PARTS() {
        const partsBasePath = `${CONSTANTS.TEMPLATES.ROOT_DIR}/sheet/player/part`;
        return {
            characterInfo: {template:`${partsBasePath}/characterInfo.hbs`},
            resources: {template:`${partsBasePath}/resources.hbs`},
            traits: {template:`${partsBasePath}/traits.hbs`},
            quickAccess: {template:`${partsBasePath}/quickAccess.hbs`},
            inventory: {template:`${partsBasePath}/inventory.hbs`},
            roleplay: {template:`${partsBasePath}/roleplay.hbs`},
            settings: {template:`${partsBasePath}/settings.hbs`},
        };
    }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
                position: {width: 1200, height: 1200},
                classes: [`${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.PLAYER}`],
                actions: {
                    ...base.actions,
                    equipItem: PlayerSheet.#equipItem,
                    unequipItem: PlayerSheet.#unequipItem,
                    consumeItem: PlayerSheet.#consumeItem,
                    activateItem: PlayerSheet.#activateItem,
                    filterItems: PlayerSheet.#filterItems,
                    deleteItem: PlayerSheet.#deleteItem,
                    openItem: PlayerSheet.#openItem,
                    attachItem: PlayerSheet.#attachItem,
                },
                form: { handler: PlayerSheet.#onSubmitForm },
                window: { title: 'Player Sheet' },
            };
    }

    get title(){
        return `${super.title} - ${this.document.name}`;
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        return {
            ...base,
            flagRollModAdv: base.rollData.rollMod === CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE,
            flagRollModDis: base.rollData.rollMod === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE,
        };
    }

    async _preparePartContext(partId, context, options) {
        const part = {};

        if (partId === "inventory") {
            part.equippedItems = {
                armor: undefined,
                primaryWeapon: undefined,
                secondaryWeapon: undefined,
                cards: []
            };

            part.equippedItems.cards = [...this.document.system.equippedDomainCards.values()];
            const cards = this.document.system.domainCards;

            const itemTypes = [];
            const filteredItems = [];
            const itemFilter = this.document.getFlag(CONSTANTS.SYSTEM_ID, "itemFilter") ?? {};
            let includeAll = true;
            for (const filter of Object.values(itemFilter)) {
                if (filter === true){
                    includeAll = false;
                    break;
                }
            }

            const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
            for(const item of [...this.document.items, ...cards.values()]){
                itemTypes.push(item.type);
                let kind = "";
                let equipped = false;
                let equipable = false;
                let itemId = item._id;
                if(item instanceof DomainCardDocument){
                    kind = CONSTANTS.ITEM_TYPES.DOMAIN_CARD;
                    equipped = equippedDomainCardsUUIDs.has(item.uuid);
                    equipable = true;
                    itemId = item.uuid;
                } else {
                    kind = "embed";
                    equipped = item.getFlag(CONSTANTS.SYSTEM_ID, "equipped");
                    equipable = item.system.equipable;
                }

                if (includeAll || itemFilter[item.type] === true){
                    filteredItems.push({ kind: kind, equipped: equipped, equipable: equipable, id: itemId, item: item});
                }

                if(item instanceof DomainCardDocument) continue;

                if (equipped === true){
                    switch(item.type){
                        case CONSTANTS.ITEM_TYPES.WEAPON:
                            switch (item.system.slot){
                                case CONSTANTS.WEAPON_SLOT.PRIMARY:
                                    part.equippedItems.primaryWeapon = item;
                                    break;
                                case CONSTANTS.WEAPON_SLOT.SECONDARY:
                                    part.equippedItems.secondaryWeapon = item;
                                    break;
                            }
                            break;
                        case CONSTANTS.ITEM_TYPES.ARMOR:
                            part.equippedItems.armor = item;
                            break;
                    }
                }
            }
            part.itemTypes = [];
            const itemTypesNames = Utils.unique(itemTypes).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }));
            for(const itemTypeName of itemTypesNames){
                part.itemTypes.push({ name: itemTypeName, active: itemFilter[itemTypeName] === true });
            }
            part.backpackItems = filteredItems;
        }

        return Utils.mergeObjects(context, part);
    }

    static #partsForPath(path){
        const result = [];
        if (!path) return [];
        if (path === "name" ||
            path === "img" ||
            path === "ownership" ||
            path === "permission" ||
            path === "folder" ||
            path.startsWith("prototypeToken"))
        {
            result.push('full');
            return result;
        }

        if (path === "system.level" ||
            path === "system.proficiency" ||
            path === "system.ancestryUUID" ||
            path === "system.communityUUID" ||
            path === "system.playerClassesUUIDs" ||
            path.startsWith("system.playerSubclasses.") ||
            path.startsWith("flags.")
        ) result.push("characterInfo");

        if (path.startsWith("system.resources.") ||
            path === "system.scars" ||
            path === "system.majorDamageThreshold" ||
            path === "system.severeDamageThreshold" ||
            path === "system.evasion"
        ) result.push("resources");

        if (path.startsWith("system.traits.")) result.push("traits");

        if (path === "system.experiences" ||
            path === "system.equippedDomainCardsUUIDs" ||
            path.startsWith("system.borrowedPowers") ||
            path.startsWith("items")
        ) result.push("quickAccess");

        if (path.startsWith("items") ||
            path === "system.domainCardsUUIDs" ||
            path === "system.equippedDomainCardsUUIDs" ||
            path.startsWith("system.currency")
        ) result.push("inventory");

        if (path === "system.description") result.push("roleplay");

        //if (path.startsWith("automation")) result.push("settings");

        return Utils.unique(result);
    }

    static requiresRender(path){
        const flat  = foundry.utils.flattenObject(path);            // "a.b.c": value
        const listOfPaths = Object.keys(flat);
        const parts = new Set();
        for (const path of listOfPaths) for (const part of PlayerSheet.#partsForPath(path)) parts.add(part);
        const result = {
            requires: parts.size && parts.size > 0,
            options: {}
        }
        if(result.requires === false) return result;

        if(parts.size && !parts.has('full'))
            result.options.parts = [...parts];
        else
            result.options.force = true;
        return result;
    }

    static async #onSubmitForm(event, form, formData) {
        const before = this.document.toObject(false);
        const formDataObject = formData.object;

        //we modify the before snapshot based on the values returned by the formData.
        //this is due to the fact that all input that the user can type are text
        //and thus they come as string instead of the proper type
        for(const[key, value] of Object.entries(formDataObject)){
            const keyParts = key.split(".");
            if(keyParts[0] === 'system'){
                let _data = this.document.system.schema.fields;
                keyParts.shift();
                for(const part of keyParts){
                    _data = _data[part];
                    if(_data instanceof foundry.data.fields.SchemaField) _data = _data.fields;
                }

                if(_data instanceof foundry.data.fields.NumberField){
                    formDataObject[key] = Number(formDataObject[key]);
                }
            }
        }

        const after = Utils.mergeObjects(
            before,
            formDataObject,
            { insertKeys: true, overwrite: true }
        );

        // get only changed fields
        const diff  = foundry.utils.diffObject(before, after);      // object of just changes
        const flat  = foundry.utils.flattenObject(diff);            // "a.b.c": value
        const listOfPaths = Object.keys(flat);

        // derive the set of parts to re-render
        const parts = new Set();
        for (const path of listOfPaths) for (const part of PlayerSheet.#partsForPath(path)) parts.add(part);

        if (parts.size && !parts.has('full'))
            await this.document.update(diff, { render: false, skipRequester: true, appId: this.id });
        else
            await this.document.update(diff);

    }

    async _onDropItem(event, item) {
        /*if(!(item instanceof InventoryItemDocument) && !(item instanceof FeatureDocument) && !(item instanceof DomainCardDocument)) {
            ui.notifications.warn('this sheet only accepts Features and Inventory items for now');
            event.preventDefault();
            return;
        }*/

        // If dragging within the same actor, ignore for now (no sort behavior yet)
        if (item.parent?.id === this.document.id) return undefined;

        // Ensure we have a full Item document (handles compendium/UUID drops)
        if (typeof item?.toObject !== "function" && item?.uuid && !await Utils.fromUuid(item.uuid)) {
            ui.notifications.warn("Could not resolve dropped item.");
            return undefined;
        }

        Utils.log('PlayerSheet', '_onDropItem', this.document, item);

        if(item instanceof InventoryItemDocument){
            const data = item.toObject();
            delete data._id;

            Utils.log('PlayerSheet', '_onDropItem', 'calling createEmbeddedDocuments');
            const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
            return created;
        } else if(item instanceof DomainCardDocument){
            const currentCards = [...this.document.system.domainCardsUUIDs];
            currentCards.push(item.uuid);
            await this.document.update({'system.domainCardsUUIDs': Utils.unique(currentCards)}, { render: false });
            return undefined;
         } else if(item instanceof AncestryDocument){
            await this.document.update({'system.ancestryUUIDs': [item.uuid],}, { render: false })
            return undefined;
         } else if(item instanceof CommunityDocument){
            await this.document.update({'system.communityUUIDs': [item.uuid],}, { render: false })
            return undefined;
        // } else if(item instanceof ClassDocument){
        //
         } else if(item instanceof SubclassDocument){
            const paths = {
                "system.playerClassesUUIDs": [],
                "system.playerSubclasses": []
            };
            paths["system.playerClassesUUIDs"].push(item.classUUID);
            paths["system.playerSubclasses"].push({
                UUID: item.uuid,
                masteryLevel: CONSTANTS.DEFAULTS.SUBCLASS_MASTERY_LEVEL
            });

            await this.document.update(paths, { render: false })
            await this.render({ parts: ["character-info"]});
            return undefined;
         } else if(item instanceof SpellDocument){
            //temporary
            const data = src.toObject();
            delete data._id;

            const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
            await this.render({ parts: ["inventory"] });
            return created;
        // } else if(item instanceof FeatureDocument){
        //
        } else {
            ui.notifications.warn('this item is not supported for this sheet yet.');
            event.preventDefault();
            return undefined;
        }
    }

    static async _actionSetFlag(event) {
        const preventRender = event.target.dataset.name === "rollMod";
        await super._actionSetFlag(event, {preventRender: preventRender});
    }

    static async #equipItem(event) {
        ui.notifications.info('Not fully implemented yet. Need to check slots & such');
        event.preventDefault();
        const element = event.target.closest("[data-item-id]");
        let item = undefined;
        switch(element.dataset.itemKind){
            case "embed":
                item = this.document.items.get(element?.dataset.itemId);
                await item.update({[`flags.${CONSTANTS.SYSTEM_ID}.equipped`]: true}, {render: false});
                break;
            case CONSTANTS.ITEM_TYPES.DOMAIN_CARD:
                const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
                equippedDomainCardsUUIDs.add(element?.dataset.itemId);
                await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs]}, { render: false });
                break;
            default:
                ui.notifications.error('Item type not set on #equipItem.')
        }
        await this.render({parts: ["inventory", "quickAccess"]});
    }

    static async #unequipItem(event) {
        event.preventDefault();
        const element = event.target.closest("[data-item-id]");
        let item = undefined;
        switch(element.dataset.itemKind){
            case "embed":
                item = this.document.items.get(element?.dataset.itemId);
                await item.update({[`flags.${CONSTANTS.SYSTEM_ID}.equipped`]: false}, {render: false});
                break;
            case CONSTANTS.ITEM_TYPES.DOMAIN_CARD:
                item = Utils.fromUuidSync(element?.dataset.itemId);
                const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
                equippedDomainCardsUUIDs.delete(element?.dataset.itemId);
                await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs]}, { render: false });
                break;
            default:
                ui.notifications.error('Item type not set on #equipItem.')
        }
        await this.render({ parts: ["inventory", "quickAccess"] });
    }

    static async #consumeItem(event) {
        event.preventDefault();
        const id = event.target.closest("[data-item-id]")?.dataset.itemId;
        const item = this.document.items.get(id);
        const qtd = item.system.quantity;
        if(qtd === 1){
            await this.document.deleteEmbeddedDocuments("Item", [id], {render: false});
        } else {
            await item.update({'system.quantity': qtd - 1}, {render: false});
            await this.render({ parts: ["inventory"] });
        }
    }

    static async #activateItem(event) {
        event.preventDefault();
        await DtgActorSheet._notYetImplemented(event);
        const item = this.document.items.get(event.target.closest("[data-item-id]")?.dataset.itemId);
    }

    static async #attachItem(event) {
        event.preventDefault();
        await DtgActorSheet._notYetImplemented(event);
        const item = this.document.items.get(event.target.closest("[data-item-id]")?.dataset.itemId);
    }

    static async #filterItems(event) {
        event.preventDefault();
        const itemFilter = this.document.getFlag(CONSTANTS.SYSTEM_ID, "itemFilter") ?? {};
        if(itemFilter[event.target.dataset.filter] === true) {
            itemFilter[event.target.dataset.filter] = false;
        } else {
            itemFilter[event.target.dataset.filter] = true;
        }
        await this.document.update({[`flags.${CONSTANTS.SYSTEM_ID}.itemFilter`]: itemFilter}, {render: false});

        this.render({ parts: ["inventory"]});
    }

    static async #openItem(event) {
        event.preventDefault();
        const element = event.target.closest("[data-item-id]");
        let item = undefined;
        switch(element.dataset.itemKind){
            case "embed":
                item = this.document.items.get(element?.dataset.itemId);
                break;
            case CONSTANTS.ITEM_TYPES.DOMAIN_CARD:
                item = Utils.fromUuidSync(element?.dataset.itemId);
                break;
        }
        if(item) {
            await item.sheet?.render({force: true});
        } else {
            ui.notifications.error('Could not find the item.');
        }
    }

    static async #deleteItem(event) {
        event.preventDefault();
        const element = event.target.closest("[data-item-id]");
        switch(element.dataset.itemKind){
            case "embed":
                const id = element?.dataset.itemId;
                await this.document.deleteEmbeddedDocuments("Item", [id], {render: false});
                break;
            case CONSTANTS.ITEM_TYPES.DOMAIN_CARD:
                const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
                equippedDomainCardsUUIDs.delete(element?.dataset.itemId);
                const domainCardsUUIDs = this.document.system.domainCardsUUIDs;
                domainCardsUUIDs.delete(element?.dataset.itemId);
                await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs], 'system.domainCardsUUIDs': [...domainCardsUUIDs]}, { render: false });
                break;
            default:
                ui.notifications.error('Item type not set on #equipItem.')
        }
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        this._handleDoubleClick ??= this.#handleDoubleClick.bind(this); // keep app as `this`
        this.element.addEventListener("dblclick", this._handleDoubleClick);

        this._onQtyChange ??= this.#onQtyChange.bind(this);
        this.element.addEventListener("change", this._onQtyChange);
    }

    async #handleDoubleClick(event) {
        //Handles double click on Inventory item-row
        const row = event.target.closest(".item-row");
        if(row && !(event.target.tagName === 'BUTTON')){
            await this.document.items.get(row.dataset.itemId)?.sheet?.render({force: true});
        }
    }

    async #onQtyChange(event) {
        const target = event.target;
        if (!target.matches(".qty-input")) return;

        const row  = target.closest("[data-item-id]");
        if (!row) return;
        const item = this.document.items.get(row.dataset.itemId);

        const raw = target.value;
        const newQuantity   = Math.max(0, Number.isFinite(+raw) ? Math.trunc(+raw) : 0);

        if (newQuantity === Number(item.system.quantity ?? 0)) return;
        await item.update({ "system.quantity": newQuantity }, { render: false });
        await this.render({ parts: ["inventory"] });
    }

}