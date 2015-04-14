var exports = {};

// exports.build = function (input, callback, fail) {
    
//     // Callback for building all distributions
//     var i = 0,
//         len = global.config.distributions.length,
//         callbackForAll = function () {
//             ++i;
//             if (i === len) {
//                 callback();
//             }
//         };
//     switch (input.build) {
//         case "cancel":
//             callback();
//             break;
//         case "*":
//             global.config.distributions.forEach(function (distribution, index) {
//                 global.tools.builder.build(index, callbackForAll);
//             });
//             break;
//         default:
//             if ((global.config.distributions.length - 1) < input.build) {
//                 global.tools.logTitle("Distribution " + input.build + " not found");
//                 callback();
//                 return;
//             }
//             global.tools.builder.build(input.build, callback);
//             break;
//     }
// };


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}