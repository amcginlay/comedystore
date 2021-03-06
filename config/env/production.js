'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL ||
	    process.env.MONGOLAB_URI ||
	    'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR ||
		'localhost') + '/comedystore',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css'
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/jquery.scrollTo/jquery.scrollTo.min.js',
				'public/lib/jquery.localScroll/jquery.localScroll.min.js',
				'public/lib/classie/classie.js',
				'public/libalt/gnmenu.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	}
};
