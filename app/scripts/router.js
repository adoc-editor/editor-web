EditAdocApp.config(['$stateProvider','$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('editor', {
            url: '/editor',
            templateUrl: 'views/editor/editor.html',
            controller: 'EditorCtrl as editor'
        })

        .state('preview', {
            url: '/preview',
            templateUrl: 'views/preview/preview.html',
            controller: 'PreviewCtrl as preview'
        })

        .state('realtime', {
            url: '/realtime',
            views: {

                // the main template will be placed here (relatively named)
                '': {
                    templateUrl: 'views/editor/realtime.html',
                    controller: '' },

                // the child views will be defined here (absolutely named)
                'editor@realtime': {  templateUrl: 'views/editor/editor.html',
                    controller: 'EditorCtrl as editor'},

                // for column two, we'll define a separate controller
                'preview@realtime': {
                    templateUrl: 'views/preview/preview.html',
                    controller: 'PreviewCtrl as preview'
                }
            }
        })

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('home', {
            url: '/home',
            templateUrl: 'views/documentation/index.html'
        })
        .state('about', {
            // about this app
        })
        .state('documentation', {
            url: '/documentation',
            //templateUrl: 'views/documentation/overview.html'
            templateUrl: 'views/documentation/index.html'
        })
        .state('contribute', {
            url: '/contribute',
            templateUrl: 'views/documentation/contribute.html'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'views/users/profile.html',
            controller: 'UserProfileCtrl as profile'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'views/settings/settings.html'
        });

    return $locationProvider.html5Mode({enabled:false, requireBase:false});

}]);
