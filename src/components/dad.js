function template () {
    return html`<div class="${this.name} content" id="${this.id}">
                <nav class="level">
                    <div class="level-right">
                        <a class="button is-link" data-navigation href="/about"> About </a>
                        <a class="button is-link" data-navigation href="/about/:${this.id}/${this.counter}"> About "with params"</a>
                    </div>
                </nav>

                <h3 class="title">${uppercase(this.name)}</h3>  
                <p>Counter: ${this.counter}</p>
                <p>Shared: ${this.shared.counter}</p>
                <button class="button is-primary" data-event="click:add"> + </button>
                <button class="button is-primary" data-event="click:remove"> - </button>
                <br/>
                <p><span class="tag is-light"><strong>Computed properties:</strong></span>  ${this.interpolated}</p>

                <p><span class="tag is-light"><strong>TWO way data binding:</strong></span> ${this.form.name}</p>

                <h3 class="title">Test FORM</h3>  
                <form data-form="formTest" name="formName" novalidate>
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Your name" name="exampleImput" data-model="form.name" data-validation="required" value="${this.form.name}">
                        </div>
                    </div>

                    <div class="field">
                        <input class="is-checkradio" id="exampleCheckbox" type="checkbox" name="exampleCheckbox" data-model="form.married" checked="${this.form.married ? 'checked' : ''}">
                        <label for="exampleCheckbox">Checkboxs with 'checked' ${this.form.married}</label>
                    </div>

                    <div class="field">
                        <input class="is-checkradio" id="exampleCheckbox2" type="checkbox" name="exampleCheckbox2" value="choice1" data-model="form.choice1">
                        <label for="exampleCheckbox2">Checkboxs with 'value' ${this.form.choice1}</label>
                    </div>

                    <div class="field">
                        <input class="is-checkradio" id="exampleRadioInline1" name="exampleRadio1" type="radio" value="red" data-model="form.testRadio">
                        <label for="exampleRadioInline1">Red</label>
                        <input class="is-checkradio" id="exampleRadioInline2" name="exampleRadio2" type="radio" value="blue" data-model="form.testRadio">
                        <label for="exampleRadioInline2">Blue</label>
                        ${this.form.testRadio}
                    </div>

                    <div class="select">
                        <select name="exampleSelect" data-model="form.testSelect" data-validation="required">
                            <option value="Argentina">Argentina</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Brazil">Brazil</option>
                            <option value="Chile">Chile</option>
                            <option value="Colombia">Colombia</option>
                        </select>
                    </div>
                    <p>${this.form.testSelect}</p>

                    <div class="field is-grouped">
                        <div class="control">
                            <button class="button is-link" type="button" data-event="click:validateForm">Submit</button>
                        </div>
                    </div>
                
                </form>
                <br/>
                
                <div data-component="child-component" data-props="form"></div>
                <div data-component="shared-component" data-props="form"></div>
            </div>`; // ${this.form.married ? 'checked':''}
}

import uppercase from './../filters/uppercase';

import { shared } from './shared-service';
import { html } from 'lit-html';


const validations = {
    required: function (value) {
        return value !== '';
    },
    phone: function (value) {
        return value.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
    }
}

export function dadCtrl (id) {
    return {
        id: id,
        name: 'dad-component',
        template: template,
        data: {
            counter: 0,
            shared: shared,
            form: {
                name: 'Lorenzo',
                married: false,
                choice1: '',
                testRadio: '',
                testSelect: ''
            }
        },
        computed: {
            interpolated () {
                return ` Clicked ${this.counter} times`;
            }
        },
        events: {
            add: function (e) {
                this.counter++;
            },
            remove: function (e) {
                this.counter--;
            },
            validateForm: function (e) {
                this.$log.log('FORMS', this.$forms['formName']);
                let inputsArr = this.$forms['formName'];
                let i = 0;
                while (i < inputsArr.length) {
                    let attr = inputsArr[i].dataset['validation'],
                        rules = attr ? attr.split(' ') : '',
                        // parent = inputsArr[i].closest(".field"),
                        j = 0;
                    while (j < rules.length) {
                        if (!validations[rules[j]](inputsArr[i].value)) {
                            // parent.className = "field error";
                            this.$log.log(`Not Valid ${inputsArr[i].name} based on rule ${rules[j]}`)
                            return false;
                        }
                        // parent.className = "field";
                        j++;
                    }
                    i++;
                }
                this.$log.log(`Form is valid`);
            }
        },
        onInit () {
            this.$event.on('from-child', (payload) => {
                this.$log.log('Sent with event bus: ', payload);
            });
        }
    }
};
