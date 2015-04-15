var exports = function (data, callback) {
    global.tools.file.concat(data.conf.sources, function (result) {
        var string = global.tools.stringReplacements(result.toString(), data.vars);
        callback(data.vars.MINIFY === "true" ?
                global.tools.stringCram(string) :
                string);
    });
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}