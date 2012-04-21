'use strict';

var isBoolean  = require('es5-ext/lib/Boolean/is-boolean')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , every      = require('es5-ext/lib/Object/every')
  , isString   = require('es5-ext/lib/String/is-string');

module.exports = function (t, a) {
	a.ok(every(t, function (value) {
		return isFunction(value.resolve);
	}), "Resolve");
	a.ok(every(t, function (value) {
		return isString(value.description);
	}), "Description");
	a.ok(every(t, function (value) {
		return (value.boolean !== true) || (value.default == null) ||
			isBoolean(value.default);
	}), "Boolean sanity");
};
