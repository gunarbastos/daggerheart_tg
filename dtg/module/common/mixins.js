import {Utils} from "./utils.js";
import {DtgEngine} from "./dtgEngine.js";

console.log(`Loaded: ${import.meta.url}`);

export class Mixins {

    static DtgApp(BaseClass) {
        return class DtgApplication extends BaseClass {

            static SETTINGS_NAME = {
                IS_OPENED: undefined,
                POSITION: undefined
            }

            _onPosition(position) {
                this._setConfigs({position: position}).then(r => null);
                super._onPosition(position);
            }

            static get DEFAULT_OPTIONS() {
                return {
                    classes: ['application', game.dtg.constants.SYSTEM_ID],
                    tag: 'div',
                    positioned: true,
                    window: {
                        contentClasses: ['standard-form'],
                        frame: true,
                        title: 'Missing Title',
                        resizable: true,
                    },
                };
            }

            async _prepareContext(options) {
                const base = await super._prepareContext(options);
                return {
                    ...base,
                    CONSTANTS: game.dtg.constants,
                };
            }

            async _onFirstRender(context, options) {
                super._onFirstRender(context, options);
                if(this.constructor.SETTINGS_NAME && DtgApplication._isValidSetting(this.constructor.SETTINGS_NAME.POSITION)) {
                    const appPosition = Utils.getGameSetting(this.constructor.SETTINGS_NAME.POSITION);
                    if (appPosition && typeof appPosition === 'object' && Object.prototype.toString.call(appPosition) === "[object Object]") {
                        this.setPosition(appPosition);
                    }
                }
            }

            async _setConfigs({show = undefined, position = undefined}){
                if(this.constructor.SETTINGS_NAME) {
                    if (DtgApplication._isValidSetting(this.constructor.SETTINGS_NAME.IS_OPENED) && typeof show === 'boolean')
                        await Utils.setGameSetting(this.constructor.SETTINGS_NAME.IS_OPENED, show);
                    if (DtgApplication._isValidSetting(this.constructor.SETTINGS_NAME.POSITION) && position)
                        await Utils.setGameSetting(this.constructor.SETTINGS_NAME.POSITION, position);
                }
            }

            async render({ persistConfigs = true, ...options} = {}, _options={}) {
                if(persistConfigs) await this._setConfigs({show: true});
                return await super.render(options, _options);
            }

            async close({ persistConfigs = true, ...options} = {}) {
                if(persistConfigs) await this._setConfigs({show: false, position: this.position ?? {}});
                return await super.close(options);
            }

            static _isValidSetting(Setting){
                return Setting && typeof Setting === "object" && Setting.hasOwnProperty('id') && typeof Setting.id === 'string';
            }

            async reRenderHeader(){
                await this.render({ window: { controls: true } });
            }

            getControl(action){
                const controls = this.options?.window?.controls ?? [];
                return controls.find(c => c.action === action);
            }

        }
    }

