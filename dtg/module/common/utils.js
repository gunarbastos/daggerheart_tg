import {CONSTANTS} from "./constants";

const _document_cache = new Map();

export class Utils {

    static registerSheets(collection, sheetList) {
        for (const sheetId in collection.sheetClasses[CONSTANTS.CORE_ID]) {
            collection.unregisterSheet(CONSTANTS.CORE_ID, collection.sheetClasses[CONSTANTS.CORE_ID][sheetId].cls);
        }
        for(const sheet of sheetList){
            collection.registerSheet(CONSTANTS.SYSTEM_ID, sheet.class, {
                types: sheet.types,
                label: sheet.label,
                makeDefault: sheet.default,
            });
        }
    }

    static getCachedDocument(uuid) {
        if (!_document_cache.has(uuid)) { _document_cache.set(uuid, fromUuidSync(uuid)); }
        return _document_cache.get(uuid);
    }

    static invalidateDocument(uuid){
        if(_document_cache.has(uuid)) { _document_cache.delete(uuid); }
    }

    static invalidateEntireCache(){
        _document_cache.clear();
    }

    static localizeLangTree(source, langCode, fallback = 'en') {
        const result = {};

        for (const [key, value] of Object.entries(source)) {
            if (typeof value === 'string') {
                // Already a localized string
                result[key] = value;
            } else if (
                value &&
                typeof value === 'object' &&
                Utils.isLanguageMap(value)
            ) {
                // It's a localizable node
                result[key] = value[langCode] || value[fallback] || `[MISSING:${key}]`;
            } else if (value && typeof value === 'object') {
                // Nested object (e.g., TRAITS)
                result[key] = Utils.localizeLangTree(value, langCode, fallback);
            } else {
                // Not recognized
                result[key] = `[INVALID:${key}]`;
            }
        }

        return result;
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

    }
}
