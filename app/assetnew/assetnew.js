'use strict';

angular.module('talaos.assetnew', [
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
        when('/:item/new', {
            controller: 'AssetnewCtrl', 
            templateUrl:'app/assetnew/assetnew.html',
            resolve: {
                item: function(Restangular, $route){
                    return Restangular.one(item, $route.current.params.item).get();
                }
            }
    });
}])

.controller('AssetnewCtrl', ['$scope', '$location', 'Restangular', 'item', function($scope, $location, Restangular, item) {
  var original = item;
  
  $scope.item = Restangular.copy(original.data); 
  $scope.meta = Restangular.copy(original.meta); 
  $split = $location.$$path.split("/");
  $scope.item.route = $split[1];
  $scope.itemtypename = $split[1];
  $scope.items = Restangular.all("item").getList().$object;
  
  $scope.save = function() {
      
    Restangular.all($scope.item.route).post($scope.item).then(function(item) {
      $location.path('/' + $scope.item.route);
    });
  }

}]);
