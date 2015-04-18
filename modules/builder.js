var exports = {};

exports.config = function (callback) {
    callback();    // No configuration required
};

exports.item = function (unit, vars, callback) {
    
    // Remove commented out items, marked with hash sign (#) as first character
    unit.sources = unit.sources.filter(function (source) {
        return source.indexOf("#") !== 0;
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

    // Get the requested distribution details
    var item = global.tools.publication(distribution),
        name = distribution,
        batch = [],
        callBatch = function (callback) {
            // Write all files
            while (batch.length) {
                batch.shift()(callback);
            }
        },
        units,
        counter = 0,
        finished = 0,
        total = item.units.length;    // Count only the units with any sources
    
    console.log([
        "",
        "                         __o",
        "                        -\\<,",
        "    Start building:     O/ O       \"" + name + "\"",
        "`````````````````````````````````````````````````````",
        ""
        ].join("\n"));

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
                    var destination = root + unit.destinations[0],
                        isFinished = function () {
                            ++finished;
                            console.log([
                                    "written: ",
                                    item.vars.ROOT,
                                    ", ",
                                    finished,
                                    "/",
                                    total,
                                    " -> ",
                                    "\"",
                                    destination,
                                    "\""
                                ].join(""));
                            if (finished === total) {
                                callback();
                            }
                        };

                    if (typeof output === "string") {
                        global.tools.file.write(destination,
                                output,
                                isFinished);
                    } else {
                        isFinished();
                    }
                });

                // After all batches were assigned, call on them
                ++counter;
                if (counter === item.units.length) {
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