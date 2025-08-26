console.log(`Loaded: ${import.meta.url}`);

import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";

export class DtgEngine {

    static async dualityDice({ hopeFormula = "1d12", fearFormula = "1d12" } = {}) {
        const hopeRoll = await (new Roll(`${hopeFormula}`)).evaluate();
        const fearRoll = await (new Roll(`${fearFormula}`)).evaluate();

        const state = ((hopeRoll.total === fearRoll.total) || (hopeRoll.total > fearRoll.total)) ? CONSTANTS.ROLL_RESULTS.HOPE : CONSTANTS.ROLL_RESULTS.FEAR;
        return { hope: hopeRoll.total, fear: fearRoll.total, state: state, hopeDie: hopeRoll, fearDie: fearRoll};
    }


    static async #bonusRoll(formula, description = "Bonus"){
        const out = {
            success: false,
            error: "",
            bonusObject: undefined,
        };

        let _roll = undefined;
        let _flavor = "";

        // noinspection JSCheckFunctionSignatures
        const strFormula = String(formula)
        if (!Roll.validate(strFormula)) {
            out.error =` (formula ${strFormula} is not valid)`;
            return out;
        }
        try {
            _roll = await (new Roll(`${strFormula}`)).evaluate();
            for(const term of _roll.terms){
                if(term.options?.flavor){
                    _flavor += ` ${term.options?.flavor}`;
                    if(term.number && term.faces){
                        _flavor += `(${term.number}d${term.faces})`;
                    } else if(term.number){
                        _flavor += `(${term.number})`;
                    }
                } else if(term.operator) {
                    _flavor += ` ${term.operator}`;
                }
            }
            _flavor = _flavor.trim();
        } catch(err) {
            out.error = `ignored "bonus" (error evaluating formula ${strFormula}. Error: ${err?.message ?? err})`;
            return out;
        }

        out.bonusObject = {
            roll: _roll,
            description: _flavor || description,
            total: _roll.total,
        }
        out.success = true;

