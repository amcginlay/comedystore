'use strict';

(function() {
	// Jokes Controller Spec
	describe('Jokes Controller Tests', function() {
		// Initialize global variables
		var JokesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Jokes controller.
			JokesController = $controller('JokesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Joke object fetched from XHR',
			inject(function(Jokes) {
			// Create sample Joke using the Jokes service
			var sampleJoke = new Jokes({
				name: 'New Joke'
			});

			// Create a sample Jokes array that includes the new Joke
			var sampleJokes = [sampleJoke];

			// Set GET response
			$httpBackend.expectGET('jokes').respond(sampleJokes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.jokes).toEqualData(sampleJokes);
		}));

		it('$scope.findOne() should create an array with one Joke object fetched from XHR using a jokeId URL parameter',
			inject(function(Jokes) {
			// Define a sample Joke object
			var sampleJoke = new Jokes({
				name: 'New Joke'
			});

			// Set the URL parameter
			$stateParams.jokeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/jokes\/([0-9a-fA-F]{24})$/).respond(sampleJoke);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.joke).toEqualData(sampleJoke);
		}));

		it('$scope.create() with valid form data should send POST with form input values and locate to new object URL',
			inject(function(Jokes) {
			// Create a sample Joke object
			var sampleJokePostData = new Jokes({
				name: 'New Joke'
			});

			// Create a sample Joke response
			var sampleJokeResponse = new Jokes({
				_id: '525cf20451979dea2c000001',
				name: 'New Joke'
			});

			// Fixture mock form input values
			scope.name = 'New Joke';

			// Set POST response
			$httpBackend.expectPOST('jokes', sampleJokePostData).respond(sampleJokeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Joke was created
			expect($location.path()).toBe('/jokes/' + sampleJokeResponse._id);
		}));

		it('$scope.update() should update a valid Joke', inject(function(Jokes) {
			// Define a sample Joke put data
			var sampleJokePutData = new Jokes({
				_id: '525cf20451979dea2c000001',
				name: 'New Joke'
			});

			// Mock Joke in scope
			scope.joke = sampleJokePutData;

			// Set PUT response
			$httpBackend.expectPUT(/jokes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/jokes/' + sampleJokePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid jokeId and remove the Joke from the scope',
			inject(function(Jokes) {
			// Create new Joke object
			var sampleJoke = new Jokes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Jokes array and include the Joke
			scope.jokes = [sampleJoke];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/jokes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleJoke);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.jokes.length).toBe(0);
		}));
	});
}());
