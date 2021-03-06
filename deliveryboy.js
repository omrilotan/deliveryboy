global.tools = require("./modules/tools");

var CONFIG_DIRECTORY = "config";

global.config = {};    // Store configuration details from file later


global.refresh = function (callback) {

    // add all configuration files from directory to 'global.config'
    global.tools.file.objectifyDir(CONFIG_DIRECTORY, function (data) {
        global.config = global.tools.objectCombine(global.config, data);
        if (typeof callback === "function") {
            callback();
        }
    });
    return;
};

    // Loading necessary resources
var init = function () {
    global.tools.ready.listen(global.tools.prompter.start)

            .report(console.log)

        // Configure all modules
            .register(global.tools.render.config)
            .register(global.tools.builder.config)
            .register(global.tools.prompter.config)
            .register(global.tools.serve.config)
            .go();
};

// Load config file and let's-a-go!
global.tools.first("lets-go")
        .then(global.refresh)
        .then(init)
        .go();
// global.refresh(init);