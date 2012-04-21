'use strict';

var resolve   = require('path').resolve
  , promisify = require('deferred').promisifyAsync
  , utimes    = promisify(require('fs').utimes)
  , unlink    = promisify(require('fs').unlink)

  , pg = resolve(__dirname, '__playground')
  , file1 = resolve(pg, 'test.js')

module.exports = function (t, d) {
	var invoked = false, p, result;
	unlink(resolve(pg, '.lintcache'))(function () {
		p = t.get(file1)(function (r) {
			invoked = true;
			result = r;
		});
		a(invoked, false, "No data after reset");
		return p;
	})(function (r) {
		invoked = false;
		t.get(file1, {})(function (r) {
			invoked = true;
			a(r, result, "Cached result");
		}).end();
		a(invoked, true, "Cached result #2");
		return utimes(file1, new Date(), new Date());
	})(function () {
		p = t.get(file1, {})(function (r) {
			invoked = true;
			a.not(r, result, "New result");
		});
		a(invoked, false, "Reset after file modification");
		return p;
	}).end(d);
};
