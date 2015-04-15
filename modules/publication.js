// publication
exports = function (name) {
    var distribution;

    if (global.config.distributions.hasOwnProperty(name)) {
        distribution = global.config.distributions[name];
    } else {
        global.tools.logTitle("Distribution " + name + " was not found. Building");
        return null;
    }
    distribution.vars.PROCESS = process.cwd() + "/" + global.config.build.SOURCES_DIRECTORY + "/";

    distribution.vars = (function (vars) {
        vars.ROOT = vars.ROOT || "";
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