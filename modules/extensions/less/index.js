var less = require("less"),
    parser = new less.Parser(),

    exports = function (data, callback) {
        global.tools.file.concat(data.conf.sources, function (result) {
            var string = global.tools.stringReplacements(result.toString(), data.vars);
            parser.parse(string,
                    function (err, tree) {
                        if (err) {
                            console.error(err)
                        }
                        callback(data.vars.MINIFY === "true" ?
                                global.tools.stringCram(tree.toCSS()) :
                                tree.toCSS());
                    });
        });
    };

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}