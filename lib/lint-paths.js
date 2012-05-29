// Lint files at given paths

'use strict'

var call          = Function.prototype.call
  , resolve       = require('path').resolve
  , commonLeft    = require('es5-ext/lib/Array/prototype/common-left')
  , mapKeys       = require('es5-ext/lib/Object/map-keys')
  , extend        = require('es5-ext/lib/Object/extend')
  , value         = require('es5-ext/lib/Object/valid-value')
  , deferred      = require('deferred')
  , lintPath      = require('./lint-path');

module.exports = function (paths, coreOptions, cb) {
	var rootIndex;
	paths = value(paths).map(String).map(resolve);
	if (!paths.length) {
		return {};
	}
	if (paths.length === 1) {
		rootIndex = paths[0].length + 1;
	} else {
		rootIndex = call.apply(commonLeft, paths);
	}

	return deferred.map(paths, function (path) {
		return lintPath(path, coreOptions).invoke(function () {
			return mapKeys(this, function (key) {
				return ((key === '.') ? path : resolve(path, key)).slice(rootIndex);
			});
		});
	}, null, 50).invoke('reduce', function (all, one) {
		return extend(all, one);
	}, {}).cb(cb);
};
