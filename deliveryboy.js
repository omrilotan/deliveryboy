global.tools = require("./modules/tools");

var CONFIG_DIRECTORY = "config";

global.config = {};    // Store configuration details from file later


global.refresh = function (callback) {
    // Read configuration file
    global.tools.file.readFilesInDir(CONFIG_DIRECTORY, function (data) {
        if (!data.length) {
            console.log(["\t\t\t\t====================",
                         "\t\t\t\t '" + CONFIG_DIRECTORY + "' is empty",
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