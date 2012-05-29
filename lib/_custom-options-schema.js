'use strict';

var last = require('es5-ext/lib/Array/prototype/last');

module.exports = {
	eolateof: {
		description: "Require EOL (end of line) at EOF (end of file)",
		interceptors: {
			end: function (e) {
				var line = last.call(e.lines);
				if (line) {
					e.warn('unexpected_a', e.lines.length, line.length, '(end of file)');
				}
			}
		}
	},
	notabalign: {
		description: "Do not allow tabs after no whitespace characters",
		interceptors: {
			line: function (e) {
				var at = e.source.search(/[\0-\u0008\u000a-\u001f!-\uffff]\t/);
				if (at >= 0) {
					e.warn('unexpected_a', e.line, at + 1, '(tab)');
				}
			}
		}
	}
};
