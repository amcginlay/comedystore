'use strict';

(function() {
	describe('HomeController', function() {
		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		var scope,
			HomeController,
			httpBackend;

		beforeEach(inject(function($controller, $rootScope, $httpBackend) {
			scope = $rootScope.$new();
			HomeController = $controller('HomeController', {
				$scope: scope
			});
			httpBackend = $httpBackend;
		}));

		it('should expose the authentication service', function() {
			expect(scope.authentication).toBeTruthy();
		});

		it('$scope.getRandomJoke() should return test joke', function() {
			var testJoke = 'test joke';
			httpBackend.whenGET(/^jokes\/random\?firstName=.*&lastName=.*/).respond(200, {
				type: 'success',
				value: { joke: testJoke }
			});
			scope.authentication = {
				user: { firstName: 'x', lastName: 'y' }
			}
			scope.getRandomJoke();
			httpBackend.flush();
			expect(scope.joke).toBe(testJoke)
		});

		it('$scope.getRandomJoke() should return default joke when nothing available', function() {
			httpBackend.whenGET(/^jokes\/random\?firstName=.*&lastName=.*/).respond(200, {
				type: 'failure'
			});
			scope.authentication = {
				user: { firstName: 'x', lastName: 'y' }
			}
			scope.getRandomJoke();
			httpBackend.flush();
			expect(scope.joke).toBe('Hmmmm, something went wrong.  That&#39;s not at all funny! :-(');
		});

		it('$scope.getWhatsOn() should return something', function() {
			var testEvent = {
				type: 'success',
				value: [
					{
						eventDate: 'whenever',
						eventTime: 'whenever',
						eventTitle: 'Heavenly humour',
						comedians: ['Tommy Cooper', 'Eric Morecambe', 'Peter Cook', 'Bill Hicks']
					}
				]
			};
			httpBackend.whenGET('whatson').respond(200, testEvent);
			scope.getWhatsOn();
			httpBackend.flush();
			expect(scope.whatson[0].displayBody).toBe('Tommy Cooper, Eric Morecambe, Peter Cook, Bill Hicks');
		});

		it('$scope.init() should not fail', function() {
			scope.authentication = {
				user: { firstName: 'x', lastName: 'y' }
			}
			scope.init();
			expect(true).toBe(true);
		})
	});
})();
