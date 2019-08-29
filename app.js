// si importa gli stili SASS
import './style.scss';

// COMPONETS
import { dadCtrl } from './components/dad'
import { childCtrl } from './components/child'
import { sharedCtrl } from './components/shared';

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

    render (root, key) {
        let componentInstance = this.components[key].instance;
        root.innerHTML = this.compileTemplate(componentInstance);
        // EVENTI del root
        this.mapEvents(root, componentInstance)
        // EVENTI dei figli
        const child = root.querySelectorAll('[data-component]');
        child.forEach(element => {
            if (element.dataset.component) {
                this.render(element, element.dataset.component);
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
    }

    addListners (theOne, componentInstance, i, that, root) {
        theOne.addEventListener(this.events[componentInstance.name][i].type, function (e) {
            componentInstance.events[that.events[componentInstance.name][i].action].call(componentInstance.model, e);
            that.render(root, componentInstance.name); // solo sul componente
        });
    }
}

window.onload = function () {

    const app = new Engine();

    app.addComponent('dad-component', dadCtrl);
    app.addComponent('child-component', childCtrl);
    app.addComponent('shared-component', sharedCtrl);

    app.render(document.getElementById('output'), 'dad-component'); // rendering the root
}
