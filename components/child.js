function templateFactory () {
    return html`
    <div class="${this.name}">
        <h3>Child component</h3>  
        <p>componente figlio: ${this.counter}</p>
        <button data-event="click:alertMe"> alert from child </button>
        <hr>
        <button data-event="click:toggle"> toggle </button>
        ${this.visible ? html`<p>Non visible: ${this.counter}</p>` : ''}
    </div > `;
}
import {html} from 'lit-html';

export function childCtrl () {
    return {
        name: "child-component",
        template: templateFactory,
        data: {
            counter: 5,
            visible: false
        },
        get model () {
            return this.data
        },
        events: {
            alertMe: function () {
                alert('event handler on a child component!')
            },
            toggle: function () {
                this.visible = !this.visible;
            }
        }
    }
};