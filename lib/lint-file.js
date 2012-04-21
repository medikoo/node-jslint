'use strict';

var isArray        = Array.isArray
  , parse          = JSON.parse
  , stringify      = JSON.stringify
  , fs             = require('fs')
  , path           = require('path')
  , assertNotNull  = require('es5-ext/lib/assert-not-null')
  , commonLeft     = require('es5-ext/lib/Array/prototype/common-left')
  , compact        = require('es5-ext/lib/Array/prototype/compact')
  , memoize        = require('es5-ext/lib/Function/memoize')
  , isCallable     = require('es5-ext/lib/Object/is-callable')
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , copy           = require('es5-ext/lib/Object/copy')
  , deferred       = require('deferred')
  , promisify      = deferred.promisify
  , findRoot       = require('next/lib/find-package-root')
  , writeFile      = promisify(require('next/lib/fs/write-file'))
  , getOptions     = require('./_get-options')
  , options        = require('./_options-schema')
  , lint           = require('./lint')

  , optNames = Object.keys(options).sort(), cachefname = '.lintcache'
  , dirname = path.dirname, resolve = path.resolve
  , readFile = promisify(fs.readFile), stat = promisify(fs.stat)

  , serializeOpts, get, save, lintFile;

serializeOpts = function (obj) {
	obj = Object(obj);
	return compact.call(optNames.map(function (name) {
		var value = options[name].resolve(obj[name]);
		return (value && (!isArray(value) || value.length)) ?
			(name + ((value !== true) ? String(':' + value) : '')) : '';
	})).join('|');
};

get = memoize(function (path) {
	return readFile(resolve(path, cachefname), 'utf8')(parse)(null, {});
});

save = function (path, cache) {
	try {
		cache = stringify(cache);
		return writeFile(resolve(path, cachefname), cache);
	} catch (e) {
		console.log("Could not save report: ",
			require('util').inspect(cache, false, null));
		throw e;
	}
};

lintFile = function (filename, options) {
	return deferred(readFile(filename), options).match(lint);
};

module.exports = function (filename, coreOptions, cb) {
	var root, name, options;
	filename = assertNotNull(filename) && resolve(String(filename));
	if (isCallable(coreOptions)) {
		cb = coreOptions;
		coreOptions = {};
	} else {
		coreOptions = Object(coreOptions);
		(cb != null) && assertCallable(cb);
	}
	options = getOptions(filename, coreOptions);
	if (coreOptions.nocache) {
		return lintFile(filename, options).cb(cb);
	}
	return deferred(findRoot(filename)(function (path) {
		root = path || dirname(filename);
		name = filename.slice(commonLeft.call(filename, root));
		return get(root);
	}), stat(filename).get('mtime').invoke('valueOf'), options)
		.match(function (cache, mtime, options) {
			var sOpts = serializeOpts(options), report;
			if (cache[name] && (cache[name].mtime === mtime)) {
				if (cache[name][sOpts]) {
					report = copy(cache[name][sOpts]);
					report.options = options;
					return report;
				}
			} else {
				cache[name] = { mtime: mtime };
			}
			return lintFile(filename, options)(function (report) {
				delete report.functions;
				cache[name][sOpts] = report;
				save(root, cache);
				report = copy(report);
				report.options = options;
				return report;
			});
		}).cb(cb);
};
