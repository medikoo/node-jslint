'use strict';

var readFile = require("fs").readFileSync
  , resolve  = require('path').resolve
  , vm       = require("vm")

  , ctx = vm.createContext({ console: console, eventEmitter: require('event-emitter') });

vm.runInContext(readFile(resolve(__dirname, "jslint.js")), ctx,
	resolve(__dirname, 'jslint.js'));

module.exports = ctx.JSLINT;
