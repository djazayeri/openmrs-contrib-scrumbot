angular.module("scrum", ["ngResource"])
    .filter("prettyDate", [function () {
        return function (isoDate) {
            return moment(isoDate).fromNow();
        }
    }])
    .filter("time", [function () {
        return function (isoDate) {
            return moment(isoDate).format("LTS");
        }
    }])
    .controller("IndexController", ["$scope", "$resource", function ($scope, $resource) {
        var summaryResource = $resource("summary");

        $scope.summary = summaryResource.get();

        $scope.duration = function (scrum) {
            var diff = moment(scrum.endTime).diff(moment(scrum.startTime), "minutes");
            return diff + (diff === 1 ? " minute" : " minutes");
        }
    }]);