'use strict';

//Setting up route
angular.module('jokes').config(['$stateProvider',
	function($stateProvider) {
		// Jokes state routing
		$stateProvider.
		state('listJokes', {
			url: '/jokes',
			templateUrl: 'modules/jokes/views/list-jokes.client.view.html'
		}).
		state('createJoke', {
			url: '/jokes/create',
			templateUrl: 'modules/jokes/views/create-joke.client.view.html'
		}).
		state('viewJoke', {
			url: '/jokes/:jokeId',
			templateUrl: 'modules/jokes/views/view-joke.client.view.html'
		}).
		state('editJoke', {
			url: '/jokes/:jokeId/edit',
			templateUrl: 'modules/jokes/views/edit-joke.client.view.html'
		});
	}
]);