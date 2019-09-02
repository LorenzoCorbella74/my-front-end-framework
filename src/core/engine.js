import Watcher from './watcher';
import { render } from 'lit-html';
import set from 'lodash.set';

export default class Engine {

    constructor() {
        this.events = {};
        this.componentsRegistry = {};
        this.istances = [];
        this.filters = {};
    }

    addComponent(key, factoryFn) {
        this.componentsRegistry[key] = factoryFn;
    }

    addFilter(key, filterFn) {
        this.filters[key] = filterFn;
    }

    propagateChange(a){
        let sonSInstance = this.istances.filter(e => e.parentId === a.id);
        sonSInstance.forEach(sonIstance => {
            render(this.compileTemplate(sonIstance), sonIstance.element); // only for the relevant component
            if (sonIstance.onPropsChange && typeof sonIstance.onPropsChange === 'function') {
                // passing the model and a reference to events
                let x = Object.assign(sonIstance.model, sonIstance.events);
                sonIstance.onPropsChange.call(x);
            }
            this.propagateChange(sonIstance);
        });
    }

    // when the model change (from asyncronous events) update relevant component and sons
    proxyMe(source, destination, a) {
        let $e = this;
        Object
            .keys(source)
            .forEach(key => {
                // TODO: in case of array...
                if (typeof source[key] !== 'object' && source[key] !== null) {
                    let props = {
                        configurable: true,
                        enumerable: true,
                        get() {
                            return source[key];
                        },
                        set(val) {
                            source[key] = val;
                            console.log(`${key} updated with value ${val}`);
                            let instance = $e.istances.find(e => e.id === a.id);
                            render($e.compileTemplate(instance), instance.element); // only for the relevant component
                            // FIXME: updating sons only if props change 
                            $e.propagateChange(a);
                        }
                    }
                    Object.defineProperty(destination, key, props);
                    // oggetti
                } else {
                    destination[key] = destination[key] || {};
                    this.proxyMe(source[key], destination[key], a)
                }
            });
    }

    createIstance(key, id, root, element, props, parent) {
        let $e = this
        if (!id) {
            let randomId = Math.floor(Math.random() * 1000000);
            let a = this.componentsRegistry[key](`${key}:${randomId}`);
            a.parentId = parent.id;
            a.rootId = root.id;
            a.element = element;
            a.model = {};
            // merging the data of the component with the data received from parent component
            a.data = props ? Object.assign(a.data, props) : a.data;
            this.proxyMe(a.data, a.model, a);

            if (a.computed) this.initComputed(a.model, a.computed);
            this.istances.push(a);
            // running the init of the component
            if (a.onInit && typeof a.onInit === 'function') {
                // passing the model and a reference to events
                let x = Object.assign(a.model, a.events);
                a.onInit.call(x);
            }
            return a;
        } else {
            return this.istances.find(e => e.id === element.id);
        }
    }

    initComputed(scope, computed) {
        scope._computedWatchers = Object.create(null);
        for (const key in computed) {
            let valueFn = computed[key];
            // si passa lo scope e la funzione che deve esser fatta girare
            scope._computedWatchers[key] = new Watcher(scope, valueFn);
            if (!(key in scope)) {
                let props = {
                    configurable: true,
                    enumerable: true,
                    set() {},
                    get() {
                        const watcher = scope._computedWatchers && scope._computedWatchers[key];
                        if (watcher) return watcher.value;
                    }
                };
                Object.defineProperty(scope, key, props);
            }
        }
    }

    checkComponentThree(root, componentInstance) {
        const child = root.querySelectorAll('[data-component]');
        const props = root.querySelectorAll('[data-props]');
        child.forEach(element => {
            if (element.dataset.component) {
                let first = element.id;
                let propsToBePassed = {};
                if (props.length>0) {
                    props.forEach(element => {
                        let models = element.dataset.props.split(':');
                        models.forEach(key => {
                            propsToBePassed[key] = componentInstance.model[key] ? componentInstance.model[key] : {}
                        });
                    });
                }
                // if there is the id returns the previously created istance
                let sonInstance = this.createIstance(element.dataset.component, element.id, root, element, propsToBePassed, componentInstance);
                render(this.compileTemplate(sonInstance), element);
                // events are registered only the first time...
                if (!first) {
                    this.mapEvents(element, sonInstance);
                }
                this.checkComponentThree(element, sonInstance);
            } else {
                throw 'Componente non presente';
            }
        });
    }

    compileTemplate(component) {
        let compiledTemplate = component.template.call(Object.assign({
            name: component.name,
            id: component.id,
            ...component.model
        }, this.filters));
        return compiledTemplate;
    }

    rootRender(root, key) {
        let componentInstance = this.createIstance(key, null, root, root, null, {id:null});
        render(this.compileTemplate(componentInstance), root);
        // Root's events
        this.mapEvents(root, componentInstance)
        // Check component three
        this.checkComponentThree(root, componentInstance);
        console.log('Components istances: ', this.istances);
    }

    mapEvents(root, componentInstance) {
        this.events[componentInstance.id] = [];
        // 1) Events handlers for USER EVENTS via component methods
        const theOnes = root.querySelectorAll('[data-event]'); // solo sul componente
        let that = this;
        theOnes.forEach((theOne, i) => {
            let str = theOne.dataset.event.split(':');
            this.events[componentInstance.id][i] = {
                type: str[0],
                action: str[1],
                element: root
            };
            this.addListners(theOne, componentInstance, i, that, root);
        });
        console.log('Events: ', this.events);
        // 2) handlers for user INPUTS (DATA BINDING)
        const twoWays = root.querySelectorAll('[data-model]'); // solo sul componente
        twoWays.forEach((element, i) => {
            if (element.type === "text" || element.type === "textarea") {
                let propToBind = element.getAttribute('data-model');
                element.onkeydown = function () {
                    set(componentInstance.model, propToBind, element.value);
                }
                // element.addEventListener('onchange', function (e) {
                //     set(componentInstance.model, propToBind, e.target.value);
                // });
            }
        });
    }

    addListners(theOne, componentInstance, i, that, root) {
        theOne.addEventListener(this.events[componentInstance.id][i].type, function (e) {
            componentInstance.events[that.events[componentInstance.id][i].action].call(componentInstance.model, e);
            console.log('Updated model: ', componentInstance);
            // let instance = that.istances.find(e => e.id === componentInstance.id);
            // render(that.compileTemplate(instance), root); // solo sul componente
        });
    }
}