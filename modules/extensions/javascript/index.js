var UglifyJS = require("uglify-js"),
    jshint = require("jshint").JSHINT,

    testJSSource = function (data, source, callback) {
        var response = [];
        global.tools.file.read(source, function (result) {
            var pass = jshint(result);
            if (pass) {
                // console.log("No errors in file " + source);
            } else {
                response.push("===============");
                response.push("Errors in file " + source);
                response.push("===============");
                jshint.data().errors.forEach(function (error) {
                    response.push(error.line + ":" + error.character + " -> " + error.reason + " -> " + error.evidence);
                });
                response.push("===============");
            }
            callback(response.join("\n"));
        });
    },
    testJSSources = function (data, after) {
        var output = [],
            i = 0,
            len = data.conf.sources.length,
            log = [];

        data.conf.sources.forEach(function (source, index) {
            testJSSource(data, source, function (result) {
                output[index] = result;
                ++i;
                if (i === len) {
                    log.push("\t\t\t\t=====================");
                    log.push("\t\t\t\t Javascript Warnings:");
                    log.push("\t\t\t\t=====================");
                    log.push(output.join("\n"));
                    after();
                }
            });
        });

        // If there are any warnings
        if (log.length) {
            console.log(log);
        }
    },

    exports = function (data, callback) {
        var after = function () {
            global.tools.file.concat(data.conf.sources, function (result) {
                var string = global.tools.stringReplacements(result.toString(),
                        data.vars);

                if (data.vars.MINIFY === "true") {
                    callback(UglifyJS.minify(string, {
                                fromString: true,
                                drop_debugger: true,
                                warnings: false
                            }).code);
                } else {
                    callback(string);
                }
            });
        };

        // Test Javascript
        testJSSources(data, after);
    };


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}