/**
 * Created by amcginlay on 19/05/15.
 */

'use strict';

//var $ = require('jquery');

function removeAll() {
    // user schema
    $('link[href*=\'core.css\']').remove();

    // home scheme
    $('link[href*=\'component.css\']').remove();
    $('link[href*=\'main.css\']').remove();
    $('link[href*=\'normalize.css\']').remove();
}

function addCss(path) {
    var headID = document.getElementsByTagName('head')[0];
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href = path;
    cssNode.media = 'screen';
    headID.appendChild(cssNode);
}

function cssfixHome() {
    removeAll();

    addCss('modules/core/css/component.css');
    addCss('modules/core/css/main.css');
    addCss('modules/core/css/normalize.css');
}

function cssfixOther() {
    removeAll();

    addCss('modules/core/css/core.css');
}
