function template() {
    return html`<div class=${this.name} id="${this.id}">
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <hr>
            <h3>Esempio di lista:</h3>
            ${this.loading ? html`<div class="loader"></div>` : html`
            <table style="width:100%">
            <tr>
              <th>Name</th>
              <th>Height</th> 
              <th>Mass</th>
            </tr>
            ${repeat(this.items, i => i.name, (e, index) => html`
            <tr>
              <td>${e.name}</td>
              <td>${e.height}</td> 
              <td>${e.mass}</td>
              <td><button data-event="click:deleteItem(${index})">x</button></td>
            </tr>`)}
          </table>`}
            
            <div data-component="child-component" data-props="form"></div>
        `;
}

import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';

import { shared } from './shared-service';

export function sharedCtrl(id) {
    return {
        id: id,
        name: 'shared-component',
        template: template,
        data: {
            shared: shared,
            items: [],
            loading: false
        },
        onInit() {
            this.getRandom();
            console.log('The HTML element of this component:', this.$ele);
        },
        onPropsChange() {
            console.log(this);
        },
        events: {
            add: function ($event) {
                this.shared.counter++;
            },
            remove: function ($event) {
                this.shared.counter--;
            },
            deleteItem: function ($event, index) {
                this.items = this.items.filter((e, i) => i != index);
            },
            async getRandom() {
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