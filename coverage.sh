#!/usr/bin/env bash

# https://github.com/nickmerwin/node-coveralls
# script based on linked document:
# https://www.npmjs.com/package/mocha-lcov-reporter

[ -d coverage ] && rm -rf coverage
mkdir coverage

# NOTE getting coverage for karma requires less hoop jumping
node_modules/.bin/karma start karma.coveralls.conf.js

# NOTE getting coverage for mocha is not so simple
# build instrumented code and backup original before overwriting
[ -d app-orig ] && rm -rf app-orig
node_modules/.bin/jscover app coverage/app
mv app app-orig
mv coverage/app app

mkdir coverage/app
#node_modules/.bin/mocha -R mocha-lcov-reporter app/tests > coverage/app/lcov.info
JS_COV=1 node_modules/.bin/mocha -R mocha-lcov-reporter app/tests > coverage/app/lcov.info.temp
# fix the paths (https://www.npmjs.com/package/mocha-lcov-reporter)
sed 's,SF:,SF:app/,' coverage/app/lcov.info.temp > coverage/app/lcov.info

# now both client and server are complete, send reports to coveralls together
cat coverage/**/lcov.info | node_modules/coveralls/bin/coveralls.js

mv app coverage/app
mv app-orig app

