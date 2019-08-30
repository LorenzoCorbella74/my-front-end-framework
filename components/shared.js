function template () {
    return html`<div class=${this.name} id="${this.id}">
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <hr>
            <h3>Esempio di lista:</h3>
            <ul>
                ${repeat(this.items, i => {
        return i.name;
    }, (e, index) => html`<li>${index}:${e.name}</li>`)}
            </ul>
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
            items: []
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
            getRandom: function () {
                http.get('https://cors-anywhere.herokuapp.com/https://swapi.co/api/people')
                    .then(response => {
                        this.items = response.results;
                    })
                    .catch(error => console.log('Error: ', error))
            }
        }
    }
};