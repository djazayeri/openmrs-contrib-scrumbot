var rp = require("request-promise");
var _ = require("lodash");

var config = require('./config');

function getJson(uri) {
    return rp({
        uri: uri,
        transform: function (body) {
            try {
                return JSON.parse(body);
            } catch (ex) {
                return ex
            }
        }
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

module.exports.query = function (jql, opts) {
    var body = _.extend({
        jql: jql,
        maxResults: 5,
        fields: ["summary", "status", "assignee", "labels", "updated"]
    }, opts);
    return postJson("https://issues.openmrs.org/rest/api/2/search", body);
}