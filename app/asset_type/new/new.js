'use strict';

angular.module('talaos.asset_type.new', [
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
        when('/asset_type/new', {
            controller: 'NewCtrl', 
            templateUrl:'app/asset_type/new/new.html'
    });
}])

.controller('NewCtrl', ['$scope', '$location', 'Restangular', '$window', function($scope, $location, Restangular, $window) {
  $scope.properties = [];
  $scope.item = {};
  
  $scope.types = {
      integer: 'Integer',
      string: 'String'
  };
        
  $scope.addProperty = function(){
    var property = {
        name: '',
        type: 'string'
    };
    $scope.properties.unshift(property);
  }; 
  
  $scope.save = function() {

    var allowed_properties = [];
    // add all allowed properties to asset_type when all properties added
    var add_ap = function(asset_type_id) {
        if (allowed_properties.length === $scope.properties.length) {
            Restangular.one('asset_type', asset_type_id).get().then(function(datatypenew) {
                var updatetype = {
                    'allowed_properties': allowed_properties
                };
                var elem = Restangular.one('asset_type', asset_type_id);
                elem.restangularEtag = datatypenew['_etag'];
                elem.patch(updatetype).then(function(){
                    $window.location.href = '#/asset_type/edit/'+asset_type_id;
                });
            });
        }   
    }

    Restangular.all('asset_type').post($scope.item).then(function(datatype) {
        if ($scope.properties.length === 0) {
            $window.location.href = '#/asset_type/edit/'+datatype['_id'];
        } else {
            for (var key in $scope.properties) {
                Restangular.all('property').post($scope.properties[key]).then(function(data) {
                    allowed_properties.push(data['_id']);
                    add_ap(datatype['_id']);
                });
            }
        }
    });
  };
}]);
