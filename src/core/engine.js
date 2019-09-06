import Watcher from './watcher';
import { render } from 'lit-html';
import set from 'lodash.set';
import router from './router';
import http from './http';

import onChange from 'on-change';

export default class Luce {

    constructor(main) {
        this.events = {};
        this.componentsRegistry = {};
        this.istances = [];
        this.router = router(this, main);
        this.http = http;
    }

    addComponent(key, factoryFn) {
        this.componentsRegistry[key] = factoryFn;
        return this;
    }

    propagateChange(a) {
        let sonSInstance = this.istances.filter(e => e.parentId === a.id);
        sonSInstance.forEach(sonIstance => {
            render(this.compiledTemplate(sonIstance), sonIstance.element); // only for the relevant component
            if (sonIstance.onPropsChange && typeof sonIstance.onPropsChange === 'function') {
                // passing the model and a reference to events
                let x = Object.assign(sonIstance.model, sonIstance.events);
                sonIstance.onPropsChange.call(x);
            }
            this.propagateChange(sonIstance);
        });
    }

    proxyMe(source, a) {
        let $e = this;
        a.model = onChange(source, function (path, value, previousValue) {
            // console.log('Model:', this);
            // console.log(`path: ${path}`);
            // if(value && previousValue){
            //     console.log(`new: ${JSON.stringify(value)} - old: ${JSON.stringify(previousValue)}`);
            // }
            let instance = $e.istances.find(e => e.id === a.id);
            if(instance){
                render($e.compiledTemplate(instance), instance.element); // only for the relevant component
                // check if there are new child components...
                $e.checkComponentThree(instance.element, instance);
                // FIXME: updating sons only if props change 
                // $e.propagateChange(a);
                // FIXME: update events  
                // $e.mapEvents(instance.element, instance);
            }    
        });
    }

    createOrGetCachedIstance(key, id, element, props, parent) {
        let $e = this
        if (!id) {
            let randomId = Math.floor(Math.random() * 1000000);
            let a = this.componentsRegistry[key](`${key}:${randomId}`);
            a.parentId = parent.id;
            a.element = element;
            a.model = {};
            // merging the data of the component with the data received from parent component
            a.data = props ? Object.assign(a.data, props) : a.data;
            
            this.proxyMe(a.data, a);    // a.model is listening for changes

            if (a.computed) this.initComputed(a.model, a.computed);
            this.istances.push(a);
            // running the init of the component
            if (a.onInit && typeof a.onInit === 'function') {
                // passing the model and a reference to events and router
                let scope = Object.assign(a.model, a.events, { $router: $e.router, $http: $e.http, $ele: a.element });
                a.onInit.call(scope);
            }
            return a;
        } else {
            // returning the cached components
            return this.istances.find(e => e.id === element.children[0].id);
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
                    set() { },
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
                let propsToBePassed = {};
                if (props.length > 0) {
                    props.forEach(element => {
                        let models = element.dataset.props.split(':');
                        models.forEach(key => {
                            propsToBePassed[key] = componentInstance.model[key] ? componentInstance.model[key] : {}
                        });
                    });
                }
                // if there is the id returns the previously created istance
                let id = element.children && element.children.length ? element.children[0].id : null;
                let sonInstance = this.createOrGetCachedIstance(element.dataset.component, id, element, propsToBePassed, componentInstance);
                render(this.compiledTemplate(sonInstance), element);
                // TODO: only when changed
                if (sonInstance.onPropsChange && typeof sonInstance.onPropsChange === 'function') {
                    // passing the model and a reference to events
                    let x = Object.assign(sonInstance.model, sonInstance.events);
                    sonInstance.onPropsChange.call(x);
                }
                // events are registered only the first time...
                //if (!id) {
                    this.mapEvents(element, sonInstance);
                // }
                this.checkComponentThree(element, sonInstance);
            } else {
                throw 'Componente non presente';
            }
        });
    }

    compiledTemplate(component) {
        return component.template.call(Object.assign({
            name: component.name,
            id: component.id,
            ...component.model
        }));
    }

    rootRender(root, key, urlParams) {
        this.router.params = Object.assign({}, urlParams);
        let componentInstance = this.createOrGetCachedIstance(key, null, root, null, root);
        render(this.compiledTemplate(componentInstance), root);
        // Root's events
        this.mapEvents(root, componentInstance)
        // Check component three
        this.checkComponentThree(root, componentInstance);
        console.log('Components istances: ', this.istances);
    }

    notAlreadyPresent(id, item) {
        let result = this.events[id].findIndex(e => e.element == item.element && e.type == item.type && e.action == item.action);
        return result === -1;
    }

    mapEvents(root, componentInstance) {
        let $e = this;
        this.events[componentInstance.id] = this.events[componentInstance.id] || [];
        // 1) Events handlers for USER EVENTS via component methods

        // only events of the component but NOT the ones inside data-components
        // const listenersNotInChildComponent = Array.from(root.querySelectorAll('[data-event]')).filter(item => !item.closest('[data-component]'));
        // const test = root.querySelectorAll('[data-component]>*'); // [data-component] > *
        // const test1 = test? test.querySelectorAll('[data-event]'):null; // [data-component] > *
        /*
            .my-paragraph div:not(.an-other-thing) {
                display: none;
            }
        */
        // console.log(listenersNotInChildComponent);
        
        // const copy = root.cloneNode(true);
        // const childs = copy.querySelectorAll('[data-component]')
        // childs.forEach(child=>child.remove());
        // const triggers = copy.querySelectorAll('[data-event]')
        // triggers.forEach(element => {
        //     console.log(`${componentInstance.id}: ${element.dataset.event}`);
        // });

        const theOnes = root.querySelectorAll('[data-event]');
        let that = this;
        theOnes.forEach((theOne, i) => {
            let str = theOne.dataset.event.split(':');
            let name = /^.*?(?=\()/g.exec(str[1]);
            let params = /\(([^)]+)\)/g.exec(str[1]);
            // we add the event if not already present
            const item = {
                type: str[0],
                action: name ? name[0] : str[1],
                params: params ? params[1].split(',') : null,
                element: theOne
            };
            if (that.notAlreadyPresent(componentInstance.id, item)) {
                that.events[componentInstance.id][i] = item;
                that.addListners(theOne, componentInstance, i);
            } else {
                // console.log('Already present: ', item);
                // that.removeListners(theOne, componentInstance, i, that, root);
            }
        });
        // 2) handlers for user INPUTS (DATA BINDING)
        const twoWays = root.querySelectorAll('[data-model]'); // solo sul componente
        twoWays.forEach((element, i) => {
            if (element.type === "text" || element.type === "textarea") {
                let propToBind = element.getAttribute('data-model');
                element.onkeydown = function () {
                    set(componentInstance.model, propToBind, element.value);
                }
            }
        });
        // console.log('Events: ', this.events);
    }

    addListners(htmlElement, componentInstance, i) {
        let $e = this;
        htmlElement.addEventListener(this.events[componentInstance.id][i].type, function (e) {
            // passing the model and a reference to events, router and the html element itself
            let scope = Object.assign(componentInstance.model, componentInstance.events, { $router: $e.router, $http: $e.http, $ele: componentInstance.element })
            let params = $e.events[componentInstance.id][i].params ? [e, ...$e.events[componentInstance.id][i].params] : [e];
            componentInstance.events[$e.events[componentInstance.id][i].action].apply(scope, params);
            console.log('Updated model: ', componentInstance);
        });
    }
}