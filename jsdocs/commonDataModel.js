/**
 * @typedef {object} BaseData
 * @property {string} description
 * @property {object} automation
 */

/**
 * @typedef {object} BorrowedPowerData
 * @property {FeatureData} feature
 * @property {number|null} usesLeft
 * @property {string|null} expiresOnRest
 */

/**
 * @typedef {object} ExperienceData
 * @extends BaseData
 * @property {number} bonus
 */

/**
 * @typedef {object} InventoryItemData
 * @extends BaseData
 * @property {boolean} stackable
 */

/**
 * @typedef {object} ResourceData
 * @property {number} min
 * @property {number} value
 * @property {number} man
 * @property {boolean} allowOverflow
 */

/**
 * @typedef {object} TargetData
 * @property {string} type
 * @property {string} numberOfTargets
 * @property {string} range
 */
