var url = require("url"),
    exports = {};

exports.parse = function (str) {
    return url.parse(str, true, true);
};

exports.breakdown = function (uri) {
    var details = exports.parse(uri);

    return {
        request: details.pathname.split("/").filter(function (item) {
            return item !== "";
        }),
        variables: details.query
    };
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}