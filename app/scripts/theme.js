EditAdocApp.config(['$mdThemingProvider','$mdIconProvider', function($mdThemingProvider, $mdIconProvider) {

    $mdIconProvider
        .defaultIconSet("./images/assets/svg/av.svg", 24)
        .iconSet("action"       , "./images/assets/svg/svg-sprite-action.svg"        , 24)
        .iconSet("alert"      , "./images/assets/svg/svg-sprite-alert.svg"       , 24)
        .iconSet("communication", "./images/assets/svg/svg-sprite-communication.svg" , 24)
        .iconSet("content"   , "./images/assets/svg/svg-sprite-content.svg"    , 24)
        .iconSet("device"    , "./images/assets/svg/svg-sprite-device.svg"     , 24)
        .iconSet("editor"      , "./images/assets/svg/svg-sprite-editor.svg"       , 24)
        .iconSet("file"      , "./images/assets/svg/svg-sprite-file.svg"       , 24)
        .iconSet("hardware"      , "./images/assets/svg/svg-sprite-hardware.svg"       , 24)
        .iconSet("image"      , "./images/assets/svg/svg-sprite-image.svg"       , 24)
        .iconSet("maps"      , "./images/assets/svg/svg-sprite-maps.svg"       , 24)
        .iconSet("navigation"      , "./images/assets/svg/svg-sprite-navigation.svg"       , 24)
        .iconSet("notification"      , "./images/assets/svg/svg-sprite-notification.svg"       , 24)
        .iconSet("social"      , "./images/assets/svg/svg-sprite-social.svg"       , 24)
        .iconSet("toggle"      , "./images/assets/svg/svg-sprite-toggle.svg"       , 24);

    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('blue-grey')
        .warnPalette('green');

}]);
