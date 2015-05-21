'use strict';

//Jokes service used to communicate Jokes REST endpoints
angular.module('jokes').factory('PreloadJokes', ['$resource',
	function($resource) {
		return $resource('jokes/preload/:count', { count: '@_count' }, {
            get: {
                method: 'GET'
            }
        });
	}
]);
