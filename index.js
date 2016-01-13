var log = require("./log");
var config = require("./config");
var ircbot = require("./ircbot");
var db = require("./db");
var processor = require("./processor");

db.assertConnection();
db.setupDb();

