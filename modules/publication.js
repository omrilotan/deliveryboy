// publication
exports = function (index) {
    var distribution;
    if (global.config.distributions.hasOwnProperty(index)) {
        distribution = global.config.distributions[index];
    } else {
        distribution = global.config.distributions[0];
        console.log("Distribution " + index + " was not found. Building " + distribution.name);
    }
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