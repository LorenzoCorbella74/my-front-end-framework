function template () {
    return html`<div class=${this.name} id="${this.id}">
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <hr>
            <h3>Esempio di lista:</h3>
            ${this.loading ? html`<div class="loader"></div>` : html`<ul>
            ${repeat(this.items, i => {
        return i.name;
    }, (e, index) => html`<li>${index}: ${e.name}</li>`)}
        </ul>`}
            
            <div data-component="child-component" data-props="form"></div>
        `;
}

import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';

import { shared } from './shared-service';

export function sharedCtrl (id) {
    return {
        id: id,
        name: 'shared-component',
        template: template,
        data: {
            shared: shared,
            items: [],
            loading: false
        },
        onInit () {
            this.getRandom();
        },
        onPropsChange () {
            console.log(this);
        },
        events: {
            add: function (e) {
                this.shared.counter++;
            },
            remove: function (e) {
                this.shared.counter--;
            },
            async getRandom () {
                try {
                    this.loading = true;
                    let toAvoidCors = 'https://cors-anywhere.herokuapp.com';
                    let response = await this.$http.get(toAvoidCors + '/https://swapi.co/api/people');
                    this.items = response.results;
                    this.loading = false;
                } catch (error) {
                    console.log('Error: ', error);
                    this.loading = false;
                }
            }
        }
    }
};