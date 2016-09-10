#!/usr/bin/env bash

# https://github.com/nickmerwin/node-coveralls
# script based on linked document:
# https://www.npmjs.com/package/mocha-lcov-reporter

#!/usr/bin/env bash 
rm -rf coverage
rm -rf app-cov
 
node_modules/.bin/jscover --exclude=tests app app-cov
mv app app-orig
mv app-cov app
node_modules/.bin/mocha app/tests -R mocha-lcov-reporter | node_modules/coveralls/bin/coveralls.js app
rm -rf app
mv app-orig app
