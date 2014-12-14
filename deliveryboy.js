global.tools = require("./modules/tools");

global.CONFIG_FILE = "src/config.json";
global.CONFIG_DIRECTORY = "src/config";
global.config = {};    // Store configuration details from file later

var first = (function () {
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

global.refresh = function (callback) {
    // Read configuration file
    global.tools.file.readFilesInDir(global.CONFIG_DIRECTORY, function (data) {
        if (!data.length) {
            console.log(["\t\t\t\t====================",
                         "\t\t\t\t Resource not found: '" + global.CONFIG_FILE + "'",
                         "\t\t\t\t===================="].join("\n"));
            return;
        } else {
            data.forEach(function (item) {
                var name = item.name.split(".")[0],
                    content = JSON.parse(item.content);
                global.config[name] = content;
            });
        }
        if (typeof callback === "function") {
            callback();
        }
    });
    return;
};

    // Loading necessary resources
var ready = (function () {
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
                for (; i < len; i++) {
                    collection[i](step);
                }
            }
        };
    }()),


    init = function () {
        ready.listen(global.tools.prompter.start)

                .report(console.log)

            // Configure all modules
                .register(global.tools.render.config)
                .register(global.tools.builder.config)
                .register(global.tools.prompter.config)
                .register(global.tools.serve.config)

                .go();
    };

// Load config file and let's-a-go!
first("lets-go")
        .then(global.refresh)
        .then(init)
        .go();
// global.refresh(init);