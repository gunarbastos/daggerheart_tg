import {BaseDataModel} from "../../common/index.js";

console.log(`Loaded: ${import.meta.url}`);

export class DomainDataModel extends BaseDataModel {

    /** @inheritDoc */
    static _enableV10Validation = true;

    /** @inheritDoc */
    get domainCards() {
        return game.items.filter(doc => doc instanceof game.dtg.documents.DomainCardDocument && doc.system.domainUUID === this.uuid);
    }

}