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

    // registering components
    app.addComponent('dad-component', dadCtrl)
        .addComponent('child-component', childCtrl)
        .addComponent('shared-component', sharedCtrl)
        .addComponent('about-component', aboutCtrl)
        .addComponent('not-found-component', notFoundCtrl)

    // rendering the root (no ROUTER)
    // app.rootRender(root, 'dad-component');

    // rendering the root with FE ROUTER
    app.router
        // page fade animation 
        .beforeChange((luce) => luce.main.classList.add('fade'))
        .afterChange( (luce) => luce.main.classList.remove('fade'))
        // mapping path
        .addRoute('/', 'dad-component')
        .addRoute('/about', 'about-component')
        .addRoute('/about/:id/:counter', 'about-component')
        .ifNotFound('not-found-component')
        .start()
}
