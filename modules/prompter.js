var prompt = require("../node_modules/prompt"),
    manager = require("./prompter.manager.js"),

    schemas = {},
    actions = {},
    collection = [],

    exports = {},

    prompter = function () {
        var args = arguments;
        var fn = function () {
            prompt.get.apply(prompt, args);
        };
        setTimeout(fn, 40);
    };

exports.config = function (callback) {
    schemas = manager.get();

    callback();
};

///////////////////////
// Build distribution
///////////////////////
actions.build = function prompter$build (callback) {
    var prebuild = function (callback, exitStrategy) {
            prompter(schemas.prebuild, function (err, result) {
                if (err) { console.error(err); return; }
                if (result.question.toLowerCase() !== "y") {
                    exitStrategy();
                    return;
                }
                callback();
            });
        },
        build = function (callback) {
            prompter(schemas.build, function (err, result) {
                if (err) { console.error(err); return; }
                var answer = collection[result.question || 0],
                    key,
                    i = 0,
                    len = 0,
                    callbackForAll = function () {
                        ++i;
                        if (i === len) {
                            callback();
                        }
                    };

                switch (answer) {
                    case "cancel":
                        callback();
                        break;
                    case "*":    // Building all distributions
                        for (key in global.config.distributions) {
                            if (global.config.distributions.hasOwnProperty(key)) {
                                len++;
                                global.tools.builder.build(key, callbackForAll);
                            }
                        }
                        break;
                    default:
                        if ((global.config.distributions.length - 1) < answer) {
                            global.tools.logTitle("Distribution " + answer + " not found");
                            callback();
                            return;
                        }
                        global.tools.builder.build(answer, callback);
                        break;
                }
            });
        },
        finalCallback = callback;

    global.tools.first("build-prompts")
            .then(function (callback) {
                prebuild(callback, actions.serve);
            })
            .then(function (callback) {
                build(callback);
            })
            .then(finalCallback)
            .go();


};

//////////////////
// Run web server
//////////////////
actions.serve = function () {
    prompter(schemas.preserve, function (err, result) {
        if (err) { console.error(err); return; }
        if (result.question.toLowerCase() === "y") {
            
            console.log(["=========================================",
                 " Select port number and an available distribution:",
                 "========================================="].join("\n"));
            prompter(schemas.port, function (err, result) {
                if (err) { console.error(err); return; }
                var port = result.question;
                prompter(schemas.serve, function (err, result) {
                    if (err) { console.error(err); return; }
                    global.tools.serve.start({
                        port: port,
                        name: collection[result.question || 0]
                    });
                });
            });
        }
    });
};

exports.start = function () {

    // Get distributions list
    var key,
        i = 0,
        menu = [];
    for (key in global.config.distributions) {
        if (global.config.distributions.hasOwnProperty(key)) {
            collection.push(key);
            menu.push("(" + i + ") " + key);
        }
    }

    // Set up build distributions prompt
    manager.set(schemas, "serve", {
        description: menu.join(", ")
    })
    manager.set(schemas, "build", {
        description: menu.join(", ") +
                    ", 'cancel' or '*' (all)"
    });

    prompt.start();

    global.tools.first("prompts")
            .then(actions.build)
            .then(actions.serve)
            .go();
};





if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}