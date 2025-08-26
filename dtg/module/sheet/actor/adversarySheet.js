import {CONSTANTS, DtgEngine, Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

import {DtgActorSheet} from "./dtgActorSheet.js";

export class AdversarySheet extends DtgActorSheet {
    static get PARTS() {
        const base = super.PARTS;
        return {
            content: {...base.content},
            adversary: {template: `systems/${CONSTANTS.SYSTEM_ID}/template/sheet/adversary.hbs`},
            debug: {...base.debug},
        }
    }

    static get DEFAULT_OPTIONS() {
        const base = super.DEFAULT_OPTIONS;
        return {
            ...base,
            classes: Utils.unique([...base.classes ?? [], `${CONSTANTS.SYSTEM_ID}-${CONSTANTS.ACTOR_TYPES.ADVERSARY}`]),
            actions: {
                setFlag: AdversarySheet.#setFlag,
                adversaryRoll: AdversarySheet.#adversaryRoll,
            },
        };
    }

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

    static async #setFlag(event) {
        event.preventDefault();
        let finalName = `flags.${CONSTANTS.SYSTEM_ID}.${event.target.dataset.name}`;
        const currValue = this.document.getFlag(CONSTANTS.SYSTEM_ID, event.target.dataset.name);
        let finalValue = event.target.dataset.value;
        if (event.target.dataset.toggle && currValue === finalValue) {
            finalValue = null;
            finalName = `flags.${CONSTANTS.SYSTEM_ID}.-=${event.target.dataset.name}`;
        }
        Utils.log(currValue, finalName, finalValue);
        await this.document.update({[finalName]: finalValue}, {render: true});
    }

    static async #adversaryRoll(event){
        event.preventDefault();
        const bonus = event.target.dataset.bonus;
        const rollMod = this.document.getFlag(CONSTANTS.SYSTEM_ID, "rollMod");
        await DtgEngine.adversaryRoll({bonus: [bonus], advDisad: rollMod});
    }


}