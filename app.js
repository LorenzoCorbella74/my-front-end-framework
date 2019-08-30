// si importa gli stili SASS
import './style.scss';

// COMPONETS
import { dadCtrl } from './components/dad'
import { childCtrl } from './components/child'
import { sharedCtrl } from './components/shared';

// FILTERS
import uppercase  from './filters/uppercase';

import { render } from 'lit-html';

class Engine {

    constructor() {
        this.events = {};
        this.componentsRegistry = {};
        this.istances = [];
        this.filters = {};
    }

    addComponent (key, factoryFn) {
        this.componentsRegistry[key] = factoryFn;
    }

    addFilter (key, filterFn) {
        this.filters[key] = filterFn;
    }

    createIstance (key, id, rootId) {
        if (!id) {
            let randomId = Math.floor(Math.random() * 1000000);
            let a = this.componentsRegistry[key](`${key}:${randomId}`);
            a.rootId = rootId;
            this.istances.push(a);
            return a;
        } else {
            return this.istances.find(e => e.id === id);
        }
    }

    compileTemplate (component) {
        let compiledTemplate =  component.template.call(Object.assign({}, { name: component.name, id: component.id, ...component.model}, this.filters));
        return compiledTemplate
    }

    checkComponentThree (root) {
        const child = root.querySelectorAll('[data-component]');
        child.forEach(element => {
            if (element.dataset.component) {
                let first = element.id;
                // if there is the id returns the previously created istance
                let sonInstance = this.createIstance(element.dataset.component, element.id, root.id);
                render(this.compileTemplate(sonInstance), element);
                // events are registered only the first time...
                if (!first) {
                    this.mapEvents(element, sonInstance);
                }
                this.checkComponentThree(element);
            } else {
                throw 'Componente non presente';
            }
        });
    }

    rootRnder (root, key) {
        let componentInstance = this.createIstance(key, null, root.id);
        render(this.compileTemplate(componentInstance), root);
        // Root's events
        this.mapEvents(root, componentInstance)
        // Check component three
        this.checkComponentThree(root);
        console.log('Components istances: ', this.istances);
    }

    mapEvents (root, componentInstance) {
        this.events[componentInstance.id] = [];
        const theOnes = root.querySelectorAll('[data-event]'); // solo sul componente
        let that = this;
        theOnes.forEach((theOne, i) => {
            let str = theOne.dataset.event.split(':');
            this.events[componentInstance.id][i] = { type: str[0], action: str[1], element: root };
            this.addListners(theOne, componentInstance, i, that, root);
        });
        console.log('Events: ', this.events);
    }

    addListners (theOne, componentInstance, i, that, root) {
        theOne.addEventListener(this.events[componentInstance.id][i].type, function (e) {
            componentInstance.events[that.events[componentInstance.id][i].action].call(componentInstance.model, e);
            let instance = that.istances.find(e => e.id === componentInstance.id);;
            render(that.compileTemplate(instance), root); // solo sul componente
        });
    }
}

window.onload = function () {

    const app = new Engine();

    // registering components
    app.addComponent('dad-component', dadCtrl);
    app.addComponent('child-component', childCtrl);
    app.addComponent('shared-component', sharedCtrl);

    // registering filters
    app.addFilter('uppercase', uppercase);

    // rendering the root
    app.rootRnder(document.getElementById('output'), 'dad-component');
}
