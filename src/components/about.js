function templateFactory () {
    return html`
    <div class="${this.name} content" id="${this.id}">
        <h3 class="title">About page</h3>  
        <a class="button is-link" data-navigation href="/"> Back to home</a>
        <p>just a placeholder text</p>
        <button class="button is-primary" data-event="click:gotoHome">Home</button>
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
                this.$router.navigate('/');
            }
        },
        onInit () {
            console.log('Route params', this.$router.params);
        },
        onDestroy(){
            console.log('On destroy on component', this);
        }
    }
}