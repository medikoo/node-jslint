'use strict';

module.exports = function (t) {
	var start = '\'use strict\';\n\n'
	  , content = start + 'var x = { x: 9 };\n';

	t = require('../lib/jslint-module');

	return {
		'eqeq:null': function (a) {
			t(start + 'var x = 9;\nif (x == null) {\n    x = 10;\n}\n',
				{ module: true, 'eqeq:null': true  });
			a(t.data().errors, undefined);
		},
		'evil:function': function (a) {
			t(start + 'var x = new Function(\'return true;\');\n',
				{ module: true, 'evil:function': true  });
			a(t.data().errors, undefined);
		},
		'in': function (a) {
			t(start + 'var x = {}, a;\nif (a in x) {\n    x[a] = 5;\n}\n',
				{ module: true, 'in': true  });
			a(t.data().errors, undefined);
		},
		'objfn': function (a) {
			t(start + 'var x = Object(2);\n',
				{ module: true, objfn: true  });
			a(t.data().errors, undefined);
		},
		'primitiveconstructor': function (a) {
			t(start + 'var x = new Number(2);\n',
				{ module: true, primitiveconstructor: true  });
			a(t.data().errors, undefined);
		},
		'sideinvocation': function (a) {
			t(start + 'var x, y;\nx() && y();\n',
				{ module: true, sideinvocation: true  });
			a(t.data().errors, undefined);
		},
		'white:anybracepad': function (a) {
			var code = start + 'var x = {x: 1};\n';
			t(code, { module: true });
			a(t.data().errors.length, 2, "Errors");
			t(code, { module: true, 'white:anybracepad': true });
			a(t.data().errors, undefined,
				"Ok");
		},
		'white:anyeof': function (a) {
			var code = start + 'var x =  { x: 1 };';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:anyeof': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:anyeol': function (a) {
			var code = start + 'var x, y;\nx = { x: 1 };\r\ny = { y: 1 };\n';
			t(code, { module: true });
			a(t.data().errors.length, 4, "Errors");
			t(code, { module: true, 'white:anyeol': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:anyindent': function (a) {
			var code = start + 'var x, y;\nif (eval) {\n\tx = 5;\n    y = 6;\n}\n';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:anyindent': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:anyprecolon': function (a) {
			var code = start + 'var x = { x : 1 };\n';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:anyprecolon': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:commafirstvar': function (a) {
			var code = start + 'var x = 5\n  , y = 6;\nx = 5;\n';
			t(code, { module: true });
			a(t.data().errors.length, 2, "Errors");
			t(code, { module: true, 'white:commafirstvar': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:doubleol': function (a) {
			var code = start + '\nvar x = 5;\n';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:doubleeol': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:tabanywhere': function (a) {
			var code = start + 'var x =\t5;\n';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:tabanywhere': true });
			a(t.data().errors, undefined, "Ok");
		},
		'white:tabs': function (a) {
			var code = start + 'var x;\nif (eval) {\n\tx = 5;\n}\n';
			t(code, { module: true });
			a(t.data().errors.length, 1, "Errors");
			t(code, { module: true, 'white:tabs': true });
			a(t.data().errors, undefined, "Ok");
		}
	};
};
