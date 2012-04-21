// Lint given code with following options

'use strict';

var assertNotNull = require('es5-ext/lib/assert-not-null')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , jslint        = require('./jslint-module');

module.exports = function (script, options) {
	var ok, result;

	assertNotNull(script);
	script = String(script);


	// Fix UTF8 with BOM
	if (startsWith.call(script, '\ufeff')) {
		script = script.slice(1);
	}

	// remove shebang
	script = script.replace(/^#![\0-\t\u000b-\uffff]*\n/, '');

	jslint(script, options);

	return jslint.data();
};
