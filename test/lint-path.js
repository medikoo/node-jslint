'use strict';

var keys     = Object.keys
  , resolve  = require('path').resolve

  , testDir  = resolve(__dirname, '__playground')
  , testFile = resolve(testDir, 'test.js');


module.exports = function (t) {
	return {
		"File": function (a, d) {
			t(testFile, function (err, data) {
				a.deep(keys(data), ['.'], "Result length");
				data = data['.'];
				a(data && data.errors && data.errors.length, 1, "Result errors");
				d();
			});
		},
		"Directory": function (a, d) {
			t(testDir)(function (r) {
				var k = keys(r);
				a(k.length, 6, "Result length");
				k.forEach(function (k, i) {
					a(r[k].errors && r[k].errors.length, 1, "#" + i + " errors");
				});
			}).end(d);
		}
	}
};
