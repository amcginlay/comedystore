'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};
