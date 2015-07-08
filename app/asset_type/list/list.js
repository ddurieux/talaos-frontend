'use strict';

angular.module('talaos.asset_type.list', [
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
        when('/asset_type', {
            controller: 'listCtrl', 
            templateUrl: 'app/asset_type/list/list.html'
        });
}])

.controller('listCtrl', ['$scope', '$location', 'Restangular', function($scope, $location, Restangular) {
        
    $scope.list = [];
    $scope.pagenumber = 0;
    $scope.loadpage = 1;

    $scope.loadPage = function() {
        Restangular.all('asset_type' + '?embedded={"allowed_properties":1}&page=' + $scope.loadpage).customGET().then(function(data) {
            $scope.list = data;
            $scope.pagenumber = Math.ceil($scope.list._meta.total / $scope.list._meta.max_results);
        });
    };

    $scope.loadPage();
        
    $scope.getNumber = function(num) {
        return new Array(num);   
    }    
    
    $scope.goToPage = function (page) {
        $scope.loadpage = page;
        $scope.loadPage();
    };

    $scope.nextPage = function() {
        $scope.urlpage = $scope.list._links.next.href;
        $scope.loadPage();
    };

    $scope.previousPage = function() {
        $scope.urlpage = $scope.list._links.prev.href;
        $scope.loadPage();
    };
}]);

