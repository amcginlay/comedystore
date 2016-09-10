'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	(function setupUserProfileApi(){
		app.route('/users/me').get(users.me);
	})();

	(function setupUserAuthenticationApi(){
		app.route('/auth/signup').post(users.signup);
		app.route('/auth/signin').post(users.signin);
		app.route('/auth/signout').get(users.signout);
	})();
};
