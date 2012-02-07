#!/usr/bin/env node

var flatten  = require('es5-ext/lib/Array/prototype/flatten');
var deferred = require('deferred');
var linter = require("../lib/linter");
var reporter = require("../lib/reporter");
var color = require("../lib/color");
var nopt = require("nopt");
var fs = require("fs");

var lintPath = deferred.promisify(linter.lintPath);

function commandOptions() {
    'use strict';
    var flags = [
        'bitwise', 'browser', 'cap', 'confusion', 'continue', 'css',
        'debug', 'devel', 'eqeq', 'es5', 'evil', 'forin', 'fragment', 'git',
        'newcap', 'nocache', 'node', 'nomen', 'on', 'passfail', 'plusplus',
        'properties', 'regexp', 'rhino', 'undef', 'unparam',
        'sloppy', 'sub', 'vars', 'white', 'widget', 'windows',
        'json', 'color'
    ],
    commandOpts = {
        'indent' : Number,
        'limit'  : Number,
        'maxerr' : Number,
        'maxlen' : Number,
        'predef' : [String, Array]
    };

    flags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}

var options = commandOptions();

var parsed = nopt(options);

function die(why) {
    'use strict';
    console.warn(why);
    console.warn("Usage: " + process.argv[1] +
        " [--" + Object.keys(options).join("] [--") +
        "] [--] <scriptfile>...");
    process.exit(1);
}

if (!parsed.argv.remain.length) {
    die("No files specified.");
}


if (!parsed.limit) {
    parsed.limit = 5;
}

deferred.map(parsed.argv.remain, function (path) {
    return lintPath(path, parsed);
}).invoke(flatten)(function (files) {
    if (files.length) {
        files.slice(0, parsed.limit).forEach(function (file) {
            reporter.report(file.filename, file, parsed.color);
        });
        if (files.length > parsed.limit) {
            console.log(color.bold(color.red("... and more errors in " +
                (files.length - parsed.limit) + " files.\n")));
        }
        process.exit(1);
    } else {
        process.exit(0);
    }
}).end();
