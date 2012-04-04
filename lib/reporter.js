'use strict';

var log        = console.log
  , isBoolean  = require('es5-ext/lib/Boolean/is-boolean')
  , mapToArray = require('es5-ext/lib/Object/map-to-array')
  , clc        = require("cli-color")

  , bold = clc.bold, yellow = clc.yellow, gray = clc.gray, green = clc.green;

module.exports = function (file, lint, colorize) {
	var options = [], key, value, line,
	i, len, pad, e, fileMessage;

	options = '(' + mapToArray(lint.options, function (value, key) {
		return key + (isBoolean(value) ? '' : ': ' + value);
	}, null, true).join(', ') + ')';

	fileMessage = "\n" + (colorize ? bold(file) : file) + ' ' +
		(colorize ? gray(options) : options);

	if (!lint.ok) {
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
		log((colorize ? green('OK') : 'OK') + " " + fileMessage);
	}

	return lint.ok;
};
