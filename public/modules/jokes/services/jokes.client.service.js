'use strict';

//Jokes service used to communicate Jokes REST endpoints
angular.module('jokes').factory('Jokes', ['$resource',
	function($resource) {
		return $resource('jokes/:jokeId', { jokeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);