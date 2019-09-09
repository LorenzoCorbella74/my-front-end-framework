import Watcher from './watcher';
import router from './router';
import http from './http';

import set from 'lodash.set';
import get from 'lodash.get';
import { render } from 'lit-html';
import onChange from 'on-change';

export default class Luce {

    constructor(main) {
        this.tempEvents = {};
        this.events = {};
        this.componentsRegistry = {};
        this.istances = [];
        this.main = main;
        this.router = router(this, main);
        this.http = http;
    }

    addComponent (key, factoryFn) {
        this.componentsRegistry[key] = factoryFn;
        return this;
    }

    propagateChange (a, path) {
        let sonSInstance = this.istances.filter(e => e.parentId === a.id);
        sonSInstance.forEach(sonIstance => {
            if(path && get(sonIstance.model, path)){
                console.log("Match between the data sent from parent and the props of the childs");
                if (sonIstance.onPropsChange && typeof sonIstance.onPropsChange === 'function') {
                    // passing the model and a reference to events
                    let x = Object.assign(sonIstance.model, sonIstance.events);
                    sonIstance.onPropsChange.call(x);
                }
            } 
            this.propagateChange(sonIstance, path);
        });
    }

    proxyMe (source, a) {
        let $e = this;
        a.model = onChange(source, function (path, value, previousValue) {
            // console.log('Model:', this);
            // console.log(`path: ${path}`);
            // if(value && previousValue){
            //     console.log(`new: ${JSON.stringify(value)} - old: ${JSON.stringify(previousValue)}`);
            // }
            let instance = $e.istances.find(e => e.id === a.id);
            if (instance) {
                render($e.compiledTemplate(instance), instance.element); // only for the relevant component
                // check if there are new child components...
                $e.checkComponentThree(instance.element, instance);
                // FIXME: updating sons only if props change 
                $e.propagateChange(a, path);
                // FIXME: update events  
                $e.mapEvents(instance.element, instance);
            }
        });
    }

    isInDadAndChild (obj, arr) {
        if (obj === null || arr === undefined) return;
        for (let a = 0; a < arr.length; a++) {
            const key = arr[a];
            if (key in obj) {
                return true;
            }
        }
        return false;
    }

