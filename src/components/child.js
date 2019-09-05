function templateFactory() {
    return html`
    <div class="${this.name} content has-background-white-ter" id="${this.id}">
        <h3 class="title">Child component</h3>  
        <p>componente figlio: ${this.counter}</p>
        <hr>
        <p>passate da parent diretto via props: ${this.form.name} - ${this.form.surname}</p>
        <hr>
        <button class="button is-primary" data-event="click:alertMe"> alert from child </button>
        <hr>
        <button class="button is-primary" data-event="click:toggle"> toggle </button>
        ${this.visible ? html`<div><p>Non visible: ${this.counter}</p>
        <div data-component="about-component"></div></div>`
         : ''}
    </div > `;
}
import { html } from 'lit-html';

export function childCtrl(id) {
    return {
        id: id,
        name: "child-component",
        template: templateFactory,
        data: {
            counter: 5,
            visible: false
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
}