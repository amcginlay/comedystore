'use strict';

//Jokes service used to communicate Jokes REST endpoints
angular.module('core').factory('WhatsOn', ['$resource',
    function($resource) {
        return $resource('whatson', {}, {
            get: {
                method: 'GET'
            }
        });
    }
]);
