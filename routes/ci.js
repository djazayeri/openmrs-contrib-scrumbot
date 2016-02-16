var express = require('express');
var router = express.Router();

var bamboo = require("../bamboo");

router.get('/brokenbuilds', function (req, res) {
    bamboo.summarizeBrokenBuilds().then(function (summary) {
        res.send({
                     broken: summary.broken,
                     summary: summary
                 });
    });
});

module.exports = router;