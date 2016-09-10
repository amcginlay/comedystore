'use strict';

var http = require('http'),
    bl = require('bl');

function createOptions(path) {
    return {
        host: 'api.icndb.com',
        path: path
    };
}

function forwardToIcndb(req, res) {
    return http.get(createOptions(req.url), function (response) {
        response.pipe(bl(function (err, data) {
            var results = JSON.parse(data);
            res.json(results);
        }));
    })
    .on('error', function(err) {
        res.json( { type: 'error', value: err.message } );
    });
}

/**
 * Create a Joke
 */
exports.create = function(req, res) {
    // the route stipulates that this method requires user logged in
    // but we don't log in to INCDB so this should never execute
    return res.status(400).send({message: 'Not Implemented'});
};

/**
 * Show the current Joke
 */
exports.read = function(req, res) {
    // this works in conjunction with jokeById "middleware" (see below)
    res.jsonp(req.joke);
};

/**
 * List of Jokes
 */
exports.list = function(req, res) {
    return forwardToIcndb(req, res);
};

/**
 * Update a Joke
 */
exports.update = function(req, res) {
    // the route stipulates that this method requires user logged in
    // but we don't log in to INCDB so this should never execute
    return res.status(400).send({message: 'Not Implemented'});
};

/**
 * Delete an Joke
 */
exports.delete = function(req, res) {
    return res.status(400).send({message: 'Not Implemented'});
};

/**
 * Joke middleware
 */
exports.jokeByID = function(req, res, next) {
    // this "middleware" works similar to the forwardToIcndb function,
    // except it decorates the request and passes on to next()
    return http.get(createOptions(req.url), function (response) {
        response.pipe(bl(function (err, data) {
            req.joke = JSON.parse(data);
            next();
        }));
    })
    .on('error', function(err) {
        res.json( { type: 'error', value: err.message } );
    });
};

/**
 * Joke authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    // this is only ever used in conjunction with requiresLogin
    // (see the joke routes and users.authorization.server.controller.js)
    // which, for ICNDB, will always respond with a 401 ('User is not logged in')
    next();
};

exports.preload = function(req, res) {
    // not applicable in this implementation
    return res.status(400).send({message: 'Not Implemented'});
};

/**
* the following routes mimic the additional ICNDB API methods
*/
exports.random = function(req, res) {
    return forwardToIcndb(req, res);
};

exports.randomMultiple = function(req, res) {
    return forwardToIcndb(req, res);
};

exports.count = function(req, res) {
    return forwardToIcndb(req, res);
};
