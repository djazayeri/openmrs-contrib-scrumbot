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

module.exports.getIssue = function (key) {
    return getJson("https://issues.openmrs.org/rest/api/2/issue/" + key + "?fields=summary,description,status,resolution,assignee").then(function (issue) {
        return _.pick(issue.fields, [
            "summary",
            "description",
            "status",
            "resolution",
            "assignee"
        ]);
    });
};