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
    SubclassDocument, WeaponDocument
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
        return {
                position: {width: 1200, height: 1200},
                classes: [`${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.PLAYER}`],
                actions: {
                    equipItem: PlayerSheet.#equipItem,
                    unequipItem: PlayerSheet.#unequipItem,
                    consumeItem: PlayerSheet.#consumeItem,
                    activateItem: PlayerSheet.#activateItem,
                    filterItems: PlayerSheet.#filterItems,
                    deleteItem: PlayerSheet.#deleteItem,
                    openItem: PlayerSheet.#openItem,
                    attachItem: PlayerSheet.#attachItem,
                    setResource: PlayerSheet.#setResource,
                    deleteExperience: PlayerSheet.#deleteExperience,
                    addExperience: PlayerSheet.#addExperience,
                },
                form: { handler: PlayerSheet.#onSubmitForm },
                window: { title: 'Player Sheet' },
            };
    }

    static EMPTY_EXPERIENCE = { description: '', bonus: '' };

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

        if (partId === "resources") {
            part.resources = {
                hp: {},
                armor: {},
                stress: {},
                hope: {}
            }

            const iconSetting = Utils.getGameSetting(CONSTANTS.SETTINGS.MEDIUM_ICONS_STYLE);

            for (const [k, v] of Object.entries(part.resources)) {
                v.resourceName = k.capitalize();
                v.resourceList = [];
                switch(k){
                    case 'hp':
                        const usedHp = this.document.system.resources.hp.max - this.document.system.resources.hp.value;
                        v.resourceList = [...Utils.getListOfResources(this.document.system.resources.hp.max, usedHp, "hp", CONSTANTS.ASSETS.ICONS.HP.USED[iconSetting], CONSTANTS.ASSETS.ICONS.HP.AVAILABLE)];
                        break;
                    case 'armor':
                        const usedArmor = this.document.system.resources.armor.max - this.document.system.resources.armor.value;
                        v.resourceList = [...Utils.getListOfResources(this.document.system.resources.armor.max, usedArmor, "armor", CONSTANTS.ASSETS.ICONS.ARMOR.USED[iconSetting], CONSTANTS.ASSETS.ICONS.ARMOR.AVAILABLE)];
                        break;
                    case 'stress':
                        const usedStress = this.document.system.resources.stress.max - this.document.system.resources.stress.value;
                        v.resourceList = [...Utils.getListOfResources(this.document.system.resources.stress.max, usedStress, "stress", CONSTANTS.ASSETS.ICONS.STRESS.USED, CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE)];
                        break;
                    case 'hope':
                        const maxFinalHope = this.document.system.resources.hope.max - this.document.system.scars;
                        const usedHope = maxFinalHope - this.document.system.resources.hope.value;
                        const scars = Utils.getListOfResources(this.document.system.scars, 0, "hope", CONSTANTS.ASSETS.ICONS.SCAR, CONSTANTS.ASSETS.ICONS.SCAR, {invertValues: true, canClick: false});
                        for(const scar of scars){
                            scar.value += maxFinalHope;
                        }
                        v.resourceList =  [...Utils.getListOfResources(maxFinalHope, usedHope, "hope", CONSTANTS.ASSETS.ICONS.HOPE.USED, CONSTANTS.ASSETS.ICONS.HOPE.AVAILABLE, {invertValues: true}),
                            ...scars];
                        break;
                }
            }
        }

        if (partId === "quickAccess") {
            part.actions = [];
            part.experiences = [];
            part.actionFilters = [
                {name: "weapon", active: false},
                {name: "spell", active: false},
                {name: "class card", active: false},
                {name: "non-class card", active: false},
                {name: "borrowed power", active: false},
            ];

            //attacks from equipped weapons
            for(const weapon of this.document.items.filter(i => i instanceof WeaponDocument && i.getFlag(CONSTANTS.SYSTEM_ID, "equipped"))){
                part.actions.push({
                    isAttack: true,
                    isBorrowedPower: false,
                    name: weapon.name,
                    trait: weapon.system.trait,
                    damageFormula: weapon.system.damage,
                    damageType: weapon.system.damageType,
                })
            }

            //attacks from equipped spells (later, spells granted by equipped cards)
            for(const spell of this.document.items.filter(i => i instanceof SpellDocument && i.getFlag(CONSTANTS.SYSTEM_ID, "equipped"))){
                /*part.actions.push({
                    isAttack: true,
                    isBorrowedPower: false,
                    name: spell.name,
                    trait: spell.system.trait,
                    damageFormula: spell.system.damage,
                    damageType: spell.system.damageType,
                })*/
            }

            //Features description

            //borrowed powers

            //experiences
            for (const experience of this.document.system.experiences) {
                part.experiences.push({ description: experience.description, bonus: experience.bonus });
            }

            if (part.experiences.length === 0){
                part.experiences.push(this.constructor.EMPTY_EXPERIENCE);
            }
        }

        if(partId === 'characterInfo') {
            part.classText = 'None';
            part.origin = 'None';
            part.ancestry = 'None';

            const ancestries = Array.from(this.document.system.ancestries.values()).reduce((arr, ancestry) => {
                arr.push(ancestry.name);
                return arr;
            }, []);

            const communities = Array.from(this.document.system.communities.values()).reduce((arr, community) => {
                arr.push(community.name);
                return arr;
            }, []);

            const classes = Array.from(this.document.system.classes.values()).reduce((arr, rpgClass) => {
                if(rpgClass){
                    let classDescriptor = rpgClass.name;
                    for(const [k, v] of this.document.system.subclasses){
                        if(v.document.system.classUUID === rpgClass.uuid){
                            classDescriptor += ` (${v.masteryLevel} ${v.document.name})`;
                            break;
                        }
                    }
                    arr.push(classDescriptor);
                }
                return arr;
            }, []);

            if(ancestries.length > 0){ part.ancestry = Utils.joinHelper(ancestries, ' / '); }
            if(communities.length > 0){ part.origin = Utils.joinHelper(communities, ' / '); }
            if(classes.length > 0){ part.classText = Utils.joinHelper(classes, ' / '); }
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

        if (path.startsWith("system.experiences") ||
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
                    if(_data instanceof foundry.data.fields.ArrayField){
                        _data = _data.element;
                    } else {
                        _data = _data[part];
                    }
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

        if(item instanceof InventoryItemDocument){
            const data = item.toObject();
            delete data._id;

            const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
            return created;
        } else if(item instanceof DomainCardDocument){
            const currentCards = [...this.document.system.domainCardsUUIDs];
            currentCards.push(item.uuid);
            await this.document.update({'system.domainCardsUUIDs': Utils.unique(currentCards)}, { render: false });
            return undefined;
        } else if(item instanceof AncestryDocument){
            await this.document.update({'system.ancestryUUIDs': [item.uuid],}, { render: false })
            await this.render({ parts: ["characterInfo"]});
            return undefined;
        } else if(item instanceof CommunityDocument){
            await this.document.update({'system.communityUUIDs': [item.uuid],}, { render: false })
            await this.render({ parts: ["characterInfo"]});
            return undefined;
        } else if(item instanceof ClassDocument){
            const paths = {
                "system.playerClassesUUIDs": [...this.document.system.playerClassesUUIDs],
            };
            paths["system.playerClassesUUIDs"].push(item.uuid);
            paths["system.playerClassesUUIDs"] = [...Utils.unique(paths["system.playerClassesUUIDs"])];

            await this.document.update(paths, { render: false })
            await this.render({ parts: ["characterInfo"]});
            return undefined;
        } else if(item instanceof SubclassDocument){
            const paths = {
                "system.playerClassesUUIDs": [...this.document.system.playerClassesUUIDs],
                "system.playerSubclasses": [...this.document.system.playerSubclasses]
            };
            if(item.system.classUUID ){
                for(const subclass in this.document.system.playerSubclasses){
                    if(subclass.UUID === item.uuid){
                        ui.notifications.warn('Subclass already present.');
                        event.preventDefault();
                        return undefined;
                    }
                }

                paths["system.playerClassesUUIDs"].push(item.system.classUUID);
                paths["system.playerClassesUUIDs"] = [...Utils.unique(paths["system.playerClassesUUIDs"])];
                paths["system.playerSubclasses"].push({
                    UUID: item.uuid,
                    masteryLevel: CONSTANTS.DEFAULTS.SUBCLASS_MASTERY_LEVEL
                });

                await this.document.update(paths, { render: false });
                await this.render({ parts: ["characterInfo"]});
            } else {
                ui.notifications.warn('Subclass has no class associated with it.');
                event.preventDefault();
            }
            return undefined;
        } else if(item instanceof SpellDocument || item instanceof FeatureDocument){
            const data = item.toObject();
            delete data._id;

            const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
            await this.render({ parts: ["inventory"] });
            return created;
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

    static async #deleteExperience(event){
        event.preventDefault();
        const experiences = this.document.system.experiences.toSpliced(event.target.dataset.index,1);
        await this.document.update({"system.experiences": experiences}, {render: false});
        this.render({ parts: ["quickAccess"] });
    }

    static async #addExperience(event){
        event.preventDefault();
        const experiences = this.document.system.experiences.toSpliced(this.document.system.experiences.length,0, this.constructor.EMPTY_EXPERIENCE);
        if(experiences.length === 1){
            experiences.push(this.constructor.EMPTY_EXPERIENCE);
        }
        await this.document.update({"system.experiences": experiences}, {render: false});
        this.render({ parts: ["quickAccess"] });
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

    /**
     * @this {PlayerSheet}
     */
    static async #setResource(event) {
        event.preventDefault();
        let newValue = Number(event.target.dataset.value);
        if(this.document.system.resources[event.target.dataset.resource].value === newValue) event.target.dataset.resource !== "hope" ? newValue += 1 : newValue -= 1;
        this.document.update({[`system.resources.${event.target.dataset.resource}.value`]:newValue}, {render: false, skipRequester: true, appId: this.id});
        Utils.updateResourcePips(
            this.document,
            event.target.dataset.resource,
            newValue,
            'resource-row',
            'id',
            `res-${event.target.dataset.resource.capitalize()}`,
            'resource-button',
            'setResource',
            Utils.getGameSetting(CONSTANTS.SETTINGS.MEDIUM_ICONS_STYLE),
            [this.element]);
    }


}