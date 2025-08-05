import { Utils } from './';
import {EffectDataModel} from "../dataModel/item";
import {LANG} from './language.js'
import {
    ApplyConditionEffectDataModel,
    ChangeRollEffectDataModel,
    ConsumeResourceEffectDataModel,
    DamageEffectDataModel,
    DamageResistanceEffectDataModel,
    HealEffectDataModel,
    RemoveConditionEffectDataModel, RestoreResourceEffectDataModel
} from "../dataModel/item/effect";
import {AdversarySheet, EnvironmentSheet, PlayerSheet} from "../sheet/actor";
import {
    AncestrySheet,
    ArmorSheet,
    ClassSheet,
    CommonItemSheet,
    CommunitySheet,
    ConsumableSheet, DomainCardSheet,
    DomainSheet, FeatureSheet, MagicItemSheet, MateriaSheet, SpellSheet, WeaponSheet
} from "../sheet/item";

const _levelUpOptions = {
    tier2:{
        trait: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 3, points_required_for_activation: 1},
        hp: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        stress: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        experience: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        evasion: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
    },
    tier3:{
        trait: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 3, points_required_for_activation: 1},
        hp: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        stress: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        experience: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        evasion: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        subclass: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        proficiency: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 2},
        multiclass: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 2},
    },
    tier4:{
        trait: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 3, points_required_for_activation: 1},
        hp: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        stress: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 2, points_required_for_activation: 1},
        experience: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        extraCard: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        evasion: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        subclass: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 1},
        proficiency: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 2},
        multiclass: {label: LANG.LEVEL_UP_OPTIONS.OPTION_1.name, times_available: 1, points_required_for_activation: 2},
    },
};

const _rawConstants = {
    //Raw Constants
    SYSTEM_ID: "dtg",
    CORE_ID: "core",

    //Dynamically Built
    LANG: {...LANG},
    CHOICES: {}, //Built Dynamically

    //Sheets (dynamically at the end)
    SHEETS: {
        ACTORS: [],
        ITEMS: [],
    },

    //Enums
    ACTOR_TYPES: {
        ADVERSARY: "adversary",
        ENVIRONMENT: "environment",
        PLAYER: "player"
    },
    ITEM_TYPES: {
        ANCESTRY: "ancestry",
        ARMOR: "armor",
        CLASS: "class",
        COMMON_ITEM: "commonItem",
        COMMUNITY: "community",
        CONSUMABLE: "consumable",
        DOMAIN: "domain",
        DOMAIN_CARD: "domainCard",
        FEATURE: "feature",
        MAGIC_ITEM: "magicItem",
        MATERIA: "materia",
        SPELL: "spell",
        SUBCLASS: "subclass",
        WEAPON: "weapon"
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
    LEVEL_UP_OPTIONS: {..._levelUpOptions},

    //Structures
    SETTINGS: {
        SETTING_NAME: {
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
_rawConstants.SHEETS.ACTORS.push({class: AdversarySheet, label: LANG.ACTOR_TYPES.ADVERSARY, types: [_rawConstants.ACTOR_TYPES.ADVERSARY], default: true});
_rawConstants.SHEETS.ACTORS.push({class: EnvironmentSheet, label: LANG.ACTOR_TYPES.ENVIRONMENT, types: [_rawConstants.ACTOR_TYPES.ENVIRONMENT], default: true});
_rawConstants.SHEETS.ACTORS.push({class: PlayerSheet, label: LANG.ACTOR_TYPES.PLAYER, types: [_rawConstants.ACTOR_TYPES.PLAYER], default: true});

_rawConstants.SHEETS.ITEMS.push({class: AncestrySheet, label: LANG.ITEM_TYPES.ANCESTRY, types: [_rawConstants.ITEM_TYPES.ANCESTRY], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ArmorSheet, label: LANG.ITEM_TYPES.ARMOR, types: [_rawConstants.ITEM_TYPES.ARMOR], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ClassSheet, label: LANG.ITEM_TYPES.CLASS, types: [_rawConstants.ITEM_TYPES.CLASS], default: true});
_rawConstants.SHEETS.ITEMS.push({class: CommonItemSheet, label: LANG.ITEM_TYPES.COMMON_ITEM, types: [_rawConstants.ITEM_TYPES.COMMON_ITEM], default: true});
_rawConstants.SHEETS.ITEMS.push({class: CommunitySheet, label: LANG.ITEM_TYPES.COMMUNITY, types: [_rawConstants.ITEM_TYPES.COMMUNITY], default: true});
_rawConstants.SHEETS.ITEMS.push({class: ConsumableSheet, label: LANG.ITEM_TYPES.CONSUMABLE, types: [_rawConstants.ITEM_TYPES.CONSUMABLE], default: true});
_rawConstants.SHEETS.ITEMS.push({class: DomainSheet, label: LANG.ITEM_TYPES.DOMAIN, types: [_rawConstants.ITEM_TYPES.DOMAIN], default: true});
_rawConstants.SHEETS.ITEMS.push({class: DomainCardSheet, label: LANG.ITEM_TYPES.DOMAIN_CARD, types: [_rawConstants.ITEM_TYPES.DOMAIN_CARD], default: true});
_rawConstants.SHEETS.ITEMS.push({class: FeatureSheet, label: LANG.ITEM_TYPES.FEATURE, types: [_rawConstants.ITEM_TYPES.FEATURE], default: true});
_rawConstants.SHEETS.ITEMS.push({class: MagicItemSheet, label: LANG.ITEM_TYPES.MAGIC_ITEM, types: [_rawConstants.ITEM_TYPES.MAGIC_ITEM], default: true});
_rawConstants.SHEETS.ITEMS.push({class: MateriaSheet, label: LANG.ITEM_TYPES.MATERIA, types: [_rawConstants.ITEM_TYPES.MATERIA], default: true});
_rawConstants.SHEETS.ITEMS.push({class: SpellSheet, label: LANG.ITEM_TYPES.SPELL, types: [_rawConstants.ITEM_TYPES.SPELL], default: true});
_rawConstants.SHEETS.ITEMS.push({class: WeaponSheet, label: LANG.ITEM_TYPES.WEAPON, types: [_rawConstants.ITEM_TYPES.WEAPON], default: true});

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

//Polymorphic Type
_rawConstants.POLYMORPHIC_TYPES.EFFECTS.MAP = _rawConstants.POLYMORPHIC_TYPES.EFFECTS.CLASSES.reduce((map, cls) => {
    map[cls._internalType] = cls;
    return map;
}, {});

export const CONSTANTS = Utils.deepFreeze(_rawConstants);
