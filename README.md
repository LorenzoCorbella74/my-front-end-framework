# My Frontend framework

Queste circa ***150 righe*** di Javascript sono il risultato dei miei sforzi nella creazione di un framework FE con una API semplice e diretta avente tutte le principali caratteristiche dei framework più famosi (component based, routing, http service, etc). Per il Templating e Rendering engine è stata utilizzata la libreria [lit-html](https://github.com/polymer/lit-html) che garantisce una ottima performance.

## FEATURES
- [x] Componenti tra loro innestati tramite l'attributo ```data-component```
- [x] API Componenti simile a quella di [Vue.js](https://vuejs.org) con ```data``` del componente proxato e Computed properties
- [x] Istanze diverse dello stesso componente
- [x] Gestione degli eventi della singola istanza del componente (per pura esigenza didattica non sono state utilizzate gli eventi di [lit-html](https://github.com/polymer/lit-html)) con Ricostruzione eventi solo se non presenti 

### TODO:
- [ ] Router
- [ ] HTTP
- [ ] Filters: implementato ma non funzionante....)
- [ ] reattività del modello condiviso tra componenti diversi
- [ ] Props passate dal componente padre al figlio
- [ ] Events
- [ ] hook del componente (onInit, onPropsChange, onDestroy)

# Documentation

Per utilizzarla basta importare la libreria e registrare i componenti, ed i filtri:
```javascript

window.onload = function () {

    const app = new Engine();

    // registering components
    app.addComponent('dad-component', dadCtrl);
    app.addComponent('child-component', childCtrl);
    app.addComponent('shared-component', sharedCtrl);

    // registering filters
    app.addFilter('uppercase', uppercase);

    // rendering the root
    app.rootRender(document.getElementById('output'), 'dad-component');
}
```

I componenti contengono in un unico file la funzione responsabile della generazione del template e l'oggetto contenente il nome, dati del modello, funzioni associate ad aventi e computed properties. Per registrare gli eventi si è itilizzato l'attributo ```data-event="click:add"``` valorizzato con <tipo evento>:<funzione associata>

```javascript

function template () {
    return html`<div class=${this.uppercase(this.name)} id="${this.id}">
                <h3>Dad component</h3>  
                <p>Counter: ${this.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <p>Esempio di computed properties: ${this.interpolated}</p>
                <hr> 
                <div data-component="child-component"></div>
                <div data-component="shared-component"></div>
            </div>`;
}

import {html} from 'lit-html';

export function dadCtrl (id) {
    return {
        id: id,
        name: 'dad-component',
        template: template,
        data: {
            counter: 0
        },
        computed:{
            interpolated (params) {
                return ` Clicked ${this.counter} times`;
            }
        },
        events: {
            add: function (e) {
                this.counter++;
            },
            remove: function (e) {
                this.counter--;
            }
        }
    }
};
```



## Built With

HTML5, CSS, Javascript, [lit-html](https://github.com/polymer/lit-html)

## Versioning

Versione 0.0.1

## License

This project is licensed under the MIT License.






