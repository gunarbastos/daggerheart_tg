console.log(`Loaded: ${import.meta.url}`);

import {BaseDataModel} from "./module/common/baseDataModel.js";
import {InventoryItemDataModel} from "./module/common/inventoryItemDataModel.js";
import {DTGHooks, Utils} from "./module/common/index.js";

Utils.log('Starting...');

DTGHooks.registerHooks();