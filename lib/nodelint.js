/*jslint
    nomen: true
 */
var vm = require("vm");
var fs = require("fs");

var ctx = vm.createContext({ console: console });

vm.runInContext(fs.readFileSync(__dirname + "/jslint.js"), ctx,
    __dirname + '/jslint.js');

module.exports = ctx.JSLINT;
