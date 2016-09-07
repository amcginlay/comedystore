'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		var _this = this;

		// Define a set of default roles
		_this.defaultRoles = ['*'];

		// Define the menus object
		_this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~_this.roles.indexOf('*')) {
					return true;
				} else {
					return (function isRoleMatchFound(){
						for (var userRoleIndex in user.roles) {
							for (var roleIndex in _this.roles) {
								if (_this.roles[roleIndex] === user.roles[userRoleIndex]) {
									return true;
								}
							}
						}
						return false;
					})();
				}
			} else {
				return _this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		_this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (_this.menus[menuId]) {
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
		_this.getMenu = function(menuId) {
			// Validate that the menu exists
			_this.validateMenuExistance(menuId);

			// Return the menu object
			return _this.menus[menuId];
		};

		// Add new menu object by menu id
		_this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			_this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || _this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return _this.menus[menuId];
		};

		// Add menu item object
		_this.addMenuItem = function(menuArgs) {
			// Validate that the menu exists
			_this.validateMenuExistance(menuArgs.menuId);

			// Push new menu item
			_this.menus[menuArgs.menuId].items.push({
				title: menuArgs.menuItemTitle,
				link: menuArgs.menuItemURL,
				menuItemType: menuArgs.menuItemType || 'item',
				menuItemClass: menuArgs.menuItemType,
				uiRoute: menuArgs.menuItemUIRoute || ('/' + menuArgs.menuItemURL),
				isPublic: ((menuArgs.isPublic === null || typeof menuArgs.isPublic === 'undefined') ?
					_this.menus[menuArgs.menuId].isPublic : menuArgs.isPublic),
				roles: ((menuArgs.roles === null || typeof menuArgs.roles === 'undefined') ?
					_this.menus[menuArgs.menuId].roles : menuArgs.roles),
				position: menuArgs.position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return _this.menus[menuArgs.menuId];
		};

		// Add submenu item object
		_this.addSubMenuItem = function(menuArgs) {
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

		//Adding the topbar menu
		_this.addMenu('topbar');
	}
]);
