var fs = require('fs');
var nconf = require('nconf');

nconf
    .argv()
    .env()
    .file({file: "config.json"})
    .defaults({
        irc: {
            server: "chat.freenode.net",
            channel: "#openmrs",
            nick: "omrs-scrum-bot",
            startListening: "!scrumon",
            stopListening: "!scrumoff"
        },
        elasticsearch: {
            host: "localhost:9200"
        },
        processor: {
            issueRegex: "[A-Z]{2,10}-\\d{1,6}"
        }
    });

module.exports = nconf;