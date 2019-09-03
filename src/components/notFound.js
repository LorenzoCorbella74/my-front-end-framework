function templateFactory() {
    return html`
    <div class="${this.name}" id="${this.id}">
        <h3>NOT FOUND!!!</h3>  
        <a data-navigation href="/"> Back to home</a>
        <p>just a placeholder text</p>
    </div > `;
}
import { html } from 'lit-html';

export function notFoundCtrl(id) {
    return {
        id: id,
        name: "not-found-component",
        template: templateFactory,
        data: {

        },
        events: {

        }
    }
}