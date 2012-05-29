// Lint given code with following options

'use strict';

var forEach    = require('es5-ext/lib/Object/for-each')
  , startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , jslint     = require('./jslint-module')
  , custom     = require('./_custom-options-schema');

module.exports = function (script, options) {
	var ok, result;

	script = String(script);
	options = Object(options);

	// Fix UTF8 with BOM
	if (startsWith.call(script, '\ufeff')) {
		script = script.slice(1);
	}

	// remove shebang
	script = script.replace(/^#![\0-\t\u000b-\uffff]*\n/, '');

	forEach(options, function (value, name) {
		forEach(Object(custom[name] && custom[name].interceptors),
			function (listener, name) {
				jslint.on(name, listener.bind(value));
			});
	});

	jslint(script, options);

	jslint.allOff();

	return jslint.data();
};
