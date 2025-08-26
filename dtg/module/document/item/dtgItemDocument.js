console.log(`Loaded: ${import.meta.url}`);

import {
    ClassDataModel,
    DomainCardDataModel,
    DomainDataModel,
    FeatureDataModel,
    SubClassDataModel
} from "../../dataModel/item/index.js";
import {InventoryItemDataModel, Utils} from "../../common/index.js";

export class DTGItemDocument extends Item {
    asProperType() {
        //Utils.log('DTGItemDocument', 'asProperType');
        //Utils.log('DTGItemDocument', 'this', this);
        //Utils.log('DTGItemDocument', 'this.system', this.system);
        //if(this.system instanceof FeatureDataModel) Object.setPrototypeOf(this, game.dtg.documents.FeatureItemDocument.prototype);
        if(this.system instanceof FeatureDataModel) Object.setPrototypeOf(this, game.dtg.documents.FeatureDocument.prototype);
        if(this.system instanceof InventoryItemDataModel) Object.setPrototypeOf(this, game.dtg.documents.InventoryItemDocument.prototype);
        if(this.system instanceof ClassDataModel) Object.setPrototypeOf(this, game.dtg.documents.ClassDocument.prototype);
        if(this.system instanceof DomainDataModel) Object.setPrototypeOf(this, game.dtg.documents.DomainDocument.prototype);
        if(this.system instanceof DomainCardDataModel) Object.setPrototypeOf(this, game.dtg.documents.DomainCardDocument.prototype);
        if(this.system instanceof SubClassDataModel) Object.setPrototypeOf(this, game.dtg.documents.SubclassDocument.prototype);

        return this;
    }
}