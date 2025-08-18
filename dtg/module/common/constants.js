console.log(`Loaded: ${import.meta.url}`);

import {EffectDataModel} from "../dataModel/item/effectDataModel.js";
import {_DO_NOT_USE_LANG} from './language.js'
import {
    ApplyConditionEffectDataModel,
    ChangeRollEffectDataModel,
    ConsumeResourceEffectDataModel,
    DamageEffectDataModel,
    DamageResistanceEffectDataModel,
    HealEffectDataModel,
    RemoveConditionEffectDataModel,
    RestoreResourceEffectDataModel
} from "../dataModel/item/effect/index.js";
import {
    AdversarySheet,
    EnvironmentSheet,
    PlayerSheet
} from "../sheet/actor/index.js";
import {
    AncestrySheet,
    ArmorSheet,
    ClassSheet,
    CommonItemSheet,
    CommunitySheet,
    ConsumableSheet,
    DomainCardSheet,
    DomainSheet,
    FeatureSheet,
    MagicItemSheet,
    MateriaSheet,
    SpellSheet,
    SubclassSheet,
    WeaponSheet
} from "../sheet/item/index.js";
import {
    AdversaryDataModel,
    EnvironmentDataModel,
    PlayerDataModel
} from "../dataModel/actor/index.js";
import {
    AncestryDataModel,
    ArmorDataModel,
    ClassDataModel,
    CommonItemDataModel,
    CommunityDataModel,
    ConsumableDataModel,
    DomainCardDataModel,
    DomainDataModel,
    FeatureDataModel,
    MagicItemDataModel,
    MateriaDataModel,
    SpellDataModel,
    SubClassDataModel,
    WeaponDataModel
} from "../dataModel/item/index.js";

let _rawConstants = {
    LANG: {..._DO_NOT_USE_LANG},
}

const _levelUpOptions = {
    tier2:{
        trait: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.TRAIT, times_available: 3, points_required_for_activation: 1},
        hp: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.HP, times_available: 2, points_required_for_activation: 1},
        stress: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.STRESS, times_available: 2, points_required_for_activation: 1},
        experience: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EXPERIENCE, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.DOMAIN_CARD, times_available: 1, points_required_for_activation: 1},
        evasion: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EVASION, times_available: 1, points_required_for_activation: 1},
    },
    tier3:{
        trait: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.TRAIT, times_available: 3, points_required_for_activation: 1},
        hp: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.HP, times_available: 2, points_required_for_activation: 1},
        stress: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.STRESS, times_available: 2, points_required_for_activation: 1},
        experience: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EXPERIENCE, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.DOMAIN_CARD, times_available: 1, points_required_for_activation: 1},
        evasion: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EVASION, times_available: 1, points_required_for_activation: 1},
        subclass: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.SUBCLASS, times_available: 1, points_required_for_activation: 1},
        proficiency: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.PROFICIENCY, times_available: 1, points_required_for_activation: 2},
        multiclass: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.MULTICLASS, times_available: 1, points_required_for_activation: 2},
    },
    tier4:{
        trait: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.TRAIT, times_available: 3, points_required_for_activation: 1},
        hp: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.HP, times_available: 2, points_required_for_activation: 1},
        stress: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.STRESS, times_available: 2, points_required_for_activation: 1},
        experience: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EXPERIENCE, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.DOMAIN_CARD, times_available: 1, points_required_for_activation: 1},
        evasion: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.EVASION, times_available: 1, points_required_for_activation: 1},
        subclass: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.SUBCLASS, times_available: 1, points_required_for_activation: 1},
        proficiency: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.PROFICIENCY, times_available: 1, points_required_for_activation: 2},
        multiclass: {label: _rawConstants.LANG.LEVEL_UP_OPTIONS.MULTICLASS, times_available: 1, points_required_for_activation: 2},
    },
};

