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
    agent = request.agent(app);
    //passport = require('passport');

/**
 * Globals
 */
var credentials, user, user2;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	beforeEach(function(done) {

        // Create user credentials
        credentials = {
            username: 'username',
            password: 'password'
        };

        user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

        it('should signin and signout without problems', function(done) {
            user.save(function(saveErr) {
                if (saveErr) return done(saveErr);

                // firstly sign-out so there can be no doubt of the current state
                agent.get('/auth/signout')
                    .end(function(signoutErr, signoutResponse) {
                        if (signoutErr) return done(signoutErr);

                        // check that there is no-one signed in
                        agent.get('/users/me')
                            .expect(200)
                            .end(function(meErr, meRes) {
                                if (meErr) return done(meErr);

                                meRes.body.should.be.instanceOf(Object);
                                Object.keys(meRes.body).should.have.lengthOf(0);

                                // sign in
                                agent.post('/auth/signin')
                                    .send(credentials)
                                    .expect(200)
                                    .end(function(signinErr2, signinRes2) {
                                        if (signinErr2) return done(signinErr2);

                                        //var cookie = signinRes.headers['set-cookie'][0];

                                        // check that there IS someone signed in
                                        agent.get('/users/me')
                                            .expect(200)
                                            .end(function(me2Err, me2Res) {
                                                if (me2Err) return done(me2Err);

                                                me2Res.body.username.should.match(credentials.username);

                                                // finally sign out ...
                                                agent.get('/auth/signout')
                                                    //agent.get('/auth/signout', passport.authenticate('local'))
                                                    //.set('cookie', cookie)
                                                    .end(function(signoutErr, signoutResponse) {

                                                        // ... and check we've gone
                                                        agent.get('/users/me')
                                                            .expect(200)
                                                            .end(function(me3Err, me3Res) {
                                                                if (me3Err) return done(me3Err);

                                                                me3Res.body.should.be.instanceOf(Object);
                                                                Object.keys(me3Res.body).should.have.lengthOf(0);

                                                                // if we got here we're all good
                                                                done();
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
        });
	});

	afterEach(function(done) {
		User.remove().exec(function() {
            done();
        });
	});
});
