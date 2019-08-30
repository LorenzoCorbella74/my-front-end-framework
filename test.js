
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