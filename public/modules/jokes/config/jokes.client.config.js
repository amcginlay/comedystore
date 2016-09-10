'use strict';

// Configuring the Articles module
angular.module('jokes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem({
			menuId: 'topbar',
			menuItemTitle: 'Jokes',
			menuItemURL: 'jokes',
			menuItemType: 'dropdown',
			menuItemUIRoute: '/jokes(/create)?'
		});

		Menus.addSubMenuItem({
			menuId: 'topbar',
			rootMenuItemURL: 'jokes',
			menuItemTitle: 'List Jokes',
			menuItemURL: 'jokes'
		});

		Menus.addSubMenuItem({
			menuId: 'topbar',
			rootMenuItemURL: 'jokes',
			menuItemTitle: 'New Joke',
			menuItemURL: 'jokes/create'
		});
	}
]);
