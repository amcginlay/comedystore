'use strict';

// Jokes controller
angular.module('jokes').controller('JokesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Jokes', 'PreloadJokes',
	function($scope, $stateParams, $location, Authentication, Jokes, PreloadJokes) {
		$scope.authentication = Authentication;

		// Create new Joke
		$scope.create = function() {
			// Create new Joke object
			var joke = new Jokes ({
				name: this.name
			});

			// Redirect after save
			joke.$save(function(response) {
				$location.path('jokes/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Joke
		$scope.remove = function(joke) {
			if ( joke ) { 
				joke.$remove();

				for (var i in $scope.jokes) {
					if ($scope.jokes [i] === joke) {
						$scope.jokes.splice(i, 1);
					}
				}
			} else {
				$scope.joke.$remove(function() {
					$location.path('jokes');
				});
			}
		};

		// Update existing Joke
		$scope.update = function() {
			var joke = $scope.joke;

			joke.$update(function() {
				$location.path('jokes/' + joke._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Jokes
		$scope.find = function() {
			$scope.jokes = Jokes.query();
		};

		// Find existing Joke
		$scope.findOne = function() {
			$scope.joke = Jokes.get({ 
				jokeId: $stateParams.jokeId
			});
		};

        $scope.preloadJokes = function(count) {
            PreloadJokes.get( { count: count }, function() {
                $scope.find();
            });
        };
	}
]);
