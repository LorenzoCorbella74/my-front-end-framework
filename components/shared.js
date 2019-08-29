function template() {
    return html`<div class=${this.name} id="${this.id}">
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <ul>
                ${repeat(this.items, i => {
                    return i.id;
                }, (e, index) => html`<li>${index}:${e.name}</li>`)}
            </ul>
            <div data-component="child-component"></div>
        </li>`;
}
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';

/* 
    NOTES: 
    al momento non sono supportate più istanze dello stesso componente 
    <div data-component="child-component"></div>
    <div data-component="shared-component"></div> 
*/

import { shared } from './shared-service';

export function sharedCtrl(id) {
    return {
        id: id,
        name: 'shared-component',
        template: template,
        data: {
            shared: shared,
            items: [
                { id: 0, name: "Prince" },
                { id: 1, name: "Elvis" },
                { id: 2, name: "Pelvis" }
            ]
        },
        get model() {
            return this.data
        },
        events: {
            add: function (e) {
                this.shared.counter++;
            },
            remove: function (e) {
                this.shared.counter--;
            }
        }
    }
};