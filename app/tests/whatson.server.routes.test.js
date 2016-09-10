'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    agent = request.agent(app);

/**
 * Globals
 */
var EXTERNAL_TIMEOUT_MS = 20000; // for Comedy Store requests

/**
 * WhatsOn routes tests
 */
describe('Whats On tests', function() {

    this.timeout(EXTERNAL_TIMEOUT_MS); // external method, long timeout
    this.slow(EXTERNAL_TIMEOUT_MS);

    beforeEach(function(done) {
        done();
    });

    it('should be able to get an HTML snippet of whats on soon at the Comedy Store', function(done) {
        agent.get('/whatson')
            .expect(200)
            .end(function(req, res) {

                res.body.should.be.instanceOf(Object);
                res.body.should.have.property('value').and.be.instanceOf(Array);
                res.body.value.length.should.be.greaterThan(0);
                res.body.value[0].should.have.property('eventDate').and.instanceOf(String);
                res.body.value[0].should.have.property('eventTime').and.instanceOf(String);
                res.body.value[0].should.have.property('eventPrice').and.instanceOf(String);
                res.body.value[0].should.have.property('eventTitle').and.instanceOf(String);
                res.body.value[0].should.have.property('comedians').and.instanceOf(Array);

                // Call the assertion callback
                done();
            });
    });

    afterEach(function(done) {
        done();
    });

});
