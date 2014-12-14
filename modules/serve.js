var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),

    find = function (collection, property, name) {
        var i = 0,
            len = collection.length;

        for (; i < len; i++) {
            if (collection[i][property][0] == name) {
                return collection[i];
            }
        }
        return null;
    },

    getFile = function (serving, uri, callback) {

        var filename = path.join(process.cwd(), serving + uri);

        fs.exists(filename, function (exists) {
            if (!exists) {
                callback(null);
                return null;
            }

            if (fs.statSync(filename).isDirectory()) {
                filename += "/index.html";
            }

            fs.readFile(filename, "binary", function (error, file) {
                if (error) {
                    callback(null);
                    return;
                }
                callback(file);
            });
            return null;
        });

    },

    exports = {};

exports.config = function (callback) {
    callback();
};

exports.start = function (result) {
    result = result || {};

    if (global.config.distributions.length < result.distribution) {
        console.log(["\t\t\t\t=========================================",
                "\t\t\t\t Distribution '" + result.distribution + "' not found",
            "\t\t\t\t========================================="].join("\n"));
        return;
    }

    var distribution = global.config.distributions[result.distribution] || global.config.distributions[0],
        port = result.port,
        root = !!distribution.vars.ROOT ? distribution.vars.ROOT : "",
        serving = global.config.build.OUTPUT_DIRECTORY + "/" + root;

    http.createServer(function (request, response) {
        var requestArray = global.tools.request.breakdown(request.url).request,
            req = requestArray[requestArray.length - 1] || "index.html",
            unit = find(global.config.units, "destinations", req),
            vars = distribution.vars,
            binary;

        // If it's a build unit, build and serve
        if (unit !== null &&

                // And if this item is included in the build units list
                distribution.units.indexOf(unit.name) !== -1) {
            global.tools.builder.item(unit, vars, function (output) {
                response.write(output);
                response.end();
            });
            return;
        }

        // Search for a file in that name and uri
        binary = getFile("/" + serving, request.url, function (file) {
            if (file === null) {

                if (unit === null) {
                    console.log("File Not Found: \"" + req + "\"");
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.write("File or build not found: " + request.url);
                    response.end();
                    return;
                }
                global.tools.builder.item(unit, vars, function (output) {
                    if (output) {
                        response.write(output);
                        response.end();
                    } else {
                        response.writeHead(404, {"Content-Type": "text/plain"});
                        response.write("Build not found: " + request.url);
                        response.end();
                    }
                });
            } else {
                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            }
        });

    }).listen(port);
    console.log("Listening on port " + port + ", Serving directory " + distribution.name);
    console.log([
        "██████████████████████████████████████████████████████",
        "████████████████       ██       ██████████████████████",
        "████████████    ░░░░░░    ▓▓▓▓▓  █████████████████████",
        "██████████  ░░░░░░░░░░░░  ▓▓▓▓▓▓  ████████████████████",
        "████████  ░░░░░░            ▓▓▓▓  ███             ████",
        "██████  ░░░░░░                ▓  ███               ███",
        "██████  ░░    ▓▓▓▓▓▓▓▓▓▓▓▓      ███   LET'S A GO!   ██",
        "████        ▓▓▓▓▓▓  ▓▓  ▓▓  ░░░░  ██               ███",
        "████  ▓▓    ▓▓▓▓▓▓  ▓▓  ▓▓  ░░░░  ███             ████",
        "██  ▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ░░  ██████   ███████████",
        "██  ▓▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓  ░░  ████   █████████████",
        "████  ▓▓▓▓▓▓▓▓▓       ▓▓▓▓      ███   ████████████████",
        "██████    ▓▓▓▓▓▓▓           ░░  ██████████████████████",
        "████████      ▓▓▓▓▓▓▓▓▓▓  ░░░░  ██████████████████████",
        "██████  ░░░░              ░░  ████████████████████████",
        "████  ░░░░░░░░    ▓▓▓▓▓▓    ██████████████████████████",
        "██    ░░░░░░░░  ▓▓▓▓▓▓▓▓▓▓  ██████████████████████████",
        "██    ░░░░░░░░  ▓▓▓▓▓▓▓▓▓▓  ██████████████████████████",
        "██      ░░░░░░░░  ▓▓▓▓▓▓        ██████████████████████",
        "████      ░░░░░░                ██████████████████████",
        "██████                      ░░░░  ████████████████████",
        "████  ░░░░                ░░░░░░  ████████████████████",
        "██    ░░                  ░░░░░░  ████████████████████",
        "██  ░░░░                  ░░░░░░  ████████████████████",
        "██  ░░░░          ██████  ░░░░    ████████████████████",
        "██  ░░░░    ██████████████      ██████████████████████",
        "████    ██████████████████████████████████████████████",
        "██████████████████████████████████████████████████████"
    ].join("\n"));

};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}