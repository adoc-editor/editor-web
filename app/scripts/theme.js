EditAdocApp.config(['$mdThemingProvider','$mdIconProvider', function($mdThemingProvider, $mdIconProvider) {

    $mdIconProvider
        .defaultIconSet("./assets/svg/av.svg", 24)
        .iconSet("action"       , "./assets/svg/svg-sprite-action.svg"        , 24)
        .iconSet("alert"      , "./assets/svg/svg-sprite-alert.svg"       , 24)
        .iconSet("communication", "./assets/svg/svg-sprite-communication.svg" , 24)
        .iconSet("content"   , "./assets/svg/svg-sprite-content.svg"    , 24)
        .iconSet("device"    , "./assets/svg/svg-sprite-device.svg"     , 24)
        .iconSet("editor"      , "./assets/svg/svg-sprite-editor.svg"       , 24)
        .iconSet("file"      , "./assets/svg/svg-sprite-file.svg"       , 24)
        .iconSet("hardware"      , "./assets/svg/svg-sprite-hardware.svg"       , 24)
        .iconSet("image"      , "./assets/svg/svg-sprite-image.svg"       , 24)
        .iconSet("maps"      , "./assets/svg/svg-sprite-maps.svg"       , 24)
        .iconSet("navigation"      , "./assets/svg/svg-sprite-navigation.svg"       , 24)
        .iconSet("notification"      , "./assets/svg/svg-sprite-notification.svg"       , 24)
        .iconSet("social"      , "./assets/svg/svg-sprite-social.svg"       , 24)
        .iconSet("toggle"      , "./assets/svg/svg-sprite-toggle.svg"       , 24);

    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('blue-grey')
        .warnPalette('green');

}]);
