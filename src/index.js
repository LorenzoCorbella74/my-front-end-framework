// si importa gli stili SASS
import './style.scss';

import '@babel/polyfill';

// COMPONETS
import { dadCtrl } from './components/dad'
import { childCtrl } from './components/child'
import { sharedCtrl } from './components/shared';
import { aboutCtrl } from './components/about';
import { notFoundCtrl } from './components/notFound';

import Luce from 'lucejs';

window.onload = function () {

    const root = document.getElementById('root');  // root of the app

    const app = new Luce(root, { debug: true });   // passing the root and a config obj

    // (required) registering components
    app.addComponent('dad-component', dadCtrl)
        .addComponent('child-component', childCtrl)
        .addComponent('shared-component', sharedCtrl)
        .addComponent('about-component', aboutCtrl)
        .addComponent('not-found-component', notFoundCtrl)

    // (optional) run config middlewares
    app.use((luce, next)=>{
            console.log('First middleware running...');
            const config = {
                URL: 'localhost:3000',
                language:'en',
                availableLanguages:['en','ita']
            };
            luce.plug('config', config); // .plug() injects a $<name> obj in each component (in this case $config)
    
            next(); // to advance to the next middleware
        })
        .use((luce, next)=>{
            console.log('Second middleware running...');
            next();
        });

    // (optional) set the  ROUTER
    app.router
        // page fade animation 
        .beforeChange((luce) => luce.main.classList.add('fade'))
        .afterChange( (luce) => luce.main.classList.remove('fade'))
        // mapping path
        .addRoute('/', 'dad-component')
        .addRoute('/about', 'about-component')
        .addRoute('/about/:id/:counter', 'about-component')
        .ifNotFound('not-found-component');
    
    // start the app
    app.init();
}
