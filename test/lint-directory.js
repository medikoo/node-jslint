'use strict';

var keys    = Object.keys
  , resolve = require('path').resolve

  , path = resolve(__dirname, '__playground');

module.exports = function (t) {
	return {
		"No options": function (a, d) {
			t(path)(function (r) {
				var k = keys(r);
				a(k.length, 4);
				k.forEach(function (k, i) {
					a(r[k].errors && r[k].errors.length, 1, "#" + i + " errors");
				});
			}).end(d);
		},
		"Options": function (a, d) {
			t(path, { module: true })(function (r) {
				var k = keys(r);
				a(k.length, 4);
				k.forEach(function (k, i) {
					a(r[k].errors, undefined, "#" + i + " errors");
				});
			}).end(d);
		}
	};
};
