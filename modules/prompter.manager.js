var exports;
exports.get = function () {
    return {
        prebuild: {
            description: "Build assets [Y/N]?",
            default: "Y",
            pattern: /[y|Y|n|N]/,
            type: "string",
            message: "Please answer by Y or N",
            required: true
        },
        build: {
            description: "Error: Description was not configured",
            default: "0",
            pattern: /^[0-9a-zA-Z\s\-\*]+$/,
            type: "string",
            message: "Answer must be only numbers, letters, spaces, or dashes",
            required: true
        },
        preserve: {
            description: "Run web server [Y/N]?",
            default: "Y",
            pattern: /[y|Y|n|N]/,
            type: "string",
            message: "Please answer by Y or N",
            required: true
        },
        port: {
            description: "Enter a port number",
            default: global.config.build.DEFAULT_PORT,
            pattern: /^[\s]+$/,
            type: "number",
            message: "Please enter a number",
            required: false
        },
        serve: {
            description: "Error: Description was not configured",
            default: "0",
            pattern: /^[0-9a-zA-Z\s\-\*]+$/,
            type: "string",
            message: "Answer must be only numbers, letters, spaces, or dashes",
            required: false
        }

    };
};
exports.set = function (schemas, name, properties) {
    var key;
    for (key in properties) {
        if (properties.hasOwnProperty(key)) {
            schemas[name] = global.tools.objectCombine(schemas[name], properties);
            // schemas[name] = schemas[name] || { properties: {} };
            // schemas[name].properties = schemas[name].properties || {};
            // schemas[name].properties[key] = global.tools.objectCombine(schemas[name].properties[key], properties[key]);
        }
    }
};


if (typeof module !== "undefined" &&
        typeof module.exports === "object") {

    // export as node module
    module.exports = exports;
}