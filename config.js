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
            userName: "scrumbot",
            realName: "OpenMRS Scrum Bot",
            startListening: "!scrumon",
            stopListening: "!scrumoff",
            sayBuildFailures: "!scrumon"
        },
        elasticsearch: {
            host: "localhost:9200"
        },
        processor: {
            issueRegex: "[A-Z]{2,10}-\\d{1,6}"
        }
    });

module.exports = nconf;
