var rp = require("request-promise");
var _ = require("lodash");
var Promise = require("bluebird");

var log = require("./log");
var config = require('./config');

function getJson(uri) {
    return rp({
        uri: uri,
        json: true
    });
}

module.exports.summarizeBrokenBuilds = function () {
    return Promise.join(
        getJson("https://ci.openmrs.org/rest/api/latest/result.json?max-results=200&expand=results.result.comments.comment").then(function (response) {
            if (response.results.size != response.results["max-result"]) {
                log.warn("There are too many Bamboo build plans (" + response.results.size + " vs " + response.results["max-result"] + ")");
            }
            var failures = _.filter(response.results.result, {
                buildState: "Failed",
                plan: {enabled: true}
            });
            return failures;
        }),
        getJson("https://ci.openmrs.org/rest/api/latest/result.json?max-results=200&buildstate=Successful&expand=results.result").then(function (response) {
            var results = {};
            _.each(response.results.result, function (it) {
                results[it.plan.key] = it.buildRelativeTime;
            });
            return results;
        }),
        function (failures, lastSuccesses) {
            var say = [];
            if (failures.length) {
                say.push("There are currently " + failures.length + " broken builds");
                _.each(failures, function (it) {
                    say.push("  * " + it.plan.shortName +
                        " - last success " + lastSuccesses[it.plan.key] +
                        " - https://ci.openmrs.org/browse/" + it.plan.key + "/latest");
                    if (it.comments.size) {
                        _.each(it.comments.comment, function (comment) {
                            say.push("    - " + comment.author + ": " + comment.content);
                        });
                    }
                });
                say.push("Please assign someone to deal with this failures!");
            }
            else {
                say.push("All CI builds are passing. Congratulations!");
            }
            return say;
        }
    )
};

// for testing, uncomment this and run "node bamboo"
// module.exports.summarizeBrokenBuilds().then(function(summary) {
//     console.log(summary);
// });