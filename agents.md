# agents.md

## Agent: PythonToolsmith

**Description**: Maintains all Python automation scripts and CLI tools used for build, validation, deployment, or conversion tasks.

**Scope**:
- /tools
- Any file ending in `.py`

**Capabilities**:
- Create and maintain Python automation scripts
- Follow project conventions for copying, packaging, and validating system assets
- Avoid introducing tests or linters unless the project adds them
- Never assume the presence of `npm`-based test or lint workflows
- Respect `.packageIgnore` when packaging
- Support both standalone and GitHub Action-based execution of scripts

---

## Agent: SystemEngineer

**Description**: Maintains the core system code written in plain JavaScript using Foundry VTT v13's AppV2 API inside the `/dtg/module` folder.

**Scope**:
- /dtg/main.js
- /dtg/module
- /dtg/system.json
- Any `.js` file inside /dtg/**

**Capabilities**:
- Write all system code in **plain JavaScript** (no TypeScript)
- Follow Foundry VTT v13 AppV2 architecture and practices
- Place utility functions as `static` methods inside the `Utils` class under `/dtg/module/common/Utils.js` when possible
- Do not write standalone functions — all functions should be `static` inside a class
- Never use the `CONSTANTS` module in static class fields or top-level module code
    - It may only be accessed in runtime code (functions/methods) executed after `CONSTANTS` is fully loaded
- Do not analyze zero size `ph` files — when creating a file inside a folder that contains a `ph` file, the `ph` file must be deleted  
- Avoid assumptions about testing or linting until those tools are introduced
- Naming conventions are as follows
  - For Constants use all caps SNAKE_CASE
  - For files and folders use camelCase
  - For classes use PascalCase
  - For class members (functions, properties and variables) use camelCase
    - class members that are not used (or are not intended to be used) outside the class must be marked as private with #
  - local variables use camelCase

---

## Agent: TemplateStylist

**Description**: Designs and maintains Handlebars templates, LESS stylesheets, and visual assets for the Foundry VTT system.

**Scope**:
- /dtg/templates/**
- /dtg/less/**
- /dtg/main.css
- /dtg/asset/**

**Capabilities**:
- Create and organize Handlebars templates using Foundry VTT conventions
- Maintain a clean, scalable CSS codebase using `main.less` as the entry point
- Avoid generating final `.css` files directly, use LESS instead
  - LESS compilation is done trough "tools.bat less" command
    - LESS compilation requires npm install and python >=3.10, if none are present, skip compilation and notify
- Do not analyze zero size `ph` files — when creating a file inside a folder that contains a `ph` file, the `ph` file must be deleted
- Help enforce consistent naming and styling across UI elements

---

## Agent: JSdocGenie

**Description**: Maintains autocomplete support and documentation via inline JSDoc annotations in `/jsdocs`.

**Scope**:
- /jsdocs
- Any file containing JSDoc-style comments (`/** ... */`)

**Capabilities**:
- Generate and improve JSDoc annotations to assist with WebStorm IntelliSense
- Respect custom typedefs, value objects, and module exports
- Avoid assuming runtime availability of `game`, `CONFIG`, or `foundry` objects — treat `/jsdocs` as IDE-only
- Support automatic generation or separation of types (e.g. for DataModels or Schemas)
