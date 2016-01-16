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
            .state("pm", {
                url: "/pm",
                templateUrl: "partials/pm.html",
                controller: "PmController"
            })
            .state("upload", {
                url: "/upload",
                templateUrl: "partials/upload.html",
                controller: "UploadController"
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
            if (!scrum) {
                return "";
            }
            var diff = moment(scrum.endTime).diff(moment(scrum.startTime), "minutes");
            return diff + (diff === 1 ? " minute" : " minutes");
        }
    }])
    .directive("issueStatus", [function () {
        return {
            restrict: "E",
            scope: {
                issue: "="
            },
            templateUrl: "partials/issueStatus.html"
        };
    }])
    .directive("issueAssignee", [function () {
        return {
            restrict: "E",
            scope: {
                issue: "="
            },
            templateUrl: "partials/issueAssignee.html"
        };
    }])
    .directive("summaryIssueList", [function () {
        return {
            restrict: "E",
            scope: {
                title: "@",
                issues: "="
            },
            templateUrl: "partials/pm/issueList.html"
        }
    }])
    .controller("WeekController", ["$scope", "$state", "$resource", "$http", function ($scope, $state, $resource, $http) {
        $scope.start = moment($state.params.startDate);
        $scope.end = moment($scope.start).endOf("week");

        $scope.prevWeek = $scope.start.clone().subtract(1, "week").toISOString();
        $scope.nextWeek = $scope.end.isAfter(moment()) ? null : $scope.start.clone().add(1, "week").toISOString();

        function loadIssues(list) {
            $scope.issues = {};
            _.each(list, function (obj) {
                var issueKey = obj.val;
                $http.get("issue/" + issueKey + "/issue").then(function (response) {
                    $scope.issues[issueKey] = response.data;
                });
            });
        }

        $scope.week = $resource("scrums/" + $scope.start.toISOString() + "/" + $scope.end.toISOString()).query();
        $scope.week.$promise.then(function (week) {
            var summary = {
                participants: transformAndSort(_.countBy(_.flatten(_.map(week, 'participants')))),
                issues: transformAndSort(_.countBy(_.flatten(_.map(week, 'issues')))),
                shortest: _.minBy(week, function (scrum) {
                    return moment(scrum.startTime).diff(scrum.endTime, 'minutes')
                }),
                longest: _.maxBy(week, function (scrum) {
                    return moment(scrum.startTime).diff(scrum.endTime, 'minutes')
                })
            };
            loadIssues(summary.issues);
            $scope.summary = summary;
        });
        var transformAndSort = function (obj) { // takes something like {djazayeri:1, wluyima:2}
            var transformed = _.map(obj, function (val, key) {
                return {
                    val: key,
                    count: val
                };
            });
            return _.orderBy(transformed, ["count", "val"], ["desc", "asc"]);
        }
        $scope.classes = function (line) {
            var lower = line.message.toLowerCase();
            var ret = [];
            if (lower.indexOf("blocker") >= 0 && lower.indexOf("no") < 0) {
                ret.push("blocker");
            }
            return ret;
        }
        $scope.issueLabels = function (key) {
            // TODO, fetch these upon building the summary, and return them here asynchronously when they are available
        }
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
    }])
    .controller("PmController", ["$scope", "$http", function ($scope, $http) {
        $scope.statusGroups = [
            {
                name: "Needs Attention",
                warnAfterDays: 0,
                statuses: [
                    'Cancelled',
                    'Awaiting Approval',
                    'Needs Assessment',
                    'Under Assessment',
                    'Waiting for Analysis',
                    'Waiting on Information',
                    'In Analysis',
                    'Design',
                    'In Backlog',
                    'Reopened',
                    // statuses that shouldn't happen for a priority ticket with resolution=empty
                    'Resolved',
                    'Closed',
                    'Approved',
                    'Accepted'
                ]
            },
            {
                name: "Ready For Work",
                warnAfterDays: 14,
                statuses: [
                    'Ready for Work',
                    'Waiting for Dev',
                    'Open'
                ]
            },
            {
                name: "Working",
                warnAfterDays: 7,
                statuses: [
                    'In Progress',
                    'In Development',
                    'Implementing Change'
                ]
            },
            {
                name: "Review/Testing",
                warnAfterDays: 7,
                statuses: [
                    'Code Review (Pre-Commit)',
                    'Code Review (Initial)',
                    'Code Review (Post-Commit)',
                    'Waiting for Test',
                    'In Test',
                    'Under Review',
                    'Reviewing Change',
                    'Monitoring Change',
                    'Waiting for Showcase'
                ]
            }
        ];
        function statusGroupFor(issue) {
            return _.find($scope.statusGroups, function (it) {
                return _.indexOf(it.statuses, issue.fields.status.name) >= 0;
            })
        }

        $http.get("projectmanagement/status").then(function (response) {
            $scope.status = response.data;
        });

        $scope.jqlQuery = "labels = 'community-priority' and resolution is empty";
        $scope.jiraQuery = function (jql) {
            $http.get("projectmanagement/jiraquery?jql=" + encodeURIComponent(jql)).then(function (response) {
                $scope.assignees = _.chain(response.data.issues).map("fields.assignee").uniqBy("name").remove(null).value();
                $scope.jiraResults = response.data;
            }).catch(function (err) {
                $scope.jiraError = err;
            });
        }
        $scope.classes = function (issue) {
            var ret = [];
            var lastUpdateCutoff = statusGroupFor(issue).warnAfterDays;
            var age = moment().diff(moment(issue.fields.updated), "days");
            if (lastUpdateCutoff && age >= (2 * lastUpdateCutoff)) {
                ret.push("warn-strong");
            } else if (lastUpdateCutoff && age >= lastUpdateCutoff) {
                ret.push("warn");
            }
            return ret;
        }
        $scope.issuesFor = function (issues, assignee, statusGroup) {
            return _.filter(issues, function (i) {
                return (_.indexOf(statusGroup.statuses, i.fields.status.name) >= 0) && (
                        (assignee && i.fields.assignee && i.fields.assignee.name == assignee)
                        || (!assignee && !i.fields.assignee)
                    );
            });
        }
    }])
    .controller("UploadController", ["$scope", "$http", function ($scope, $http) {
        //var nickRegex = /[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]*/i;
        //var timeRegex = /\d{1,2}:\d{2} [ap]m/;
        $scope.$watchGroup(["input", "date"], function (newVals) {
            $scope.toUpload = null;
            var val = newVals[0];
            var date = newVals[1];
            if (val && date) {
                var lines = _.map(val.split("\n"), function (line) {
                    var arr = line.split("\t");
                    var ts = moment(moment(date).format("YYYY MM DD") + " " + arr[2], "YYYY-MM-DD hh:mm:ss aa");
                    if (!ts.isValid()) {
                        throw "Invalid date: " + arr[2];
                    }
                    return {
                        from: arr[0],
                        message: arr[1],
                        timestamp: ts.toISOString()
                    }
                });
                $scope.toUpload = lines;
            }
            $scope.doUpload = function () {
                $http.post("upload/tsv", $scope.toUpload).then(function () {
                    $scope.input = "";
                })
            }
        });
    }]);