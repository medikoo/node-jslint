// Lint files at given path
// If path leads to file, lint this file, if it leads to directory, lint all
// files in this directory and it's subdirectories

'use strict';

var resolve       = require('path').resolve
  , isCallable    = require('es5-ext/lib/Object/is-callable')
  , promisify     = require('deferred').promisify
  , stat          = promisify(require('fs').stat)
  , lintDirectory = require('./lint-directory')
  , lintFile      = require('./lint-file');

module.exports = function (path, coreOptions, cb) {
	path = resolve(String(path));
	if (isCallable(coreOptions)) {
		cb = coreOptions;
		coreOptions = {};
	}
	return stat(path)(function (stats) {
		if (stats.isDirectory()) {
			return lintDirectory(path, coreOptions);
		} else if (stats.isFile()) {
			return lintFile(path, coreOptions)(function (report) {
				return { '.': report };
			});
		} else {
			return new Error("No such file or directory");
		}
	}).cb(cb);
};
