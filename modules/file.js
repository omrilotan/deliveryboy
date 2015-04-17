var fs = require("fs"),
    ncp = require("ncp").ncp,
    mkdirp = require("../node_modules/mkdirp"),
    path = require("path"),
    options = {
        encoding: "utf-8"
    },

    exports = {};

exports.read = function (location, callback) {
    fs.readFile(location,
            options,
            function (err, data) {
                if (err && typeof err.path === "string") {
                    global.tools.logTitle("Path Not Found: " + err.path);
                }
                if (err) { console.error(err); callback(""); return; };
                callback(data);
            });
};

exports.readDir = function (location, callback) {
    fs.readdir(location, function (err, files) {
        if (err) { console.error(err); return };
        callback(files.filter(function (file) {
            
            // Ignore "hidden" files
            return file.indexOf(".") !== 0;
        }));
    });
};

exports.readFilesInDir = function (location, callback) {
    var contents = [];
    exports.readDir(location, function (files) {
        var i = 0,
            len = files.length;
        files.forEach(function (file, index) {
            exports.read(location + "/" + file, function (content) {
                ++i;
                contents[index] = {
                    name: file,
                    content: content
                };
                if (i === len) {
                    callback(contents);
                }
            });
        });
    });
};

exports.notHidden = function (file) {
    return file.indexOf(".") !== 0;
};

// Convert a directory tree to an object
exports.objectifyDir = function (location, callback) {
    var obj = {};
    exports.readDir(location, function (files) {
        var i = 0,
            len,
            check = function () {
                if (i === len) {
                    callback(obj);
                }
            };
        files = files.filter(exports.notHidden);
        len = files.length;

        if (len === 0) { callback({}); }    // Empty directories
        files.forEach(function (file, index) {
            details = path.resolve(location, file);
            fs.stat(details, function(err, stat) {
                var path = location + "/" + file,
                    name = file.indexOf(".") > -1 ? file.substring(0, file.lastIndexOf(".")) : file;

                // Directory
                if (stat && stat.isDirectory()) {
                    exports.objectifyDir(path, function (result) {
                        obj[name] = result;
                        ++i;
                        check();
                    });

                // File (should be JSON)
                } else {
                    exports.read(path, function (content) {
                        try {
                            obj[name] = JSON.parse(content);
                        } catch (err) {
                            global.tools.logTitle("ERROR IN \"" + file + "\":");
                            throw err;
                        }
                        ++i;
                        check();
                    });
                }
            });
        });
    });
};

exports.makeDir = function (location, callback) {
    mkdirp(location, function (err) {
        if (err) { console.error(err); return };
        if (typeof callback === "function") { callback(); }
    });
};

exports.copyDir = function (from, to, callback) {
    exports.makeDir(to, function () {
        ncp(from,
                to,
                function (err) {
                    if (err) { console.error(err); return }
                    if (typeof callback === "function") { callback(); }
                });
    });
};

exports.write = function (location, data, callback) {
    exports.makeDir(path.dirname(location), function () {
        fs.writeFile(location,
                data,
                options,
                function (err) {
                    if (err) { console.error(err); return };
                    if (typeof callback === "function") { callback(location); }
                });
    });
};

exports.concat = function (files, callback) {
    var result = [],
        i = 0;

    files.forEach(function (file, index) {
        exports.read(file, function (data) {
            result[index] = data;
            if (++i === files.length) {
                if (typeof callback === "function") { callback(result.join("\n")); }
            }
        });
    });
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}