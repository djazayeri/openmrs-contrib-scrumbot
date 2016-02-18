var rp = require("request-promise");
var _ = require("lodash");
var Promise = require("bluebird");

var config = require('./config');

function getJson(uri) {
    return rp({
        uri: uri,
        json: true
    });
}

function postJson(uri, postBody) {
    return rp({
        method: "POST",
        uri: uri,
        body: postBody,
        json: true
    });
}

module.exports.getIssue = function (key) {
    return getJson("https://issues.openmrs.org/rest/api/2/issue/" + key + "?fields=summary,description,status,resolution,assignee,labels").then(function (issue) {
        return _.pick(issue.fields, [
            "summary",
            "description",
            "status",
            "resolution",
            "assignee",
            "labels"
        ]);
    });
};

module.exports.queryOnePage = function (jql, opts) {
    var body = _.extend({
        jql: jql,
        maxResults: 5,
        fields: ["summary", "status", "assignee", "labels", "updated"]
    }, opts);
    return postJson("https://issues.openmrs.org/rest/api/2/search", body);
}

module.exports.query = function (jql, opts) {
    var body = _.extend({
                            jql: jql,
                            maxResults: 5,
                            fields: ["summary", "status", "assignee", "labels", "updated"]
                        }, opts);

    var first = postJson("https://issues.openmrs.org/rest/api/2/search", body);
    return Promise.join(first,
                        first.then(function (response) {
                            var morePages = [];
                            for (var st = response.startAt + response.maxResults; st < response.total; st += response.maxResults) {
                                morePages.push(st);
                            }
                            console.log("more pages: " + morePages);
                            return Promise.map(morePages, function (startAt) {
                                console.log("Getting another page: " + startAt);
                                return postJson("https://issues.openmrs.org/rest/api/2/search", _.extend({
                                                                                                             jql: jql,
                                                                                                             maxResults: 5,
                                                                                                             fields: ["summary", "status", "assignee", "labels", "updated"]
                                                                                                         }, opts, {startAt: startAt}));
                            })
                        }),
                        function (first, rest) {
                            console.log("resolving with rest.length == " + rest.length);
                            var pages = _.flatten([first, rest]);
                            var issues = _.chain(pages).map("issues").flatten().value();
                            return {
                                issues: issues,
                                total: issues.length
                            }
                        });
}