import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";

console.log(`Loaded: ${import.meta.url}`);

export class DtgSockets {

    //#region Handlers
    static async socketHandler(msg){
        if(!msg) return;
        try{
            switch(msg.message) {
                case CONSTANTS.SOCKETS.MESSAGES.REFRESH_PLAYER_SHEET:
                    await DtgSockets.#refreshPlayerSheet(msg.params);
                    break;
                default:
                    Utils.error(`message ${msg.message} received on socket not implemented`, {showUiNotification:true});
                    break;
            }
        } catch (err) {
            Utils.error(err, {showUiNotification: true, uiMessage: 'there was an error processing sockets, check log for more information'});
        }
    }

    static async #refreshPlayerSheet(params) {
        if (!params){
            Utils.error(`params is empty for refreshPlayerSheet`, {showUiNotification:true});
            return;
        }

        //not doing anything for the user that emits it.
        if(params.emitter === game.userId) return;

        if(!params.documentId){
            Utils.error(`documentId is empty for refreshPlayerSheet`, {showUiNotification:true});
            return;
        }

        if(!params.parts){
            Utils.error(`no parts to render, nothing will be done`, {showUiNotification:true});
            return;
        }

        const document = await Utils.fromUuid(params.documentId);
        if(!document){
            Utils.error(`could not find document passed in refreshPlayerSheet`, {showUiNotification:true});
            return;
        }

        const apps = (document.apps && typeof document.apps === "object")
            ? Object.values(document.apps)
            : [];

        for (const app of apps){
            await app.render({parts: params.parts});
        }

    }
    //#endregion

    //#region Emitters
    static refreshPlayerSheet(uuid, { parts = null } = {}) {
        try {
            game.socket?.emit(CONSTANTS.SOCKETS.ID, {
                message: CONSTANTS.SOCKETS.MESSAGES.REFRESH_PLAYER_SHEET,
                params: {
                    documentId: uuid,
                    parts: parts,
                    emitter: game.userId
                }
            });
        } catch (err) {
            Utils.error(err.message, {showUiNotification:true});
        }
    }
    //#endregion


}