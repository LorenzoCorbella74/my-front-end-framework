function templateFactory () {
    return html`
    <div class="${this.name}" id="${this.id}">
        <h3>About page</h3>  
        <a data-navigation href="/"> Back to home</a>
        <p>just a placeholder text</p>
        <button data-event="click:gotoHome">Home</button>
    </div > `;
}
import { html } from 'lit-html';

export function aboutCtrl (id) {
    return {
        id: id,
        name: "about-component",
        template: templateFactory,
        data: {

        },
        events: {
            gotoHome () {
                this.router.navigate('/');
            }
        },
        onInit () {
            console.log('Route params', this.router.params);
        }
    }
}