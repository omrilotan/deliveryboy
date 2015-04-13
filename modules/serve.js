var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),

    find = function (collection, property, name) {
        var i = 0,
            len = collection.length;

        for (; i < len; i++) {
            if (!collection[i].hasOwnProperty(property)) {
                console.log("This collection has no 'destinations' property");
            } else if (collection[i][property][0] == name) {
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
                return;
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
        });

    },

    exports = {};

exports.config = function (callback) {
    callback();
};

exports.start = function (result) {
    var serverCallout = function serverCallout (request, response) {
        var requestArray = global.tools.request.breakdown(request.url).request,
            req = requestArray[requestArray.length - 1] || "index.html",
            unit = find(global.config.units, "destinations", req),
            vars = distribution.vars;

        // If it's a build unit, build and serve
        if (unit !== null &&

                // And if this item is included in the build units list
                distribution.units.indexOf(unit.name) !== -1) {
            global.tools.builder.item(unit, vars, function (output) {
                response.writeHead(200);
                response.write(output);
                response.end();
            });
            return;
        }

        // Search for a file in that name and uri
        getFile("/" + serving, request.url, function (file) {
            if (file === null) {

                // File not found, Build unit not found
                if (unit === null) {
                    
                    console.log(["Neither file nor build unit found: \"/",
                                serving + request.url + "\"",
                                "Redirecting to \"index.html\""
                            ].join(""));

                    request.url = "index.html";
                    serverCallout(request, response)
                    return;

                    // console.log("Neither file nor build unit found: \"/" + serving + request.url + "\"");
                    // response.writeHead(404, {
                    //         "Content-Type": "text/plain",
                    //         "Error-Description": "Not Found"
                    // });
                    // response.write("Not found: " + request.url);
                    // response.end();
                    // return;
                }

                // If 'unit' exists, build it
                global.tools.builder.item(unit, vars, function (output) {
                    if (output) {
                        response.writeHead(200);
                        response.write(output);
                        response.end();
                    } else {
                        response.writeHead(502, {
                                "Content-Type": "text/plain",
                                "Error-Description": "Bad Gateway"
                            });
                        response.write("Build unsuccessful: " + request.url);
                        response.end();
                    }
                });
            } else {
                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            }
        });
    };

    result = result || {};

    if (global.config.distributions.length < result.distribution) {
        console.log(["\t\t\t\t=========================================",
                "\t\t\t\t Distribution '" + result.distribution + "' not found",
            "\t\t\t\t========================================="].join("\n"));
        return;
    }

    var distribution = global.tools.publication(result),
        port = result.port,
        root = !!distribution.vars.ROOT ? distribution.vars.ROOT : "",
        serving = global.config.build.OUTPUT_DIRECTORY + "/" + root;

    if (global.config.build.SSL) {
        fs.readFile(global.config.build.CERTIFICATE,
                "binary",
                function (error, file) {
            if (error) {
                console.log(error);
                return;
            }
            https.createServer({
                pfx: file,
                passphrase: global.config.build.PASSPHRASE
            }, serverCallout).listen(port);
        });
    } else {
        http.createServer(serverCallout).listen(port);
    }



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