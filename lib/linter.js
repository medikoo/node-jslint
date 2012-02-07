'use strict';

var fs = require('fs');
var JSLINT = require("../lib/nodelint");

exports.prepOptions = function (options) {
    delete options.argv;
    ['module', 'es5'].forEach(function (opt) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = true;
        }
    });

    if (options.predef) {
        if (!Array.isArray(options.predef)) {
            options.predef = options.predef.split(',').filter(Boolean);
        }
        options.predef.sort();
    }

    return options;
}

exports.lint = function (script, options) {
    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    // remove shebang
    /*jslint regexp: true*/
    script = script.replace(/^\#\!.*/, "");

    options = exports.prepOptions(options || {});

    var ok = JSLINT(script.split('\n'), options),
        result = {
            ok: true,
            errors: []
        };

    if (!ok) {
        result = JSLINT.data();
        result.ok = ok;
    }

    result.options = options;

    return result;
};

exports.lintFile = function (path, options, cb) {
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            cb(err);
            return;
        }

        cb(null, exports.lint(data, options));
    });
};

exports.lintPath = require('./lint-path');
