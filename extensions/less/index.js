var less = require("less"),
    parser = new less.Parser(),

    exports = function (data, callback) {
        global.tools.file.concat(data.conf.sources, function (result) {
            var string = global.tools.stringReplacements(result.toString(), data.vars);
            try {
                less.render(string,
                        {
                            "strict-math": true    // -sm=on, --strict-math=on
                        },
                        function (err, output) {
                            if (err) {
                                console.error(err);
                                callback("");
                                return;
                            }
                            callback(data.vars.MINIFY === "true" ?
                                    global.tools.stringCram(output) :
                                    output);
                        });
                // parser.parse(string,
                //         function (err, tree) {
                //             if (err) {
                //                 console.error(err);
                //                 callback("");
                //             } else {
                //                 callback(data.vars.MINIFY === "true" ?
                //                         global.tools.stringCram(tree.toCSS()) :
                //                         tree.toCSS());
                //             }
                //         });
            } catch (err) {
                console.log([
                    "-------------------",
                    "LESS Parsing Error:",
                    "Message: " + err.message,
                    "Snippet: " + err.extract,
                    "Line: " + err.line + ", Column: " + err.column,
                    "-------------------"
                ].join("\n"));
                callback("");
            }
        });
    };

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}