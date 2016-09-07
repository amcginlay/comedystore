'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuArgs) {
			// Validate that the menu exists
			this.validateMenuExistance(menuArgs.menuId);

			// Push new menu item
			this.menus[menuArgs.menuId].items.push({
				title: menuArgs.menuItemTitle,
				link: menuArgs.menuItemURL,
				menuItemType: menuArgs.menuItemType || 'item',
				menuItemClass: menuArgs.menuItemType,
				uiRoute: menuArgs.menuItemUIRoute || ('/' + menuArgs.menuItemURL),
				isPublic: ((menuArgs.isPublic === null || typeof menuArgs.isPublic === 'undefined') ?
					this.menus[menuArgs.menuId].isPublic : menuArgs.isPublic),
				roles: ((menuArgs.roles === null || typeof menuArgs.roles === 'undefined') ?
					this.menus[menuArgs.menuId].roles : menuArgs.roles),
				position: menuArgs.position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuArgs.menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuArgs) {
			// Validate that the menu exists
			this.validateMenuExistance(menuArgs.menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuArgs.menuId].items) {
				if (this.menus[menuArgs.menuId].items[itemIndex].link === menuArgs.rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuArgs.menuId].items[itemIndex].items.push({
						title: menuArgs.menuItemTitle,
						link: menuArgs.menuItemURL,
						uiRoute: menuArgs.menuItemUIRoute || ('/' + menuArgs.menuItemURL),
						isPublic: ((menuArgs.isPublic === null || typeof menuArgs.isPublic === 'undefined') ?
							this.menus[menuArgs.menuId].items[itemIndex].isPublic : menuArgs.isPublic),
						roles: ((menuArgs.roles === null || typeof menuArgs.roles === 'undefined') ?
							this.menus[menuArgs.menuId].items[itemIndex].roles : menuArgs.roles),
						position: menuArgs.position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuArgs.menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
