var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),

    findUnit = function (destination) {
        var key;
        for (key in global.config.units) {
            if (global.config.units.hasOwnProperty(key)) {
                if (global.config.units[key].destinations[0] === destination) {
                    return global.config.units[key];
                }
            }
        }
        return null;
    },

    getFile = function (distribution, serving, uri, callback) {
        var filename = path.join(process.cwd(), serving + uri);
        fs.exists(filename, function (exists) {
            if (!exists) {
                callback(null);
                return;
            }
            if (fs.statSync(filename).isDirectory()) {

                // Serve index file instead
                getFile(distribution,
                        serving,
                        uri + "/" + (distribution.vars.INDEX || "index.html"),
                        callback);
                return;
            }
            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    console.error(err);
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
    if (!global.config.distributions.hasOwnProperty(result.name)) {
        console.log(["\t\t\t\t=========================================",
                "\t\t\t\t Distribution '" + result.name + "' not found",
            "\t\t\t\t========================================="].join("\n"));
        return;
    }

    var name = result.name,
        port = result.port,
        distribution = global.tools.publication(name),
        root = !!distribution.vars.ROOT ? distribution.vars.ROOT : "",
        serving = global.config.build.OUTPUT_DIRECTORY + "/" + root,

        serverCallout = function serverCallout (request, response) {
            var requestArray = global.tools.request.breakdown(request.url).request,
                req = requestArray[requestArray.length - 1] || (distribution.vars.INDEX || "index.html"),
                unit;

            // if (request.url[request.url.length - 1] === "/") {

            // }

            // Search for our file
            getFile(distribution,
                    "/" + serving,
                    request.url,
                    function (file) {
                        if (file === null) {
                            unit = findUnit(req);
                            
                            // TODO: Decide if necessary
                            // See if this unit is a part of the distribution
                            if (distribution.units.indexOf(req) === -1) {
                                global.tools.logTitle(req + " is served but is not listed in the distribution");
                            }

                            // Unit found, build and serve
                            if (unit !== null) {
                                global.tools.builder.item(unit, 
                                        distribution.vars,
                                        function (output) {
                                            response.writeHead(200);
                                            response.write(output);
                                            response.end();
                                        });
                                return;
                            }

                            // Unit not found (also file not found)
                            if (unit === null) {
                                if (distribution.vars.hasOwnProperty("NOT_FOUND") &&
                                        request.url !== distribution.vars["NOT_FOUND"]) {

                                    global.tools.logTitle(["Neither file nor build unit found: \"/",
                                                serving + "/" + request.url + "\". ",
                                                "Serving \"" + distribution.vars["NOT_FOUND"] + "\" instead"
                                            ].join(""));

                                    // Make the new request instead of the client
                                    request.url = distribution.vars["NOT_FOUND"];
                                    serverCallout(request, response);
                                } else {
                                    response.writeHead(404, {
                                            "Content-Type": "text/plain",
                                            "Error-Description": "Not Found"
                                        });
                                    response.write([
                                            "Request URL: " + request.url,
                                            "Unit Name: " + name,
                                            "File and Unit not found"
                                        ].join("\n"));
                                    response.end();
                                }
                                return;
                            }

                            // Unit exists. Let's build it
                            global.tools.builder.item(unit, distribution.vars, function (output) {
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

    if (global.config.build.SSL) {
        fs.readFile(global.config.build.CERTIFICATE,
                "binary",
                function (err, file) {
            if (err) { console.error(err); return; }
            https.createServer({
                pfx: file,
                passphrase: global.config.build.PASSPHRASE
            }, serverCallout).listen(port);
        });
    } else {
        http.createServer(serverCallout).listen(port);
    }

    console.log([
        "````````````````````````````````````````````````````````````````````````````````",
        "     Listening on port " + port + ", Serving directory \"" + name + "\"",
        "                         __o",
        "                        -\\<,",
        "                        O/ O                                   Let's Roll!",
        "````````````````````````````````````````````````````````````````````````````````",
        ""
    ].join("\n"));
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}