var exports = {};

exports.builder     = require("./builder");
exports.prompter    = require("./prompter");
exports.serve       = require("./serve");
exports.publication = require("./publication");
exports.file        = require("./file");
exports.render      = require("./render");
exports.serve       = require("./serve");
exports.request     = require("./request");
exports.ready       = require("./ready");
exports.first       = require("./first");

////////////////////////////////
// Miscellaneous useful tools //
////////////////////////////////

// remove line breaks and double spaces
exports.stringCram = function (string) {
    return string.replace(/\n|\r/gmi, "").replace(/\s{2,}/gmi, " ");
};

// Replace representations of global constants
exports.stringReplacements = function (string, data) {
    if (typeof data !== "object") {
        throw Error("Second argument must be an object");
    }
    if ((new RegExp(global.config.constants.tags.OPEN +
                    ".*" +
                    global.config.constants.tags.CLOSE,
                "gmi")).test(string)) {
        
        // Iterate through an array of matches
        string.match(new RegExp(global.config.constants.tags.OPEN +
                    ".*?" +
                    global.config.constants.tags.CLOSE,
                "gmi")).forEach(function (item) {
                    var clean = exports.stringClean(item);
                    if (data.hasOwnProperty(clean)) {
                        string = string.replace(item, data[clean]);
                    } else if (clean !== "") {
                        console.log(["\t\t\t\t======================",
                                     "\t\t\t\t Missing variable:" + clean,
                                     "\t\t\t\t======================"].join("\n"));
                    } else {
                        console.log(["\t\t\t\t======================",
                                     "\t\t\t\t Empty variable: (" + item + ")",
                                     "\t\t\t\t======================"].join("\n"));
                    }
                });
    }
    return string;
};

// Remove representations of global constants
exports.stringClean = function (string) {
    return string.replace((new RegExp(global.config.constants.tags.OPEN)), "")
            .replace((new RegExp(global.config.constants.tags.CLOSE)), "");
};

exports.numberToDoubleDigit = function (num) {
    return num < 10 ? "0" + num : num;
};

exports.listNumber = function (list) {
    var returnList = [];
    list.forEach(function (item, index) {
        returnList.push("(" + index + ") " + item);
    });
    return returnList;
};

exports.listAttribute = function (list, attribute) {
    var returnList = [];
    list.forEach(function (item) {
        returnList.push(item[attribute]);
    });
    return returnList;
};

exports.objectCombine = function () {
    var subject,
        combined = {},
        key;
    while (arguments.length) {
        subject = [].shift.call(arguments);
        if (typeof subject === "object") {
            for (key in subject) {
                if (subject.hasOwnProperty(key)) {
                    combined[key] = subject[key];
                }
            }
        }
    }
    return combined;
};

exports.collectionFilter = function (collection, fn) {
    var key;
    for (key in collection) {
        if (collection.hasOwnProperty(key)) {
            if (!fn(collection[key])) {
                delete collection[key];
            }
        }
    }
    return collection;
};

exports.forIn = function (object, fn) {
    var key;
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            fn.call(object[key], object[key], object);
        }
    }
    return object;
};

exports.logTitle = function (string) {
    var character = "=",
        line = (new Array(string.length + 5)).join(character);
    console.log([
            line,
            line,
            character + " " + string + " " + character,
            line,
            line
        ].join("\n"));
};

// create a last-build text file
exports.lastBuild = function (root) {
    var now = (function (date) {

        // Formats a date to a "yyyy/MM/dd hh:mm:ss" string
        return date.getFullYear() +
                "/" +
                exports.numberToDoubleDigit(date.getMonth() + 1) +
                "/" +
                exports.numberToDoubleDigit(date.getDate()) +
                " " +
                exports.numberToDoubleDigit(date.getHours()) +
                ":" +
                exports.numberToDoubleDigit(date.getMinutes()) +
                ":" +
                exports.numberToDoubleDigit(date.getSeconds());
        }(new Date())),
        content = [
            "Last Build Date and Time",
            root,
            now
        ].join("\n");
    
    global.tools.file.write(root + "last-build.txt",
            content);
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}