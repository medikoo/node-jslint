'use strict';

var call         = Function.prototype.call
  , keys         = Object.keys
  , trim         = call.bind(String.prototype.trim)
  , parse        = JSON.parse
  , stringify    = JSON.stringify
  , fs           = require('fs')
  , path         = require('path')
  , dirname      = path.dirname
  , basename     = path.basename
  , resolve      = path.resolve
  , compact      = require('es5-ext/lib/Array/prototype/compact')
  , contains     = require('es5-ext/lib/Array/prototype/contains')
  , diff         = require('es5-ext/lib/Array/prototype/diff')
  , invoke       = require('es5-ext/lib/Function/invoke')
  , k            = require('es5-ext/lib/Function/k')
  , odiff        = require('es5-ext/lib/Object/prototype/diff')
  , omap         = require('es5-ext/lib/Object/prototype/map')
  , create       = require('es5-ext/lib/Object/prototype/plain-create')
  , endsWith     = require('es5-ext/lib/String/prototype/ends-with')
  , startsWith   = require('es5-ext/lib/String/prototype/starts-with')
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

lintDir = function (path, coreOptions, cb) {
    var cache = {}, cachePath = path + '/.lintcache', toClear = {}
      , options = {}, optToken = '*! opts !*';

    lint.prepOptions(coreOptions);

    cache[optToken] = coreOptions;
    deferred(
        // Get cache
        coreOptions.nocache ? {} : readFile(cachePath, 'utf-8')(
            function (content) {
                var data = parse(content)
                  , optdiff = odiff.call(data[optToken] || {}, coreOptions);
                if (optdiff[0].length || optdiff[2].length ||
                        (optdiff[1].length && ((optdiff[1].length > 1) ||
                        (optdiff[1][0] !== 'predef') ||
                        diff.call(data.predef, coreOptions.predef).length ||
                        diff.call(coreOptions.predef, data.predef).length))) {
                    toClear['.'] = true;
                }
                return data;
            },
            {}
        ),
        // Get filenames
        readdirDeep(path, { git: coreOptions.git, ignorefile: '.lintignore',
            pattern: /^([\u0000-\u002d\u002f-\uffff]+|[\u0000-\uffff]+\.js)$/ })
            .map(function (file) {
                if (endsWith.call(file, '.js')) {
                    return file;
                } else {
                    return isExecutable(path + '/' + file)(function (result) {
                        if (!result) {
                            return null;
                        }
                        var d = deferred(), stream;
                        stream = createReadStream(path + '/' + file,
                            { start: 0, end: 100 });
                        stream.on('data', function (data) {
                            d.resolve(re.test(data) ? file : null);
                        });
                        stream.on('end', d.resolve);
                        return d.promise;
                    });
                }
            }).invoke(compact)

    ).match(function (fcache, files) {
        // Read lint configuration
        var paths = {};
        files.forEach(function (file) {
            var dir = dirname(file);
            paths[dir] = true;
            file = dir;
            while ((dir = dirname(file)) !== file) {
                paths[dir] = true;
                file = dir;
            }
        });
        return deferred.map(keys(paths), function (subpath) {
            var confPath = path + '/' + subpath + '/.lint';
            return (options[subpath] = readFile(confPath, 'utf-8')(
                function (content) {
                    var conf = {};
                    content.trim().split('\n').map(trim).forEach(function (data) {
                        var name = data.split(/\s/, 1)[0], value = true;
                        if (data.length > name.length) {
                            value = data.slice(name.length).trim() || true;
                        }
                        if (contains.call(['indent', 'maxerr', 'maxlen'], name)) {
                            value = Number(value);
                        } else if (startsWith.call(name, 'predef')) {
                            value = value.split(/\s*,\s*/).sort();
                        } else if (contains.call(['0', 'false'], value)) {
                            value = false;
                        }
                        // console.log('nv', name, value);
                        conf[name] = value;
                    });
                    return lstat(confPath)(function (stat) {
                        var fpath = '.lint';
                        if (subpath !== '.') {
                            fpath = subpath + '/' + fpath;
                        }
                        if ((cache[fpath] = stat.mtime.getTime()) !=
                                fcache[fpath]) {
                            toClear[subpath] = true;
                        }
                    })(conf);
                },
                k(null)
            )(function (conf) {
                var dir = dirname(subpath);
                while (!options[dir]) {
                    dir = dirname(dir);
                }
                return deferred((dir === subpath) ? coreOptions : options[dir])(
                    function (pre) {
                        if (conf) {
                            if (conf['predef+']) {
                                conf.predef = pre.predef ?
                                        pre.predef.concat(conf['predef+']).sort() :
                                        conf['predef+'];
                                delete conf['predef+'];
                            } else if (conf['predef-']) {
                                if (pre.predef) {
                                    conf.predef = diff.call(
                                        pre.predef,
                                        conf['predef-']
                                    ).sort();
                                }
                                delete conf['predef-'];
                            }
                        }
                        if (dir !== subpath) {
                            while (dir !== '.') {
                                if (toClear[dir]) {
                                    toClear[subpath] = true;
                                    break;
                                }
                                dir = dirname(dir);
                            }
                        }
                        // console.log(subpath, pre);
                        return create.call(pre, conf);
                    }
                );
            }));
        })(function () {
            options = omap.call(options, invoke('valueOf'));

            // Remove cached not changed
            return coreOptions.nocache ? files : deferred.map(files,
                function (file) {
                    return fcache[file] ? lstat(path + '/' + file)(
                        function (stat) {
                            return (((cache[file] = stat.mtime.getTime())
                                == fcache[file]) && !toClear[dirname(file)]) ?
                                    null : file;
                        }
                    ) : file;
                }).invoke(compact);
        });

        // Lint files
    }).map(function (file) {
        return readFile(path + '/' + file, 'utf-8')(function (content) {
            content = lint.lint(content, options[dirname(file)]);
            content.filename = file;
            return content;
        });

        // Clear ones without errors and take their modification date for cache
    }, null, 100).map(function (data) {
        if (!data.errors.length) {
            return (coreOptions.nocache || cache[data.filename]) ?
                    null : lstat(path + '/' + data.filename)(
                function (stat) {
                    cache[data.filename] = stat.mtime.getTime();
                }
            );
        } else {
            if (!coreOptions.nocache) {
                delete cache[data.filename];
            }
            return data;
        }
    }).invoke(compact)(function (data) {
        return writeFile(cachePath, stringify(cache))(data);
    }).end(cb);
};
