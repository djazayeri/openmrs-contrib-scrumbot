var elasticsearch = require('elasticsearch');
var ejs = require('elastic.js');
var _ = require("lodash");

var log = require("./log");
var config = require("./config");
var host = config.get("elasticsearch").host;

var client;
client = new elasticsearch.Client({
    apiVersion: "2.1",
    host: host
});

module.exports.assertConnection = function () {
    client.ping({}, function (error) {
        if (error) {
            log.error("Failed to connect to ElasticSearch at " + host);
            log.error(error);
            process.exit(1);
        } else {
            log.info("Connected to ElasticSearch at " + host);
        }
    });
};

module.exports.setupDb = function () {
    client.indices.get({
        index: "scrum"
    }, function (err, response, status) {
        if (status == 404) {
            log.info("Setting up ElasticSearch index: scrum");
            client.indices.create({
                index: "scrum",
                body: {
                    mappings: {
                        "_default_": {
                            properties: {
                                //raw: { type: "string", analyzer: "standard" },
                                startTime: {type: "date"},
                                endTime: {type: "date"},
                                participants: {type: "string", index: "not_analyzed"},
                                issues: {type: "string", index: "not_analyzed"}
                            }
                        }
                    }
                }
            }, function (err, response, status) {
                if (err) {
                    log.error("Error setting up 'scrum' index!");
                    log.error(err);
                }
                else {
                    log.info("Done.");
                }
            });
        } else {
            log.debug("ElasticSearch index for 'scrum' already configured");
        }
    });
};

module.exports.recordScrum = function (processedScrum) {
    client.index({
        index: "scrum",
        id: processedScrum.startTime,
        type: "conversation",
        body: processedScrum
    }, function (err, response) {
        if (err) {
            log.error("Failed to index in ElasticSearch");
            log.error(err);
        } else {
            log.info("Recorded in ElasticSearch");
        }
    });
};

module.exports.thisWeekScrums = function () {
    return client.search({
        index: "scrum",
        body: ejs.Request()
            .query(ejs.RangeQuery("startTime", {gte: "now/w"}))
    }).then(function (response) {
        return _.pluck(response.hits.hits, "_source").reverse();
    });
};

module.exports.scrumsWithIssue = function (key) {
    return client.search({
        index: "scrum",
        body: ejs.Request()
            .query(ejs.TermQuery("issues", key))
    }).then(function (response) {
        return _.pluck(response.hits.hits, "_source");
    });
};

module.exports.scrum = function (startTime) {
    return client.search({
        index: "scrum",
        body: ejs.Request()
            .query(ejs.TermQuery("startTime", startTime))
    }).then(function (response) {
        return response.hits.hits[0]["_source"];
    });
};

module.exports.scrumsBetween = function (startTime, endTime) {
    return client.search({
        index: "scrum",
        body: ejs.Request()
            .query(ejs.BoolQuery()
                .must(ejs.RangeQuery("startTime").gte(startTime))
                .must(ejs.RangeQuery("startTime").lte(endTime))
            )
            .sort(ejs.Sort("startTime").desc())
    }).then(function (response) {
        return _.pluck(response.hits.hits, "_source");
    });
}