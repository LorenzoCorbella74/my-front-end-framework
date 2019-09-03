function template () {
    return html`<div class=${uppercase(this.name)} id="${this.id}">
                <nav>
                    <a data-navigation href="/about"> About </a>
                    <a data-navigation href="/about/:${this.id}/${this.counter}"> About "with params"</a>
                </nav>
                <h3>Dad component</h3>  
                <p>Counter: ${this.counter}</p>
                <p>Shared: ${this.shared.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <p><strong>Computed properties:</strong> ${this.interpolated}</p>
                <hr> 
                <p><strong>TWO way data binding:</strong> ${this.form.name}</p>
                <input type="text" data-model="form.name" value="${this.form.name}">
                <input type="textarea" data-model="form.surname" value="${this.form.surname}">
                <input type="checkbox" data-model="form.married" name="married"> 
                <label for="married">Married</label>
                <div data-component="child-component" data-props="form"></div>
                <div data-component="shared-component" data-props="form"></div>
            </div>`; // ${this.form.married ? 'checked':''}
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
                name:'Lore',
                surname:'Corbe',
                married: false
            }
        },
        computed:{
            interpolated () {
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
