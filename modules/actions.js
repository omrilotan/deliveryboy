var exports = {};

exports.build = function (input, callback) {
    // Callback for building all distributions
    
    var i = 0,
        len = global.config.distributions.length,
        callbackForAll = function () {
            ++i;
            if (i === len) {
                callback();
            }
        };

    switch (input.build) {
        case "cancel":
            callback();
            break;
        case "*":
            global.config.distributions.forEach(function (distribution) {
                global.tools.builder.build(distribution, callbackForAll);
            });
            break;
        default:
            if ((global.config.distributions.length - 1) < input.build) {
                console.log(["\t\t\t\t=========================================",
                             "\t\t\t\t Distribution " + input.build + " not found",
                             "\t\t\t\t========================================="].join("\n"));
                callback();
                return;
            }

            global.tools.builder.build(global.config.distributions[input.build], callback);
            break;
    }
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}