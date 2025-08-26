/**
 * @typedef {object} AdversaryData
 * @extends BaseData
 * @property {object} resources
 * @property {ResourceData} resources.hp
 * @property {ResourceData} resources.stress
 * @property {ExperienceData[]} experiences
 * @property {number} tier
 * @property {string} type
 * @property {string} tactics
 * @property {number} difficulty
 * @property {number} majorDamageThreshold
 * @property {number} severeDamageThreshold
 * @property {number} attackModifier
 * @property {object} standardtAttack
 * @property {string} standardtAttack.name
 * @property {string} standardtAttack.rabge
 * @property {string} standardtAttack.damage
 * @property {FeatureData[]} features
 */

/**
 * @typedef {object} EnvironmentData
 * @extends BaseData
 * @property {number} tier
 * @property {string} type
 * @property {string} impulses
 * @property {number} difficulty
 * @property {string[]} potentialAdversariesUUIDs
 * @property {AdversaryData[]} potentialAdversaries
 */

/** @typedef {object} PlayerSubclassSchema
 * @property {string} UUID
 * @property {string} masteryLevel
 */

/**
 * @typedef {object} PlayerData
 * @extends BaseData
 * @property {object} resources
 * @property {ResourceData} resources.hp
 * @property {ResourceData} resources.stress
 * @property {ResourceData} resources.armor
 * @property {ResourceData} resources.hope
 * @property {ResourceData} resources.scars
 * @property {number} level
 * @property {number} majorDamageThreshold
 * @property {number} severeDamageThreshold
 * @property {number} proficiency
 * @property {string[]} ancestryUUIDs
 * @property {AncestryData[]} ancestries
 * @property {string[]} communityUUIDs
 * @property {CommunityData[]} communities
 * @property {object} traits
 * @property {number} traits.agility
 * @property {number} traits.strength
 * @property {number} traits.finesse
 * @property {number} traits.knowledge
 * @property {number} traits.presence
 * @property {number} traits.instinct
 * @property {ExperienceData[]} experiences
 * @property {string[]} playerClassesUUIDs
 * @property {ClassData[]} playerClasses
 * @property {PlayerSubclassSchema[]} playerSubclasses
 * @property {Map<string, PlayerSubclassSchema>} subclasses
 * @property {string[]} domainCardsUUIDs
 * @property {DomainCardData[]} domainCards
 * @property {string[]} equippedDomainCardsUUIDs
 * @property {DomainCardData[]} equippedDomainCards
 * @property {object} levelUpOptionsTaken
 * @property {BorrowedPowerData[]} borrowedPowers
 */
