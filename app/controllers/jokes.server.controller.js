'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Joke = mongoose.model('Joke'),
    User = mongoose.model('User'),
    async = require('async'),
	_ = require('lodash'),
    http = require('http'),
    bl = require('bl');

function reformatJoke(modelJoke, req) {

    function defeatChuckNorris(joke, req) {
        var result = joke;
        if (req && req.query && Object.keys(req.query).length > 0) {
            if (req.query.firstName) {
                result = result.replace('Chuck', req.query.firstName);
            }
            if (req.query.lastName) {
                result = result.replace('Norris', req.query.lastName);
            }
        }
        return result;
    }

    var result = JSON.parse(JSON.stringify(modelJoke)); // strip the model (is there a better way?)

    // translate the joke
    result.name = defeatChuckNorris(result.name, req);

    // attach the ICNDB stuff
    result.type = 'success';
    result.value = {
        // Stuck between a rock and hard place ...
        // Numeric identity is not recommended in NoSQL databases so we use string based ObjectIDs, but ICNDB uses numbers.
        // We can't change the ICNDB spec, but we shouldn't be fabricating numberical identifiers in MongoDB
        // Therefore, this implementation differs from ICNDB with regard to data types.
        // Fingers crossed that everything copes with that difference!
        id: result._id,
        joke: result.name
    };
    return result;
}

function fetchRandomChuckNorrisJokes(count, cb) {
    // TODO it would be nice to know how to leverage the (mildly redundant) work already done in the ICNDB controller, but this will do ...
    return http.get({host: 'api.icndb.com', path: '/jokes/random/' + count}, function (response) {
        response.pipe(bl(function (err, data) {
            var results = JSON.parse(data);
            cb(null, results);
        }));
    })
    .on('error', function(err) {
        cb(err);
    });
}

/**
 * Create a Joke
 */
exports.create = function(req, res) {
	var joke = new Joke(req.body);
	joke.user = req.user;

	joke.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
            res.jsonp(reformatJoke(joke));
		}
	});
};

/**
 * Show the current Joke
 */
exports.read = function(req, res) {
    res.jsonp(reformatJoke(req.joke, req));
};

/**
 * Update a Joke
 */
exports.update = function(req, res) {
	var joke = req.joke ;

	joke = _.extend(joke , req.body);

	joke.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reformatJoke(req.joke, req));
		}
	});
};

/**
 * Delete an Joke
 */
exports.delete = function(req, res) {
	var joke = req.joke ;

	joke.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reformatJoke(req.joke, req));
		}
	});
};

/**
 * List of Jokes
 */
exports.list = function(req, res) { 
	Joke.find().sort('-created').populate('user', 'displayName').exec(function(err, jokes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
            res.jsonp(jokes);
		}
	});
};

/**
 * Joke middleware
 */
exports.jokeByID = function(req, res, next, id) { 
	Joke.findById(id).populate('user', 'displayName').exec(function(err, joke) {

        if (err) return next(err);
		if (! joke) return next(new Error('Failed to load Joke ' + id));

        req.joke = joke; // NOTE we don't reformat it until we're ready to return to the user
		next();
	});
};

/**
 * Joke authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    // NOTE for simplicity let's ignore joke ownership rules
    // anyone logged in can edit/remove anyone else's jokes

	//if (req.joke.user.id !== req.user.id) {
	//	return res.status(403).send('User is not authorized');
	//}
	next();
};

function getRandomJoke(req, cb) {
    // NOTE we need to do this in a couple of steps which leaves us prone to race conditions
    User.findOne( { username: req.user.username }).exec(function(err, user) {
        if (err) return cb(err);

        // http://bdadam.com/blog/finding-a-random-document-in-mongodb.html
        Joke.count().exec(function(err, jokeCount) {
            if (err) return cb(err);

            var adjustedJokeCount = jokeCount - user.excludedJokes.length;
            if (adjustedJokeCount < 0) adjustedJokeCount = 0;

            Joke.findOne({ _id: { $nin: user.excludedJokes } }).skip(Math.floor(Math.random() * (adjustedJokeCount))).exec(function(err, joke) {
                if (err) return cb(err);

                if (joke) {
                    user.excludedJokes.push(joke.id);
                    User.findOneAndUpdate({_id: user.id}, user, {upsert: false}, function(err, data) {
                        if (err) return cb(err);

                        cb(null, reformatJoke(joke, req));
                    });
                } else {
                    cb(null,
                    {
                        type: 'success',
                        value: {
                            id: undefined,
                            joke: 'It&#39;s no joke, you&#39;ve seen them all!'
                        }
                    });
                }
            });
        });
    });
}

function getRandomJokes(req, cb) {

    function getRandomJokeWrapper(cb) {
        return getRandomJoke(req, function(err, data) {
            if (err) return cb(err);

            cb(null, data.value);
        });
    }

    // stuff an array with 'n' function pointers ...
    var count = Number(req.params.count);
    var functionArray = Array.apply(null, new Array(count)).map(function() { return getRandomJokeWrapper; } );

    // ... then execute serially
    async.series(functionArray, function(err, data) {
        if (err) return cb(err);

        cb(null, {
            type: 'success',
            value: data
        });
    });
}

/**
 * the following routes mimic the additional ICNDB API methods
 */
exports.random = function(req, res) {
    return getRandomJoke(req, function(err, data) {
        if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});

        res.jsonp(data);
    });
};

exports.randomMultiple = function(req, res) {
    return getRandomJokes(req, function(err, data) {
        if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});

        res.jsonp(data);
    });
};

exports.count = function(req, res) {
    Joke.count().exec(function(err, jokeCount) {
        if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});

        res.jsonp({
            type: 'success',
            value: jokeCount
        });
    });
};

exports.preload = function(req, res) {
    mongoose.connection.db.dropCollection('jokes', function() {
        // ignore errors, the collection may not exist

        var count = Number(req.params.count);
        fetchRandomChuckNorrisJokes(count, function(err, data) {

            function saveJoke(value, cb) {
                // TODO it would be nice to know how to leverage the create method above as it does te same thing, but in the context of a req/res pair
                var joke = new Joke({
                    name: value.joke
                });
                joke.user = req.user;

                joke.save(function(err) {
                    if (err) return cb(err);
                    cb();
                });
            }

            async.each(data.value, saveJoke, function(err) {
                if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                res.send();
            });

        });
    });
};