        return out;
    }

    /**
     * filters and rolls the items inside bonus
     *
     * accepted valus
     * 5
     * '2d10'
     * [5, 10, 15, '1d12', '3d4kl2']
     * [{formula: '5', label: 'experience 1'}, {formula: '3d4', label: 'another bonus'}, 20, '1d4']
     * {['experience 1']: 5, ['another bonus']: "3d4"}
     * @param bonus
     */
    static async #normalizeBonuses(bonus) {
        const out = [];

        const bonusType = Array.isArray(bonus) ? "array" : (bonus === null ? "null" : typeof bonus);
        switch (bonusType) {
            case "number":
            case "string":
                const plainRoll = await this.#bonusRoll(bonus);
                if(!plainRoll.success){
                    Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (${plainRoll.error ?? "no specific error provided"})`);
                    return out;
                }
                out.push(plainRoll.bonusObject);
                break;
            case "object":
                for (const [entryKey, entryValue] of Object.entries(bonus)) {
                    const ObjectRoll = await this.#bonusRoll(entryValue, entryKey);
                    if (!ObjectRoll.success) {
                        Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (${ObjectRoll.error ?? "no specific error provided"})`);
                        continue;
                    }
                    out.push(ObjectRoll.bonusObject);
                }
                break;
            case "array":
                for (const arrItem of bonus) {
                    const arrItemType = Array.isArray(arrItem) ? "array" : (arrItem === null ? "null" : typeof arrItem);
                    let arrItemRoll = undefined;
                    switch (arrItemType) {
                        case "number":
                        case "string":
                            arrItemRoll = await this.#bonusRoll(arrItem);
                            if(!arrItemRoll.success){
                                Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (${arrItemRoll.error ?? "no specific error provided"})`);
                                continue;
                            }
                            break;
                        case "object":
                            if (!Object.prototype.hasOwnProperty.call(arrItem, "formula")) {
                                Utils.warn(`discarded bonus ${JSON.stringify(arrItem)} — missing "formula"`);
                                continue;
                            }

                            if (Object.prototype.hasOwnProperty.call(arrItem, "description")) {
                                arrItemRoll = await this.#bonusRoll(arrItem.formula,  arrItem.description);
                                if(!arrItemRoll.success){
                                    Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (${arrItemRoll.error ?? "no specific error provided"})`);
                                    continue;
                                }
                            } else {
                                arrItemRoll = await this.#bonusRoll(arrItem.formula);
                                if(!arrItemRoll.success){
                                    Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (${arrItemRoll.error ?? "no specific error provided"})`);
                                    continue;
                                }
                            }
                            break;
                        default:
                            Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" ${arrItem} (item inside array expected to be number, string formula, object with "formula" and optional "description" fields, got ${arrItemType})`);
                            continue;
                    }

                    if(arrItemRoll && arrItemRoll.success){
                        out.push(arrItemRoll.bonusObject);
                    }
                }
                break;
            default:
                Utils.warn(`[DtgEngine.#normalizeBonuses] ignored "bonus" (expected number, string formula, array or object, got ${bonusType})`);
                break;
        }

        return out;
    }

    static async dualityRoll({ hopeFormula = "1d12", fearFormula = "1d12", bonus = [], grantsHopeFear = true, advDisad = "" }) {
        let d6roll = undefined;
        const dualityDice = await this.dualityDice({hopeFormula, fearFormula});

        const result = {
            hope: dualityDice.hope,
            fear: dualityDice.fear,
            state: dualityDice.state,
            base: [
                { roll: dualityDice.hopeDie, description: CONSTANTS.ROLL_RESULTS.HOPE, total: dualityDice.hopeDie.total},
                { roll: dualityDice.fearDie, description: CONSTANTS.ROLL_RESULTS.FEAR, total: dualityDice.fearDie.total},
            ]
        };
        const consideredBonus = await this.#normalizeBonuses(bonus);
        if((advDisad === CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE) || (advDisad === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE)){
            d6roll = await (new Roll(`1d6`)).evaluate();
            consideredBonus.push(
                {
                    roll: d6roll,
                    description: advDisad,
                    total: d6roll.total * (advDisad === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE ? -1 : 1)
                });
        }

        let totalBonus = 0;
        consideredBonus.forEach((entry) => { totalBonus += entry.total; });

        let total = dualityDice.hope + dualityDice.fear + totalBonus;

        result.template = `systems/${CONSTANTS.SYSTEM_ID}/template/chat/dualityDiceRoll.hbs`;
        result.totalBonus = totalBonus;
        result.total = total;
        result.bonus = consideredBonus;
        result.formula = `${hopeFormula} + ${fearFormula}`;
        result.isCritical = dualityDice.hope === dualityDice.fear;
        if(totalBonus > 0){
            result.formula += ` + ${totalBonus - (d6roll?.total ?? 0)}`;
        }
        if(d6roll){
            result.formula += ` with ${advDisad}(${d6roll.total})`;
        }

        await this.#postToChat(result);

        return result;
    }

    static async damageRoll(formula, type) {
        Utils.log('damageRoll', formula, type);
        const roll = await (new Roll(formula)).evaluate();
        Utils.log('damageRoll', 'roll', roll);

        const result = {
            formula: formula,
            roll: roll,
            type: type,
            template: `systems/${CONSTANTS.SYSTEM_ID}/template/chat/damageRoll.hbs`,
        }
        Utils.log('damageRoll', 'result', result);

        await this.#postToChat(result);

        return result;
    }

    static async #postToChat(roll){
        const sender = ChatMessage.getSpeaker({
            token: canvas.tokens?.controlled?.[0] ?? null,
            actor: canvas.tokens?.controlled?.[0]?.actor ?? game.user.character ?? null
        });

        const content = await foundry.applications.handlebars.renderTemplate(roll.template, {
            roll: roll
        });

        return ChatMessage.create({
            sender,
            content: content
        });
    }

    static async adversaryRoll({baseDice = "1d20", bonus = [], critOnAndAbove = 20, advDisad = ""} = {}){
        const roll = await (new Roll(baseDice)).evaluate();


        const result = {
            baseDice: baseDice,
            roll: roll,
            validRoll: roll,
            advDisad: advDisad,
            template: `systems/${CONSTANTS.SYSTEM_ID}/template/chat/adversaryRoll.hbs`,
        }

        const consideredBonus = await this.#normalizeBonuses(bonus);
        if((advDisad === CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE) || (advDisad === CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE)){
            const advDisadRoll = await (new Roll(baseDice)).evaluate();
            result.advDisadRoll = advDisadRoll;
            switch (advDisad){
                case CONSTANTS.ROLL_MODIFICATIONS.ADVANTAGE:
                    if(advDisadRoll.total > roll.total){
                        result.validRoll = advDisadRoll;
                    }
                    break;
                case CONSTANTS.ROLL_MODIFICATIONS.DISADVANTAGE:
                    if(advDisadRoll.total < roll.total){
                        result.validRoll = advDisadRoll;
                    }
                    break;
            }
        }

        let totalBonus = 0;
        consideredBonus.forEach((entry) => { totalBonus += entry.total; });

        let formula = baseDice;
        if (totalBonus < 0){
            formula += ` - ${totalBonus}`;
        } else if(totalBonus > 0){
            formula += ` + ${totalBonus}`;
        }

        let total = result.validRoll.total + totalBonus;
        result.totalBonus = totalBonus;
        result.total = total;
        result.bonus = consideredBonus;
        result.formula = formula;
        result.isCritical = result.validRoll.total >= critOnAndAbove;

        await this.#postToChat(result);

        return result;
    }

}