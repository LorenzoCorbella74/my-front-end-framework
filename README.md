# My Personal Frontend framework

Queste circa ***200 righe*** di Javascript ES6 sono il risultato dei miei sforzi nella creazione di un framework FE avente ___tutte le principali caratteristiche dei framework attuali ___ (component based, nestable components, two way binding, routing, http requests, etc), realizzato unicamente per finalità didattiche. Per il Templating e Rendering engine è stata utilizzata la libreria [lit-html](https://github.com/polymer/lit-html) che garantisce una performance superiore alle soluzioni che utilizzano il Virtual DOM, mentre per il watch sui cambiamenti del modello si è utilizzato [on-change](https://github.com/sindresorhus/on-change).

## FEATURES
- [x] Componenti tra loro innestati 
- [x] API Componenti simile a quella di [Vue.js](https://vuejs.org) con ```data``` del componente proxato e Computed properties
- [x] Istanze diverse dello stesso componente
- [x] Gestione automatizzata degli eventi della singola istanza del componente
- [x] hook del componente: onInit
- [x] two way data binding  
- [x] wrapper di [fetch API](https://github.com/github/fetch) per le chiamate HTTP
- [x] Filters (implementato ma non funzionante :-( )

### TODO:
- [ ] Router
- [ ] Props passate dal componente padre al figlio
- [ ] Events
- [ ] hook del componente: onPropsChange, onDestroy
- [ ] "queue dei cambiamenti" per avere un unico cambiamento in caso di modifica contemporanea di più proprietà 
- [ ] reattività del modello condiviso tra componenti diversi
- [ ] rimozione eventi se il componente è distrutto

# Documentation

Per utilizzare il framework basta importare la libreria e registrare i componenti, ed i filtri:
```javascript

window.onload = function () {

    const app = new Engine();

    // registering components
    app.addComponent('dad-component', dadCtrl); //  
    app.addComponent('child-component', childCtrl);
    app.addComponent('shared-component', sharedCtrl);

    // registering filters
    app.addFilter('uppercase', uppercase);

    // rendering the root
    app.rootRender(document.getElementById('output'), 'dad-component');
}
```

I componenti contengono in un unico file la funzione responsabile della generazione del template ( in cui è possibile avere componenti tra loro innestati tramite l'attributo ```data-component```)e l'oggetto rappresentativo del componente, contenente il nome, dati del modello, funzioni associate ad aventi e computed properties. Per esigenze didattiche non sono stati utilizzati gli eventi di [lit-html](https://github.com/polymer/lit-html)) ma gli eventi sono automaticamente generati dal template tramite l'attributo ```data-event="click:add"``` valorizzato con ```<tipo evento>:<funzione associata>```

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

HTML5, CSS, Javascript, [lit-html](https://github.com/polymer/lit-html) [on-change](https://github.com/sindresorhus/on-change), 

## Versioning

Versione 0.1.0

## License

This project is licensed under the MIT License.






