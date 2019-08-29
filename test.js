/*
    Quando si incontra una struttura tipo:
    padre
    |
    |_figlio
    |
    |_figlio
        |
        |_nipote
        |
        |_nipote

    Si deve dichiarare i componenti "interni" come in vue: components:['figlio','nipote']:
        no: si deve parsare tutto il template per vedere se ci sono delle condizioni (ng-if) che abilitano o no dei componenti
    
    
        Inizio dal root:
    
    1) seleziono un elemento html che sarà la root
    2) faccio girare la renderfn su tale elemento passando il nome del componente
        A internamente con tale nome (in base ad un component registy) se non ci sono istanze 
        la creo una istanza, dandogli un id e la metto dentro un array di istanze
        B alla root.innerHTML dò il risultato della templateFactory di tale istanza (template = f(state))
        C mappo gli eventi di tale elemento su una mappa idComponente : evento ( e non nomeComponente : evento )
        D una volta eseguite gli eventi (che modificano lo stato) faccio girare la renderFn sul solo elemento (ripassando l'id)
        E nel caso in cui ci siano altri componenti figli per ognuno di essi riparto da A (ma specificando l'id dell'elemento padre)

        L'idea è quella di avere una cache di istanze su cui applicare un meccanismo che permetta 
        di sapere se un componente è renderizzato in pagina o no (una proprietà "inPage" true/false)
        Una volta che un elemento è rimosso si può 
*/

let three = {
    id: 1,
    name: 'padre',
    component: 'padre-componente',
    level: 0,
    viewFn: () => console.log('padre'),
    child: [{
        id: 11,
        level: 1,
        name: 'figlio',
        viewFn: () => console.log('figlio'),
        component: 'figlio-componente',
        child: []
    },
    {
        id: 12,
        name: 'figlio',
        viewFn: () => console.log('figlio'),
        component: 'figlio-componente',
        child: [
            {
                id: 13,
                name: 'nipote',
                viewFn: () => console.log('mipote'),
                component: 'nipote-componente',
            },
            {
                id: 144,
                name: 'nipote',
                viewFn: () => console.log('mipote'),
                component: 'nipote-componente',
            }
        ]
    }
    ]
}

/*
    
        FILTRI: durante la templateFactory si possono usare dei filtri (funzioni pure) 
            che sono anch'essi messi dentro un registry di funzioni. Tale oggetto può essere mescolato 
            con il modello del componente
            */
let c = {
    nome: "lore"
}

let filterRegistry = {
    'uppercase': function (str) {
        if (str && typeof str === 'string') {
            return str.toUpperCase();
        }
        return '';
    }
}

function compileTemplate() {
    return `prova ${this.uppercase(this.nome)}`;
}

const result = compileTemplate.bind(Object.assign(c, filterRegistry));

console.log(result());

/*

PROPS:
Si possono implementare le props mescolando quanto è preso dal modello del componente padre
con il modello del componente figlio. Nel pomponente padre si deve pertanto indicare sia
il nome del componente che cosa viene passato:
<div data-component="figlio-component" data-props="propX"></div>

Mentre all'interno della dichiarazione del compoente figlio:

props:{
    propX
}

COMPONENTS HOOKS:
vedere per rifareimento: https://alligator.io/angular/lifecycle-hooks/

TRANSCLUSION


*/