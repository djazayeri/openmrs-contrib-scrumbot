var fs = require('fs');
var nconf = require('nconf');

nconf
    .argv()
    .env()
    .file({file: "config.json"})
    .defaults({
        elasticsearch: {
            host: "localhost:9200"
        }
    });

module.exports = nconf;