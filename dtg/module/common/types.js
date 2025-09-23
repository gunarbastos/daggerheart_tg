import {Utils} from './utils.js';

console.log(`Loaded: ${import.meta.url}`);

export class DTGRadioType extends foundry.data.fields.StringField {

    _toInput(config) {
        //Utils.log('DTGRadioType', '_toInput', config, this);
        let itemsHTML = '';
        for(const [key, value] of Object.entries(this.options.items)){
            let imagesHTML = '';
            for(const img of value){
                imagesHTML += `<img alt="${key}" src="${img}" class="${this.options.iconClass}" />`;
            }

            itemsHTML +=
                `<div style="display: flex; align-items: center">
                    <input type="radio" name="${this.name}" id="${this.name}.${key}" value="${key}" id="settings-config-${this.name}" ${config.value === key ? 'checked' : ''}>
                    <div style="display: flex">${imagesHTML}</div>
                </div>`;
        }
        return `<div>
                    ${itemsHTML}
               </div>`;
    }

    toFormGroup(groupConfig={}, inputConfig={}){
        //Utils.log('DTGRadioType', 'toFormGroup', groupConfig, inputConfig);
        const el = this._toInput(inputConfig);
        const mine = document.createElement("div");
        mine.innerHTML =
            `
                <label for="settings-config-${this.name}" style="align-self: flex-start">${this.label}</label>
                <div class="form-fields">
                    ${el}
                </div>
            `;
        mine.className = "form-group";
        return mine;
    }

}