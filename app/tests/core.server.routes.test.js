'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    agent = request.agent(app);

/**
 * Globals
 */
var EXTERNAL_TIMEOUT_MS = 20000; // for Comedy Store requests

/**
 * Core server routes tests
 */
describe('Core server tests', function() {

    this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout
    this.slow(EXTERNAL_TIMEOUT_MS);

    beforeEach(function(done) {
        done();
    });

    it('should be able to request site home page', function(done) {
        agent.get('/')
            .expect(200)
            .end(function(req, res) {
                res.statusCode.should.match(200);
                done();
            });
    });

    it('should not be able to request a non-existent page', function(done) {
        agent.get('/this_route_does_not_exist')
            .expect(404)
            .end(function(req, res) {
                res.statusCode.should.match(404);
                done();
            });
    });

    afterEach(function(done) {
        done();
    });

});
