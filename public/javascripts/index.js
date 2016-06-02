angular.module("scrum", ["ngResource", "ui.router", "nvd3"])
        .constant("needsAttentionStatuses", [
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
        ])
        .factory("releaseStatusGroups", [function () {
            return [
                {
                    name: "Backlog",
                    color: "red",
                    statuses: [
                        'Needs Assessment',
                        'Under Assessment',
                        'In Backlog'
                    ]
                },
                {
                    name: "Design/Analysis",
                    color: "yellow",
                    statuses: [
                        'Waiting for Analysis',
                        'Waiting on Information',
                        'In Analysis',
                        'Design',
                        'Reopened'
                    ]
                },
                {
                    name: "Ready",
                    color: "lightGray",
                    statuses: [
                        'Ready for Work',
                        'Waiting for Dev',
                        'Open'
                    ]
                },
                {
                    name: "Progress",
                    color: "darkGray",
                    statuses: [
                        'In Progress',
                        'In Development',
                        'Implementing Change'
                    ]
                },
                {
                    name: "Review/Test",
                    color: "blue",
                    statuses: [
                        'Awaiting Approval',
                        'Code Review (Pre-Commit)',
                        'Code Review (Initial)',
                        'Code Review (Post-Commit)',
                        'Waiting for Test',
                        'In Test',
                        'Under Review',
                        'Reviewing Change',
                        'Monitoring Change'
                    ]
                },
                {
                    name: "Complete",
                    color: "green",
                    statuses: [
                        'Waiting for Showcase'
                    ]
                },
                {
                    name: "Finished",
                    color: "green",
                    statuses: [
                        'Cancelled',
                        'Resolved',
                        'Closed',
                        'Approved',
                        'Accepted'
                    ]
                }
            ]
        }])
        .factory("statusGroups", ["needsAttentionStatuses", function (needsAttentionStatuses) {
            return [
                {
                    name: "Needs Attention",
                    warnAfterDays: 0.1,
                    mode: "list",
                    show: true,
                    statuses: needsAttentionStatuses
                },
                {
                    name: "Ready For Work",
                    warnAfterDays: 30,
                    mode: "list",
                    show: false,
                    statuses: [
                        'Ready for Work',
                        'Waiting for Dev',
                        'Open'
                    ]
                },
                {
                    name: "Working",
                    warnAfterDays: 7,
                    mode: "table",
                    statuses: [
                        'In Progress',
                        'In Development',
                        'Implementing Change'
                    ]
                },
                {
                    name: "Review/Testing",
                    warnAfterDays: 7,
                    mode: "table",
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
        }])
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/index");
        $stateProvider
            .state("index", {
                url: "/index",
                controller: ["$state", function ($state) {
                    $state.go("pm");
                }]
            })
                .state("thisweek", {
                    url: "/week",
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
                controller: "PmOverviewController"
            })
                .state("prioritytickets", {
                    url: "/prioritytickets",
                    templateUrl: "partials/prioritytickets.html",
                    controller: "PmTicketsController"
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
        .filter("jiraLink", [function () {
            return function (jql) {
                return "https://issues.openmrs.org/issues/?jql=" + encodeURIComponent(jql);
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
                opts: "="
            },
            controller: ["$scope", function ($scope) {
                $scope.check = function () {
                    if (!$scope.opts) {
                        return {loading: true};
                    }
                    var expected = "";
                    // explicitly test vs null, because minExpected might be 0, which is falsey
                    if ($scope.opts.minExpected != null && $scope.opts.maxExpected != null) {
                        expected = "Expected " + $scope.opts.minExpected + "-" + $scope.opts.maxExpected;
                    } else if ($scope.opts.minExpected != null) {
                        expected = "Expected >=" + $scope.opts.minExpected;
                    } else if ($scope.opts.maxExpected != null) {
                        expected = "Expected <=" + $scope.opts.maxExpected;
                    }
                    var error = ($scope.opts.minExpected != null && $scope.opts.issues.total < $scope.opts.minExpected) ||
                                ($scope.opts.maxExpected != null && $scope.opts.issues.total > $scope.opts.maxExpected);
                    return {
                        error: error,
                        message: expected
                    };
                }
            }],
            templateUrl: "partials/pm/issueList.html"
        }
    }])
        .directive("releaseSummary", [function () {
            return {
                restrict: "E",
                scope: {
                    opts: "="
                },
                controller: ["$scope", "releaseStatusGroups", function ($scope, releaseStatusGroups) {
                    $scope.$watch("opts.issues", function (issues) {
                        if (!issues) {
                            return;
                        }
                        $scope.chartOptions = {
                            chart: {
                                type: 'discreteBarChart',
                                height: 300,
                                margin: {
                                    top: 20,
                                    right: 20,
                                    bottom: 50,
                                    left: 55
                                },
                                x: function (d) {
                                    return d.name;
                                },
                                y: function (d) {
                                    return d.total;
                                },
                                showValues: true,
                                valueFormat: function (d) {
                                    return d3.format(',.0f')(d);
                                },
                                duration: 100,
                                dispatch: {
                                    elementClick: function (e) {
                                        console.log("click");
                                        console.log(e);
                                    }
                                }
                            }
                        }
                        var byStatus = _.groupBy(issues.issues, "fields.status.name");
                        var values = _.map(releaseStatusGroups, function (group) {
                            var data = {};
                            var total = 0;
                            _.each(group.statuses, function (status) {
                                data[status] = byStatus[status];
                                if (data[status]) {
                                    total += data[status].length;
                                }
                            });
                            return {
                                name: group.name,
                                color: group.color,
                                total: total,
                                data: data
                            };
                        });
                        $scope.chartData = [{
                            key: "Statuses",
                            values: values
                        }]
                    })
                }],
                templateUrl: "partials/pm/releaseSummary.html"
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
                    return moment(scrum.endTime).diff(scrum.startTime)
                }),
                longest: _.maxBy(week, function (scrum) {
                    return moment(scrum.endTime).diff(scrum.startTime)
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
        .controller("PmOverviewController", ["$scope", "$http", "needsAttentionStatuses", function ($scope, $http,
                                                                                                    needsAttentionStatuses) {
            $scope.brokenBuilds = {loading: true};
            $http.get("ci/brokenbuilds").then(function (response) {
                $scope.brokenBuilds = response.data;
            });

            $scope.queryHasIssues = {};
            function doJiraQuery(name, title, jql, opts) {
                $scope[name] = {loading: true, title: title};
                $http.get("projectmanagement/jiraquery?jql=" + encodeURIComponent(jql)).then(function (response) {
                    $scope[name] = angular.extend({
                                                      title: title,
                                                      issues: response.data,
                                                      jql: jql
                                                  }, opts);
                    $scope.queryHasIssues[name] = response.data.total ? $scope[name] : null;
                });
            }

            doJiraQuery("availableCommunityPriority",
                        "Available Community Priority",
                        'labels = community-priority AND status in ("Ready for Work", "Waiting for Dev") ORDER BY Rank', {
                            showNum: 0,
                            bigNumber: true,
                            minExpected: 5,
                            maxExpected: 15
                        });

            doJiraQuery("availableCuratedIntro",
                        "Available Curated Intro",
                        'labels = "intro" AND labels = "curated" AND status in ("Ready for Work", "Waiting for Dev")', {
                            showNum: 0,
                            bigNumber: true,
                            minExpected: 10
                        });

            doJiraQuery("communityPriorityNeedsAttention",
                        "Community-Priority Needs Attention",
                        'labels = "community-priority" AND resolution is empty AND status in (' +
                        _.map(needsAttentionStatuses, function (it) {
                            return '"' + it + '"'
                        }).join(",") +
                        ')', {
                            showNum: 5,
                            bigNumber: true,
                            maxExpected: 0
                        });

            doJiraQuery("communityPriorityClosedThisWeek",
                        "Community-Priority Closed This Week",
                        'labels = "community-priority" AND resolved >= -1w', {
                            showNum: 5,
                            bigNumber: true
                        });
            
            doJiraQuery("platform2dot0release",
                        "Platform 2.0",
                        'project = TRUNK and fixVersion = "Platform 2.0.0"',
                        {
                            showNum: 0,
                            bigNumber: false,
                            minExpected: 1
                        });

            doJiraQuery("refapp2dot4release",
                        "Reference Appliation 2.4",
                        'project = RA and fixVersion = "Reference Application 2.4"',
                        {
                            showNum: 0,
                            bigNumber: false,
                            minExpected: 1
                        });

            $scope.alertKeys = ["communityPriorityClosedThisWeek", "communityPriorityNeedsAttention"];
            $scope.anyAlerts = function () {
                return _.some($scope.alertKeys, function (key) {
                    return $scope.queryHasIssues[key];
                });
            }
        }])
        .controller("PmTicketsController", ["$scope", "$http", "statusGroups", function ($scope, $http, statusGroups) {
            $scope.statusGroups = statusGroups;
        function statusGroupFor(issue) {
            return _.find($scope.statusGroups, function (it) {
                return _.indexOf(it.statuses, issue.fields.status.name) >= 0;
            })
        }

        $scope.jqlQuery = "labels = 'community-priority' and resolution is empty";
        $scope.jiraQuery = function (jql) {
            $http.get("projectmanagement/jiraquery?jql=" + encodeURIComponent(jql)).then(function (response) {
                $scope.assignees = _.chain(response.data.issues).map("fields.assignee").uniqBy("name").remove(null).value();
                $scope.jiraResults = response.data;
            }).catch(function (err) {
                $scope.jiraError = err;
            });
        }
        // trigger it at page load
        $scope.jiraQuery($scope.jqlQuery);

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
        $scope.issuesFor = function (issues, statusGroup) {
            return _.filter(issues, function (i) {
                return _.indexOf(statusGroup.statuses, i.fields.status.name) >= 0;
            });
        }
        $scope.issuesInWorkTable = function (issues) {
            var groups = _.filter($scope.statusGroups, {mode: 'table'});
            var count = 0;
            _.each(groups, function (group) {
                count += $scope.issuesFor(issues, group).length;
            });
            return count;
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