var exports = {};

exports.builder     = require("./builder");
exports.prompter    = require("./prompter");
exports.actions     = require("./actions");
exports.serve       = require("./serve");
exports.publication = require("./publication");
exports.file        = require("./file");
exports.render      = require("./render");
exports.serve       = require("./serve");
exports.request     = require("./request");
exports.ready       = require("./ready");
exports.first       = require("./first");

exports.stringClean = function (string) {
    return string.replace((new RegExp(global.config.constants.tags.OPEN)), "")
            .replace((new RegExp(global.config.constants.tags.CLOSE)), "");
};

exports.stringCram = function (string) {
    return string.replace(/\n|\r/gmi, "").replace(/\s{2,}/gmi, " ");
};

exports.stringReplacements = function (string, data) {
    if (typeof data !== "object") {
        throw Error("Second argument must be an object");
    }

    if ((new RegExp(global.config.constants.tags.OPEN +
                    ".*" +
                    global.config.constants.tags.CLOSE,
                "gmi")).test(string)) {
        
        // Loop through an array of matches

        string.match(new RegExp(global.config.constants.tags.OPEN +
                    ".*?" +
                    global.config.constants.tags.CLOSE,
                "gmi")).forEach(function (item) {
                    var cleanString = exports.stringClean(item);

                    if (data.hasOwnProperty(cleanString)) {
                        string = string.replace(item, data[cleanString]);
                    } else if (cleanString !== "") {
                        console.log(["\t\t\t\t======================",
                                     "\t\t\t\t Missing variable:" + cleanString,
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

exports.dateToString = function (date) {
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
};

exports.lastBuild = function (root) {
    var content = [
        root,
        global.tools.dateToString(new Date()),
    ].join("\n");
    
    global.tools.file.write(root + "last-build.txt",
            content,
            function () {});
};

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}