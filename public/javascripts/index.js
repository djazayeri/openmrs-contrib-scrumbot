angular.module("scrum", ["ngResource", "ui.router"])
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/index");
        $stateProvider
            .state("index", {
                url: "/index",
                controller: ["$state", function ($state) {
                    $state.go("week", {startDate: moment().startOf("week").toISOString()});
                }]
            })
            .state("week", {
                url: "/week/{startDate:string}",
                templateUrl: "partials/week.html",
                controller: "WeekController"
            })
            .state("issue", {
                url: "/issues/{issueKey:string}",
                templateUrl: "partials/issue.html",
                controller: "IssueController"
            })
            .state("scrum", {
                url: "/scrum/{startTime:string}",
                templateUrl: "partials/scrum.html",
                controller: "ScrumController"
            })
    }])
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
    .filter("date", [function () {
        return function (date) {
            return moment(date).format("ll");
        }
    }])
    .filter("scrumDuration", [function () {
        return function (scrum) {
            var diff = moment(scrum.endTime).diff(moment(scrum.startTime), "minutes");
            return diff + (diff === 1 ? " minute" : " minutes");
        }
    }])
    .controller("WeekController", ["$scope", "$state", "$resource", function ($scope, $state, $resource) {
        $scope.start = moment($state.params.startDate);
        $scope.end = moment($scope.start).endOf("week");

        $scope.prevWeek = $scope.start.clone().subtract(1, "week").toISOString();
        $scope.nextWeek = $scope.end.isAfter(moment()) ? null : $scope.start.clone().add(1, "week").toISOString();

        $scope.week = $resource("scrums/" + $scope.start.toISOString() + "/" + $scope.end.toISOString()).query();
    }])
    .controller("IssueController", ["$scope", "$state", "$http", function ($scope, $state, $http) {
        $scope.issueKey = $state.params.issueKey;

        $scope.issue = {};
        $http.get("issue/" + $scope.issueKey + "/issue").then(function (response) {
            $scope.issue = response.data;
        });
        $http.get("issue/" + $scope.issueKey + "/scrums").then(function (response) {
            $scope.scrums = response.data;
        });
    }])
    .controller("ScrumController", ["$scope", "$state", "$http", function ($scope, $state, $http) {
        $http.get("scrum/" + $state.params.startTime).then(function (response) {
            $scope.scrum = response.data;
        });
    }]);