    //Adds "Keep Editing on Re-Render" functionality
    //Adds Roll Duality Dice
    //Adds Roll Damage Dice
    //Adds Roll GM Dice
    //Adds Dice and roll flags
    //Adds Open Settings
    /** @BaseClass DtgActor */
    static DtgSheet(BaseClass) {
        return class DtgSheet extends BaseClass {

            #selection = {
                start: 0,
                end: 0,
                value: '',
                restore: false,
            }

            static FLAG_DEFAULT_VALUES = {
                rollMod: '',
                hopeDie: '1d12',
                fearDice: '1d12',
                gmDie: '1d20',
            }

            _getFlag(flag){
                let value = this.document.getFlag(game.dtg.constants.SYSTEM_ID, flag);
                if (Utils.isBoxedPrimitive(value)) {
                    ui.notifications.error(`Flag ${flag} is a boxed primitive.`);
                    value = undefined;
                }
                if(!value && this.constructor.FLAG_DEFAULT_VALUES[flag]) value = this.constructor.FLAG_DEFAULT_VALUES[flag];

                return value;
            }

            async _setFlag(flag, value){
                if (Utils.isBoxedPrimitive(value)) {
                    ui.notifications.error(`Value passed to flag ${flag} is a boxed primitive.`);
                    return;
                }
                let finalName = `flags.${game.dtg.constants.SYSTEM_ID}.${flag}`;
                if(!value){
                   value = null;
                    finalName = `flags.${game.dtg.constants.SYSTEM_ID}.-=${flag}`;
                }
                await this.document.update({[finalName]: value}, {render: false});
            }

            //#region properties
            static SETTINGS_PART_NAME = 'settings';

            static FLAG_NAMES = {
                rollMod: 'rollMod',
                hopeDie: 'hopeDie',
                fearDice: 'fearDice',
                gmDie: 'gmDie',
            }

            get rollData(){
                return {
                    rollMod: this._getFlag(this.constructor.FLAG_NAMES.rollMod),
                    hopeDie: this._getFlag(this.constructor.FLAG_NAMES.hopeDie),
                    fearDice: this._getFlag(this.constructor.FLAG_NAMES.fearDice),
                    gmDie: this._getFlag(this.constructor.FLAG_NAMES.gmDie),
                }
            }
            //#endregion

            //#region overrides
            static get DEFAULT_OPTIONS() {
                return {
                    id: `${game.dtg.constants.SYSTEM_ID}-{id}`,
                    classes: ['application', 'sheet', game.dtg.constants.SYSTEM_ID],
                    tag: 'form',
                    frame: true,
                    positioned: true,
                    actions: {
                        openSettings: this._actionOpenSettings,
                        setFlag: this._actionSetFlag,
                        rollDuality: this._actionRollDualityDice,
                        notYetImplemented: Utils.actionNotYetImplemented,
                        rollDamage: this._actionRollDamage,
                        rollGM: this._actionGMRoll,
                    },
                    window: {
                        contentClasses: ['standard-form', 'sheet-body'],
                        title: 'Missing Title',
                        resizable: true
                    },
                    form: { submitOnChange: true, closeOnSubmit: false }
                }
            }

            get title(){
                return Utils.localize(this.options.window.title ?? 'Missing Title');
            }

            async _prepareContext(options) {
                const base = await super._prepareContext(options);
                return {
                    ...base,
                    system: this.document.system,
                    systemFields: this.document.system.schema.fields,
                    CONSTANTS: game.dtg.constants,
                    rollData: this.rollData,
                    isWorldDocument: this.document.parent === null
                };
            }

            async _preRender(context, options){
                if(document.activeElement && typeof document.activeElement.selectionStart === "number" && typeof document.activeElement.selectionEnd === "number"){
                    this.#selection.start = document.activeElement.selectionStart;
                    this.#selection.end = document.activeElement.selectionEnd;
                    if(document.activeElement.value && typeof document.activeElement.value === "string")
                        this.#selection.value = document.activeElement.value;
                     else
                         this.#selection.end = undefined;

                    this.#selection.restore = true;
                }
                super._preRender(context, options);
            }

            async _postRender(context, options){
                super._postRender(context, options);
                if(this.#selection.restore === true && document.activeElement){
                    if(typeof document.activeElement.selectionStart === "number" && typeof document.activeElement.selectionEnd === "number"){
                        if(typeof document.activeElement.value === "string" && this.#selection.value) document.activeElement.value = this.#selection.value;
                        document.activeElement.selectionStart = this.#selection.start;
                        document.activeElement.selectionEnd = this.#selection.end;
                    } else if(typeof document.activeElement.select === "function"){
                        document.activeElement.select();
                    }
                }
                this.#selection.restore = false;
            }

            _configureRenderOptions(options) {
                super._configureRenderOptions(options);

                if(options.parts.includes(this.constructor.SETTINGS_PART_NAME)) options.parts.splice(options.parts.indexOf(this.constructor.SETTINGS_PART_NAME), 1);
            }

            async _preFirstRender(context, options) {
                super._configureRenderOptions(options);

                if(options.parts.includes(this.constructor.SETTINGS_PART_NAME)) options.parts.splice(options.parts.indexOf(this.constructor.SETTINGS_PART_NAME), 1);
            }
            //#endregion

            //#region actions
            /** @this DtgSheet */
            static async _actionRollDualityDice(event) {
                event.preventDefault();
                const rolledTrait = event.target.dataset.trait.toLowerCase();
                return await DtgEngine.dualityRoll({
                    bonus:{
                        [rolledTrait]: this.document.system.traits[rolledTrait],
                    },
                    advDisad: this.rollData.rollMod,
                    hopeFormula: this.rollData.hopeDie,
                    fearFormula: this.rollData.fearDice,
                });
            }

            static async _actionRollDamage(event) {
                event.preventDefault();
                let rollFormula = event.target.dataset.formula;
                if(this.#containsProficiencyDie(rollFormula) === true){
                    rollFormula = this.#fillProficiencyDie(rollFormula, this.document.system.proficiency);
                }
                const rollType = event.target.dataset.type;
                return await DtgEngine.damageRoll(rollFormula, rollType);
            }

            /** @this DtgSheet */
            static async _actionGMRoll(event){
                event.preventDefault();
                const bonus = event.target.dataset.bonus;
                const crit = event.target.dataset.crit;
                return await DtgEngine.adversaryRoll( {bonus: [bonus], advDisad: this.rollData.rollMod, critOnAndAbove: crit, baseDice: this.rollData.gmDie} );
            }

            /** @this DtgSheet */
            static async _actionOpenSettings(event) {
                if(this.constructor.PARTS && this.constructor.PARTS[this.constructor.SETTINGS_PART_NAME] && this.constructor.PARTS[this.constructor.SETTINGS_PART_NAME].template){
                    await Utils.showSheetPartInDialog(this, this.constructor.SETTINGS_PART_NAME);
                } else {
                    Utils.error('_actionOpenSettings', 'settings not setup propertly for this sheet', this.constructor.SETTINGS_PART_NAME);
                }
            }

            /** @this DtgSheet */
            static async _actionSetFlag(event, {preventRender = false}) {
                event.preventDefault();
                const currValue = this._getFlag(event.target.dataset.name);
                let finalValue = event.target.dataset.value;
                if (event.target.dataset.toggle && currValue === finalValue) {
                    finalValue = null;
                }
                await this._setFlag(event.target.dataset.name, finalValue);

                if(preventRender) return;
                await this.render();
            }
            //#enregion

            #containsProficiencyDie(formula) {
                const outside = formula.replace(/\[[^\]]*]/g, " ");
                const rx = /(?:^|[^A-Za-z0-9_])(pd\d+)/gi;

                return rx.test(outside);
            }

