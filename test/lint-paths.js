'use strict';

var keys     = Object.keys
  , resolve  = require('path').resolve

  , testDir  = resolve(__dirname, '__playground', 'test')
  , testFile = resolve(__dirname, '__playground', 'test.js');

module.exports = function (t, a, d) {
	t([testDir, testFile])(function (r) {
		var k = keys(r);
		a(k.length, 3, "Result length");
		k.forEach(function (k, i) {
			a(r[k].errors && r[k].errors.length, 1, "#" + i + " errors");
		});
	}).end(d);
};
