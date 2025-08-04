export class PolymorphicEmbeddedField extends foundry.data.fields.EmbeddedDataField {
    constructor(base, mapping, options = {}) {
        // mapping: { damage: DamageEffectDataModel, consume: ConsumeResourceEffectDataModel }
        super(base, options);
        this.mapping = mapping;
    }

    /** Override initialize to pick the right class */
    initialize(value, model, options={}) {
        const ModelClass = this.mapping[value.type] || this.type;
        return super.initialize(value, ModelClass, options);
    }
}