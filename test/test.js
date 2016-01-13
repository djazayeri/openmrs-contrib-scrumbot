require('chai').should();
var sinon = require('sinon');
var moment = require("moment");
var processor = require("../processor");
var db = require("../db");

describe('Processor', function () {
    describe('#processMessage()', function () {
        it("should find issue key at start", function () {
            var processed = processor.processMessage({message: "HTML-123: I worked on it"});
            processed.issues.should.have.length(1);
            processed.issues.should.have.property(0).equal("HTML-123");
        });
        it("should find issue key in middle", function () {
            var processed = processor.processMessage({message: "I worked on HTML-123 and I finished it."});
            processed.issues.should.have.length(1);
            processed.issues.should.have.property(0).equal("HTML-123");
        });
        it("should find multiple issue keys", function () {
            var processed = processor.processMessage({message: "I worked on HTML-123 and HTML-456 and I finished both!"});
            processed.issues.should.have.length(2);
            processed.issues.should.have.property(0).equal("HTML-123");
            processed.issues.should.have.property(1).equal("HTML-456");
        });
    });

    describe("#processScrum()", function () {
        before(function (done) {
            sinon.stub(db, 'recordScrum').returns(null);
            done();
        });
        it("should process whole conversation", function () {
            var conv = [
                {
                    from: "djazayeri",
                    message: "ABC-123: found this bug and completed it",
                    timestamp: moment().subtract(2, 'minutes').toISOString()
                },
                {
                    from: "djazayeri",
                    message: "Blockers: I don't know how to approach DEF-456",
                    timestamp: moment().subtract(1, 'minutes').toISOString()
                },
                {
                    from: "wluyima",
                    message: "I organized a sprint",
                    timestamp: moment().toISOString()
                }
            ];
            processor.processScrum(conv);
            db.recordScrum.calledOnce.should.equal(true);
            var calledWith = db.recordScrum.firstCall.args[0];
            calledWith.should.have.property("raw").equal(conv);
            calledWith.startTime.should.equal(conv[0].timestamp);
            calledWith.endTime.should.equal(conv[2].timestamp);
            calledWith.participants.should.deep.equal(["djazayeri", "wluyima"]);
            calledWith.issues.should.deep.equal(["ABC-123", "DEF-456"]);
        });
        after(function (done) {
            db.recordScrum.restore();
            done();
        });
    });
});