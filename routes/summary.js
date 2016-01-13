var express = require('express');
var router = express.Router();

var db = require("../db");

/* GET users listing. */
router.get('/', function (req, res, next) {
    db.thisWeekScrums().then(function (response) {
        res.send({scrumsThisWeek: response});
    });
});

module.exports = router;
