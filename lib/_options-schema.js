'use strict';

var compact = require('es5-ext/lib/Array/prototype/compact')
  , extend  = require('es5-ext/lib/Object/extend')
  , forEach = require('es5-ext/lib/Object/for-each')

  , custom  = require('./_custom-options-schema');

exports = module.exports = {
	adsafe: {
		description: "if ADsafe rules should be enforced. "
			+ "See http://www.ADsafe.org/"
	},
	bitwise: {
		description: "if bitwise operators should be allowed"
	},
	browser: {
		description: "if the standard browser globals should be predefined"
	},
	cap: {
		description: "if uppercase HTML should be allowed"
	},
	continue: {
		description: "if the continue statement should be allowed"
	},
	css: {
		description: "if CSS workarounds should be tolerated"
	},
	debug: {
		description: "if debugger statements should be allowed"
	},
	devel: {
		description: "if browser globals that are useful in development "
			+ "(alert, console etc) should be predefined"
	},
	eqeq: {
		description: "if the == and != operators should be tolerated"
	},
	es5: {
		default: true,
		description: "if ES5 syntax should be allowed"
	},
	evil: {
		description: "if eval should be allowed"
	},
	forin: {
		description: "if unfiltered for in statements should be allowed"
	},
	fragment: {
		description: "if HTML fragments should be allowed"
	},
	indent: {
		default: 4,
		description: "The number of spaces used for indentation",
		resolve: Number
	},
	maxerr: {
		default: 50,
		description: "The maximum number of warnings (per file) reported",
		resolve: Number
	},
	maxlen: {
		description: "The maximum number of characters in a line",
		resolve: Number
	},
	newcap: {
		description: "if Initial Caps with constructor functions is optional"
	},
	node: {
		description: "if Node.js globals should be predefined",
		default: true
	},
	nomen: {
		default: true,
		description: "if names should not be checked "
			+ "for initial or trailing underbars"
	},
	on: {
		description: "if HTML event handlers should be allowed"
	},
	passfail: {
		description: "if the scan should stop on first error (per file)"
	},
	plusplus: {
		description: "if ++ and -- should be allowed"
	},
	predef: {
		description: "Comma separated list of the names of "
			+ "predefined global variables",
		resolve: function (obj) {
			return obj ? compact.call(obj.map(String)).sort() : [];
		}
	},
	regexp: {
		description: "if . and [^...] should be allowed in RegExp literals"
	},
	rhino: {
		description: "if the Rhino environment globals should be predefined"
	},
	safe: {
		description: "if the safe subset rules are enforced. "
			+ "These rules are used by ADsafe."
	},
	sloppy: {
		description: "if the ES5 'use strict'; pragma is not required."
	},
	stupid: {
		description: "true if blocking ('...Sync') methods can be used."
	},
	sub: {
		description: "if subscript notation may be used for expressions better "
			+ "expressed in dot notation"
	},
	undef: {
		description: "if variables and functions need not be declared before used"
	},
	unparam: {
		description: "if warnings should not be given for unused parameters"
	},
	vars: {
		description: "if multiple var statement per function should be allowed"
	},
	white: {
		description: "if strict whitespace rules should be ignored"
	},
	windows: {
		description: "if the Windows globals should be predefined"
	}
};

forEach(custom, function (val) {
	if (val.description) {
		val.description = '(custom) ' + val.description;
	}
});
extend(exports, custom);

// Setup booleans
forEach(exports, function (value) {
	if (!value.resolve) {
		value.boolean = true;
		value.resolve = Boolean;
	}
});
