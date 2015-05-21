'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var jokesInternal = require('../../app/controllers/jokes.server.controller');
    var jokesExternal = require('../../app/controllers/jokes.icndb.server.controller');

    var getJokes = function(req) {
        if (req.isAuthenticated()) {
            // use our MongoDB instance
            //console.log('returning jokesInternal')
            return jokesInternal;
        }
        // DEFAULT forward request to ICNDB
        //console.log('returning jokesExternal')
        return jokesExternal;
    };

    var jokesHasAuthorization = function(req, res, next) {
        return getJokes(req).hasAuthorization(req, res, next);
    };

    /**
     * the following routes mimic the additional ICNDB API methods
     * NOTE random needs to be configured first or '/jokes/:jokeId' will catch it
     */

    app.route('/jokes/preload/:count')
        .get(function(req, res) { return getJokes(req).preload(req, res); } );

    app.route('/jokes/random')
        .get(function(req, res) { return getJokes(req).random(req, res); } );

    app.route('/jokes/random/:count')
        .get(function(req, res) { return getJokes(req).randomMultiple(req, res); } );

    app.route('/jokes/count')
        .get(function(req, res) { return getJokes(req).count(req, res); } );

    /**
     * the following routes are the standard CRUD methods
     */
	app.route('/jokes')
        // LIST ALL
		.get(function(req, res) { return getJokes(req).list(req, res); } )
		// CREATE NEW
        .post(users.requiresLogin, function(req, res) { return getJokes(req).create(req, res); } );

	app.route('/jokes/:jokeId')
		// FETCH ONE
        .get(function(req, res) { return getJokes(req).read(req, res); } )
		// UPDATE ONE
        .put(users.requiresLogin, jokesHasAuthorization, function(req, res) { return getJokes(req).update(req, res); } )
        // DELETE ONE
		.delete(users.requiresLogin, jokesHasAuthorization, function(req, res) { return getJokes(req).delete(req, res); } );

	// Finish by binding the Joke middleware
	app.param('jokeId', function(req, res, next, id) { return getJokes(req).jokeByID(req, res, next, id); } );
};
