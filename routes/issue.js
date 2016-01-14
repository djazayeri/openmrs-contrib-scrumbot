var express = require('express');
var router = express.Router();

var jira = require("../jira");
var db = require("../db");

router.get('/:key/issue', function (req, res) {
    jira.getIssue(req.params.key).then(function (json) {
        res.send(json);
    })
});

router.get('/:key/scrums', function (req, res) {
    db.scrumsWithIssue(req.params.key).then(function (arr) {
        res.send(arr);
    });
});

module.exports = router;
