var exports = function (data, callback) {
        var base = global.config.build.OUTPUT_DIRECTORY +
                "/" +
                data.vars.ROOT +
                "/" +
                data.conf.destination,

            i = 0,
            len = data.conf.sources.length;

        data.conf.sources.forEach(function (source) {
            global.tools.file.copyDir(source, base, function () {
                        ++i;
                        if (i === len) {
                            callback(null);
                        }
                    });
        });
    };

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}