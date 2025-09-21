import {Utils} from "../../common/index.js";
import {
    PlayerDataModel,
    EnvironmentDataModel,
    AdversaryDataModel
} from "../../dataModel/actor/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class DTGActorDocument extends Actor {

    constructor(data, context) {
        super(data, context);

        if(this.system instanceof PlayerDataModel) Object.setPrototypeOf(this, game.dtg.documents.PlayerDocument.prototype);
        if(this.system instanceof EnvironmentDataModel) Object.setPrototypeOf(this, game.dtg.documents.EnvironmentDocument.prototype);
        if(this.system instanceof AdversaryDataModel) Object.setPrototypeOf(this, game.dtg.documents.AdversaryDocument.prototype);
    }

    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        this.updateSource({
            prototypeToken: this.defaultPrototypeToken
        });
    }

    get defaultPrototypeToken(){
        return {};
    }

    async _preUpdate(changes, options, userId) {
        await super._preUpdate(changes, options, userId);

        const newImg = changes?.img;
        if (newImg && !foundry.utils.getProperty(changes, "prototypeToken.texture.src")){ // actor image is changing and is also not set by the user as part of the update
            const oldImg   = this.img ?? "";
            const tokenImg = this.prototypeToken?.texture?.src ?? "";
            const isUnset  = (s) => !s || s === "icons/svg/mystery-man.svg";

            // copy only if token image was blank or mirroring the old actor image
            if (isUnset(tokenImg) || tokenImg === oldImg) {
                foundry.utils.setProperty(changes, "prototypeToken.texture.src", newImg);
            }
        }

        const newName = changes?.name;
        if (newName && !foundry.utils.getProperty(changes, "prototypeToken.name")){ // actor name is changing and is also not set by the user as part of the update
            const oldName   = this.name ?? "";
            const tokenName = this.prototypeToken?.name ?? "";

            // copy only if token name was blank or mirroring the old actor name
            if (tokenName === '' || tokenName === oldName) {
                foundry.utils.setProperty(changes, "prototypeToken.name", newName);
            }
        }
    }
    
}