var log4js = require("log4js");
var fs = require("fs");

try {
    fs.mkdirSync("logs");
} catch (ignore) {
}
log4js.configure('log4js.config.json', {});
var log = log4js.getLogger();
log.setLevel("DEBUG");

module.exports = log;