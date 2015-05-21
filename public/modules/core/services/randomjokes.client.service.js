'use strict';

//Jokes service used to communicate Jokes REST endpoints
angular.module('core').factory('RandomJokes', ['$resource',
    function($resource) {
        return $resource('jokes/random', { firstName: '@firstName', lastName: '@lastName' }, {
            get: {
                method: 'GET'
            }
        });
    }
]);
