'use strict';

module.exports = function(app) {
    var whatson = require('../../app/controllers/whatson.server.controller');

    app.route('/whatson')
        .get(function(req, res) { return whatson.list(req, res); } );
};
