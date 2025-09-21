import {
    AncestryDataModel, ArmorDataModel,
    ClassDataModel, CommonItemDataModel, CommunityDataModel, ConsumableDataModel,
    DomainCardDataModel,
    DomainDataModel,
    FeatureDataModel, MagicItemDataModel, MateriaDataModel, SpellDataModel,
    SubClassDataModel, WeaponDataModel
} from "../../dataModel/item/index.js";
import {InventoryItemDataModel, Utils} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class DTGItemDocument extends Item {

    constructor(data, context) {
        super(data, context);

        if(this.system instanceof FeatureDataModel) Object.setPrototypeOf(this, game.dtg.documents.FeatureDocument.prototype);
        else if(this.system instanceof ClassDataModel) Object.setPrototypeOf(this, game.dtg.documents.ClassDocument.prototype);
        else if(this.system instanceof DomainDataModel) Object.setPrototypeOf(this, game.dtg.documents.DomainDocument.prototype);
        else if(this.system instanceof DomainCardDataModel) Object.setPrototypeOf(this, game.dtg.documents.DomainCardDocument.prototype);
        else if(this.system instanceof SubClassDataModel) Object.setPrototypeOf(this, game.dtg.documents.SubclassDocument.prototype);
        else if(this.system instanceof AncestryDataModel) Object.setPrototypeOf(this, game.dtg.documents.AncestryDocument.prototype);
        else if(this.system instanceof CommunityDataModel) Object.setPrototypeOf(this, game.dtg.documents.CommunityDocument.prototype);
        else if(this.system instanceof SpellDataModel) Object.setPrototypeOf(this, game.dtg.documents.SpellDocument.prototype);
        else if(this.system instanceof ArmorDataModel) Object.setPrototypeOf(this, game.dtg.documents.ArmorDocument.prototype);
        else if(this.system instanceof WeaponDataModel) Object.setPrototypeOf(this, game.dtg.documents.WeaponDocument.prototype);
        else if(this.system instanceof CommonItemDataModel) Object.setPrototypeOf(this, game.dtg.documents.CommonItemDocument.prototype);
        else if(this.system instanceof ConsumableDataModel) Object.setPrototypeOf(this, game.dtg.documents.ConsumableDocument.prototype);
        else if(this.system instanceof MagicItemDataModel) Object.setPrototypeOf(this, game.dtg.documents.MagicItemDocument.prototype);
        else if(this.system instanceof MateriaDataModel) Object.setPrototypeOf(this, game.dtg.documents.MateriaDocument.prototype);
        else if(this.system instanceof InventoryItemDataModel) Object.setPrototypeOf(this, game.dtg.documents.InventoryItemDocument.prototype);
    }

    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        if(this.parent) return;

        this.updateSource({
            ownership: {
                default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
            }
        });
    }

}