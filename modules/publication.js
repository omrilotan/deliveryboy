// publication
exports = function (result) {
    var distribution = global.config.distributions[result.distribution] || global.config.distributions[0];
    distribution.vars.PROCESS = process.cwd() + "/" + global.config.build.SOURCES_DIRECTORY + "/";

    distribution.vars = (function (vars) {
        vars.ROOT = vars.ROOT || "";

        console.log(global.config.constants.hasOwnProperty("assets"));
        if (global.config.constants.hasOwnProperty("assets")) {
            vars = global.tools.objectCombine(vars,
                    global.config.constants.assets);
        }
        return vars;
    }(distribution.vars));

    return distribution;
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}