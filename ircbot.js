var irc = require("irc");
var _ = require("lodash");
var moment = require("moment");

var log = require("./log");
var config = require("./config");
var processor = require("./processor");
var bamboo = require("./bamboo");

var SERVER = config.get("irc").server;
var CHANNEL = config.get("irc").channel;
var NICK = config.get("irc").nick;
var START_LISTENING = config.get("irc").startListening;
var STOP_LISTENING = config.get("irc").stopListening;
var SAY_BUILD_FAILURES = config.get("irc").sayBuildFailures;
var IGNORE_FROM = ["OpenMRSBot"];

var listeningNow = false;
var conversation = null;

var postMessage = function (text) {
    client.say(CHANNEL, text);
};

var client = new irc.Client(SERVER, NICK, {channels: [CHANNEL]});
log.info("Connected to " + CHANNEL);

client.addListener('error', function (message) {
    log.error(message);
});

client.addListener('message', function (from, to, message) {
    log.trace(from + ' => ' + to + ': ' + message);
    if (to == NICK) {
        // it's a PM
    }
    if (message === START_LISTENING) {
        if (listeningNow) {
            log.warn("Was already listening, and told to start listening again");
        }
        listeningNow = true;
        if (!conversation) {
            conversation = [];
        }
    }
    else if (message === STOP_LISTENING) {
        listeningNow = false;
        processor.processScrum(conversation);
        conversation = null;
        postMessage("I recorded and indexed this scrum");
    }
    else if (listeningNow && to === CHANNEL && !_.find(IGNORE_FROM, from)) {
        log.info("Recorded: " + from + ": " + message);
        conversation.push({
            from: from,
            message: message,
            timestamp: moment().toISOString()
        });
    }
    if (message === SAY_BUILD_FAILURES) {
        postMessage("Wait a moment while I check on CI for broken builds.");
        bamboo.summarizeBrokenBuilds().then(function (summary) {
            _.each(summary, function (line) {
                postMessage(line);
            })
        });
    }
});

module.exports.postMessage = postMessage;