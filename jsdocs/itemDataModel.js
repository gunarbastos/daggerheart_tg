/**
 * @typedef {object} AncestryData
 * @extends BaseData
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} ArmorData
 * @extends InventoryItemData
 * @property {number} baseScore
 * @property {number} baseMajorThreshold
 * @property {number} baseSevereThreshold
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} ClassItemsOptionsSchema
 * @property {string[]} itemsUUIDs
 */

/**
 * @typedef {object} ClassData
 * @extends BaseData
 * @property {string[]} domainsUUIDs
 * @property {DomainData} domains
 * @property {number} startingEvasion
 * @property {number} startingHitPoints
 * @property {ClassItemsOptionsSchema[][]} classItemsOptions
 * @property {FeatureData[]} features
 * @property {FeatureData[]} hopeFeatures
 * @property {string[]} subclassesUUIDs
 * @property {SubClassData[]} subclasses
 */

/**
 * @typedef {object} CommonItemData
 * @extends InventoryItemData
 * @property {number} quantity
 */

/**
 * @typedef {object} CommunityData
 * @extends BaseData
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} ConsumableData
 * @extends InventoryItemData
 * @property {number} quantity
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} DomainCardData
 * @extends BaseData
 * @property {string} domainUUID
 * @property {DomainData} domain
 * @property {number} level
 * @property {number} recallCost
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} DomainData
 * @extends BaseData
 * @property {string[]} domainCardsUUIDs
 * @property {DomainCardData[]} domainCards
 */

/**
 * @typedef {object} ApplyConditionEffectData
 * @extends EffectData
 * @property {string} condition
 * @property {string} duration
 */

/**
 * @typedef {object} ChangeRollEffectData
 * @extends EffectData
 * @property {string} hopeDie
 * @property {string} fearDie
 * @property {number} modifier
 * @property {string} changeRoll
 */

/**
 * @typedef {object} ConsumeResourceEffectData
 * @extends EffectData
 * @property {string} resource
 * @property {number} quantity
 */

/**
 * @typedef {object} DamageEffectData
 * @extends EffectData
 * @property {string} formula
 * @property {string} toHitTrait
 * @property {string} damageType
 */

/**
 * @typedef {object} DamageResistanceEffectData
 * @extends EffectData
 * @property {string} damageType
 * @property {boolean} resistsFully
 */

/**
 * @typedef {object} HealEffectData
 * @extends EffectData
 * @property {string} amount
 */

/**
 * @typedef {object} RemoveConditionEffectData
 * @extends EffectData
 * @property {string} condition
 */

/**
 * @typedef {object} RestoreResourceEffectData
 * @extends EffectData
 * @property {string} resource
 * @property {string} quantity
 */

/**
 * @typedef {object} EffectData
 * @property {string} type
 * @property {TargetData} target
 */

/**
 * @typedef {object} FeatureData
 * @extends BaseData
 * @property {EffectData[]} effects
 */

/**
 * @typedef {object} MagicItemData
 * @extends InventoryItemData
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} MateriaData
 * @extends InventoryItemData
 * @property {string} accepts
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} SpellData
 * @extends BaseData
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} SubClassData
 * @extends BaseData
 * @property {string} classUUID
 * @property {ClassData} class
 * @property {string} spellcastTrait
 * @property {FeatureData[]} foundationFeatures
 * @property {FeatureData[]} specializationFeatures
 * @property {FeatureData[]} masteryFeatures
 */

/**
 * @typedef {object} WeaponData
 * @extends BaseData
 * @property {string} trait
 * @property {string} range
 * @property {string} damage
 * @property {string} burden
 * @property {FeatureData[]} features
 */
