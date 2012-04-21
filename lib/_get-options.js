// Get JSLint options for given filename

'use strict';

var call           = Function.prototype.call
  , defineProperty = Object.defineProperty
  , trim           = String.prototype.trim
  , path           = require('path')
  , readFile       = require('deferred').promisify(require('fs').readFile)
  , assertNotNull  = require('es5-ext/lib/assert-not-null')
  , compact        = require('es5-ext/lib/Array/prototype/compact')
  , contains       = require('es5-ext/lib/Array/prototype/contains')
  , uniq           = require('es5-ext/lib/Array/prototype/uniq')
  , memoize        = require('es5-ext/lib/Function/memoize')
  , not            = require('es5-ext/lib/Function/prototype/not')
  , partial        = require('es5-ext/lib/Function/prototype/partial')
  , copy           = require('es5-ext/lib/Object/copy')
  , v              = require('es5-ext/lib/Object/descriptor')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , filter         = require('es5-ext/lib/Object/filter')
  , startsWith     = require('es5-ext/lib/String/prototype/starts-with')

  , trimf = call.bind(trim)
  , dirname = path.dirname, resolve = path.resolve

  , parse, normalize, mergeUpper, getFileOpts, getDirOpts
  , numProps = ['indent', 'maxlen']
  , predefProps = ['predef', 'predef+', 'predef-'];

parse = function (data, path) {
	var opts, current;

	opts = current = defineProperty({}, '_paths', v({}));
	if (!data) {
		return opts;
	}
	data = compact.call(trim.call(data).split('\n').map(trimf)
		.map(function (line) {
			return line.replace(/#[\0-\uffff]*$/, '').trim();
		}));

	if (data[0] === '@root') {
		defineProperty(opts, '_root', v(true));
		data.shift();
	}

	data.forEach(function (line) {
		var name, value;

		if (startsWith.call(line, './')) {
			current = opts._paths[resolve(path, line)] = {};
			return;
		}
		name = line.split(/\s+/, 1)[0];
		if (startsWith.call(name, '_')) {
			// Do not allow underscored properties
			return;
		}
		value = line.slice(name.length).trim();
		if (contains.call(numProps, name)) {
			value = Number(value);
		} else if (contains.call(predefProps, name)) {
			value = value.split(/\s*,\s*/).sort();
		} else if (startsWith.call(name, '!')) {
			name = name.slice(1);
			value = false;
		} else {
			value = true;
		}
		// console.log("SET", name, value);
		current[name] = value;
	});
	return opts;
};

normalize = function (data, other) {
	if (other) {
		forEach(other, function (value, key) {
			if (data.hasOwnProperty(key)) {
				return;
			}
			data[key] = value;
		});
	}

	if (data['predef+']) {
		data.predef = uniq.call((data.predef || []).concat(data['predef+'])).sort();
		delete data['predef+'];
	}
	if (data['predef-']) {
		if (data.predef) {
			data.predef = data.predef
				.filter(not.call(contains.bind(data['predef-'])));
		}
		delete data['predef-'];
	}
	return data;
};

mergeUpper = function (opts, path) {
	var parent = opts, descs = [];
	do {
		if (parent._paths[path]) {
			descs.unshift(parent._paths[path]);
		}
	} while ((parent = parent._parent));
	descs.forEach(function (desc) {
		opts = normalize(desc, opts);
	});
	return opts;
};

getDirOpts = memoize(function (path) {
	return readFile(resolve(path, '.lint'))(null, '')(function (content) {
		var data = parse(content, path);
		return (data._root || (dirname(path) === path)) ? normalize(data) :
			getDirOpts(dirname(path))(function (parent) {
				if (parent) {
					defineProperty(data, '_parent', v(parent));
					parent = mergeUpper(parent, path);
				}
				return normalize(data, parent);
			});
	});
});

getFileOpts = memoize(function (path) {
	return getDirOpts(dirname(path))(function (data) {
		return data ? mergeUpper(data, path) : {};
	});
});

module.exports = function (filename, coreOptions) {
	return getFileOpts(filename)(function (data) {
		return filter(normalize(copy(data), coreOptions), Boolean);
	});
};
