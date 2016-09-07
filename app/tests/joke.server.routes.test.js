'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Joke = mongoose.model('Joke'),
	agent = request.agent(app),
    passport = require('passport');

/**
 * Globals
 */
var credentials, user, joke1, joke2;
var INTERNAL_TIMEOUT_MS = process.env.DEV_TIMEOUT || 5000; // use larger number for debugging (default 5000)
var outOfJokesMessage = 'It&#39;s no joke, you&#39;ve seen them all!';

/**
 * Joke routes tests
 */
describe('Joke MongoDB CRUD tests (signed in)', function() {
	beforeEach(function(done) {

        this.timeout(INTERNAL_TIMEOUT_MS);

        // Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db,
		// sign out THEN sign in to ensure we only test MongoDB
		// and then create new jokes (without saving)
		user.save(function() {
            agent.get('/auth/signout')
                .end(function(signOutErr, singOutRes) {
                    if (signOutErr) return done(signOutErr);

                    agent.post('/auth/signin')
                        .send(credentials)
                        .expect(200)
                        .end(function(signinErr, signinRes) {
                            if (signinErr) return done(signinErr);

                            joke1 = {
                                name: 'Joke 1 Name'
                            };
                            joke2 = {
                                name: 'Joke 2 Name'
                            };
                            done();
                    });
            });
		});
	});

    it('should be able to get single Joke instance if signed in (GET /jokes/:jokeId)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB

                var savedId = res1.body.value.id;

                // request the joke we just entered
                agent.get('/jokes/' + savedId)
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                            res2.body.should.have.property('type', 'success');
                            res2.body.should.have.property('value').and.be.instanceOf(Object);
                            res2.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB
                            res2.body.value.should.have.property('joke').and.be.instanceOf(String);

                            // compare saved ID and targeted one
                            res2.body.value.id.should.match(savedId);

                            done();
                    });
            });
    });

    it('should be able to get a list of Jokes if signed in (GET /jokes)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // get empty joke list (none saved yet)
        agent.get('/jokes')
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                res1.body.should.be.instanceOf(Array).with.lengthOf(0);

                // save a joke
                agent.post('/jokes')
                    .send(joke1)
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                        agent.get('/jokes')
                            .expect(200)
                            .end(function(err3, res3) {
                                if (err3) return done(err3);

                                res3.body.should.be.instanceOf(Array).with.lengthOf(1);

                                done();
                            });
                    });
            });
    });

    it('should get single Joke (with name swapped) if signed in (GET /jokes/:jokeId?firstName=Joe&lastName=Bloggs)',
        function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        joke1.name = 'Chuck Norris jokes are not very funny';
        var expectedVersion = joke1.name.replace('Chuck Norris', 'Joe Bloggs');

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB

                var savedId = res1.body.value.id;

                // request the joke we just entered
                agent.get('/jokes/' + savedId + '?firstName=Joe&lastName=Bloggs')
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                        res2.body.should.have.property('type', 'success');
                        res2.body.should.have.property('value').and.be.instanceOf(Object);
                        res2.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB
                        res2.body.value.should.have.property('joke').and.be.instanceOf(String);

                        // compare saved ID and targeted one, then check the name swap occurred
                        res2.body.value.id.should.match(savedId);
                        res2.body.value.joke.should.match(expectedVersion);

                        done();
                    });
            });
    });

    it('should get default message for random Joke instance if signed in and database is empty (GET /jokes/random)',
        function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // grab a random joke
        agent.get('/jokes/random')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('type', 'success');
                res.body.should.have.property('value').and.be.instanceOf(Object);
                res.body.value.should.have.property('joke').and.be.instanceOf(String);

                // ensure we get the default joke back because database was empty
                res.body.value.joke.should.match(outOfJokesMessage);

                done();
            });
    });

    it('should be able to mark Joke exluded when we get a random Joke instance if signed in (GET /jokes/random)',
        function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB

                var savedId = res1.body.value.id;

                // grab a random joke
                agent.get('/jokes/random')
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                        // now check if ID got added to the excluded jokes
                        agent.get('/users/me')
                            .expect(200)
                            .end(function(err3, res3) {
                                if (err3) return done(err3);

                                res3.body.should.have.property('excludedJokes').and.be.instanceOf(Array);
                                res3.body.excludedJokes.length.should.be.greaterThan(0);
                                done();
                            });
                        });
            });
    });

    it('should be able to get random Joke instance if signed in (GET /jokes/random)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(String); // is number in ICNDB

                var savedId = res1.body.value.id;

                // grab a random joke
                agent.get('/jokes/random')
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                        res2.body.should.have.property('type', 'success');
                        res2.body.should.have.property('value').and.be.instanceOf(Object);
                        res2.body.value.should.have.property('id').and.be.instanceOf(String);
                        res2.body.value.should.have.property('joke').and.be.instanceOf(String);

                        // compare saved ID and the random one, they must be the same because only one exists
                        res2.body.value.id.should.match(savedId);

                        // grab a SECOND joke, which should return a default because
                        // the spec say says jokes cannot be repeated
                        agent.get('/jokes/random')
                            .expect(200)
                            .end(function(err3, res3) {
                                if (err3) return done(err3);

                                res3.body.should.have.property('type', 'success');
                                res3.body.should.have.property('value').and.be.instanceOf(Object);
                                res3.body.value.should.not.have.property('id'); // because the default is undefined
                                res3.body.value.should.have.property('joke').and.be.instanceOf(String);

                                // ensure we get the default joke back because user has now seen them all
                                res3.body.value.joke.should.match(outOfJokesMessage);

                                done();
                            });
                    });
            });
    });

    it('should be able to get multiple random Joke instances if signed in (GET /jokes/random/:count)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                // save a joke
                agent.post('/jokes')
                    .send(joke2)
                    .expect(200)
                    .end(function(err2, res2) {
                        if (err2) return done(err2);

                        // get two randoms
                        agent.get('/jokes/random/2')
                            .expect(200)
                            .end(function(err1, res1) {

                                res1.body.should.have.property('type', 'success');
                                res1.body.should.have.property('value').and.be.instanceOf(Array);
                                res1.body.value.should.have.property('length', 2);

                                // get single random (value should STILL appear as an array)
                                agent.get('/jokes/random/1')
                                    .expect(200)
                                    .end(function(err1, res1) {

                                        res1.body.should.have.property('type', 'success');
                                        res1.body.should.have.property('value').and.be.instanceOf(Array);
                                        res1.body.value.should.have.property('length', 1);

                                        done();
                                    });
                            });
                });
        });
    });

    it('should get default msg for multiple random Joke req if signed in & too few jokes available (GET /jokes/random)',
        function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                agent.get('/jokes/random/3')
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.have.property('type', 'success');
                        res.body.should.have.property('value').and.be.instanceOf(Array);
                        res.body.value.length.should.match(3);
                        res.body.value[1].should.have.property('joke').and.be.instanceOf(String);
                        res.body.value[2].should.have.property('joke').and.be.instanceOf(String);

                        // ensure we get the default joke back in the second
                        // and third slots because too few jokes were available
                        res.body.value[1].joke.should.match(outOfJokesMessage);
                        res.body.value[2].joke.should.match(outOfJokesMessage);

                        done();
                    });
            });
    });

    it('should be able to get a count of Joke instances if signed in (GET /jokes/count)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        agent.get('/jokes/count')
            .expect(200)
            .end(function(err, res) {

                res.body.should.be.instanceOf(Object);
                res.body.should.have.property('type', 'success');
                res.body.should.have.property('value').and.match(0);

                // save a joke
                agent.post('/jokes')
                    .send(joke1)
                    .expect(200)
                    .end(function(err1, res1) {
                        if (err1) return done(err1);

                        agent.get('/jokes/count')
                            .expect(200)
                            .end(function(err2, res2) {
                                if (err2) return done(err2);

                                res2.body.should.be.instanceOf(Object);
                                res2.body.should.have.property('type', 'success');
                                res2.body.should.have.property('value').and.match(1);

                                done();
                            });
                    });
            });
    });

    it('should be able to save Joke instance if signed in (POST /jokes)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.be.instanceOf(Object);
                res.body.should.have.property('_id').and.be.instanceOf(String);

                res.body.value.should.be.instanceOf(Object);
                res.body.value.should.have.property('id').and.be.instanceOf(String);

                // quick check to see _id (Mongo) and value.id (ICNDB) match
                res.body._id.should.match(res.body.value.id);

                // Call the assertion callback
                done();
            });
    });

    it('should be able to update Joke instance if signed in (PUT /jokes/:jokeId)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var newJokeText = 'Damn it, I can never tell jokes right!';

                res.body.should.be.instanceOf(Object);
                res.body.should.have.property('_id').and.be.instanceOf(String);
                res.body.should.have.property('name').and.be.instanceOf(String);
                res.body.name.should.not.match(newJokeText); // NOTE should NOT!

                var id = res.body._id;
                joke1.name = newJokeText;

                agent.put('/jokes/' + id)
                    .send(joke1)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        agent.get('/jokes/' + id)
                            .expect(200)
                            .end(function(err, res) {
                                if (err) return done(err);

                                res.body.should.be.instanceOf(Object);
                                res.body.should.have.property('_id').and.be.instanceOf(String);
                                res.body.should.have.property('name').and.be.instanceOf(String);
                                res.body.name.should.match(newJokeText);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should be able to delete Joke instance if signed in (DELETE /jokes/:jokeId)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS); // external method, long timeout

        // add a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.be.instanceOf(Object);
                res.body.should.have.property('_id').and.be.instanceOf(String);

                var id = res.body._id;

                // check the count is one
                agent.get('/jokes/count')
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.be.instanceOf(Object);
                        res.body.should.have.property('type', 'success');
                        res.body.should.have.property('value').and.match(1);

                        // delete the joke
                        agent.delete('/jokes/' + id)
                            .expect(200)
                            .end(function(err, res) {
                                if (err) return done(err);

                                // check the count is zero
                                agent.get('/jokes/count')
                                    .expect(200)
                                    .end(function(err, res) {
                                        if (err) return done(err);

                                        res.body.should.be.instanceOf(Object);
                                        res.body.should.have.property('type', 'success');
                                        res.body.should.have.property('value').and.match(0);

                                        done();
                                    });
                            });
                    });
            });
    });

    it('should not be able to save Joke instance if no name is provided and signed in (POST /jokes)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        joke1.name = ''; // this is invalid

        // save a joke
        agent.post('/jokes')
            .send(joke1)
            .expect(400)
            .end(function(err1, res1) {
                if (err1) return done(err1);

                done();
            });
    });

    it('should be able to preload ICNDB Joke instances if signed on (GET /jokes/preload/:count)', function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        agent.get('/jokes/preload/5')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                done();
            });
    });

    afterEach(function(done) {
        this.timeout(INTERNAL_TIMEOUT_MS);

        Joke.remove().exec(function() {
            User.remove().exec(function() {
                //mongoose.connection.close(function() {
                    done();
                //});
            });
        });
	});
});
