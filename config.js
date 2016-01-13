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
        }
    });

module.exports = nconf;