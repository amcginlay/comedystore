'use strict';

/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};
