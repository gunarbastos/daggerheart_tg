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
import {DTGRadioType} from "./types.js";

console.log(`Loaded: ${import.meta.url}`);

let _rawConstants = {
    SYSTEM_ID: "dtg",
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
    //SYSTEM_ID: "dtg",
    CORE_ID: "core",

    //sockets
    SOCKETS: {
        ID: `system.${_rawConstants.SYSTEM_ID}`,
        MESSAGES: {
            REFRESH_PLAYER_SHEET: "REFRESH_PLAYER_SHEET",
        }
    },

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

    TEMPLATES: {
    },

    ASSETS: {
        ICONS: {
            HP: {
                USED: {
                    '1': 'heart_marked.webp',
                    '2': 'heart_marked_2.webp',
                    '3': 'heart_marked_3.webp',
                    '4': 'heart_marked_4_2.webp',
                    '5': 'heart_marked_5.webp',
                },
                AVAILABLE: 'heart_unmarked.webp',
            },
            ARMOR: {
                USED: {
                    '1': 'armor_marked.webp',
                    '2': 'armor_marked_2.webp',
                    '3': 'armor_marked_3.webp',
                    '4': 'armor_marked_4_2.webp',
                    '5': 'armor_marked_5.webp',
                },
                AVAILABLE: 'armor_unmarked.webp',
            },
            STRESS: {
                USED: 'stress_marked.webp',
                AVAILABLE: 'stress_unmarked.webp',
            },
            HOPE: {
                USED: 'hope_empty.webp',
                AVAILABLE: 'hope_filled.webp',
            },
            SCAR: 'scar_1.webp',
            ADVANTAGE: 'advantage.webp',
            DISADVANTAGE: 'disadvantage.webp',
        }
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
    WEAPON_SLOT: {
        PRIMARY: 'Primary',
        SECONDARY: 'Secondary',
    },
    SPOTLIGHT: {
        GM: "GM",
        PLAYERS: "Players",
    },

    //Defaults
    DEFAULTS: {},
    LEVEL_UP_OPTIONS: {..._levelUpOptions},

    //Structures
    SETTINGS: {
        FEAR_MAXIMUM: {
            name: "Fear: Maximum",
            hint: "Maximum size of the GM fear pool.",
            scope: "world",
            config: true,
            type: Number,
            default: 12,
            range: { min: 0 },
        },
        FEAR_CURRENT: {
            name: "Fear: Current",
            hint: "Current GM fear points (temporary: editable for testing).",
            scope: "world",
            config: false,
            type: Number,
            default: 0,
            range: { min: 0 },
        },
        FEAR_ASSISTANT_CAN_EDIT: {
            name: "Fear: Allow Assistant to Edit Fear",
            hint: "Determines if players with Assistant role can edit fear value.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
        },
        FEAR_PLAYERS_CAN_SEE: {
            name: "Fear: Allow Players to See Fear",
            hint: "Determines if players can open the Fear app.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
        },
        FEAR_WINDOW_POSITION: {
            scope: "user",
            config: false,
            type: Object,
            default: {},
        },
        FEAR_WINDOW_IS_OPEN: {
            scope: "user",
            config: false,
            type: Boolean,
            default: true,
        },
        /*FEAR_WINDOW_LAYOUT: {
            scope: "user",
            config: false,
            type: String,
            default: "numbers",
        },*/
        RESOURCEMANAGER_WINDOW_POSITION: {
            scope: "user",
            config: false,
            type: Object,
            default: {},
        },
        RESOURCEMANAGER_WINDOW_IS_OPEN: {
            scope: "user",
            config: false,
            type: Boolean,
            default: true,
        },
        RESOURCEMANAGER_SELECTED_DOCUMENT: {
            scope: "user",
            config: false,
            type: String,
            default: '',
        },
        RESOURCEMANAGER_SHOW_NOT_OWNED: {
            scope: "user",
            config: true,
            name: "Resource Manager: Show actors that you can see only",
            hint: "Determines if the Resource Manager App shows actors that the player can see but not edit.",
            type: Boolean,
            default: true,
        },
        RESOURCEMANAGER_SHOW_FOLDER_IN_NAME: {
            scope: "user",
            config: true,
            name: "Resource Manager: Show folder in name",
            hint: "Determines if the the folder name is prepended to the token name.",
            type: Boolean,
            default: false,
        },
        SPOTLIGHT: {
            scope: "world",
            config: false,
            type: String,
            default: 'GM',
        },
        SMALL_ICONS_STYLE: {
            scope: "user",
            config: true,
            customType: 'DTGRadioType',
            default: '5',
            name: 'Style of Small Icons',
            hint: 'Style of icons in places like Combat Tracker',
            iconClass: 'small-icon',
            items: {
                '1': [],
                '2': [],
                '3': [],
                '4': [],
                '5': [],
            }
        },
        MEDIUM_ICONS_STYLE: {
            scope: "user",
            config: true,
            customType: 'DTGRadioType',
            default: '3',
            name: 'Style of Medium Icons',
            hint: 'Style of icons in places like Player Sheet and Resource Manager',
            iconClass: 'medium-small-icon',
            items: {
                '1': [],
                '2': [],
                '3': [],
                '4': [],
                '5': [],
            }
        },
        COMBATTRACKER_PLAYERS_SEE_NOT_OWNED_ACTORS_RESOURCES: {
            scope: "world",
            config: true,
            type: String,
            default: 'none',
            name: 'Combat Tracker - Player Resource visibility',
            hint: 'Determines if the players can see resources from non-owned actors',
            choices: {
                "none": "Only see it's own",
                "allies": "It's own and other players",
                "all": "See everyone's resources"
            }
        }
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
_rawConstants.CHOICES.WEAPON_SLOT = Object.values(_rawConstants.WEAPON_SLOT);

//Defaults
_rawConstants.DEFAULTS.RESOURCES = _rawConstants.RESOURCE_TYPES.HP;
_rawConstants.DEFAULTS.TARGETS = _rawConstants.TARGETS.ENEMIES;
_rawConstants.DEFAULTS.RANGE = _rawConstants.RANGE.MELEE;
_rawConstants.DEFAULTS.TRAITS = _rawConstants.TRAITS.STRENGTH;
_rawConstants.DEFAULTS.DAMAGE_TYPES = _rawConstants.DAMAGE_TYPES.PHYSICAL;
_rawConstants.DEFAULTS.ENVIRONMENT = _rawConstants.ENVIRONMENT_TYPES.EXPLORATION;
_rawConstants.DEFAULTS.SUBCLASS_MASTERY_LEVEL = _rawConstants.SUBCLASS_MASTERY_LEVEL.FOUNDATION;
_rawConstants.DEFAULTS.WEAPON_SLOT = _rawConstants.WEAPON_SLOT.PRIMARY;

//Templates to preload
_rawConstants.TEMPLATES.ROOT_DIR = `systems/${_rawConstants.SYSTEM_ID}/template`;
_rawConstants.TEMPLATES.DUALITY_DICE_ROLL = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/chat/dualityDiceRoll.hbs` };
_rawConstants.TEMPLATES.RULER = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/canvas/ruler-waypoint-label.hbs` };
_rawConstants.TEMPLATES.DUALITY_DICE_ROLL_DETAILS =  { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/chat/partials/dualityDiceRollDetails.hbs`, PRELOAD: true, ALIAS: "dualityDiceRollDetails" };
_rawConstants.TEMPLATES.NUMBER_FIELD = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/common/numberField.hbs`, PRELOAD: true, ALIAS: "numberField" };
_rawConstants.TEMPLATES.TEXT_FIELD = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/common/textField.hbs`, PRELOAD: true, ALIAS: "textField" };
_rawConstants.TEMPLATES.RESOURCE_ROW = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/common/resourceRow.hbs`, PRELOAD: true, ALIAS: "resourceRow" };
_rawConstants.TEMPLATES.SHEET_RESOURCE_ROW = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/sheet/common/resourceRow.hbs`, PRELOAD: true, ALIAS: "sheetResourceRow" };
_rawConstants.TEMPLATES.PLAYER_SHEET_TRAIT = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/sheet/player/partial/trait.hbs`, PRELOAD: true, ALIAS: "playerSheetTrait" };
_rawConstants.TEMPLATES.COMBAT_TRACKER_ADVERSARY_ROW = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/app/dtgCombatTracker/partial/adversary.hbs`, PRELOAD: true, ALIAS: "CTAdversary" };
_rawConstants.TEMPLATES.COMBAT_TRACKER_PLAYER_ROW = { PATH: `${_rawConstants.TEMPLATES.ROOT_DIR}/app/dtgCombatTracker/partial/player.hbs`, PRELOAD: true, ALIAS: "CTPlayer" };

//Asset dirs
_rawConstants.ASSETS.ROOT_DIR = `systems/${_rawConstants.SYSTEM_ID}/asset`;
_rawConstants.ASSETS.ICON_DIR = `${_rawConstants.ASSETS.ROOT_DIR}/icon`;

//Range Bands
_rawConstants.RANGE_BANDS = {
    5: _rawConstants.RANGE.MELEE,
    10: _rawConstants.RANGE.VERY_CLOSE,
    30: _rawConstants.RANGE.CLOSE,
    100: _rawConstants.RANGE.FAR,
    300: _rawConstants.RANGE.VERY_FAR,
    max: 'OUT OF RANGE'
}

//Set property "id" for each and all Settings
for(const [settingKey, settingValue] of Object.entries(_rawConstants.SETTINGS)) {
    settingValue.id = settingKey;
}

for(const setting of [_rawConstants.SETTINGS.MEDIUM_ICONS_STYLE, _rawConstants.SETTINGS.SMALL_ICONS_STYLE]) {
    console.log('setting', setting);
    console.log('constant', _rawConstants.ASSETS.ICONS.HP.USED);
    setting.items['1'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.HP.USED['1']}`);
    setting.items['1'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.ARMOR.USED['1']}`);
    setting.items['2'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.HP.USED['2']}`);
    setting.items['2'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.ARMOR.USED['2']}`);
    setting.items['3'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.HP.USED['3']}`);
    setting.items['3'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.ARMOR.USED['3']}`);
    setting.items['4'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.HP.USED['4']}`);
    setting.items['4'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.ARMOR.USED['4']}`);
    setting.items['5'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.HP.USED['5']}`);
    setting.items['5'].push(`${_rawConstants.ASSETS.ICON_DIR}/${_rawConstants.ASSETS.ICONS.ARMOR.USED['5']}`);
}

//Polymorphic Type
_rawConstants.POLYMORPHIC_TYPES.EFFECTS.MAP = _rawConstants.POLYMORPHIC_TYPES.EFFECTS.CLASSES.reduce((map, cls) => {
    map[cls._internalType] = cls;
    return map;
}, {});

export const CONSTANTS = _rawConstants;