_rawConstants = {
    ..._rawConstants,

    //Raw Constants
    SYSTEM_ID: "dtg",
    CORE_ID: "core",

    //Dynamically Built
    CHOICES: {}, //Built Dynamically

    //Sheets (dynamically at the end)
    SHEETS: {
        ACTORS: [],
        ITEMS: [],
    },

    DATA_MODELS: {
        ACTORS: {},
        ITEMS: {},
    },

    //Enums
    ROLL_RESULTS: {
        HOPE: "hope",
        FEAR: "fear",
    },
    ACTOR_TYPES: {
        ADVERSARY: "Adversary",
        ENVIRONMENT: "Environment",
        PLAYER: "Player"
    },
    ITEM_TYPES: {
        ANCESTRY: "Ancestry",
        ARMOR: "Armor",
        CLASS: "Class",
        COMMON_ITEM: "CommonItem",
        COMMUNITY: "Community",
        CONSUMABLE: "Consumable",
        DOMAIN: "Domain",
        DOMAIN_CARD: "DomainCard",
        FEATURE: "Feature",
        MAGIC_ITEM: "MagicItem",
        MATERIA: "Materia",
        SPELL: "Spell",
        SUBCLASS: "Subclass",
        WEAPON: "Weapon"
    },
    ADVERSARY_TYPES: {
        BRUISER: 'Bruiser',
        HORDE: 'Horde',
        LEADER: 'Leader',
        MINION: 'Minion',
        RANGED: 'Ranged',
        SKULK: 'Skulk',
        SOCIAL: 'Social',
        SOLO: 'Solo',
        STANDARD: 'Standard',
        SUPPORT: 'Support',
    },
    ENVIRONMENT_TYPES: {
        EXPLORATION: 'Exploration',
        SOCIAL: 'Social',
        TRAVERSAL: 'Traversal',
        EVENT: 'Event',
    },
    SUBCLASS_MASTERY_LEVEL: {
        FOUNDATION: 'Foundation',
        SPECIALIZATION: 'Specialization',
        MASTERY: 'Mastery',
    },
    ROLL_MODIFICATIONS: {
        ADVANTAGE: 'Advantage',
        DISADVANTAGE: 'Disadvantage',
        REROLL: 'Reroll',
    },
    RESOURCE_TYPES: {
        HP: 'hp',
        STRESS: 'stress',
        ARMOR: 'armor',
        HOPE: 'hope',
    },
    TRAITS: {
        AGILITY: 'Agility',
        FINESSE: 'Finesse',
        INSTINCT: 'Instinct',
        KNOWLEDGE: 'Knowledge',
        PRESENCE: 'Presence',
        STRENGTH: 'Strength',
    },
    DAMAGE_TYPES: {
        PHYSICAL: 'Physical',
        MAGICAL: 'Magical',
    },
    REST_TYPE: {
        SHORT_REST: 'Short Rest',
        LONG_REST: 'Long Rest',
    },
    TARGETS: {
        SELF: "Self",
        ALLIES: "Allies",
        ENEMIES: "Enemies",
    },
    RANGE: {
        MELEE: "Melee",
        VERY_CLOSE: "Very Close",
        CLOSE: "Close",
        FAR: "Far",
        VERY_FAR: "Very Far",
    },

    //Defaults
    DEFAULTS: {},
    LEVEL_UP_OPTIONS: {..._levelUpOptions},

    //Structures
    SETTINGS: {
        SETTING_NAME: {
            SCOPE: "user", //user || world
            USER_CAN_CONFIG: true, // true/false
            NAME: "setting_name",
            DEFAULT_VALUE: "setting_value",
        },
    },

    APPS: {
        CHARACTER_HUD: {
            ID: "dtg.characterHud",
            SOCKET_ID: "dtg.characterHud",
        },
        CHARACTER_MANAGER: {
            ID: "dtg.characterManager",
            SOCKET_ID: "dtg.characterManager",
        },
        COMBAT_TRACKER: {
            ID: "dtg.combatTracker",
            SOCKET_ID: "dtg.combatTracker",
        },
        DEATH_MOVE_HANDLER: {
            ID: "dtg.deathMoveHandler",
            SOCKET_ID: "dtg.deathMoveHandler",
        },
        FEAR_TRACKER: {
            ID: "dtg.fearTracker",
            SOCKET_ID: "dtg.fearTracker",
        },
        FEATURE_EDITOR: {
            ID: "dtg.featureEditor",
            SOCKET_ID: "dtg.featureEditor",
        },
        PROGRESS_TRACKER: {
            ID: "dtg.progressTracker",
            SOCKET_ID: "dtg.progressTracker",
        },
        SETTINGS_MANAGER: {
            ID: "dtg.settingsManager",
            SOCKET_ID: "dtg.settingsManager",
        }
    },
    POLYMORPHIC_TYPES: {
        EFFECTS: {
            BASE: EffectDataModel,
            CLASSES: [
                ApplyConditionEffectDataModel,
                ChangeRollEffectDataModel,
                ConsumeResourceEffectDataModel,
                DamageEffectDataModel,
                DamageResistanceEffectDataModel,
                HealEffectDataModel,
                RemoveConditionEffectDataModel,
                RestoreResourceEffectDataModel
            ]
        }
    }
}

