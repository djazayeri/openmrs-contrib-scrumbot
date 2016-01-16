var express = require('express');
var router = express.Router();
var Promise = require("bluebird");

var jira = require("../jira");

router.get('/status', function (req, res) {
    Promise.join(
        jira.query("labels = 'community-priority' and status in ('Waiting for Dev', 'Ready for Work')"),
        jira.query("labels = 'intro' and status in ('Waiting for Dev', 'Ready for Work')"),
        jira.query("labels = 'curated' and status in ('Waiting for Dev', 'Ready for Work')"),
        function (priority, intro, curated) {
            res.send({
                "community-priority": priority,
                "intro": intro,
                "curated": curated
            });
        }
    );
});

router.get('/communitypriority', function (req, res) {
    jira.query("labels = 'community-priority' and resolution is empty", {maxResults: 50})
        .then(function (response) {
            res.send(response);
        });
});

router.get("/jiraquery", function (req, res) {
    jira.query(req.query.jql, {maxResults: 50})
        .then(function (response) {
            res.send(response);
        })
        .catch(function (err) {
            res.status(400).send(err);
        })
});

module.exports = router;
