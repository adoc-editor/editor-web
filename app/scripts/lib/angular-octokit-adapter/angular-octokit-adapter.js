angular.module('octokit.adapter', [])
    .provider('$gh', function () {
        this.options = {};

        this.$get = [
            '$q',
            function ($q) {

                var $gh = {};

                var gh = new Octokit(this.options);

                $gh.getRepo = function (username, reponame) {
                    return $q.when(gh.getRepo(username, reponame));
                };
                $gh.getUser = function (username) {
                    return $q.when(gh.getUser(username));
                };
                $gh.getSearch = function () {
                    return $q.when(gh.getSearch());
                };

                $gh.setCreds = function (token) {
                    var credentials = {
                            token: token
                        };
                    gh = new Octokit(credentials);
                };

                return $gh;
            }
        ];

        this.setOptions = function (options) {
            this.options = options;
        };
    });