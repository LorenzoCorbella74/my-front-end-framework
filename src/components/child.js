function templateFactory() {
    return html`
    <div class="${this.name} content has-background-grey-lighter" id="${this.id}">
        <h3 class="title">Child component</h3>  
        <p>componente figlio: ${this.counter}</p>
        <hr>
        <p>From parent component via <span class="tag is-light">props</span>: ${this.form.name}</p> 
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
        props:['form'],
        data: {
            counter: 5,
            visible: false
        },
        events: {
            alertMe: function () {
                alert('Sending an event to the dad component!');
                this.$event.emit('from-child',{test:`string from ${this.name}`});
            },
            toggle: function () {
                this.visible = !this.visible;
            }
        }
    }
}