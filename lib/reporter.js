'use strict';

var clog       = console.log
  , isBoolean  = require('es5-ext/lib/Boolean/is-boolean')
  , compact    = require('es5-ext/lib/Array/prototype/compact')
  , contains   = require('es5-ext/lib/Array/prototype/contains')
  , callable   = require('es5-ext/lib/Object/valid-callable')
  , mapToArray = require('es5-ext/lib/Object/map-to-array')
  , clc        = require('cli-color')
  , custom     = Object.keys(require('./_custom-options-schema'))

  , bold = clc.bold, yellow = clc.yellow, gray = clc.gray, green = clc.green
  , filter = ['!root', 'color', 'git', 'maxerr', 'maxerrfiles', 'nocache'];

module.exports = function (file, lint, log) {
	var sOpts, key, value, line, colorize, i, len, pad, e, fileMessage;

	file = String(file);
	lint = Object(lint);
	if (log == null) {
		log = clog;
	} else {
		callable(log);
	}

	sOpts = '(' + compact.call(mapToArray(lint.options, function (value, key) {
		if (contains.call(custom, key)) {
			key = '+' + key;
		}
		return (value && !contains.call(filter, key)) ?
				(key + (isBoolean(value) ? '' : ': ' + value)) : null;
	}, null, function (a, b) {
		var aCustom = contains.call(custom, a)
		  , bCustom = contains.call(custom, b);
		if (aCustom !== bCustom) {
			return aCustom ? 1 : -1;
		} else {
			return a.localeCompare(b);
		}
	})).join(', ') + ')';
	colorize = lint.options.color;

	fileMessage = (colorize ? bold(file) : file) + ' ' +
		(colorize ? gray(sOpts) : sOpts);

	if (lint.errors) {
		log("\n" + fileMessage);
		len = lint.errors.length;
		for (i = 0; i < len; i += 1) {
			pad = "#" + String(i + 1);
			while (pad.length < 3) {
				pad = ' ' + pad;
			}
			e = lint.errors[i];
			if (e) {
				line = ' // Line ' + e.line + ', Pos ' + e.character;

				log(pad + ' ' + ((colorize) ? yellow(e.reason) : e.reason));
				log('    ' + (e.evidence || '').replace(/^\s+|\s+$/, "") +
					((colorize) ? gray(line) : line));
			}
		}
		log("");
	} else {
		log((colorize ? green('OK') : 'OK') + " " + fileMessage + "\n");
	}

	return lint.ok;
};
