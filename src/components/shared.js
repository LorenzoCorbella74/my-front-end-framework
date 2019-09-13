function template() {
    return html`<div class="${this.name} content has-background-white-bis" id="${this.id}">
    <h3 class="title">Component with nested components</h3>       
            <p>Shared: ${this.shared.counter}</p>
            <button class="button is-primary" data-event="click:add"> + </button>  
            <hr>
            <h3>Esempio di lista:</h3>
            ${this.loading ? html`<div class="loader"></div>` : html`
            <table class="table is-hoverable is-fullwidth">
            <tr>
              <th>Name</th>
              <th>Height</th> 
              <th>Mass</th>
              <th></th>
            </tr>
            ${repeat(this.items, i => i.name, (e, index) => html`
            <tr>
              <td>${e.id}</td>
              <td>${e.title}</td> 
              <td>${e.title}</td>
              <td><button class="button is-danger" data-event="click:deleteItem(${e.id})">x</button></td>
            </tr>`)}
          </table>`}
        <div data-component="child-component" data-props="form"></div>`;
}

import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';

import { shared } from './shared-service';

export function sharedCtrl(id) {
    return {
        id: id,
        name: 'shared-component',
        template: template,
        props: ['form'],
        data: {
            shared: shared,
            items: [],
            loading: false
        },
        onInit() {
            this.getRandom();
            this.$log.log('The HTML element of this component:', this.$ele);
        },
        onPropsChange() {
            this.$log.log(this);
        },
        events: {
            add: function ($event) {
                this.shared.counter++;
            },
            remove: function ($event) {
                this.shared.counter--;
            },
            deleteItem: function ($event, index) {
                this.items = this.items.filter((e, i) => e.id != Number(index));
            },
            async getRandom() {
                try {
                    this.loading = true;
                    let toAvoidCors = 'https://cors-anywhere.herokuapp.com';
                    let response = await this.$http.get(toAvoidCors + '/https://my-json-server.typicode.com/typicode/demo/posts');  // '/https://swapi.co/api/people'
                    this.items = response;
                    this.loading = false;
                } catch (error) {
                    console.log('Error: ', error);
                    this.loading = false;
                }
            }
        }
    }
};