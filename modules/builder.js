var find = function (array, key) {
        var i = 0,
            len = array.length;
        for (; i < len; i++) {
            if (array[i].name === key) {
                return array[i];
            }
        }
        return null;
    },
    logFile = function (message) {
        console.log(["========",
                     "written: " + message,
                     "========"].join("\n"));
    },

    exports = {};

exports.config = function (callback) {
    callback();
};

exports.item = function (unit, vars, callback) {
    var sources = [];
    
    unit.sources.forEach(function (source) {

        // Remove commented out items, marked with Number sign (#) as first character
        if (source.indexOf("#") === 0) {
            // console.log("Skipped commented out file \"" + source + "\"");
            return;
        }

        sources.push(global.config.build.SOURCES_DIRECTORY +
                "/" +
                global.tools.stringReplacements(source, vars));
    });

    global.tools.render.parse({
                    type: unit.type,
                    sources: sources,
                    destination: unit.destinations[0]
                },
                vars,
                callback);
};

exports.build = function (distribution, callback) {
    console.log(["================",
                 " Start building: " + distribution.name,
                 "================"].join("\n"));

    var item,
        batch = [],
        callBatch = function (callback) {
            // Write all files
            while (batch.length) {
                batch.shift()(callback);
            }
        },
        units,
        i = 0,

        finished = 0,
        total;

    // Get the requested distribution details
    item = distribution;

    // global.config.units
    units = item.units.filter(function (unit) {
        var specification = find(global.config.units, unit);
        if (specification === null) {

            // specification.destinations[0]
            console.log("Unit " +
                unit +
                " missing specification");
            return false;
        }
        // Report no source files to the console
        if (specification.sources.length === 0) {
            console.log("Unit " +
                specification.destinations[0] +
                " has no assigned source files");
        }
        return !!specification.sources.length;
    });

    // Count only the units with any sources
    total = units.length;

    units.forEach(function (unit) {
        var u = find(global.config.units, unit),
            root =  global.config.build.OUTPUT_DIRECTORY +
                            "/" +
                            item.vars.ROOT +
                            "/";

        if (u === null) {
            console.log(unit + " not specified in units list");
            callback("");
            return;
        }

        global.tools.lastBuild(root);

        exports.item(u,
            item.vars,
            function (output) {
                batch.push(function (callback) {
                    var destination = root + u.destinations[0];
                    if (typeof output === "string") {
                        global.tools.file.write(destination,
                                output,
                                function (location) {
                                    ++finished;
                                    logFile(item.vars.ROOT + ", " + finished + "/" + total + " ~> " + location);
                                    if (finished === total) {
                                        callback();
                                    }
                        });
                    } else {
                        ++finished;
                        logFile(item.vars.ROOT + ", " + finished + "/" + total + " -> " + destination);
                        if (finished === total) {
                            callback();
                        }
                    }
                });

                // After all batches were assigned, call on them
                ++i;
                if (i === units.length) {
                    callBatch(callback);
                }
            });
    });
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}