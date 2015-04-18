var extensions = {},
    exports = {};

// Load all extensions for rendering files
exports.config = function (callback) {
    global.tools.file.readDir("extensions", function (result) {
        var i = 0,
            len = result.length;
        result.forEach(function (item) {
            extensions[item] = require("../extensions/" + item);
        });
        callback();
        return;
    });
};

// Parse a unit by it's type (using respective extension)
exports.parse = function (data, vars, callback) {
    var sources = [];

    // Missing engine
    if (typeof extensions[data.type] !== "function") {
        global.tools.logTitle("Missing extension " + data.type);
        return;
    }

    // No sources
    if (!data.sources.length) {
        global.tools.logTitle(data.destination + " has no sources");
        return;
    }

    // TODO: Add explanation to this
    data.sources.forEach(function (source, index, array) {
        sources[index] = global.config.build.SOURCES_DIRECTORY +
                "/" +
                global.tools.stringReplacements(source, vars);
    });
    data.sources = sources;

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