//Sheets
_rawConstants.SHEETS.ACTORS.push({class: AdversarySheet, label: _rawConstants.LANG.ACTOR_TYPES.ADVERSARY, types: [_rawConstants.ACTOR_TYPES.ADVERSARY], default: true});
_rawConstants.SHEETS.ACTORS.push({class: EnvironmentSheet, label: _rawConstants.LANG.ACTOR_TYPES.ENVIRONMENT, types: [_rawConstants.ACTOR_TYPES.ENVIRONMENT], default: true});
_rawConstants.SHEETS.ACTORS.push({class: PlayerSheet, label: _rawConstants.LANG.ACTOR_TYPES.PLAYER, types: [_rawConstants.ACTOR_TYPES.PLAYER], default: true});

_rawConstants.SHEETS.ITEMS.push({class: AncestrySheet, label: _rawConstants.LANG.ITEM_TYPES.ANCESTRY, types: [_rawConstants.ITEM_TYPES.ANCESTRY], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ArmorSheet, label: _rawConstants.LANG.ITEM_TYPES.ARMOR, types: [_rawConstants.ITEM_TYPES.ARMOR], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ClassSheet, label: _rawConstants.LANG.ITEM_TYPES.CLASS, types: [_rawConstants.ITEM_TYPES.CLASS], default: true});
_rawConstants.SHEETS.ITEMS.push({class: CommonItemSheet, label: _rawConstants.LANG.ITEM_TYPES.COMMON_ITEM, types: [_rawConstants.ITEM_TYPES.COMMON_ITEM], default: true});
_rawConstants.SHEETS.ITEMS.push({class: CommunitySheet, label: _rawConstants.LANG.ITEM_TYPES.COMMUNITY, types: [_rawConstants.ITEM_TYPES.COMMUNITY], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ConsumableSheet, label: _rawConstants.LANG.ITEM_TYPES.CONSUMABLE, types: [_rawConstants.ITEM_TYPES.CONSUMABLE], default: true});
_rawConstants.SHEETS.ITEMS.push({class: DomainSheet, label: _rawConstants.LANG.ITEM_TYPES.DOMAIN, types: [_rawConstants.ITEM_TYPES.DOMAIN], default: true});
_rawConstants.SHEETS.ITEMS.push({class: DomainCardSheet, label: _rawConstants.LANG.ITEM_TYPES.DOMAIN_CARD, types: [_rawConstants.ITEM_TYPES.DOMAIN_CARD], default: true});
_rawConstants.SHEETS.ITEMS.push({class: FeatureSheet, label: _rawConstants.LANG.ITEM_TYPES.FEATURE, types: [_rawConstants.ITEM_TYPES.FEATURE], default: true});
_rawConstants.SHEETS.ITEMS.push({class: MagicItemSheet, label: _rawConstants.LANG.ITEM_TYPES.MAGIC_ITEM, types: [_rawConstants.ITEM_TYPES.MAGIC_ITEM], default: true});
_rawConstants.SHEETS.ITEMS.push({class: MateriaSheet, label: _rawConstants.LANG.ITEM_TYPES.MATERIA, types: [_rawConstants.ITEM_TYPES.MATERIA], default: true});
_rawConstants.SHEETS.ITEMS.push({class: SpellSheet, label: _rawConstants.LANG.ITEM_TYPES.SPELL, types: [_rawConstants.ITEM_TYPES.SPELL], default: true});
_rawConstants.SHEETS.ITEMS.push({class: SubclassSheet, label: _rawConstants.LANG.ITEM_TYPES.SUBCLASS, types: [_rawConstants.ITEM_TYPES.SUBCLASS], default: true});
_rawConstants.SHEETS.ITEMS.push({class: WeaponSheet, label: _rawConstants.LANG.ITEM_TYPES.WEAPON, types: [_rawConstants.ITEM_TYPES.WEAPON], default: true});

