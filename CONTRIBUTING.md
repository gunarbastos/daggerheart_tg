# Contributing to Daggerheart-TG (Foundry VTT System)

Thanks for your interest in contributing! This guide will help you understand how to work with the project structure, coding conventions, and expectations.

---

## ️Project Structure

```
/dtg/              → Foundry VTT system folder
  └─ /asset/       → Images and other visual assets
  └─ /lang/        → mock files for languages. We do not use default localizer
  └─ /less/        → Stylesheets written in LESS
  └─ /module/      → All JS source code (plain ESModules)
  └─ /template/    → Handlebars templates
  └─ main.css      → Output of LESS compilation (do not edit directly)
  └─ main.js       → main Javascript file loaded for the system
  └─ system.json   → configuration json for foundry VTT system
  
/jsdocs/           → JSDoc autocomplete/type hinting helpers
/tools/            → Python scripts for packaging, validation, etc
tools.bat          → DOS Bat file that calls "python -m tools" with all the parameters sent exactly as given to the bat
```

---

## Development Guidelines

### JavaScript Code

- Use **plain JavaScript ESModules**
- All functions must be placed as `static` methods inside classes
- Use the `Utils` class in `/dtg/module/common/Utils.js` for shared helpers
- Avoid standalone functions or top-level logic
- Keep an `index.js` file with all the exports of the directory inside each directory. Running `tool indexes` tool builds it automatically for you.


### Constants Usage

- Do **not** reference the `CONSTANTS` module in static class properties or at module top-level
- Only use `CONSTANTS` in:
  - Functions (including static defineSchema())
  - Non-static class members
  - Code that runs **after** module load is complete (after `Hooks.on("ready")` triggers)

### Naming Conventions

| Element| Convention|
|---|---|
|Class names| `PascalCase`|
|Class members (Functions/Properties/Vars)| `camelCase`|
|Local variables| `camelCase`|
|Constants| `UPPER_SNAKE_CASE`|
|Files/Folders| `camelCase`|

- Class members that are not intended for external use should be marked as private `#`
- Files and Class names for common things, that repeat across the system, should be suffixed with the part of the system that it is being done in the file
  - i.e: For Player, we will have `/dtg/module/dataModel/actor/playerDataModel.js`, `/dtg/module/document/actor/playerDocument.js` and `/dtg/module/sheet/actor/playerSheet.js`

---

## Placeholder Files

Some folders contain empty `ph` files. These:

- Exist only to preserve directory structure
- **Must be deleted** once you add a real file to the folder

---

## Templates & LESS

- Templates live in `/dtg/templates/`, styles in `/dtg/less/`
- Compile styles into `/dtg/main.css` via LESS (e.g., `tools less`)
- Do not edit `main.css` manually

---

## Python Tooling

- All automation lives in `/tools/`
- Written in Python
- Scripts are run standalone (or via GitHub Actions)
- Currently, no tests or linters are used

> ❕❕❕ Until tests/linting are added, skip `npm test`, `npm lint`, etc.

---

## Tests / CI / Linting

Testing and linting are **not yet implemented**. Do not submit testing-related configurations or run commands unless requested.

---

## Making a Contribution

1. Fork the repository
2. Create a new branch: `feature/my-new-feature` from `develop`
3. Follow all naming and structure rules above
4. If your changes affect multiple areas (e.g., JS + LESS), commit them in logical groups
5. Remove placeholder files (`ph`) if your files replace them
6. Submit a pull request to  `develop` with a clear description

---

## Need Help?

- Open a GitHub Discussion or Issue if you're unsure about anything
