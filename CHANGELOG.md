# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

## [Unreleased]
### Worked On
- Progress and Countdown App
- Rest App
- Death Move Handler App
- Drag actions to hotbar
- Access to all fields for each type of `Item` and `Actor` from the `Sheets`
- Settings for all `Sheets`
- Feature editor
- Automation (Stats calculation and automatic consumption)
- Tag Team Action App

### Backlog
- Toast Messages for `Fear` gains and expenditures
- Standardized styling across all `Sheets` except `Players`
- Character Manager (which will include leveling up)
- Character Selector on Chat App
- Homebrew editor
- System Configuration App (Maybe won't be needed)
- Localization for `en`, `pt-BR` and `ja`
- Improvements in chat messages (roll damage from hit roll, roll reactions from roll messages that require them)

## [0.1.1] - 2025-09-26
### Added
- Combat Tracker Enhancements
- App for on-screen monitor and edit of Player Resources
- Player Sheet Configurations
- Support for notation pd<size> on Weapon damage rolls made trough the Player Sheet, where p is the proficiency
- Configuration to choose image styles for resource pips

### Changed
- Player Sheet Improvements

### Known issues / WIP
- Placeholder `Token` on `dtg` tools category sometimes is restored
- Images for resources pips are larger than they should be, making them slow to load in some circumstances

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
- `Actor` list is not updated when other user change an `Actor` name
- `Token` linked to actor is not updated when other user change an `Actor` name
- Image of the `Player Sheet` is not working
- There is a visible placeholder in the `dtg` tools category that should not be there
- New `Actors` sheets are not being properly configured with the default `Token` configurations

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

[Unreleased]: https://github.com/gunarbastos/daggerheart_tg/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/gunarbastos/daggerheart_tg/releases/tag/v0.1.1
[0.1.0]: https://github.com/gunarbastos/daggerheart_tg/releases/tag/v0.1.0