//Data Models
_rawConstants.DATA_MODELS.ACTORS = {
    [_rawConstants.ACTOR_TYPES.ADVERSARY]: AdversaryDataModel,
    [_rawConstants.ACTOR_TYPES.ENVIRONMENT]: EnvironmentDataModel,
    [_rawConstants.ACTOR_TYPES.PLAYER]: PlayerDataModel,
};

_rawConstants.DATA_MODELS.ITEMS = {
    [_rawConstants.ITEM_TYPES.ANCESTRY]: AncestryDataModel,
    [_rawConstants.ITEM_TYPES.ARMOR]: ArmorDataModel,
    [_rawConstants.ITEM_TYPES.CLASS]: ClassDataModel,
    [_rawConstants.ITEM_TYPES.COMMON_ITEM]: CommonItemDataModel,
    [_rawConstants.ITEM_TYPES.COMMUNITY]: CommunityDataModel,
    [_rawConstants.ITEM_TYPES.CONSUMABLE]: ConsumableDataModel,
    [_rawConstants.ITEM_TYPES.DOMAIN]: DomainDataModel,
    [_rawConstants.ITEM_TYPES.DOMAIN_CARD]: DomainCardDataModel,
    [_rawConstants.ITEM_TYPES.FEATURE]: FeatureDataModel,
    [_rawConstants.ITEM_TYPES.MAGIC_ITEM]: MagicItemDataModel,
    [_rawConstants.ITEM_TYPES.MATERIA]: MateriaDataModel,
    [_rawConstants.ITEM_TYPES.SPELL]: SpellDataModel,
    [_rawConstants.ITEM_TYPES.SUBCLASS]: SubClassDataModel,
    [_rawConstants.ITEM_TYPES.WEAPON]: WeaponDataModel,
};

//Choices
_rawConstants.CHOICES.ADVERSARY = Object.values(_rawConstants.ADVERSARY_TYPES);
_rawConstants.CHOICES.ENVIRONMENT = Object.values(_rawConstants.ENVIRONMENT_TYPES);
_rawConstants.CHOICES.SUBCLASS_MASTERY_LEVEL = Object.values(_rawConstants.SUBCLASS_MASTERY_LEVEL);
_rawConstants.CHOICES.ROLL_MODIFICATIONS = Object.values(_rawConstants.ROLL_MODIFICATIONS);
_rawConstants.CHOICES.RESOURCES = Object.values(_rawConstants.RESOURCE_TYPES);
_rawConstants.CHOICES.TRAITS = Object.values(_rawConstants.TRAITS);
_rawConstants.CHOICES.DAMAGE_TYPES = Object.values(_rawConstants.DAMAGE_TYPES);
_rawConstants.CHOICES.REST_TYPE = Object.values(_rawConstants.REST_TYPE);
_rawConstants.CHOICES.TARGETS = Object.values(_rawConstants.TARGETS);
_rawConstants.CHOICES.RANGE = Object.values(_rawConstants.RANGE);

//Defaults
_rawConstants.DEFAULTS.RESOURCES = _rawConstants.RESOURCE_TYPES.HP;
_rawConstants.DEFAULTS.TARGETS = _rawConstants.TARGETS.ENEMIES;
_rawConstants.DEFAULTS.RANGE = _rawConstants.RANGE.MELEE;
_rawConstants.DEFAULTS.TRAITS = _rawConstants.TRAITS.STRENGTH;
_rawConstants.DEFAULTS.DAMAGE_TYPES = _rawConstants.DAMAGE_TYPES.PHYSICAL;
_rawConstants.DEFAULTS.ENVIRONMENT = _rawConstants.ENVIRONMENT_TYPES.EXPLORATION;
_rawConstants.DEFAULTS.SUBCLASS_MASTERY_LEVEL = _rawConstants.SUBCLASS_MASTERY_LEVEL.FOUNDATION;

//Polymorphic Type
_rawConstants.POLYMORPHIC_TYPES.EFFECTS.MAP = _rawConstants.POLYMORPHIC_TYPES.EFFECTS.CLASSES.reduce((map, cls) => {
    map[cls._internalType] = cls;
    return map;
}, {});

export const CONSTANTS = _rawConstants;
