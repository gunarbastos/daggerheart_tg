import {CONSTANTS, DtgEngine, Utils} from "../../common/index.js";
import {DtgActorSheet} from "./dtgActorSheet.js";

console.log(`Loaded: ${import.meta.url}`);

export class AdversarySheet extends DtgActorSheet {
    static get PARTS() {
        const basePartPath = `${CONSTANTS.TEMPLATES.ROOT_DIR}/sheet/adversary/part`
        return {
            adversaryInfo: { template: `${basePartPath}/adversaryInfo.hbs` },
            resources: { template: `${basePartPath}/resources.hbs` },
            combatInfo: { template: `${basePartPath}/combatInfo.hbs` },
            features: { template: `${basePartPath}/features.hbs` },
            roleplay: { template: `${basePartPath}/roleplay.hbs` },
            settings: { template: `${basePartPath}/settings.hbs` },
        }
    }

    static get DEFAULT_OPTIONS() {
        return {
            position: {width: 1200, height: 1200},
            classes: [`${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.ADVERSARY}`],
             actions: {
                 deleteExperience: AdversarySheet.#deleteExperience,
                 addExperience: AdversarySheet.#addExperience,
                 //setResource: AdversarySheet.#setResource,
             },
            //form: { handler: PlayerSheet.#onSubmitForm },
            window: { title: 'Adversary Sheet' },
        };
    }

    static EMPTY_EXPERIENCE = { description: '', bonus: '' };

    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        const rollModValue = this.document.getFlag(CONSTANTS.SYSTEM_ID, "rollMod") ?? "";
        return {
            ...base,
            flagRollModAdv: rollModValue === CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE,
            flagRollModDis: rollModValue === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE,
            RANGE_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.RANGE.map(v => [v, v])),
            DAMAGETYPE_CHOICES: Object.fromEntries(CONSTANTS.CHOICES.DAMAGE_TYPES.map(v => [v, v])),
        };
    }

    async _preparePartContext(partId, context, options) {
        const part = {};
        switch(partId) {
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
                            v.resourceList = [...Utils.getListOfResources(this.document.system.resources.hp.max, context.isWorldDocument ? 0 : usedHp, "hp", CONSTANTS.ASSETS.ICONS.HP.USED[iconSetting], CONSTANTS.ASSETS.ICONS.HP.AVAILABLE, {canClick: !context.isWorldDocument})];
                            v.HideName = context.isWorldDocument;
                            break;
                        case 'stress':
                            const usedStress = this.document.system.resources.stress.max - this.document.system.resources.stress.value;
                            v.resourceList = [...Utils.getListOfResources(this.document.system.resources.stress.max, context.isWorldDocument ? 0 :usedStress, "stress", CONSTANTS.ASSETS.ICONS.STRESS.USED, CONSTANTS.ASSETS.ICONS.STRESS.AVAILABLE, {canClick: !context.isWorldDocument})];
                            v.HideName = context.isWorldDocument;
                            break;
                    }
                }

                break;
            case "combatInfo":
                part.experiences = [];

                for (const experience of this.document.system.experiences) {
                    part.experiences.push({ description: experience.description, bonus: experience.bonus });
                }

                if (part.experiences.length === 0){
                    part.experiences.push({ description: '', bonus: '' });
                }
                break;
        }

        return Utils.mergeObjects(context, part);
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
        await this.document.update({[finalName]: finalValue}, {render: true});
    }

    static async #adversaryRoll(event){
        event.preventDefault();
        const bonus = event.target.dataset.bonus;
        const rollMod = this.document.getFlag(CONSTANTS.SYSTEM_ID, "rollMod");
        await DtgEngine.adversaryRoll({bonus: [bonus], advDisad: rollMod});
    }

    static async #deleteExperience(event){
        event.preventDefault();
        const experiences = this.document.system.experiences.toSpliced(event.target.dataset.index,1);
        await this.document.update({"system.experiences": experiences}, {render: false});
        this.render({ parts: ["combatInfo"] });
    }

    static async #addExperience(event){
        event.preventDefault();
        const experiences = this.document.system.experiences.toSpliced(this.document.system.experiences.length,0, this.constructor.EMPTY_EXPERIENCE);
        if(experiences.length === 1){
            experiences.push(this.constructor.EMPTY_EXPERIENCE);
        }
        await this.document.update({"system.experiences": experiences}, {render: false});
        this.render({ parts: ["combatInfo"] });
    }


}