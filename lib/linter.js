'use strict';

var JSLINT = require("../lib/nodelint");

function addDefaults(options) {
    ['module', 'es5'].forEach(function (opt) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = true;
        }
    });
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

    options = options || {};
    delete options.argv;
    options = addDefaults(options);

    if (options.predef && !Array.isArray(options.predef)) {
        options.predef = options.predef.split(',')
            .filter(function (n) { return !!n; });
    }

    var ok = JSLINT(script, options),
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
