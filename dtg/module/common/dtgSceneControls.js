import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";

Utils.log(`Loaded: ${import.meta.url}`);

export class DTGSceneControls extends CONFIG.ui.controls {

    async _onRender(context, options) {
        await super._onRender(context, options);
        if(this.control.name === CONSTANTS.SYSTEM_ID) {
            document.querySelector('[id=scene-controls-tools]').lastElementChild.outerHTML = '';
        }
    }

}