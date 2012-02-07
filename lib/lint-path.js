'use strict';

var parse        = JSON.parse
  , stringify    = JSON.stringify
  , fs           = require('fs')
  , path         = require('path')
  , resolve      = path.resolve
  , compact      = require('es5-ext/lib/Array/prototype/compact')
  , endsWith     = require('es5-ext/lib/String/prototype/ends-with')
  , deferred     = require('deferred')
  , lint         = require('./linter')
  , promisify    = deferred.promisify
  , readdirDeep  = promisify(require('next/lib/fs/readdir-files-deep'))
  , isExecutable = promisify(require('next/lib/fs/is-executable'))

  , readFile = promisify(fs.readFile), writeFile = promisify(fs.writeFile)
  , lstat = promisify(fs.lstat), createReadStream = fs.createReadStream

  , re, lintDir;

re = /^#![\u0021-\uffff]+(?:\/node|\/env node)\s/;

module.exports = function (path, options, cb) {
    fs.lstat(path, function (err, stat) {
        if (err) {
            cb(err);
            return;
        }
        if (stat.isDirectory()) {
            lintDir(path, options, cb);
        } else if (stat.isFile()) {
            lint.lintFile(path, options, function (err, result) {
                if (err) {
                    cb(err);
                    return;
                }
                result.filename = path;
                cb(null, result);
            });
        } else {
            cb(new Error("Given path is neither file or directory"));
        }
    });
};

lintDir = function (path, options, cb) {
    var cache = {}, cachePath = path + '/.lintcache';
    deferred(
        // Get cache
        options.nocache ? {} : readFile(cachePath, 'utf-8')(function (content) {
            return parse(content);
        }, {}),
        // Get filenames
        readdirDeep(path, { git: options.git, ignorefile: '.lintignore',
            pattern: /^([\u0000-\u002d\u002f-\uffff]+|[\u0000-\uffff]+\.js)$/ })
            .map(function (file) {
                if (endsWith.call(file, '.js')) {
                    return file;
                } else {
                    return isExecutable(path + '/' + file)(function (result) {
                        if (!result) {
                            return null;
                        }
                        var d = deferred();
                        createReadStream(path + '/' + file,
                            { start: 0, end: 100 }).on('data', function (data) {
                                d.resolve(re.test(data) ? file : null);
                            });
                        return d.promise;
                    });
                }
            }).invoke(compact)

        // Remove cached not changed
    ).match(function (fcache, files) {
        return options.nocache ? files : deferred.map(files, function (file) {
            return fcache[file] ? lstat(path + '/' + file)(function (stat) {
                return ((cache[file] = stat.mtime.getTime()) == fcache[file]) ?
                    null : file;
            }) : file;
        }).invoke(compact);

        // Lint files
    }).queue(100, function (file) {
        return readFile(path + '/' + file, 'utf-8')(function (content) {
            content = lint.lint(content, options);
            content.filename = file;
            return content;
        });

        // Clear ones without errors and take their modification date for cache
    }).map(function (data) {
        if (!data.errors.length) {
            return (options.nocache || cache[data.filename]) ?
                null : lstat(path + '/' + data.filename)(
                    function (stat) {
                        cache[data.filename] = stat.mtime.getTime();
                    }
                );
        } else {
            if (!options.nocache) {
                delete cache[data.filename];
            }
            return data;
        }
    }).invoke(compact)(function (data) {
        return writeFile(cachePath, stringify(cache))(data);
    }).end(cb);
};