    createOrGetCachedIstance (key, id, element, props, parent) {
        let $e = this
        if (!id) {
            let randomId = Math.floor(Math.random() * 1000000);
            let a = this.componentsRegistry[key](`${key}:${randomId}`);
            a.parentId = parent.id;
            a.element = element;
            a.model = {};
            let match = this.isInDadAndChild(props, a.props);
            // merging the data of the component with the data received from parent component
            a.data = props && a.props && match ? Object.assign(a.data, props) : a.data;

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

    initComputed (scope, computed) {
        scope._computedWatchers = Object.create(null);
        for (const key in computed) {
            let valueFn = computed[key];
            // si passa lo scope e la funzione che deve esser fatta girare
            scope._computedWatchers[key] = new Watcher(scope, valueFn);
            if (!(key in scope)) {
                let props = {
                    configurable: true,
                    enumerable: true,
                    set () { },
                    get () {
                        const watcher = scope._computedWatchers && scope._computedWatchers[key];
                        if (watcher) return watcher.value;
                    }
                };
                Object.defineProperty(scope, key, props);
            }
        }
    }

    checkComponentThree (root, componentInstance) {
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
                // events are registered only the first time...
                // events management is done when data change !!
                if (!id) {
                    this.mapEvents(element, sonInstance);
                }
                this.checkComponentThree(element, sonInstance);
            } else {
                throw 'Componente non presente';
            }
        });
    }

    compiledTemplate (component) {
        let compiledTemplate = component.template.call(Object.assign({
            name: component.name,
            id: component.id,
            ...component.model
        }));
        return compiledTemplate;
    }

    rootRender (root, key, urlParams) {
        this.router.params = Object.assign({}, urlParams);
        let componentInstance = this.createOrGetCachedIstance(key, null, root, null, root);
        render(this.compiledTemplate(componentInstance), root);
        // Root's events
        this.mapEvents(root, componentInstance)
        // Check component three
        this.checkComponentThree(root, componentInstance);
        // console.log('Components istances: ', this.istances);
    }

    getTree (node, component) {
        var r = { tag: node.nodeName, element: node, component: component }, a, i;
        for (i = 0; a = node.attributes[i]; i++) {
            r[a.nodeName] = a.nodeValue;
        }
        if ('data-component' in r) {
            let child = node.firstElementChild;
            if (child) {
                r.component = child.id;
            }
        }
        if (node.childElementCount) {
            r.children = [];
            for (i = 0; a = node.children[i]; i++) {
                r.children.push(this.getTree(a, r.component));
            }
        }

        if ('data-event' in r) {
            this.tempEvents[component] = this.tempEvents[component] || [];
            let str = r['data-event'].split(':');
            let name = /^.*?(?=\()/g.exec(str[1]);
            let params = /\(([^)]+)\)/g.exec(str[1]);
            r.type = str[0];
            r.action = name ? name[0] : str[1];
            r.params = params ? params[1].split(',') : null;
            this.tempEvents[component].push(r);
        }
        return r;
    }

    notAlreadyPresent (id, item) {
        let result = this.events[id].findIndex(e => e.element == item.element && e.type == item.type && e.action == item.action);
        return result === -1;
    }

    containsObject (id, item) {
        let result = this.tempEvents[id].findIndex(e => e.element == item.element && e.type == item.type && e.action == item.action);
        return result !== -1;
    }

    checkEventList (componentInstance) {
        // console.log(this.events[componentInstance.id], this.tempEvents[componentInstance.id]);
        let index = [];
        for (let x = 0; x < this.events[componentInstance.id].length; x++) {
            const elem = this.events[componentInstance.id][x];
            if (this.containsObject(componentInstance.id, elem)) {
                continue;
            } else {
                index.push(x);
            }
        }
        if (this.events[componentInstance.id].length > this.tempEvents[componentInstance.id].length && index.length > 0) {
            index.forEach(i => {
                this.removeListners(this.events[componentInstance.id][i], componentInstance);
                this.events[componentInstance.id].splice(i, 1);
            });
        }
    }

    checkComponentList(){
        let $e = this;
        for (let a = 0; a < this.istances.length; a++) {
            const instance = this.istances[a];
            if(document.getElementById(instance.id)){
                // console.log(`Component ${instance.id } is in page.`);
            } else {
                if (instance.onDestroy && typeof instance.onDestroy=== 'function') {
                    // passing the model and a reference to events and router
                    let scope = Object.assign(instance.model, instance.events, { $router: $e.router, $http: $e.http, $ele: instance.element });
                    instance.onDestroy.call(scope);
                }
                console.log(`Component ${instance.id } removed.`);
                this.istances.splice(a,1);
            }
        }
    }

    mapEvents (root, componentInstance) {
        let $e = this;
        this.tempEvents = {};
        this.events[componentInstance.id] = this.events[componentInstance.id] || [];
        this.tempEvents[componentInstance.id] = this.tempEvents[componentInstance.id] || [];
        // 1) Events handlers for USER EVENTS via component methods
        // only events of the component but NOT the ones inside data-components
        let three = this.getTree(root, componentInstance.id);
        // console.log('DOM Three :', three);
        // console.log('Three :', this.tempEvents);
        let that = this;
        this.tempEvents[componentInstance.id].forEach((event, i) => {
            if (that.notAlreadyPresent(componentInstance.id, event)) {
                that.events[componentInstance.id].push(event);
                that.addListners(event, componentInstance);
            } else {
                // console.log('Already present: ', event);
            }
        });
        this.checkEventList(componentInstance);
        this.checkComponentList();
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

    addListners (htmlElement, componentInstance) {
        let $e = this;
        htmlElement.element.addEventListener(htmlElement.type, function (e) {
            // passing the model and a reference to events, router and the html element itself
            let scope = Object.assign(componentInstance.model, componentInstance.events, { $router: $e.router, $http: $e.http, $ele: componentInstance.element })
            let params = htmlElement.params ? [e, ...htmlElement.params] : [e];
            componentInstance.events[htmlElement.action].apply(scope, params);
            // console.log(`Updated model after ${htmlElement.type} event, triggering action: ${htmlElement.action}`);
        });
    }

    removeListners (htmlElement, componentInstance) {
        let $e = this;
        htmlElement.element.removeEventListener(htmlElement.type, function (e) {
            // passing the model and a reference to events, router and the html element itself
            let scope = Object.assign(componentInstance.model, componentInstance.events, { $router: $e.router, $http: $e.http, $ele: componentInstance.element })
            let params = htmlElement.params ? [e, ...htmlElement.params] : [e];
            componentInstance.events[htmlElement.action].apply(scope, params);
            // console.log(`Removed event listners for ${htmlElement.type} event, triggering action: ${htmlElement.action}`);
        });
    }
    removeAllListnersInPage () {
        this.istances.forEach(istance => {
            this.events[istance.id].forEach(event => {
                this.removeListners(event, istance);
            });
        });
    }
}