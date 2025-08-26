console.log(`Loaded: ${import.meta.url}`);

import {
    PlayerDataModel,
    EnvironmentDataModel,
    AdversaryDataModel
} from "../../dataModel/actor/index.js";

export class DTGActorDocument extends Actor {
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);

        const proper = this.asProperType();

        data = proper._modifyDataObject(data, options, userId);

        //foundry.utils.mergeObject(data.prototypeToken, result, { inplace: true, insertKeys: true, overwrite: false });
    }

    _modifyDataObject(data, options, userId){
        return data;
    }

    asProperType() {
        if(this.system instanceof PlayerDataModel) Object.setPrototypeOf(this, game.dtg.documents.PlayerDocument.prototype);
        if(this.system instanceof EnvironmentDataModel) Object.setPrototypeOf(this, game.dtg.documents.EnvironmentDocument.prototype);
        if(this.system instanceof AdversaryDataModel) Object.setPrototypeOf(this, game.dtg.documents.AdversaryDocument.prototype);

        return this;
    }

    async _preUpdate(changes, options, userId) {
        await super._preUpdate(changes, options, userId);

        const newImg = changes?.img;
        if (!newImg) return; // actor image not changing

        // don't touch if token image is explicitly set in changes (user is ALSO setting the protypetoken image)
        if (foundry.utils.getProperty(changes, "prototypeToken.texture.src")) return;

        const oldImg   = this.img ?? "";
        const tokenImg = this.prototypeToken?.texture?.src ?? "";
        const isUnset  = (s) => !s || s === "icons/svg/mystery-man.svg";

        // copy only if token image was blank or mirroring the old actor image
        if (isUnset(tokenImg) || tokenImg === oldImg) {
            foundry.utils.setProperty(changes, "prototypeToken.texture.src", newImg);
        }
    }
}