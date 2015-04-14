var extensions = {},
    exports = {};

// Get all extensions rendering files
exports.config = function (callback) {
    global.tools.file.readDir("modules/extensions", function (result) {
        var i = 0,
            len = result.length;
        result.forEach(function (item) {
            extensions[item] = require("./extensions/" + item);
        });
        callback();
        return;
    });
};

// Parse a unit by it's type (using respective extension)
exports.parse = function (data, vars, callback) {

    // Missing engine
    if (typeof extensions[data.type] !== "function") {
        exports.logTitle("Missing extension " + data.type);
        return;
    }

    // No sources
    if (!data.sources.length) {
        cexports.logTitle(data.destination + " has no sources");
        return;
    }

    // Cool!
    extensions[data.type].call(null, {
        conf: data,
        vars: vars
    }, callback);
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}