            #fillProficiencyDie(formula, proficiency) {
                let result = "";
                let iterator = 0;

                while (iterator < formula.length) {
                    const open = formula.indexOf("[", iterator);
                    if (open === -1) {
                        result += this.#replaceOutside(formula.slice(iterator), proficiency);
                        break;
                    }
                    const close = formula.indexOf("]", open + 1);
                    if (close === -1) {
                        // Unbalanced '[' — treat rest as outside.
                        result += this.#replaceOutside(formula.slice(iterator), proficiency);
                        break;
                    }
                    // Outside chunk before '['
                    result += this.#replaceOutside(formula.slice(iterator, open), proficiency);
                    // Bracketed chunk copied verbatim
                    result += formula.slice(open, close + 1);
                    iterator = close + 1;
                }
                return result;
            }

            #replaceOutside(chunk, proficiency){
                // (^|[^A-Za-z0-9_]) ensures we don't match inside identifiers like "rapid4"
                const rx = /(^|[^A-Za-z0-9_])(pd)(\d+)/gi;
                return chunk.replace(rx, (m, prefix, pd, size) => {
                    const dChar = pd[1] === pd[1].toUpperCase() ? "D" : "d"; // preserve 'd' case
                    return `${prefix}${proficiency}${dChar}${size}`;
                });
            }

        }
    }

    static HasFeatureHolderMixin = Symbol('HasFeatureHolderMixin');
    static DtgFeatureHolder(BaseClass){
        class DtgFeatureHolder extends BaseClass {
            _featureRoots = [];

            #getFeaturesFiltered({includeGranted = false, includeCalculation = false} = {}){
                const result = [];
                for(const root of this._featureRoots){
                    for(const /** @type FeatureData */ item of root){
                        if((includeGranted === true && item.isGrantedToUser === true) ||
                           (includeCalculation === true && item.isGrantedToUser !== true)) {
                            result.push(item);
                        }
                    }
                }

                return result;
            }

            getFeaturesGrantedToUser(){
                return this.#getFeaturesFiltered({includeGranted: true});
            }

            getFeaturesForCalculationOnly(){
                return this.#getFeaturesFiltered({includeCalculation: true});
            }

            getAllFeatures(){
                return this.#getFeaturesFiltered({includeGranted: true, includeCalculation: true});
            }
        }

        Object.defineProperty(DtgFeatureHolder, this.HasFeatureHolderMixin, {value: true});
        Object.defineProperty(DtgFeatureHolder.prototype, this.HasFeatureHolderMixin, {value: true});
        return DtgFeatureHolder;
    }
}