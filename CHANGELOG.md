# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

## [Unreleased]
### Added
- Combat Tracker Enhancements
- App for on-screen monitor and edit of Player Resources
- Progress/Countdown App
- Long/Shor Rest Implementation
- Death Move Implementation
- Sheets Configurations
- Full fields for all Items Types and Actors

### Changed
- Player Sheet Improvements
- Standardized style for all Non Player Sheets


## [0.1.0] - 2025-08-26
### Added
- **Foundry v13 baseline**: initial compatibility targets (`minimum=13`, `verified=13`).
- **Languages**: wiring for `en`, `pt-BR`, and `ja` language files.
- **Actor DataModels**: `Player`, `Adversary`, `Environment` registered via `CONFIG.Actor.dataModels`.
- **Item Types**: `Weapon`, `Armor`, `Spell`, `Class`, `Subclass`, `Domain`, `DomainCard`, `Feature`, `Ancestry`,
  `Consumable`, `Community`, `CommonItem`, `MagicItem`, `Materia`.
- **Sheets**: MVP of Player, Adversary and Items sheets are in place.
- **Fear Tracker App**: Added tracker of fear points to both players and GM, with options to restrict view to players. 

### Known issues / WIP
- Player, Adversary and Items sheet UIs are functional but not final; CSS/LESS styling is in progress.
- All Item Sheets are just input forms; activation/rolling behavior pending.
- Drag-to-hotbar macro + `{event}` handoff planned but not wired.
- Localization content incomplete; file structure is in place.

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

[Unreleased]: https://github.com/gunarbastos/daggerheart_tg/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/gunarbastos/daggerheart_tg/releases/tag/v0.1.0