'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
    agent = request.agent(app);

/**
 * Globals
 */
var credentials, user;
var EXTERNAL_TIMEOUT_MS = 20000; // for ICNDB requests (i.e. not signed in)

/**
 * Joke ICNDB routes tests
 */
describe('Joke ICNDB CRUD tests (not signed in)', function() {

    beforeEach(function(done) {

        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

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

		// Save a user to the test db and sign out to be sure we only test ICNDB
		user.save(function() {
            agent.get('/auth/signout')
                .end(function(err, res) {
                    done();
                });
		});
    });

    it('should be able to get a list of Jokes if not signed in (GET /jokes)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        agent.get('/jokes')
            .expect(200)
            .end(function(req, res) {
                // Set assertion
                res.body.type.should.match('success');
                res.body.value.should.be.instanceOf(Array); // .with.length.greaterThan(0); ???
                res.body.value.length.should.be.greaterThan(0);
                res.body.value[0].should.have.property('id');
                res.body.value[0].should.have.property('joke');

                // Call the assertion callback
                done();
            });
    });

    it('should be able to get single Joke instance if not signed in (GET /jokes/:jokeId)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        // firstly, request a random joke so we can extract a valid id to feed back into the test
        agent.get('/jokes/random')
            .expect(200)
            .end(function(err1, res1) {

                var randomId = res1.body.value.id;

                agent.get('/jokes/' + randomId)
                    .expect(200)
                    .end(function(err2, res2) {

                        res2.body.should.have.property('type', 'success');
                        res2.body.should.have.property('value').and.be.instanceOf(Object);
                        res2.body.value.should.have.property('id').and.be.instanceOf(Number);
                        res2.body.value.should.have.property('joke').and.be.instanceOf(String);

                        // compare random ID and targeted one
                        res2.body.value.id.should.match(randomId);

                        done();
                    });
            });
    });

    it('should get single Joke (name swapped) if not signed in (GET /jokes/:jokeId?firstName=Joe&lastName=Bloggs)',
        function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        // firstly, request a random joke so we can extract a valid id to feed back into the test
        agent.get('/jokes/random')
            .expect(200)
            .end(function(err1, res1) {

                var randomId = res1.body.value.id;

                agent.get('/jokes/' + randomId + '?firstName=Joe&lastName=Bloggs')
                    .expect(200)
                    .end(function(err2, res2) {

                        res2.body.should.have.property('type', 'success');
                        res2.body.should.have.property('value').and.be.instanceOf(Object);
                        res2.body.value.should.have.property('id').and.be.instanceOf(Number);
                        res2.body.value.should.have.property('joke').and.be.instanceOf(String);

                        // compare random ID and targeted one
                        res2.body.value.id.should.match(randomId);

                        done();
                    });
            });
    });

    it('should be able to get random Joke instance if not signed in (GET /jokes/random)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        agent.get('/jokes/random')
            .expect(200)
            .end(function(err1, res1) {

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(Number);
                res1.body.value.should.have.property('joke').and.be.instanceOf(String);

                done();
            });
    });

    it('should get random Joke (with name swapped) if not signed in (GET /jokes/random?firstName=Joe&lastName=Bloggs)',
        function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        agent.get('/jokes/random?firstName=Joe&lastName=Bloggs')
            .expect(200)
            .end(function(err1, res1) {

                res1.body.should.have.property('type', 'success');
                res1.body.should.have.property('value').and.be.instanceOf(Object);
                res1.body.value.should.have.property('id').and.be.instanceOf(Number);
                res1.body.value.should.have.property('joke').and.be.instanceOf(String);
                res1.body.value.joke.indexOf('Joe').should.be.greaterThan(-1); // must be a better way!
                res1.body.value.joke.indexOf('Bloggs').should.be.greaterThan(-1); // must be a better way!

                done();
            });
    });

    it('should be able to get multiple random Joke instances if not signed in (GET /jokes/random/:count)',
        function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

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

    it('should be able to get a count of Joke instances if not signed in (GET /jokes/count)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

            agent.get('/jokes/count')
                .expect(200)
                .end(function(err, res) {

                    res.body.should.be.instanceOf(Object);
                    res.body.should.have.property('type', 'success');
                    res.body.should.have.property('value').and.be.greaterThan(500); // ~546 in the ICNDB database

                    done();
                });
    });

    it('should not be able to save Joke instance if not signed in (POST /jokes)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        var joke1 = {
            id: 99999,
            joke: 'Joke 1'
        };
        agent.post('/jokes')
            .send(joke1)
            .expect(401)
            .end(function(jokeSaveErr, jokeSaveRes) {

                // we have no permission to submit new jokes to ICNDB
                jokeSaveRes.body.message.should.match('User is not logged in');

                // Call the assertion callback
                done();
            });
    });

    it('should not be able to update Joke instance if not signed in (PUT /jokes/:jokeId)', function(done) {

        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        // firstly, request a random joke so we can attempt to update it
        agent.get('/jokes/random')
            .expect(200)
            .end(function(err1, res1) {

                var existingJoke = res1.body;
                var idToUpdate = existingJoke.value.id;
                var oldJoke = existingJoke.value.joke;

                existingJoke.value.joke = 'updated joke definition';

                agent.put('/jokes/' + idToUpdate)
                    .send(existingJoke)
                    .expect(401)
                    .end(function(jokeSaveErr, jokeSaveRes) {

                        // we have no permission to update jokes on ICNDB
                        jokeSaveRes.body.message.should.match('User is not logged in');

                        // Call the assertion callback
                        done();
                    });
            });
    });

    it('should not be able to delete Joke instance if not signed in (DELETE /jokes/:jokeId)', function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        // firstly, request a random joke so we can extract a valid id to feed back into the test
        agent.get('/jokes/random')
            .expect(200)
            .end(function(req, res) {
                var randomId = res.body.value.id;

                agent.delete('/jokes/' + randomId)
                    .expect(401)
                    .end(function(jokeSaveErr, jokeSaveRes) {

                        // we have no permission to update jokes on ICNDB
                        jokeSaveRes.body.message.should.match('User is not logged in');

                        // Call the assertion callback
                        done();
                    });
            });
    });

    afterEach(function(done) {
        this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout

        User.remove().exec(function() {
            //mongoose.connection.close(function() {
                done();
            //});
        });
    });

});
