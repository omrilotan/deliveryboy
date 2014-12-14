var extensions = {},

    exports = {};

exports.config = function (callback) {
    var ready = false;
    global.tools.file.readDir("modules/extensions", function (result) {
        var i = 0,
            len = result.length;
        if (len === 0) {
            callback();
            return;
        }
        result.forEach(function (item) {
            extensions[item] = require("./extensions/" + item);
        });
        callback();
    });
};

exports.parse = function (data, vars, callback) {
    if (typeof extensions[data.type] !== "function") {
        console.log("Missing extension " + data.type);
        return;
    }
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