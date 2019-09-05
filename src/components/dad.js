function template () {
    return html`<div class="${this.name} content" id="${this.id}">
                <nav class="level">
                    <div class="level-right">
                        <a class="button is-link" data-navigation href="/about"> About </a>
                        <a class="button is-link" data-navigation href="/about/:${this.id}/${this.counter}"> About "with params"</a>
                    </div>
                </nav>

                <h3 class="title">${uppercase(this.name)}</h3>  
                <p>Counter: ${this.counter}</p>
                <p>Shared: ${this.shared.counter}</p>
                <button class="button is-primary" data-event="click:add"> + </button>
                <button class="button is-primary" data-event="click:remove"> - </button>
                <p><strong>Computed properties:</strong> ${this.interpolated}</p>
                <hr> 
                <p><strong>TWO way data binding:</strong> ${this.form.name}</p>
                <div class="field">
                    <label class="label">Name</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Your name" data-model="form.name" value="${this.form.name}">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Surname</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Your surname" data-model="form.surname" value="${this.form.surname}">
                    </div>
                </div>
                <div class="field">
                    <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" data-model="form.married" name="married">
                        Married
                    </label>
                    </div>
                </div>

                <div data-component="child-component" data-props="form"></div>
                <div data-component="shared-component" data-props="form"></div>
            </div>`; // ${this.form.married ? 'checked':''}
}

import uppercase from './../filters/uppercase';

import { shared } from './shared-service';
import { html } from 'lit-html';

export function dadCtrl (id) {
    return {
        id: id,
        name: 'dad-component',
        template: template,
        data: {
            counter: 0,
            shared: shared,
            form: {
                name: 'Lore',
                surname: 'Corbe',
                married: false
            }
        },
        computed: {
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
