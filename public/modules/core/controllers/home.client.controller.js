'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'RandomJokes', 'WhatsOn',
	function($scope, Authentication, RandomJokes, WhatsOn) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        $scope.joke = 'Wait for it ...';
        $scope.whatson = '<p>Fetching data ...</p>';

        $scope.getRandomJoke = function() {

            var user = $scope.authentication.user;

            RandomJokes.get(
                {
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                function(res) {
                    if (res.type === 'success') {
                        $scope.joke = res.value.joke;
                    } else {
                        $scope.joke = 'Hmmmm, something went wrong.  That&#39;s not at all funny! :-(';
                }
            });
        };

        $scope.getWhatsOn = function() {

            WhatsOn.get(function(res) {
                res.value.forEach(function(entry) {
                    entry.displayHeading = entry.eventDate + ' at ' + entry.eventTime + ' - ' + entry.eventTitle;
                    entry.displayBody = entry.comedians.join(', ');
                });
                $scope.whatson = res.value;
            });
        };

        $scope.init = function() {
            $scope.getRandomJoke();
            $scope.getWhatsOn();
        };
	}
]);
