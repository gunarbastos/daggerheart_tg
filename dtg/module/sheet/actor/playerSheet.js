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

    //#region Static var overrides
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
                filterItems: PlayerSheet.#filterBackpackItems,
                filterActions: PlayerSheet.#filterQuickActionsItems,
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
    //#endregion

    //#region class variables
    #backpackItems = new Map();
    #experienceItems = new Map();
    #quickActionItems = new Map();
    #backpackContainer = undefined;
    #experienceContainer = undefined;
    #quickActionsContainer = undefined;
    //#endregion

    //#region method overrides
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

        switch(partId) {
            case "inventory":
                const cardsUUIDSet = new Set(this.document.system.domainCardsUUIDs);
                for (const [key, value] of this.#backpackItems) {
                    if (value instanceof DomainCardDocument) {
                        if (!cardsUUIDSet.has(key)) this.#backpackItems.delete(key);
                    } else {
                        if (!this.document.items.has(key)) this.#backpackItems.delete(key);
                    }
                }

                const cards = this.document.system.domainCards;

                const itemTypes = [];
                const itemFilter = this.#getBackpackFilters();

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

                    if(!this.#backpackItems.has(itemId)){
                        const currSize = this.#backpackItems.size;
                        this.#backpackItems.set(
                            itemId,
                            {
                                item: item,
                                dom: await this.#buildDomForBackpackRow(item, kind, equipped, equipable, itemId, currSize),
                                order: currSize,
                            });
                    } else {
                        const backpackItem = this.#backpackItems.get(item.id);
                        backpackItem.dom.replaceChildren(...(await this.#buildDomForBackpackRow(item, kind, equipped, equipable, itemId, backpackItem.order)).children);
                    }

                    if(item instanceof DomainCardDocument) continue;

                }
                part.itemTypes = [];
                const itemTypesNames = Utils.unique(itemTypes).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }));
                for(const itemTypeName of itemTypesNames){
                    part.itemTypes.push(
                        {
                            name: itemTypeName,
                            active: itemFilter[itemTypeName] === true,
                            ...(itemFilter[itemTypeName] === true ? {icon: 'bi-check-lg'} : {})
                        });
                }
                break;
            case "resources":
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
                break;
            case "quickAccess":
                //#region Quick Actions
                for (const key of this.#quickActionItems.keys()) {
                   if (!this.document.items.has(key) /* add here later with && the other sources of quick Actions, like spells, Ancestries, etc */) {
                       this.#quickActionItems.delete(key);
                   }
                }


                part.experienceButtons = [
                    {
                        name: "Add",
                        icon: "bi-plus-lg",
                        action: "addExperience",
                    }
                ];
                const filters = this.#getQuickActionFilters();
                part.actionFilters = [
                    {name: "weapon", active: !!filters?.["weapon"]},
                    {name: "spell", active: !!filters?.["spell"]},
                    {name: "class card", active: !!filters?.["class card"]},
                    {name: "non-class card", active: !!filters?.["non-class card"]},
                    {name: "borrowed power", active: !!filters?.["borrowed power"]},
                ];

                //attacks from equipped weapons
                for(const weapon of this.document.items.filter(i => i instanceof WeaponDocument)){
                    if (weapon.getFlag(CONSTANTS.SYSTEM_ID, "equipped")){
                        this.#quickActionItems.set(
                            weapon._id,
                            await this.#buildAction({
                                type: 'weapon',
                                id: weapon._id,
                                originId: weapon._id,
                                isAttack: true,
                                isBorrowedPower: false,
                                name: weapon.name,
                                trait: weapon.system.trait,
                                damageFormula: weapon.system.damage,
                                damageType: weapon.system.damageType,
                            })
                        );
                    } else {
                        this.#quickActionItems.delete(weapon._id);
                    }
                }

                //attacks from equipped spells (later, spells granted by equipped cards)
                for(const spell of this.document.items.filter(i => i instanceof SpellDocument && i.getFlag(CONSTANTS.SYSTEM_ID, "equipped"))){
                    /*actions.push({
                        isAttack: true,
                        isBorrowedPower: false,
                        name: spell.name,
                        trait: spell.system.trait,
                        damageFormula: spell.system.damage,
                        damageType: spell.system.damageType,
                    })*/
                }

                //Features

                //borrowed powers
                //endregion

                //#region experiences
                for (const key of this.#experienceItems.keys()) {
                    if (!this.document.system.experiences.some(element => element.id === key)){
                        this.#experienceItems.delete(key);
                    }
                }

                for(const index in this.document.system.experiences) {
                    const experience = this.document.system.experiences[index];
                    if (!this.#experienceItems.has(experience.id)) {
                        this.#experienceItems.set(
                            experience.id,
                            {
                                index: index,
                                experience: experience,
                                dom: await this.#buildDomForExperience(index, experience)
                            });
                    } else {
                        const experienceItem = this.#experienceItems.get(experience.id);
                        experienceItem.dom.replaceChildren(...(await this.#buildDomForExperience(index, experience)).children);
                    }
                }
                //endregion

                break;
            case "characterInfo":
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
                break;
        }

        return Utils.mergeObjects(context, part);
    }

    async _onDropItem(event, item) {
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
            return undefined;
        } else if(item instanceof CommunityDocument){
            await this.document.update({'system.communityUUIDs': [item.uuid],}, { render: false })
            return undefined;
        } else if(item instanceof ClassDocument){
            const paths = {
                "system.playerClassesUUIDs": [...this.document.system.playerClassesUUIDs],
            };
            paths["system.playerClassesUUIDs"].push(item.uuid);
            paths["system.playerClassesUUIDs"] = [...Utils.unique(paths["system.playerClassesUUIDs"])];

            await this.document.update(paths, { render: false })
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
            } else {
                ui.notifications.warn('Subclass has no class associated with it.');
                event.preventDefault();
            }
            return undefined;
        } else if(item instanceof SpellDocument || item instanceof FeatureDocument){
            const data = item.toObject();
            delete data._id;

            const [created] = await this.document.createEmbeddedDocuments("Item", [data], { render: false });
            return created;
        } else {
            ui.notifications.warn('this item is not supported for this sheet yet.');
            event.preventDefault();
            return undefined;
        }
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        this._handleDoubleClick ??= this.#handleDoubleClick.bind(this); // keep app as `this`
        this.element.addEventListener("dblclick", this._handleDoubleClick);

        this._onQtyChange ??= this.#onQtyChange.bind(this);
        this.element.addEventListener("change", this._onQtyChange);

        this.#setBackpackContainer();
        this.#populateBackpackItems();

        this.#setQuickActionsContainer();
        this.#populateQuickActions();

        this.#setExperiencesContainer();
        this.#populateExperiences();
    }

    async _onRender(context, options) {
        super._onRender(context, options);

        this.#reconnectBackpackContainer();
        this.#reconnectQuickActionContainer();
        this.#reconnectExperiencesContainer();

        this.#animateBackpack().then(r => null);
        this.#animateQuickActions().then(r => null);
        this.#animateExperiences().then(r => null);
    }
    //#endregion

    //#region form submission and outside update integration
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
            path === `flags.${CONSTANTS.SYSTEM_ID}.${PlayerSheet.FLAG_NAMES.rollMod}`
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
    //#endregion

    //#region actions
    static async _actionSetFlag(event) {
        const preventRender = event.target.dataset.name === "rollMod";
        await super._actionSetFlag(event, {preventRender: preventRender});
    }

    static async #equipItem(event) {
        event.preventDefault();
        const itemId = event.target.closest("[data-item-id]").dataset.itemId;
        const mapItem = this.#backpackItems.get(itemId);
        if (mapItem.item instanceof DomainCardDocument) {
            const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
            equippedDomainCardsUUIDs.add(itemId);
            await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs]}, { render: false });
        } else if (mapItem.item.parent?.id === this.document.id) {
            const item = this.document.items.get(itemId);
            await item.update({[`flags.${CONSTANTS.SYSTEM_ID}.equipped`]: true}, {render: false});
        } else {
            ui.notifications.error('Item type not set on #equipItem.')
        }
    }

    static async #unequipItem(event) {
        event.preventDefault();
        const itemId = event.target.closest("[data-item-id]").dataset.itemId;
        const mapItem = this.#backpackItems.get(itemId);
        if (mapItem.item instanceof DomainCardDocument) {
            const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
            equippedDomainCardsUUIDs.delete(itemId);
            await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs]}, { render: false });
        } else if (mapItem.item.parent?.id === this.document.id) {
            const item = this.document.items.get(itemId);
            await item.update({[`flags.${CONSTANTS.SYSTEM_ID}.equipped`]: false}, {render: false});
        } else {
            ui.notifications.error('Item type not set on #unequipItem.')
        }
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
    }

    static async #activateItem(event) {
        event.preventDefault();
        Utils.actionNotYetImplemented(event);
    }

    static async #attachItem(event) {
        event.preventDefault();
        Utils.actionNotYetImplemented(event);
    }

    static async #filterBackpackItems(event) {
        event.preventDefault();
        const itemFilter = this.#getBackpackFilters();
        if(itemFilter[event.target.dataset.filter] === true) {
            itemFilter[event.target.dataset.filter] = false;
        } else {
            itemFilter[event.target.dataset.filter] = true;
        }
        event.target.setAttribute('aria-pressed', String(itemFilter[event.target.dataset.filter]));
        event.target.querySelector('i').classList.toggle('bi-check-lg');
        await this.document.update({[`flags.${CONSTANTS.SYSTEM_ID}.itemFilter`]: itemFilter}, {render: false});

        await this.#applyBackpackFilter(itemFilter);
    }

    static async #openItem(event) {
        event.preventDefault();
        const itemId = event.target.closest("[data-item-id]").dataset.itemId;
        const mapItem = this.#backpackItems.get(itemId);
        let item = undefined;
        if (mapItem.item instanceof DomainCardDocument) {
            item = Utils.fromUuidSync(itemId);
        } else if (mapItem.item.parent?.id === this.document.id) {
            item = this.document.items.get(itemId);
        } else {
            ui.notifications.error('Item type not set on #openItem.');
            return null;
        }

        if(item) {
            await item.sheet?.render({force: true});
        } else {
            ui.notifications.error('Could not find the item.');
        }
    }

    static async #deleteItem(event) {
        event.preventDefault();
        const itemId = event.target.closest("[data-item-id]").dataset.itemId;
        const mapItem = this.#backpackItems.get(itemId);
        if (mapItem.item instanceof DomainCardDocument) {
            const equippedDomainCardsUUIDs = this.document.system.equippedDomainCardsUUIDs;
            equippedDomainCardsUUIDs.delete(itemId);
            const domainCardsUUIDs = this.document.system.domainCardsUUIDs;
            domainCardsUUIDs.delete(itemId);
            await this.document.update({'system.equippedDomainCardsUUIDs': [...equippedDomainCardsUUIDs], 'system.domainCardsUUIDs': [...domainCardsUUIDs]}, { render: false });
        } else if (mapItem.item.parent?.id === this.document.id) {
            await this.document.deleteEmbeddedDocuments("Item", [itemId], {render: false});
        } else {
            ui.notifications.error('Item type not set on #.')
        }
    }

    static async #deleteExperience(event){
        event.preventDefault();
        let experiences = this.document.system.experiences;
        if (this.document.system.experiences.length > 1) {
            experiences = this.document.system.experiences.filter(element => element.id !== event.target.parentElement.id);
        } else if ((this.document.system.experiences.length === 1) && this.document.system.experiences[0].id === event.target.parentElement.id){
            experiences[0].bonus = '';
            experiences[0].description = '';
            experiences[0].enabled = false;
            const dom = this.#experienceItems.get(event.target.parentElement.id).dom;
            for (const element of dom.querySelectorAll('.field-input')) {
                element.value = '';
            }
        }
        await this.document.update({"system.experiences": experiences}, {render: false});
    }

    static async #addExperience(event){
        event.preventDefault();
        const experiences = this.document.system.experiences.toSpliced(this.document.system.experiences.length,0, Utils.getEmptyExperience());
        this.document.update({"system.experiences": experiences}, {render: false});
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

    static async #filterQuickActionsItems(event) {
        event.preventDefault();
        const quickActionFilter = this.#getQuickActionFilters();
        if(quickActionFilter[event.target.dataset.filter] === true) {
            quickActionFilter[event.target.dataset.filter] = false;
        } else {
            quickActionFilter[event.target.dataset.filter] = true;
        }
        event.target.setAttribute('aria-pressed', String(quickActionFilter[event.target.dataset.filter]));
        event.target.querySelector('i').classList.toggle('bi-check-lg');
        await this.document.update({[`flags.${CONSTANTS.SYSTEM_ID}.quickActionFilter`]: quickActionFilter}, {render: false});

        await this.#applyQuickActionsFilter(quickActionFilter);
    }
    //#endregion

    //#region generic helper functions
    get title(){
        return `${super.title} - ${this.document.name}`;
    }

    #defineOrder(action) {
        const rank =
            action.isAttack ? 0 :
                action.isBorrowedPower ? 1 : 2;

        const origin = action.originId ?? "";               // strings: A→Z
        const group  = Number.isFinite(action.group) ? action.group : 9999;
        const prio   = Number.isFinite(action.priority) ? action.priority : 9999;
        const name   = (action.name ?? "").toLocaleLowerCase();

        // Return a tuple; JS sort can compare lexicographically via a helper
        return [rank, origin, group, prio, name];
    }

    #cmpTuple(a, b) {
        for (let i = 0; i < a.length; i++) {
            const A = a[i], B = b[i];
            if (typeof A === "string" && typeof B === "string") {
                const c = A.localeCompare(B);
                if (c) return c;
            } else if (A < B) return -1;
            else if (A > B) return 1;
        }
        return 0;
    }
    //#endregion

    //#region event handlers
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
    }

    async #handleDoubleClick(event) {
        //Handles double click on Inventory item-row
        const row = event.target.closest(".item-row");
        if(row && !(event.target.tagName === 'BUTTON')){
            await this.document.items.get(row.dataset.itemId)?.sheet?.render({force: true});
        }
    }
    //#endregion

    //#region backpack Functions
    async #buildDomForBackpackRow(item, kind, equipped, equipable, itemId, order){
        const dom = await foundry.applications.handlebars.renderTemplate(
            CONSTANTS.TEMPLATES.PLAYER_SHEET_BACKPACK_ROW.PATH,
            {
                backpackItem: {
                    kind: kind,
                    equipped: equipped,
                    equipable: equipable,
                    id: itemId,
                    item: item
                },
                order: order
            });
        const elementHolder = document.createElement('template');
        elementHolder.innerHTML = dom.trim();
        return elementHolder.content.firstElementChild;
    }

    #populateBackpackItems() {
        this.#flipBackpackMutator(this.#backpackContainer, { filters: this.#getBackpackFilters() });
    }

    #getCurrentBackpackContainer() {
        return this.element.querySelector('div.item-list');
    }

    #setBackpackContainer() {
        this.#backpackContainer = this.#getCurrentBackpackContainer()
    }

    async #applyBackpackFilter(filters) {
        await Utils.flipList(this.#backpackContainer, this.#flipBackpackMutator.bind(this), { filters });
    }

    #flipBackpackMutator(list, { filters }) {
        const isAll = !Object.values(filters)?.some(Boolean);
        const sortedRows = [...this.#backpackItems.values()].sort((a, b) => a.order - b.order);

        for (const element of Array.from(list.querySelectorAll('.item-row'))) {
            const id = element.dataset.itemId;
            const row = this.#backpackItems.get(id);
            const keep = row && (isAll || !!filters?.[row.item.type]);
            element.dataset.remove = keep ? 'false' : 'true';
        }

        for (const row of sortedRows) {
            if ((isAll || !!filters?.[row.item.type]) && !row.dom.isConnected) {
                row.dom.style.opacity = '0';

                const before = Array
                    .from(list.children)
                    .find(el => el.matches('.item-row')
                        && el.dataset.remove !== 'true'
                        && ((+el.dataset.order || 0) > row.order)) ?? null;

                list.insertBefore(row.dom, before);
                queueMicrotask(() => row.dom.style.removeProperty('opacity'));
            }
        }
    }

    #getBackpackFilters() {
        return this.document.getFlag(CONSTANTS.SYSTEM_ID, "itemFilter") ?? {};
    }

    #reconnectBackpackContainer() {
        if (this.#backpackContainer && !this.#backpackContainer.isConnected) {
            this.#getCurrentBackpackContainer().replaceWith(this.#backpackContainer);
            for (const element of this.#backpackContainer.querySelectorAll('.item-row')) {
                if (this.#quickActionItems.has(element.dataset.ItemId)){
                    this.#quickActionItems.get(element.dataset.ItemId).dom = element;
                }
            }
        }
    }

    async #animateBackpack() {
        await Utils.flipList(this.#backpackContainer, this.#flipBackpackMutator.bind(this), { filters: this.#getBackpackFilters() });
    }
    //#endregion

    //#region Experiences Functions
    async #buildDomForExperience(index, experience) {
        const dom = await foundry.applications.handlebars.renderTemplate(
            CONSTANTS.TEMPLATES.SHEET_EXPERIENCE_ROW.PATH,
            {
                index: index,
                experience: experience
            });
        const elementHolder = document.createElement('template');
        elementHolder.innerHTML = dom.trim();
        return elementHolder.content.firstElementChild;
    }

    #getCurrentExperiencesContainer() {
        return this.element.querySelector('div.section-body#experiences-body div.info');
    }

    #setExperiencesContainer() {
        this.#experienceContainer = this.#getCurrentExperiencesContainer();
    }

    #reconnectExperiencesContainer() {
        if (this.#experienceContainer && !this.#experienceContainer.isConnected) {
            this.#getCurrentExperiencesContainer().replaceWith(this.#experienceContainer);
            for (const element of this.#experienceContainer.querySelectorAll('.experience')) {
                if (this.#experienceItems.has(element.id)){
                    this.#experienceItems.get(element.id).dom = element;
                }
            }
        }
    }

    #populateExperiences(){
        this.#flipExperiencesMutator(this.#experienceContainer);
    }

    async #animateExperiences({deleted = false, inserted = false} = {}) {
        await Utils.flipList(this.#experienceContainer, this.#flipExperiencesMutator.bind(this));
    }

    #flipExperiencesMutator(list) {
        const sortedExperiences = [...this.#experienceItems.values()].sort((a, b) => a.index - b.index);

        for (const element of Array.from(list.querySelectorAll('.experience'))) {
            const elementIdx = sortedExperiences.findIndex(a => a.dom === element);
            const row = elementIdx > -1 ? sortedExperiences[elementIdx] : undefined;
            element.dataset.remove = row ? 'false' : 'true';
        }

        for (const row of sortedExperiences) {
            if(!row.dom.isConnected){
                const before = Array
                    .from(list.children)
                    .find(el => el.matches('.experience')
                        && el.dataset.remove !== 'true'
                        && ((+el.dataset.order || 0) > row.order)) ?? null;
                list.insertBefore(row.dom, before);
            }
        }
    }
    //#endregion

    //#region Quick Actions Functions
    async #buildAction(action){
        const dom = await foundry.applications.handlebars.renderTemplate(
            CONSTANTS.TEMPLATES.PLAYER_SHEET_QUICKACTION_ROW.PATH,
            {
                action: action
            }
        );
        const elementHolder = document.createElement("template");
        elementHolder.innerHTML = dom.trim();
        return {
            dom: elementHolder.content.firstElementChild,
            action: action,
            order: this.#defineOrder(action),
        }
    }

    #setQuickActionsContainer() {
        this.#quickActionsContainer = this.#getCurrentQuickActionsContainer();
    }

    #getCurrentQuickActionsContainer() {
        return this.element.querySelector('div.section-body#actions-body div.actions');;
    }

    async #animateQuickActions(){
        await Utils.flipList(this.#quickActionsContainer, this.#flipActionListMutator.bind(this), { filters: this.#getQuickActionFilters() });
    }

    #flipActionListMutator(list, { filters } = {}) {
        const isAll = !Object.values(filters)?.some(Boolean);
        const sortedActions = [ ...this.#quickActionItems.values() ].sort((a, b) => this.#cmpTuple(a.order, b.order));

        for (const element of Array.from(list.querySelectorAll('.action'))) {
            const elementIdx = sortedActions.findIndex(a => a.dom === element);
            const row = elementIdx > -1 ? sortedActions[elementIdx] : undefined;
            const keep = row && (isAll || !!filters?.[row.action.type]);
            element.dataset.remove = keep ? 'false' : 'true';
        }

        for (const row of sortedActions) {
            if(isAll || !!filters?.[row.action.type]){
                if(!row.dom.isConnected){
                    let before = null;
                    const currIndex = sortedActions.findIndex(a => a === row);
                    if(currIndex > -1 && currIndex < sortedActions.length-1 ) {
                        let drift = 1;
                        while(before === null && (currIndex + drift) < sortedActions.length){
                            if (sortedActions[currIndex + drift].dom.isConnected) {
                                before = sortedActions[currIndex + drift].dom;
                            }
                            drift++;
                        }
                    }
                    list.insertBefore(row.dom, before);
                }
            }
        }
    }

    async #applyQuickActionsFilter(filters) {
        const list = this.#quickActionsContainer;
        if (!list) return;

        await Utils.flipList(list, this.#flipActionListMutator.bind(this), { filters });
    }

    #getQuickActionFilters() {
        return this.document.getFlag(CONSTANTS.SYSTEM_ID, "quickActionFilter") ?? {};
    }

    #populateQuickActions(){
        this.#flipActionListMutator(this.#quickActionsContainer, { filters: this.#getQuickActionFilters() });
    }

    #reconnectQuickActionContainer(){
        if (this.#quickActionsContainer && !this.#quickActionsContainer.isConnected) {
            this.#getCurrentQuickActionsContainer().replaceWith(this.#quickActionsContainer);
            for (const element of this.#quickActionsContainer.querySelectorAll('.action')) {
                if (this.#quickActionItems.has(element.id)){
                    this.#quickActionItems.get(element.id).dom = element;
                }
            }
        }
    }
    //#endregion

}