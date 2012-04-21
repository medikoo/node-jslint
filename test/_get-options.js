'use strict';

var resolve = require('path').resolve

  , pg = resolve(__dirname, '__playground');

module.exports = function (t) {
	return {
		"Root": function (a, d) {
			t(resolve(pg, 'bar.js'))(function (r) {
				a.deep(r.predef, ['bar', 'foo'], "Predef");
				delete r.predef;
				a.deep(r,{ bitwise: true, evil: true, 'eqeq:null': true, maxlen: 70 });
			}).end(d);
		},
		"No conf": function (a, d) {
			t('/test.js')(function (r) {
				a.deep(r, {}, "No data");
			}).end(d);
		},
		"Sub": function (a, d) {
			t(resolve(pg, 'foo', 'bar', 'bar.js'))(function (r) {
				a.deep(r.predef, ['bar', 'foo', 'x', 'y'], "Predef");
				delete r.predef;
				a.deep(r,{ continue: true, css: true, devel: true, evil: true,
					'eqeq:null': true, indent: 2, maxlen: 60 });
			}).end(d);
		},
		"Sub file": function (a, d) {
			t(resolve(pg, 'foo', 'bar', 'foo.js'))(function (r) {
				a.deep(r.predef, ['bar', 'foo', 'x', 'y'], "Predef");
				delete r.predef;
				a.deep(r,{ continue: true, devel: true, evil: true, 'eqeq:null': true,
					undef: true, unparam: true, windows: true, indent: 2, maxlen: 60 });
			}).end(d);
		},
		"Sub sub": function (a, d) {
			t(resolve(pg, 'foo', 'bar', 'raz', 'bar.js'))(function (r) {
				a.deep(r.predef, ['dwa', 'raz'], "Predef");
				delete r.predef;
				a.deep(r,{ continue: true, css: true, devel: true, evil: true,
					'eqeq:null': true, indent: 2, maxlen: 60 });
			}).end(d);
		},
		"Core options": function (a, d) {
			t(resolve(pg, 'foo', 'bar', 'raz', 'bar.js'),
				{ adsafe: true, es5: true })(function (r) {
					a.deep(r.predef, ['dwa', 'raz'], "Predef");
					delete r.predef;
					a.deep(r,{ adsafe: true, continue: true, css: true, devel: true,
						es5: true, evil: true, 'eqeq:null': true, indent: 2, maxlen: 60 });
				}).end(d);
		},
		"Inner root": function (a, d) {
			t(resolve(pg, 'foo', 'bar', 'other', 'bar.js'))(function (r) {
				a.deep(r.predef, ['a', 'b'], "Predef");
				delete r.predef;
				a.deep(r,{ nomen: true });
			}).end(d);
		}
	};
};
