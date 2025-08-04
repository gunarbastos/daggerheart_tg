export class BaseResourceDataModel extends foundry.abstract.TypeDataModel {
    isOverflowing = false;

    changeValue(amount = 1, overflows = false) {
        let newAmount = this.value + amount;
        if (overflows &&  this.allowOverflow && (newAmount > this.max)) {
            this.isOverflowing = true;
            this.value = newAmount;
        } else {
            this.value = Math.min(this.max, this.value + amount);
        }
    }

    hasAmount(amount = 1) {
        return this.value >= amount;
    }

    updateSource(changes = {}) {
        super.updateSource(changes);

        this.isOverflowing = this.value <= this.max;
        // Enforce consistency *after* changes are applied
        if (!this.isOverflowing && (typeof this.min === 'number' && typeof this.max === 'number')) {
            this.value = Math.max(this.min, Math.min(this.max, this.value));
        }
    }
}

export function ResourceDataModel({ min = 0, max = 10, default: def = 10, overflows = false } = {}) {
    return class extends BaseResourceDataModel {
        /** @inheritDoc */
        static _enableV10Validation = true;

        /** @inheritDoc */
        static defineSchema() {
            const fields = foundry.data.fields;
            return {
                min: new fields.NumberField({ required: true, integer: true, initial: min }),
                value: new fields.NumberField({ required: true, integer: true, initial: def }),
                max: new fields.NumberField({ required: true, integer: true, initial: max }),
                allowOverflow: new fields.BooleanField({ required: true, integer: true, initial: overflows }),
            };
        }
    };
}