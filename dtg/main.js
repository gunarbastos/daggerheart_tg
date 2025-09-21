import {Mixins} from "./module/common/mixins.js";
import {BaseDataModel} from "./module/common/baseDataModel.js";
import {InventoryItemDataModel} from "./module/common/inventoryItemDataModel.js";
import {Utils} from "./module/common/utils.js";
import {DTGHooks} from "./module/common/index.js";

console.log(`Loaded: ${import.meta.url}`);

Utils.log('Starting...');

DTGHooks.registerHooks();