// Lint files at given paths

'use strict'

var call          = Function.prototype.call
  , resolve       = require('path').resolve
  , assertNotNull = require('es5-ext/lib/assert-not-null')
  , commonLeft    = require('es5-ext/lib/Array/prototype/common-left')
  , mapKeys       = require('es5-ext/lib/Object/map-keys')
  , merge         = require('es5-ext/lib/Object/merge')
  , deferred      = require('deferred')
  , lintPath      = require('./lint-path');

module.exports = function (paths, coreOptions, cb) {
	var rootIndex;
	paths = assertNotNull(paths) && paths.map(String).map(resolve);
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
	}).invoke('reduce', function (all, one) {
		return merge(all, one);
	}, {}).cb(cb);
};
