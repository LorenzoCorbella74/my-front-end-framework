// si importa gli stili SASS
import './style.scss';

// COMPONETS
import { dadCtrl } from './components/dad'
import { childCtrl } from './components/child'
import { sharedCtrl } from './components/shared';

import {html, render} from 'lit-html';

class Engine {
    
    constructor() {
        this.events = {};
        this.components = {};
    }

    addComponent (key, factoryFn) {
        this.components[key] = factoryFn;
        this.components[key].instance = factoryFn();
    }

    compileTemplate (component) {
        return component.template.call(Object.assign({ name: component.name }, component.model));
    }

    rootRnder (root, key) {
        let componentInstance = this.components[key].instance;
        render(this.compileTemplate(componentInstance), root);
        // EVENTI del root
        this.mapEvents(root, componentInstance)
        // EVENTI dei figli
        const child = root.querySelectorAll('[data-component]');
        child.forEach(element => {
            if (element.dataset.component) {
                let sonInstance = this.components[element.dataset.component].instance;
                render(this.compileTemplate(sonInstance), element );
                this.mapEvents(element, sonInstance);
            } else {
                throw 'Componente non presente';
            }
        });
    }

    mapEvents (root, componentInstance) {
        this.events[componentInstance.name] = [];
        const theOnes = root.querySelectorAll('[data-event]'); // solo sul componente
        let that = this;
        theOnes.forEach((theOne, i) => {
            let str = theOne.dataset.event.split(':');
            this.events[componentInstance.name][i] = { type: str[0], action: str[1], element: root };
            this.addListners(theOne, componentInstance, i, that, root);
        });
        console.log(this.events);
    }

    addListners (theOne, componentInstance, i, that, root) {
        theOne.addEventListener(this.events[componentInstance.name][i].type, function (e) {
            componentInstance.events[that.events[componentInstance.name][i].action].call(componentInstance.model, e);
            let instance = that.components[componentInstance.name].instance;
            render(that.compileTemplate(instance), root); // solo sul componente
        });
    }
}

window.onload = function () {

    const app = new Engine();

    // si registrano i componenti
    app.addComponent('dad-component', dadCtrl);
    app.addComponent('child-component', childCtrl);
    app.addComponent('shared-component', sharedCtrl);

    // si 
    app.rootRnder(document.getElementById('output'), 'dad-component'); // rendering the root
}
