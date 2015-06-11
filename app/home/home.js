'use strict';

angular.module('talaos.home', [
    'restangular', 
    'ngRoute', 
    'angular.filter', 
    'ui.bootstrap', 
    'ngSanitize', 
    'queryBuilder', 
    'ngMaterial',
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {
        controller: 'homePage', 
        templateUrl: 'app/home/home.html',
      });
}])

.controller('homePage', ['$scope', function($scope) {
    
    $scope.items = {};
    $scope.items["asset"] = {};
    $scope.items["asset"]["menu"] = "Asset";
    $scope.items["asset"]["name"] = "Asset";
    $scope.items["asset"]["item"] = "asset";

}]);
