'use strict';

module.exports = function (t) {
	var start = '\'use strict\';\n\n'
	  , content = start + 'var x = { x: 9 };\n';

	return {
		"Errors": function (a) {
			var data = t(content);
			a(data.functions.length, 0, "Functions");
			a(data.errors.length, 1, "Errors");
			a.deep(data.globals, ['x'], "Globals");
			a.deep(data.member, { x: 1 }, "Member");
		},
		"Ok": function (a) {
			a(t(content, { module: true }).errors, undefined);
		},
		"UTF8 BOM": function (a) {
			a(t('\ufeff' + content, { module: true }).errors, undefined);
		},
		"Shebang": function (a) {
			a(t('#!/usr/bin/env node\n' + content, { module: true }).errors,
				undefined);
		}
	};
};
