// publication
exports = function (result) {
    var distribution = global.config.distributions[result.distribution] || global.config.distributions[0];
    distribution.vars.PROCESS = process.cwd() + "/" + global.config.build.SOURCES_DIRECTORY + "/";
    return distribution;
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}