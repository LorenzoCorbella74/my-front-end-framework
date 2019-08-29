function template () {
    return `<div class=${this.name}>
            <p>Shared: ${this.shared.counter}</p>
            <button data-event="click:add"> + </button>
            <button data-event="click:remove"> - </button>
        </div>`;
}

/* 
    NOTES: 
    al momento non sono supportate più istanze dello stesso componente 
    <div data-component="child-component"></div>
    <div data-component="shared-component"></div> 
*/

import {shared} from './shared-service';

export function sharedCtrl () {
    return {
        name: 'shared-component',
        template: template,
        data: {
            shared: shared 
        },
        get model () {
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