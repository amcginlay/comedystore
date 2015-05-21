'use strict';

// Configuring the Articles module
angular.module('jokes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Jokes', 'jokes', 'dropdown', '/jokes(/create)?');
		Menus.addSubMenuItem('topbar', 'jokes', 'List Jokes', 'jokes');
		Menus.addSubMenuItem('topbar', 'jokes', 'New Joke', 'jokes/create');
	}
]);