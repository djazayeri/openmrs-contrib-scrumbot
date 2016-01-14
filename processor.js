var _ = require("lodash");

var log = require("./log");
var db = require("./db");

var issueKeyRegex = /[A-Z]{3,10}-\d{1,6}/g;

var processMessage = function (msg) {
    var message = msg.message;
    var issues = message.match(issueKeyRegex);
    return {
        issues: issues
    };
}

module.exports = {
    processMessage: processMessage,
    processScrum: function (conversation) {
        if (conversation && conversation.length) {
            var processed = _.map(conversation, function (it) {
                return processMessage(it);
            });
            db.recordScrum({
                raw: conversation,
                startTime: _.first(conversation).timestamp,
                endTime: _.last(conversation).timestamp,
                participants: _.uniq(_.pluck(conversation, "from")),
                issues: _.chain(processed).pluck("issues").flatten().remove(null).uniq().value()
            });
        }
        else {
            log.warn("Didn't capture any conversation between START and STOP message");
        }
        conversation = null;
    }
};