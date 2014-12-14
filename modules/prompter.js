var prompt = require("../node_modules/prompt"),

    schemas = {},
    actions = {},

    exports = {},

    setSchema = function (name, properties) {
        var key;
        for (key in properties) {
            if (properties.hasOwnProperty(key)) {
                schemas[name] = schemas[name] || { properties: {} };
                schemas[name].properties = schemas[name].properties || {};
                schemas[name].properties[key] = global.tools.objectCombine(schemas[name].properties[key], properties[key]);
            }
        }
    };

exports.config = function (callback) {
    setSchema("prebuild", {
        prebuild: {
            description: "Build assets [Y/N]?",
            default: "Y",
            pattern: /[y|Y|n|N]/,
            type: "string",
            message: "Please answer by Y or N",
            required: true
        }
    });

    setSchema("build", {
        build: {
            description: "Error: Description was not configured",
            default: "0",
            pattern: /^[0-9a-zA-Z\s\-\*]+$/,
            type: "string",
            message: "Answer must be only numbers, letters, spaces, or dashes",
            required: true
        }
    });

    setSchema("preserve", {
        serve: {
            description: "Run web server [Y/N]?",
            default: "Y",
            pattern: /[y|Y|n|N]/,
            type: "string",
            message: "Please answer by Y or N",
            required: true
        }
    });

    setSchema("serve", {
        port: {
            description: "Enter a port number",
            default: global.config.build.DEFAULT_PORT,
            pattern: /^[\s]+$/,
            type: "number",
            message: "Please enter a number",
            required: false
        },
        distribution: {
            description: "Error: Description was not configured",
            default: "0",
            pattern: /^[0-9a-zA-Z\s\-\*]+$/,
            type: "string",
            message: "Answer must be only numbers, letters, spaces, or dashes",
            required: false
        }
    });

    callback();
};

///////////////////////
// Build distribution
///////////////////////
actions.build = function (options) {
    options = options || {};

    var distributions = global.tools.listAttribute(global.config.distributions, "name");
    
    prompt.get(schemas.prebuild, function (err, result) {
        if (err) { console.log(err); return; }

        if (result.prebuild.toLowerCase() !== "y") {
            actions.serve();
            return;
        }

        // Build distribution
        prompt.get(schemas.build, function (err, result) {
            if (err) { console.log(err); return; }

            global.tools.actions.build(result, actions.serve);
        });
    });
};

//////////////////
// Run web server
//////////////////
actions.serve = function () {
    prompt.get(schemas.preserve, function (err, result) {
        if (err) { console.log(err); return; }
        if (result.serve.toLowerCase() === "y") {
            
            console.log(["=========================================",
                 " Select port number and an available distribution:",
                 "========================================="].join("\n"));
            prompt.get(schemas.serve, function (err, result) {
                if (err) { console.log(err); return; }

                global.tools.serve.start(result);
            });
        }
    });
};

exports.start = function () {

    // Get distributions list
    var distributions = global.tools.listAttribute(global.config.distributions, "name");

    // Set up build distributions prompt
    setSchema("serve", {
        distribution: {
            description: global.tools.listNumber(distributions).join(", ")
        }
    })
    setSchema("build", {
        build: {
            description: global.tools.listNumber(distributions).join(", ") +
                    ", 'cancel' or '*' (all)"
        }
    });

    prompt.start();
    actions.build({
        distributions: distributions,
        default: distributions[0]
    });
};





if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}