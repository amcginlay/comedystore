# The Comedy Store's Unfunny Brother by Alan McGinlay

[![Build Status](https://travis-ci.org/amcginlay/comedystore.svg?branch=master)](https://travis-ci.org/amcginlay/comedystore)
[![Coverage Status](https://coveralls.io/repos/github/amcginlay/comedystore/badge.svg?branch=master)](https://coveralls.io/github/amcginlay/comedystore?branch=master)

![Comedy Store Logo](https://raw.githubusercontent.com/amcginlay/comedystore/master/public/modules/core/img/brand/logo.png)

As per the [instructions](https://github.com/makersacademy/comedy_api_tech_test), this is my attempt at the challenge.

## Tech Stack
My solution is a single page [MEAN Stack](http://mean.io) app, using front-to-back Javascript components.  I used a [Yeoman](http://yeoman.io) generator to produce the authorisation and basic joke admin layers, customising this boilerplate code to suit.  I've used [Bootstrap](http://getbootstrap) for styling.  'What's On' web-scraping is performed using [Cheerio](http://cheeriojs.github.io/cheerio/).  BDD-style tests for the APIs are covered by [Mocha](http://mochajs.org/) and [Should](https://github.com/shouldjs/should.js).  Code anlalysis is performed by [JSHint](http://jshint.com/) and [CSS Lint](http://csslint.net/)

## Preparing and Launching (Dev Mode)
* I will assume that you have [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) and [MongoDB](https://www.mongodb.org/) installed locally
* `git clone` this repository and run `npm install` from its root to download the project dependencies
* MongoDB needs to be launched locally using `mongod --maxConns 100` on the default port (27017).
* You may then 'lint' the code and launch the web server just by running [Grunt](http://gruntjs.com/) on the command line with `grunt`
* Finally, navigate a browser to [http://localhost:3000](http://localhost:3000)

## Feature walkthrough (when not signed in)
* When not signed in, all **Joke** REST API calls are transparently routed through an ICNDB-specific implementation
* The menu access point (the hamburger icon in the top-left) will be painted red when not signed in
* Random Chuck Norris **jokes from ICNDB** will be shown on the website.  NOTE these may repeat.

## Feature walkthrough (when signed in)
* When signed in, all **Joke** REST API calls are transparently routed through an MongoDB-specific implementation
* To sign up (and in), use the appropriate options in the menu.
* Be sure to provide a realistic **First Name** and **Last Name** (see why later)
* The menu icon will be painted green when signed in
* On the main page you will see the message **'It's no joke, you've seen them all!'** which indicates that we've switched to **our own (empty) joke database**.
* Select the Admin option in the menu and locate the **Random Fill** button to import five random jokes from ICNDB.
* See if you can figure out how to add one of your own to our database at this point, just to marginally improve the overall quality of jokes!
* When you return to the main page you should start seeing **jokes from our newly populated database**.
* Note that Chuck Norris jokes from our database mimic the **'Changing the name of the main character'** feature from ICNDB.
* Identifiers for jokes displayed to the current user are recorded in MongoDB (see the **excludedJokes** array property in the users collection)
* When the range of available jokes is depleted for a user, he/she will continually see **'It's no joke, you've seen them all!'** until more jokes are added.

## What's On at The Comedy Store
* Regardless of signed in/out status, the main page will replicate the listings shown on the real [London Comedy Store](http://thecomedystore.co.uk/london/) website which always begin from today.  This is performed via [our own REST API call](http://localhost:3000/whatson) which forwards a request to their website and strips out the required information to build a response.

## Limitations
* In the interests of getting this delivered ASAP I have not yet attempted to integrate Travis, Hound or Coveralls.
* I noticed that the [instructions](https://github.com/makersacademy/comedy_api_tech_test) have, since I began the task, been extended to include **upvote** and **sorting** features.  I have not yet attempted this but I'll make these changes if necessary.
* Production builds have not been tested.
* The main page and the joke admin pages utilise different CSS themes that don't play nicely with each other.  To support the two themes side-by-side (see cssfix.js) I dynamically push/pull stylesheets from the DOM as the views change.  These incomapibilities should ideally be resolved.
* Given that we're web-scraping their site, if The Comedy Store make changes tomorrow ... BANG! (maybe)
* The website is only fully tested in Google Chrome browser.
* Some Mocha tests may periodically time out.  It's not clear why but I suspect the MongoDB server could be getting starved of connections.

## v1.0.1 Release Notes (Sept 2016)
* Changes predominantly based around coding standards, test coverage and removal of superfluous scaffolding code.
* Integrated Travis, Coveralls and Hound.
