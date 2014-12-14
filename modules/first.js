var exports = (function () {
    var collection = {},
        Plan = function () {
            this.steps = [];
        };
    Plan.prototype = {
        then: function (fn) {
            this.steps.push(fn);
            return this;
        },
        go: function (callback) {
            var that = this,
                next = function next () {
                    [].push.call(arguments, next);    // 'next' becomes the callback
                    if (!!that.steps.length) {
                        that.steps.shift().apply(null, arguments);
                    }
                }
            that.steps.push(callback);
            next();
        }
    };
    return function (name) {
        if (!collection.hasOwnProperty(name)) {
            collection[name] = new Plan();
        }
        return collection[name];
    };
}());

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}