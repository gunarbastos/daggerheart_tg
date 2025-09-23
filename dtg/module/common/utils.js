console.log(`Loaded: ${import.meta.url}`);

export class Utils {

    static _document_cache = new Map();

    static async showSheetPartInDialog(sheet, partId, opts = {}) {
        //Resolve the part from the class' static PARTS
        const part = sheet.constructor.PARTS && sheet.constructor.PARTS[partId];
        if (!part || !part.template) throw new Error(`Part "${partId}" not found or missing template.`);

        //Build the same context the sheet would use for that part
        const ctx = await sheet._prepareContext({ parts: [partId] });
        const html = await foundry.applications.handlebars.renderTemplate(part.template, ctx);
        const content = document.createElement("div");
        content.innerHTML = html;
        //content.className = "dtg settings-page";

        //Modal dialog that submits via the sheet's own helpers
        const dlg = new foundry.applications.api.DialogV2({
            window: { title: opts.title || `${sheet.title} — Settings` },
            modal: true,
            content,
            classes: ['dtg', 'settings-page'],
            buttons: [
                {
                    action: "save",
                    label: "Save",
                    default: true,
                    callback: async (_ev, button, dialog) => {
                        const form = button.form;
                        const fdx  = new foundry.applications.ux.FormDataExtended(form);

                        //Build the same submit data
                        const submitData = sheet._processFormData(null, form, fdx);

                        //Compute the minimal change object vs the current document
                        const before = sheet.document.toObject();
                        const after  = foundry.utils.mergeObject(foundry.utils.deepClone(before), submitData, {
                            insertKeys: true, overwrite: true, inplace: false
                        });
                        const changed = foundry.utils.diffObject(before, after); // minimal patch

                        //Do nothing if nothing changed
                        if (!Object.keys(changed).length) { dialog.close(); return; }

                        //Update without triggering the sheet's global render
                        await sheet._processSubmitData(
                            new SubmitEvent("submit"),
                            form,
                            changed,
                            { render: false, diff: true, skipRequester: true, appId: sheet.id } // suppress auto-rerender, still send diff
                        );

                        //Decide which parts to re-render (prefix match against your watch-map)
                        const { requires, options } = sheet.constructor.requiresRender(changed);
                        //const affected = sheet.RequiresRender(changed, sheet.constructor.PARTS);
                        if(requires === true) await sheet.render(options);

                        dialog.close();
                    }
                },
                { action: "cancel", label: "Cancel" }
            ]
        });

        await dlg.render({ force: true });
    }

    static getRangeDescriptor(distance){
        let range = '';
        for (const [key, value] of Object.entries(game.dtg.constants.RANGE_BANDS)) {
            if(key === 'max' || Number(distance) <= Number(key)) {
                range = value;
                break;
            }
        }
        return range;
    }

    static getListOfResources(maxValue, usedAmount, resourceName, iconUsed, iconAvailable, {canClick= true, invertValues = false} = {}){
        const result = [];
        for(let iter = 1; iter <= maxValue; iter++ ){
            let imgFinal = '';
            if(invertValues){
                imgFinal = iter <= (maxValue - usedAmount) ? `${game.dtg.constants.ASSETS.ICON_DIR}/${iconAvailable}` : `${game.dtg.constants.ASSETS.ICON_DIR}/${iconUsed}`;
            } else {
                imgFinal = iter <= usedAmount ? `${game.dtg.constants.ASSETS.ICON_DIR}/${iconUsed}` : `${game.dtg.constants.ASSETS.ICON_DIR}/${iconAvailable}`
            }
            result.push({
                img: imgFinal,
                resourceName: resourceName,
                value: invertValues ? iter : maxValue - iter,
                canClick: canClick,
            });
        }
        return result;
    }

    static getCheckIcon(value){
        return value ? 'fa-regular fa-square-check' : 'fa-regular fa-square';
    }

    static actionNotYetImplemented(event) {
        ui.notifications.warn("Not implemented yet.");
    }

    static filterByOwnership(collection, level = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED, user = game.user) {
        return collection.filter(doc => doc.testUserPermission(user, level));
    }

    static async fromUuid(uuid){
        return await fromUuid(uuid);
    }

    static fromUuidSync(uuid){
        return fromUuidSync(uuid);
    }

