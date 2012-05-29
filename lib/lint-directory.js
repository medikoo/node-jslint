'use strict';

var createReadStream = require('fs').createReadStream
  , resolve          = require('path').resolve
  , compact          = require('es5-ext/lib/Array/prototype/compact')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , callable         = require('es5-ext/lib/Object/valid-callable')
  , endsWith         = require('es5-ext/lib/String/prototype/ends-with')
  , deferred         = require('deferred')
  , promisify        = deferred.promisify
  , readdir          = promisify(require('next/lib/fs/readdir-files-deep'))
  , lintFile         = require('./lint-file')

  , reExt = /^([\u0000-\u002d\u002f-\uffff]+|[\u0000-\uffff]+\.js)$/
  , reShebang = /^#![\u0021-\uffff]+(?:\/node|\/env node)\s/;

module.exports = function (path, coreOptions, cb) {
	var results = {};
	path = resolve(String(path));
	if (isCallable(coreOptions)) {
		cb = coreOptions;
		coreOptions = {};
	} else {
		coreOptions = Object(coreOptions);
		(cb == null) || callable(cb);
	}
	return readdir(path, { git: coreOptions.git, ignorefile: '.lintignore',
		pattern: reExt }).map(
			function (file) {
				if (endsWith.call(file, '.js')) {
					return file
				} else {
					var d = deferred(), stream;
					stream = createReadStream(resolve(path, file),
						{ start: 0, end: 100 });
					stream.on('data', function (data) {
						d.resolve(reShebang.test(data) ? file : null);
					});
					stream.on('error', d.resolve);
					stream.on('end', d.resolve);
					return d.promise;
				}
			}, null, 50).invoke(compact).map(function (file) {
				var filename = resolve(path, file);
				return lintFile(filename, coreOptions)(function (r) {
					results[file] = r;
				});
			})(results).cb(cb);
};
