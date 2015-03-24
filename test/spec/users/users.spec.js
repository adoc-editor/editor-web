'use strict';

describe('Test Controller: UsersCtrl', function () {
  var ctrl;
  //Services
  var SyncUser, mdSidenav, firebase;


  beforeEach(function () {

    module('ngMaterial', 'firebase', 'editAdoc.users.controller', 'editAdoc.users.service', 'editAdoc.sync.service', function($provide) {
      $provide.constant("FBURL","https://luminous-fire-672.firebaseio.com/");
    });

    inject(function ($rootScope, $controller, $mdSidenav, _SyncUser_) {
      SyncUser = _SyncUser_;
      ctrl = $controller('UsersCtrl', {
        '$mdSidenav': $mdSidenav,
        'SyncUser': SyncUser
      });
    })
  });

  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      var parent = angular.element('<div>');
      el = angular.element('<md-sidenav ' + (attrs||'') + '>');
      parent.append(el);
      $compile(parent)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  it('Application is started', function () {
    var el = setup('component-id="users"');
    expect(el.hasClass('md-closed')).toBe(true);
    ctrl.close();

  });
});
