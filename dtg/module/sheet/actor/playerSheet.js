console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS, Utils} from "../../common/index.js";
import {DtgActorSheet} from "./dtgActorSheet.js";
import {
    DomainCardDocument,
    FeatureDocument,
    FeatureItemDocument,
    InventoryItemDocument
} from "../../document/item/index.js";

export class PlayerSheet extends DtgActorSheet {

    static get PARTS() {
        const partsBasePath = `${CONSTANTS.TEMPLATES.ROOT_DIR}/sheet/player/parts`;
        return {
            characterInfo: {template:`${partsBasePath}/characterInfo.hbs`},
            resources: {template:`${partsBasePath}/resources.hbs`},
            traits: {template:`${partsBasePath}/traits.hbs`},
            quickAccess: {template:`${partsBasePath}/quickAccess.hbs`},
            inventory: {template:`${partsBasePath}/inventory.hbs`},
            roleplay: {template:`${partsBasePath}/roleplay.hbs`},
            //settings: {template:`${partsBasePath}/settings.hbs`}, //probably should do this on an App
        };
    }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return Utils.mergeObjects(
            base,
            {
                position: {width: 1200, height: 1200},
                classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.PLAYER}`]),
                actions: {
                    openSettings: PlayerSheet.#openSettings,
                    setFlag: PlayerSheet.#setFlag,
                    equipItem: PlayerSheet.#equipItem,
                    unequipItem: PlayerSheet.#unequipItem,
                    consumeItem: PlayerSheet.#consumeItem,
                    activateItem: PlayerSheet.#activateItem,
                    filterItems: PlayerSheet.#filterItems,
                    deleteItem: PlayerSheet.#deleteItem,
                    openItem: PlayerSheet.#openItem,
                    attachItem: PlayerSheet.#attachItem,
                    //itemQuantitySet: PlayerSheet.#itemQuantitySet,
                },
                form: {
                    handler: PlayerSheet.#onSubmitForm
                },
                window: {
                    contentClasses: Utils.unique([...base.window.contentClasses ?? [], 'sheet-body']),
                    title: 'Player Sheet',
                    resizable: true
                },
            });
    }

    get title(){
        return `${super.title} - ${this.document.name}`;
    }

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        const rollModValue = this.document.getFlag(CONSTANTS.SYSTEM_ID, "rollMod") ?? "";
        return {
            ...base,
            flagRollModAdv: rollModValue === CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE,
            flagRollModDis: rollModValue === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE,
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
            //Utils.log('domainCardsUUIDs', this.document.system.domainCardsUUIDs);
            //Utils.log('unified items', [...this.document.items, ...cards.values()]);
            for(const item of [...this.document.items, ...cards.values()]){
                const properItem = item.asProperType();
                itemTypes.push(properItem.type);
                let kind = "";
                let equipped = false;
                let equipable = false;
                let itemId = properItem._id;
                if(properItem instanceof DomainCardDocument){
                    kind = CONSTANTS.ITEM_TYPES.DOMAIN_CARD;
                    equipped = equippedDomainCardsUUIDs.has(properItem.uuid);
                    equipable = true;
                    itemId = properItem.uuid;
                } else {
                    kind = "embed";
                    equipped = properItem.getFlag(CONSTANTS.SYSTEM_ID, "equipped");
                    equipable = properItem.system.equipable;
                }

                if (includeAll || itemFilter[properItem.type] === true){
                    filteredItems.push({ kind: kind, equipped: equipped, equipable: equipable, id: itemId, item: properItem});
                }

                if(properItem instanceof DomainCardDocument) continue;

                if (equipped === true){
                    switch(properItem.type){
                        case CONSTANTS.ITEM_TYPES.WEAPON:
                            switch (properItem.system.slot){
                                case CONSTANTS.WEAPON_SLOT.PRIMARY:
                                    part.equippedItems.primaryWeapon = properItem;
                                    break;
                                case CONSTANTS.WEAPON_SLOT.SECONDARY:
                                    part.equippedItems.secondaryWeapon = properItem;
                                    break;
                            }
                            break;
                        case CONSTANTS.ITEM_TYPES.ARMOR:
                            part.equippedItems.armor = properItem;
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
        if(path === "name") result.push('full');

        if (path === "name" ||
            path === "img" ||
            path === "system.level" ||
            path === "system.proficiency" ||
            path === "system.ancestryUUID" ||
            path === "system.communityUUID" ||
            path === "system.playerClassesUUIDs" ||
            path.startsWith("system.playerSubclasses.")
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
            path === "system.equippedDomainCardsUUIDs"
        ) result.push("inventory");

        if (path === "system.description") result.push("roleplay");

        //if (path.startsWith("automation")) result.push("settings");

        return Utils.unique(result);
    }

    static async #onSubmitForm(event, form, formData) {
        // before/after snapshots
        const before = this.document.toObject(false);
        const after = Utils.mergeObjects(
            before,
            formData.object,
            { insertKeys: true, overwrite: true }
        );

        // get only changed fields
        const diff  = foundry.utils.diffObject(before, after);      // object of just changes
        const flat  = foundry.utils.flattenObject(diff);            // "a.b.c": value
        const listOfPaths = Object.keys(flat);

        // derive the set of parts to re-render
        const parts = new Set();
        for (const path of listOfPaths) for (const part of PlayerSheet.#partsForPath(path)) parts.add(part);

        await this.document.update(diff, { render: false });        // send only changes
        if (parts.size) await this.render({ parts: [...parts] });
    }

    async _onDropItem(event, item) {
        const properItem = item.asProperType();
        if(!(properItem instanceof InventoryItemDocument) && !(properItem instanceof FeatureDocument) && !(properItem instanceof DomainCardDocument)) {
            ui.notifications.warn('this sheet only accepts Features and Inventory items for now');
            event.preventDefault();
            return;
        }

        if(properItem instanceof DomainCardDocument){
            const currentCards = [...this.document.system.domainCardsUUIDs];
            currentCards.push(item.uuid);
            await this.document.update({'system.domainCardsUUIDs': Utils.unique(currentCards)}, { render: false });
            await this.render({ parts: ["inventory"]})
            return;
        }

        // If dragging within the same actor, ignore for now (no sort behavior yet)
        if (item.parent?.id === this.document.id) return null;

        // Ensure we have a full Item document (handles compendium/UUID drops)
        let src = item;
        if (typeof item?.toObject !== "function" && item?.uuid) {
            src = await fromUuid(item.uuid);
            if (!src) { ui.notifications.warn("Could not resolve dropped item."); return null; }
        }

        const data = src.toObject();
        delete data._id;

        const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
        await this.render({ parts: ["inventory"] });
        return created;
    }

    static async #openSettings(event) {
        await DtgActorSheet._notYetImplemented(event);
    }

    static async #setFlag(event) {
        event.preventDefault();
        let finalName = `flags.${CONSTANTS.SYSTEM_ID}.${event.target.dataset.name}`;
        const currValue = this.document.getFlag(CONSTANTS.SYSTEM_ID, event.target.dataset.name);
        let finalValue = event.target.dataset.value;
        if (event.target.dataset.toggle && currValue === finalValue) {
            finalValue = null;
            finalName = `flags.${CONSTANTS.SYSTEM_ID}.-=${event.target.dataset.name}`;
        }
        await this.document.update({[finalName]: finalValue}, {render: false});
        if(event.target.dataset.name === "rollMod"){
            await this.render({ parts: ["characterInfo"] });
            return;
        }

        this.render();
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
                //item = fromUuidSync(element?.dataset.itemId);
                const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
                equippedDomainCardsUUIDs.add(element?.dataset.itemId);
                Utils.log('equipItem', equippedDomainCardsUUIDs);
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
                item = fromUuidSync(element?.dataset.itemId);
                const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
                equippedDomainCardsUUIDs.delete(element?.dataset.itemId);
                Utils.log('unequipItem', equippedDomainCardsUUIDs);
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
        }
        await this.render({ parts: ["inventory"] });
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
                item = fromUuidSync(element?.dataset.itemId);
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
                Utils.log('equipItem', equippedDomainCardsUUIDs);
                await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs], 'system.domainCardsUUIDs': [...domainCardsUUIDs]}, { render: false });
                break;
            default:
                ui.notifications.error('Item type not set on #equipItem.')
        }
        await this.render({parts: ["inventory", "quickAccess"]});
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

    /*static async #itemQuantitySet(event) {
        Utils.log('#itemQuantitySet', event);
        return;
        const item = this.document.items.get(event.target.closest("[data-item-id]")?.dataset.itemId);
        const raw = event.target.value;
        const newQuantity = Math.max(0, Number.isFinite(+raw) ? Math.floor(+raw) : 0);
        if (newQuantity === Number(item.system.quantity ?? 0)) return;
        await item.update({ "system.quantity": newQuantity }, { render: false });
        await this.render({ parts: ["inventory"] });
    }*/

}