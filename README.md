# Luce.js

***Luce.js*** è il risultato dei miei sforzi nella creazione di un framework FE avente tutte le principali caratteristiche dei framework attuali, realizzato unicamente per finalità didattiche. Per avere prestazioni in linea o superiori alle soluzioni basate sul Virtual DOM si è utilizzato per il Templating e Rendering engine la libreria [lit-html](https://github.com/polymer/lit-html) mentre per guardare ai cambiamenti del modello dei dati si è usato [on-change](https://github.com/sindresorhus/on-change).

## FEATURES
- [x] Componenti, componenti  innestati e istanze multiple di uno stesso componente
- [x] API dei componenti simile a quella di [Vue.js](https://vuejs.org) con il modello all'interno della proprietà```data``` e reimplementate le```Computed properties```
- [x] hook del componente: onInit, onPropsChange
- [x] Two way data binding  
- [x] wrapper di [fetch API](https://github.com/github/fetch) per chiamate HTTP
- [x] Client side routing system based on [History API](https://developer.mozilla.org/en-US/docs/Web/API/History), routes with parameters, 
- [x] Filters in template as pure function
- [x] Props passate da un componente ad un suo figlio
- [x] Gestione automatizzata degli eventi della singola istanza del componente

## ISSUES
- [x] eventi della singola istanza del componente padre doppiati a quelli dei figli
- [x] verifica effettiva del cambiamento delle props per onPropsChange
- [x] reattività di un modello condiviso tra componenti diversi

### TODO:
- [ ] Event bus: shared state management
- [ ] "queue dei cambiamenti" per avere un unico cambiamento in caso di modifica contemporanea di più proprietà 
- [ ] rimozione eventi se il componente o una sua parte sono rimossi dal dom
- [ ] hook del componente: onDestroy

# Documentation

## Bootstrap

Per utilizzare il framework è necessario importare la libreria e registrare i componenti:
```javascript

window.onload = function () {

    const mainTag = document.getElementById('output');

    const app = new Luce(mainTag);

    // registering components
    app.addComponent('dad-component', dadCtrl)
       .addComponent('child-component', childCtrl)
       .addComponent('about-component', aboutCtrl)
        
        // rendering the root (no ROUTER)
       .rootRender(mainTag, 'dad-component');
}
```

## Components

I componenti contengono in un unico file```.js``` la funzione responsabile della generazione del template ( in cui è possibile avere componenti tra loro innestati tramite l'attributo ```data-component```) e l'oggetto rappresentativo del componente, contenente il nome, dati del modello, funzioni associate ad aventi e computed properties. Per esigenze didattiche non sono stati utilizzati gli eventi di [lit-html](https://github.com/polymer/lit-html)) ma generati automaticamente gli addEventListeners dal template tramite l'attributo ```data-event="<tipo evento>:<funzione associata>"```. Da notare che è consigliato mettere all'inizio di ciascun template ```class=${uppercase(this.name)}``` per eventualmente distinguere gli stili relativi esclusivamente ad un unico componente (magari anche in un file .sass distinto) mentre è obbligatorio inserire ```id="${this.id}"``` che viene iniettato dall'engine in fase di creazione delle diverse istanze dei componenti e poi utilizzato per gestire le istanze cachate.

Le proprietà passate da un componente ad un suo figlio sono indicate tramite l'attributo ```data-props="form:name"``` valorizzato con ```<nome proprietà>:<nome proprietà>...```. 

All'interno del componente l'engine inietta ```$ele``` per poter accedere all'elemento html padre del componente.

Per la manipolazione delle interpolazioni del template tramite filtri si utilizzano ```pure functions```.

```javascript

function template () {
    return html`<div class=${uppercase(this.name)} id="${this.id}">
                <h3>Dad component</h3>  
                <p>Counter: ${this.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <p>Esempio di computed properties: ${this.interpolated}</p>
                <hr> 
                <div data-component="child-component" data-props="form:name"></div>
            </div>`;
}

import {html} from 'lit-html';

// FILTRO
import uppercase from './../filters/uppercase';

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

## Router
Per utilizzare il router si devono mappare i path con il nome del componente da visualizzare, indicare il componente di fallback e fare partire il listner sul cambio di path.
```javascript
window.onload = function () {

    const mainTag = document.getElementById('output');

    const app = new Luce(mainTag);

    // registering components
    app.addComponent('dad-component', dadCtrl)
        .addComponent('child-component', childCtrl)
        .addComponent('shared-component', sharedCtrl)
        .addComponent('about-component', aboutCtrl)
        .addComponent('not-found-component', notFoundCtrl);

    // rendering the root with FE ROUTER
    app.router
        .addRoute('/', 'dad-component')
        .addRoute('/about', 'about-component')
        .addRoute('/about/:id/:counter', 'about-component')
        .ifNotFound('not-found-component')
        .start();

}
```

Per usare i link all'interno dei template si deve specificare l'attributo ```data-navigation```:
```html
 <nav>
    <a data-navigation href="/about"> About </a>
    <a data-navigation href="/about/:${this.id}/${this.counter}"> About "with params"</a>
</nav>
```
All'interno del componente l'engine inietta ```$router``` per poter leggere gli eventuali parametri passati nell'URl o per accedere ai metodi di navigazione.
```javascript
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
        }
    }
}
```

## HTTP
All'interno del componente l'engine inietta ```$http``` per fare chiamate http (```.get```, ```.post```, ```.put```, ```.patch```, ```.delete```):
```javascript
async getRandom () {
                try {
                    this.loading = true;
                    let toAvoidCors = 'https://cors-anywhere.herokuapp.com';
                    let response = await this.$http.get(toAvoidCors + '/https://swapi.co/api/people');
                    this.items = response.results;
                    this.loading = false;
                } catch (error) {
                    console.log('Error: ', error);
                    this.loading = false;
                }
            }
```

## Built With

HTML5, CSS, Javascript, [lit-html](https://github.com/polymer/lit-html), 

## Versioning

Versione 0.1.0

## License

This project is licensed under the MIT License.






