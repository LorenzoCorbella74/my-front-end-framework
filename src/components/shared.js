function template () {
    return html`<div class=${this.name} id="${this.id}">
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <hr>
            <h3>Esempio di lista:</h3>
            ${this.loading ? html`<p> CARICAMENTO!!!!!</p>` : html`<ul>
            ${repeat(this.items, i => {
        return i.name;
    }, (e, index) => html`<li>${index}: ${e.name}</li>`)}
        </ul>`}
            
            <div data-component="child-component"></div>
        </li>`;
}

import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import http from './../core/http';

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
        events: {
            add: function (e) {
                this.shared.counter++;
            },
            remove: function (e) {
                this.shared.counter--;
            },
            getRandom () {
                this.loading = true;
                let toAvoidCors = 'https://cors-anywhere.herokuapp.com';
                http.get(toAvoidCors + '/https://swapi.co/api/people')
                    .then(response => {
                        this.items = response.results;
                        this.loading = false;
                    })
                    .catch(error => {
                        console.log('Error: ', error);
                        this.loading = false;
                    });
            }
        }
    }
};