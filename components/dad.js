function template () {
    return html`<div class=${uppercase(this.name)} id="${this.id}">
                <h3>Dad component</h3>  
                <p>Counter: ${this.counter}</p>
                <p>Shared: ${this.shared.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <p>Esempio di computed properties: ${this.interpolated}</p>
                <hr> 
                <p>Esempio di two way data binding: ${this.form.name}</p>
                <input type="text" data-model="form.name" value="${this.form.name}">
                <div data-component="child-component"></div>
                <div data-component="shared-component"></div>
            </div>`;
}

import uppercase from './../filters/uppercase';

import {shared} from './shared-service';
import {html} from 'lit-html';

export function dadCtrl (id) {
    return {
        id: id,
        name: 'dad-component',
        template: template,
        data: {
            counter: 0,
            shared: shared,
            form:{
                name:''
            }
        },
        computed:{
            interpolated (params) {
                return ` Clicked ${this.counter} times`;
            }
        },
        events: {
            add: function (e) {
                this.counter++;
            },
            remove: function (e) {
                this.counter--;
            }
        }
    }
};
