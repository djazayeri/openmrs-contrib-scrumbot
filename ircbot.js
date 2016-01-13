var irc = require("irc");
var _ = require("lodash");
var moment = require("moment");

var log = require("./log");
var processor = require("./processor");

var CHANNEL = "#openmrstest";
var NICK = "omrs-scrum-bot";
var START_LISTENING = "teston";
var STOP_LISTENING = "testoff";
var IGNORE_FROM = ["OpenMRSBot"];

var listeningNow = false;
var conversation = null;

var client = new irc.Client('chat.freenode.net', NICK, {
    channels: [CHANNEL]
});
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
    }
    else if (listeningNow && to === CHANNEL && !_.find(IGNORE_FROM, from)) {
        log.info("Recorded: " + from + ": " + message);
        conversation.push({
            from: from,
            message: message,
            timestamp: moment().toISOString()
        });
    }
});

module.exports.postMessage = function (text) {
    client.say(CHANNEL, text);
};