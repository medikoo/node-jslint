'use strict';

var resolve  = require('path').resolve
  , promisify = require('deferred').promisify
  , utimes    = promisify(require('fs').utimes)
  , unlink    = promisify(require('fs').unlink)

  , pg = resolve(__dirname, '__playground')
  , testFile = resolve(pg, 'test.js');

module.exports = function (t) {
	return {
		"Cache": function (t, a, d) {
			var invoked = false, p, result;
			unlink(resolve(pg, '.lintcache'))(null, {})(function () {
				return t(testFile)(function (r) {
					result = r;
				});
			})(function () {
				invoked = false;
				return t(testFile)(function (r) {
					invoked = true;
					a.deep(r, result, "Cached result");
					return utimes(testFile, new Date(), new Date());
				});
			})(function () {
				return t(testFile)(function (r) {
					a.not(r, result, "New result");
				});
			}).end(d);
		},
		"No options": function (a, d) {
			t(testFile, function (err, data) {
				a(err, null, "No error");
				a(data.errors && data.errors.length, 1, "Result errors");
			}).end(d);
		},
		"Options": function (a, d) {
			t(testFile, { module: true }, function (err, data) {
				a(err, null, "No error");
				a(data.errors, undefined, "Result errors");
			}).end(d);
		}
	};
};
