// si importa gli stili SASS
import './style.scss';

import '@babel/polyfill';

// COMPONETS
import { dadCtrl } from './components/dad'
import { childCtrl } from './components/child'
import { sharedCtrl } from './components/shared';

// FILTERS
import uppercase  from './filters/uppercase';

import Engine from './core/engine';

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