    static isBoxedPrimitive(value) {
        if (value === null) return false;
        if (typeof value !== "object") return false; // all boxed primitives are objects
        const tag = Object.prototype.toString.call(value);
        return tag === "[object String]"  ||
            tag === "[object Number]"  ||
            tag === "[object Boolean]" ||
            tag === "[object BigInt]"  ||
            tag === "[object Symbol]";
    };

    static getGameSetting(setting){
        let value = game.settings.get(game.dtg.constants.SYSTEM_ID, setting.id);
        if (Utils.isBoxedPrimitive(value)) {
            ui.notifications.error(`Setting ${setting.id} is a boxed primitive.`);
            value = undefined;
        }
        if((value === undefined || value === null) && setting.hasOwnProperty('default')) value = Utils.deepClone(setting.default);
        return value;
    }

    static async setGameSetting(setting, value){
        if (Utils.isBoxedPrimitive(value)) {
            ui.notifications.error(`Value passed to setting ${setting.id} is a boxed primitive.`);
            return;
        }
        await game.settings.set(game.dtg.constants.SYSTEM_ID, setting.id, value);
    }

    static deepClone(original, {strict=false}={}) {
        return foundry.utils.deepClone(original, {strict: strict});
    }

    static getTemplateUrl(templateUrlFromProjectRoot){
        return `${game.dtg.constants.TEMPLATES.ROOT_DIR}/${templateUrlFromProjectRoot}`;
    }

    static JSON(object) {
        return JSON.stringify(object, null, 2);
    }

