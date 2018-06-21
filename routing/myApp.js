let app = angular.module('myApp', ["ngRoute", "LocalStorageModule", "chart.js", "angular-jwt"]);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider)  {

    $locationProvider.hashPrefix('');

    $routeProvider
        .when('/', {
            templateUrl: 'components/HomePage/home.html',
            controller : 'homeCtrl as homeCtrl'
        })
        .when('/register',{
            templateUrl: 'components/Register/register.html',
            controller : 'registerCtrl as registerCtrl'
        })
        .when('/retrivePassword',{
            templateUrl: 'components/RetrivePassword/retrivePassword.html',
            controller : 'retrivePasswordCtrl as retrivePassCtrl'
        })
        .when('/registerUsers',{
            templateUrl: 'components/RegisterUsers/registerUsers.html',
            controller : 'registerUsersCtrl as registerUsersCtrl'
        })
        .when('/about',{
            templateUrl: 'components/About/about.html',
            controller : 'aboutCtrl as aboutCtrl'
        })
        .when('/poi/:type',{
            templateUrl: 'components/Poi/poi.html',
            controller : 'poiCtrl as poiCtrl'
        })
        .when('/poiDetails/:poiId',{
            templateUrl: 'components/PoiDetails/poiDetails.html',
            controller : 'poiDetailsCtrl as poiDetailsCtrl'
        })
        .when('/admin',{
            templateUrl: 'components/AdminManage/admin.html',
            controller : 'adminCtrl as adminCtrl'
        })
        .otherwise({ redirectTo: '/' });
}]);