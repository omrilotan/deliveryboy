var exports = {};

exports.config = function (callback) {
    callback();    // No configuration required
};

exports.item = function (unit, vars, callback) {
    
    // Remove commented out items, marked with hash sign (#) as first character
    unit.sources = unit.sources.filter(function (source) {
        return source.indexOf("#") !== 0;
    });
    unit.sources.forEach(function (source, index, array) {
        array[index] = global.config.build.SOURCES_DIRECTORY +
                "/" +
                global.tools.stringReplacements(source, vars);
    });

    global.tools.render.parse({
                    type: unit.type,
                    sources: unit.sources,
                    destination: unit.destinations[0]
                },
                vars,
                callback);
};

exports.build = function (distribution, callback) {
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

    item = global.tools.publication(distribution);
    
    console.log([
        "",
        "                         __o",
        "                        -\\<,",
        "    Start building:     O/ O       \"" + item.name + "\"",
        "`````````````````````````````````````````````````````",
        ""
        ].join("\n"));

    // Count only the units with any sources
    total = item.units.length;

    item.units.forEach(function (name) {
        var root,
            unit;
        if (!global.config.units.hasOwnProperty(name)) {
            global.tools.logTitle(name + " unit is not configured");
            return;
        }
        root = [
            global.config.build.OUTPUT_DIRECTORY,
            item.vars.ROOT,
            ""
        ].join("/");
        unit = global.config.units[name];

        global.tools.lastBuild(root);

        exports.item(unit,
                item.vars,
                function (output) {
                batch.push(function (callback) {
                    var destination = root + unit.destinations[0];
                    if (typeof output === "string") {
                        global.tools.file.write(destination,
                                output,
                                function (location) {
                                    ++finished;
                                    console.log("written: " +
                                            item.vars.ROOT +
                                            ", " +
                                            finished +
                                            "/" +
                                            total +
                                            " ~> " +
                                            location);

                                    if (finished === total) {
                                        callback();
                                    }
                        });
                    } else {
                        ++finished;
                        console.log("written: " +
                                item.vars.ROOT +
                                ", " +
                                finished +
                                "/" +
                                total +
                                " -> " +
                                destination);

                        if (finished === total) {
                            callback();
                        }
                    }
                });

                // After all batches were assigned, call on them
                ++i;
                if (i === item.units.length) {
                    callBatch(callback);
                }
            });


    });

    // return;



    // units.forEach(function (unit) {
    //     var u = find(global.config.units, unit),
    //         root =  global.config.build.OUTPUT_DIRECTORY +
    //                         "/" +
    //                         item.vars.ROOT +
    //                         "/";

    //     if (u === null) {
    //         global.tools.logTitle(unit + " not specified in units list");
    //         callback("");
    //         return;
    //     }

    //     global.tools.lastBuild(root);

    //     exports.item(u,
    //         item.vars,
    //         function (output) {
    //             batch.push(function (callback) {
    //                 var destination = root + u.destinations[0];
    //                 if (typeof output === "string") {
    //                     global.tools.file.write(destination,
    //                             output,
    //                             function (location) {
    //                                 ++finished;
    //                                 logFile(item.vars.ROOT + ", " + finished + "/" + total + " ~> " + location);
    //                                 if (finished === total) {
    //                                     callback();
    //                                 }
    //                     });
    //                 } else {
    //                     ++finished;
    //                     logFile(item.vars.ROOT + ", " + finished + "/" + total + " -> " + destination);
    //                     if (finished === total) {
    //                         callback();
    //                     }
    //                 }
    //             });

    //             // After all batches were assigned, call on them
    //             ++i;
    //             if (i === units.length) {
    //                 callBatch(callback);
    //             }
    //         });
    // });
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}