    static #isLogOpts(value) {
        return value && typeof value === "object" && (value.hasOwnProperty("showUiNotification") || value.hasOwnProperty("uiMessage"));
    }

    static #getFinalArgs(...data){
        let opts = {};
        if (data.length && Utils.#isLogOpts(data[0])) opts = data.shift();
        else if (data.length && Utils.#isLogOpts(data[data.length - 1])) opts = data.pop();
        return { opts: opts, args: data };
    }

    static #buildUiMessage(...data){
        let messages = [];
        for(const part of data){
            messages.push(String(part));
        }
        let message = messages.join(' ').trim();
        if(message.length > 100 ){
            message = message.slice(0, 97) + "...";
        }
        return message;
    }

    static log(...data){
        const {opts, args} = Utils.#getFinalArgs(...data);

        // Log everything else
        console.log("DTG |", ...args);

        // Optional UI surface
        if (opts.showUiNotification) {
            const msg = typeof opts.uiMessage === "string"
                ? opts.uiMessage
                : Utils.#buildUiMessage(...args);
            ui.notifications.info(msg);
        }
    }

    static info(...data){
        const {opts, args} = Utils.#getFinalArgs(...data);

        // Log everything else
        console.info("DTG |", ...args);

        // Optional UI surface
        if (opts.showUiNotification) {
            const msg = typeof opts.uiMessage === "string"
                ? opts.uiMessage
                : Utils.#buildUiMessage(...args);
            ui.notifications.info(msg);
        }
    }

    static warn(...data){
        const {opts, args} = Utils.#getFinalArgs(...data);

        // Log everything else
        console.warn("DTG |", ...args);

        // Optional UI surface
        if (opts.showUiNotification) {
            const msg = typeof opts.uiMessage === "string"
                ? opts.uiMessage
                : Utils.#buildUiMessage(...args);
            ui.notifications.warn(msg);
        }
    }

    static error(...data){
        const {opts, args} = Utils.#getFinalArgs(...data);

        // Log everything else
        console.error("DTG |", ...args);

        // Optional UI surface
        if (opts.showUiNotification) {
            const msg = typeof opts.uiMessage === "string"
                ? opts.uiMessage
                : Utils.#buildUiMessage(...args);
            ui.notifications.error(msg);
        }
    }

    static localize(text, lang = (game?.i18n?.lang ?? "en")) {
        if (typeof text === "string") return text;
        if (text && typeof text === "object" && !Array.isArray(text) && Object.prototype.hasOwnProperty.call(text, "en") && typeof text.en === "string") return text.en;
        return JSON.stringify(text);
    }
    static unique(arr) { return Array.from(new Set(arr ?? [])); }

    static mergeObjects(base, extra, options = {}) {
        return foundry.utils.mergeObject(
            foundry.utils.deepClone(base),
            extra ?? {},
            { inplace: false, recursive: true, ...options }
        );
    }

    static getCachedDocument(uuid) {
        if (!this._document_cache.has(uuid)) { this._document_cache.set(uuid, Utils.fromUuidSync(uuid)); }
        return this._document_cache.get(uuid);
    }

    static invalidateDocument(uuid){
        if(this._document_cache.has(uuid)) { this._document_cache.delete(uuid); }
    }

    static invalidateEntireCache(){
        this._document_cache.clear();
    }

    static localizeLangTree(source, langCode, fallback = 'en') {
        for (const [key, value] of Object.entries(source)) {
            if (typeof value === 'string') continue;
            if (value && typeof value === 'object' && Utils.isLanguageMap(value)) {
                source[key] = value[langCode] || value[fallback] || `[MISSING:${key}]`;
            } else if (value && typeof value === 'object') {
                Utils.localizeLangTree(value, langCode, fallback);
            }
        }

        return source;
    }

    static isLanguageMap(obj) {
        const keys = Object.keys(obj);
        // Detect if keys look like language codes (en, ptBR, etc)
        return keys.every(k => /^[a-z]{2}(-[A-Z]{2})?$|^[a-z]{2,3}$/.test(k));
    }

    /*
     * Recursively freezes an object and all nested objects to make it immutable.
     * @param {object} obj - The object to deep freeze.
     * @returns {object} The same object, frozen.
     */
    static deepFreeze(obj) {
        Object.freeze(obj);

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (value && typeof value === "object" && !Object.isFrozen(value)) {
                Utils.deepFreeze(value);
            }
        }

        return obj;
    }

    /*
     * Registers a Handlebars helper function.
     * @param {string} name - The name of the helper.
     * @param {Function} fn - The helper function.
     * @returns {void}
     */
    static registerHandlebarHelper(name, fn) {
        if (typeof Handlebars !== "undefined" && Handlebars.registerHelper) {
            Handlebars.registerHelper(name, fn);
        } else {
            console.warn("Handlebars is not available to register helper:", name);
        }
    }

    /*
     * Converts an array of objects into a map keyed by a specified property.
     * @template T
     * @param {Array<T>} array - The array of objects.
     * @param {string} keyProperty - The property name to use as key in the map.
     * @returns {Map<any, T>} Map where keys are the values of keyProperty in each object.
     */
    static arrayToMap(array, keyProperty) {
        return array.reduce((map, item) => {
            if (item && keyProperty in item) {
                map.set(item[keyProperty], item);
            }
            return map;
        }, new Map());
    }

    /*
     * Handlebars helper: Capitalizes the first letter of a string.
     * Usage: {{capitalize "hello"}}
     */
    static capitalizeHelper(str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*
     * Handlebars helper: Formats a number as currency (e.g., USD).
     * Usage: {{currency 1234.5}}
     */
    static currencyHelper(amount, currency = 'USD') {
        if (typeof amount !== 'number') return '';
        return amount.toLocaleString(undefined, { style: 'currency', currency });
    }

    /*
     * Handlebars helper: Returns true if two values are equal.
     * Usage: {{#ifEquals var1 var2}} ... {{/ifEquals}}
     */
    static ifEqualsHelper(a, b, options) {
        if (a === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }

    /*
     * Handlebars helper: Joins an array into a string with a separator.
     * Usage: {{join array ", "}}
     */
    static joinHelper(array, separator = ', ') {
        if (!Array.isArray(array)) return '';
        return array.join(separator);
    }

    /*
     * Handlebars helper: Formats a date according to the user's locale.
     * Usage: {{formatDate dateString options}}
     *
     * @param {string|Date|number} date - Date input (ISO string, Date object, or timestamp).
     * @param {Object} [options] - Optional formatting options (e.g. { year: 'numeric', month: 'long', day: 'numeric' }).
     * @returns {string} Localized formatted date string.
     */
    static formatDateHelper(date, options = {}) {
        try {
            if (!date) return '';

            // Detect user's locale; fallback to 'en-US'
            const userLocale = navigator?.language || 'en-US';

            // Convert to Date object if needed
            const d = (date instanceof Date) ? date : new Date(date);
            if (isNaN(d)) return '';

            // Default formatting if no options provided
            const formatOptions = Object.keys(options).length > 0 ? options : {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };

            return new Intl.DateTimeFormat(userLocale, formatOptions).format(d);
        } catch {
            return '';
        }
    }

    /*
     * Handlebars helper: Formats a time according to the user's locale.
     * Usage: {{formatTime dateOrTimestamp options}}
     *
     * @param {string|Date|number} time - Date/time input (ISO string, Date object, or timestamp).
     * @param {Object} [options] - Optional formatting options (e.g. { hour: '2-digit', minute: '2-digit', second: '2-digit' }).
     * @returns {string} Localized formatted time string.
     */
    static formatTimeHelper(time, options = {}) {
        try {
            if (!time) return '';

            const userLocale = navigator?.language || 'en-US';
            const d = (time instanceof Date) ? time : new Date(time);
            if (isNaN(d)) return '';

            const formatOptions = Object.keys(options).length > 0 ? options : {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };

            return new Intl.DateTimeFormat(userLocale, formatOptions).format(d);
        } catch {
            return '';
        }
    }

    /*
     * Handlebars helper: Returns relative time string ("5 minutes ago", "in 3 hours") based on current time.
     * Usage: {{relativeTime dateOrTimestamp}}
     *
     * @param {string|Date|number} time - Date/time input.
     * @returns {string} Localized relative time string or empty string if invalid date.
     */
    static relativeTimeHelper(time) {
        try {
            if (!time) return '';

            const userLocale = navigator?.language || 'en-US';
            const d = (time instanceof Date) ? time : new Date(time);
            if (isNaN(d)) return '';

            const now = new Date();
            const diffMs = d - now;

            // Use Intl.RelativeTimeFormat if available
            if (typeof Intl.RelativeTimeFormat === 'function') {
                const rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: 'auto' });
                const seconds = Math.round(diffMs / 1000);

                const divisions = [
                    { amount: 60, name: 'second' },
                    { amount: 60, name: 'minute' },
                    { amount: 24, name: 'hour' },
                    { amount: 7, name: 'day' },
                    { amount: 4.34524, name: 'week' },
                    { amount: 12, name: 'month' },
                    { amount: Number.POSITIVE_INFINITY, name: 'year' }
                ];

                let duration = seconds;
                let unit = 'second';

                for (const division of divisions) {
                    if (Math.abs(duration) < division.amount) {
                        unit = division.name;
                        break;
                    }
                    duration /= division.amount;
                }

                duration = Math.round(duration);
                return rtf.format(duration, unit);
            } else {
                // Fallback if Intl.RelativeTimeFormat not available
                const diffSec = Math.abs(diffMs / 1000);
                if (diffSec < 60) return 'just now';
                if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
                if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
                return d.toLocaleDateString(userLocale);
            }
        } catch {
            return '';
        }
    }

    /*
     * Block helper: Renders content if **all** arguments are truthy.
     * Usage: {{#ifAll cond1 cond2 ...}} true block {{else}} false block {{/ifAll}}
     */
    static ifAllHelper(...args) {
        const options = args.pop();
        const allTrue = args.every(Boolean);
        return allTrue ? options.fn(this) : options.inverse(this);
    }

    /*
     * Block helper: Renders content if **any** argument is truthy.
     * Usage: {{#ifAny cond1 cond2 ...}} true block {{else}} false block {{/ifAny}}
     */
    static ifAnyHelper(...args) {
        const options = args.pop();
        const anyTrue = args.some(Boolean);
        return anyTrue ? options.fn(this) : options.inverse(this);
    }

    /*
     * Format Helper: Prints an object as string
     */
    static hbsJSON(...args) {
        args.pop();
        return JSON.stringify(args, null, 2);
    }

    static absolute(...args) {
        args.pop();
        return Math.abs(args.pop());
    }

    /*
     * Registers helper functions into Handlebars
     */
    static registerCommonHelpers() {
        Utils.registerHandlebarHelper('capitalize', this.capitalizeHelper);
        Utils.registerHandlebarHelper('currency', this.currencyHelper);
        Utils.registerHandlebarHelper('ifEquals', this.ifEqualsHelper);
        Utils.registerHandlebarHelper('join', this.joinHelper);
        Utils.registerHandlebarHelper('formatDate', this.formatDateHelper);
        Utils.registerHandlebarHelper('formatTime', this.formatTimeHelper);
        Utils.registerHandlebarHelper('relativeTime', this.relativeTimeHelper);
        Utils.registerHandlebarHelper('ifAll', this.ifAllHelper);
        Utils.registerHandlebarHelper('ifAny', this.ifAnyHelper);
        Utils.registerHandlebarHelper('json', this.hbsJSON);
        Utils.registerHandlebarHelper('absolute', this.absolute)
    }
}
