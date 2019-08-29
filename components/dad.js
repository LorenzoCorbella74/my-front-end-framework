function template () {
    return `<div class=${this.name}>
                <p>Counter: ${this.counter}</p>
                <p>Shared: ${this.shared.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <hr> 
                <div data-component="child-component"></div>
                <div data-component="shared-component"></div>
            </div>`;
}

import {shared} from './shared-service';

export function dadCtrl () {
    return {
        name: 'dad-component',
        template: template,
        data: {
            counter: 0,
            shared: shared
        },
        get model () {
            return this.data
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
