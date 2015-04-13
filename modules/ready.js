var exports = (function () {
    var eventually = null,
        count = 0,
        collection = [],
        report = null,
        step = function () {
            var queue = collection.length,
                place = collection.length - count + 1;
            if (typeof report === "function") {
                report("(" + place + "/" + queue + ")==> " +
                        Math.round(place / queue * 100) + "% ready");
            }
            count--;
            if (count === 0 &&
                    typeof eventually === "function") {
                eventually();
            }
        };
    return {
        report: function (fn) {
            report = fn;
            return this;
        },
        listen: function (fn) {
            eventually = fn;
            return this;
        },
        register: function (fn) {
            count++;
            collection.push(fn);
            return this;
        },
        go: function () {
            var i = 0,
                len = collection.length;
            if (typeof report === "function") {
                report("Booting configurations:");
                report("-----------------------");
                report("(0/" + collection.length + ")==> 0% ready");
            }
            for (; i < len; i++) {
                collection[i](step);
            }
        }
    };
}());

if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}