'use strict';

angular.module('talaos.asset_type.edit', [
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
        when('/asset_type/edit/:itemId', {
            controller: 'Asset_typeEditCtrl', 
            templateUrl:'app/asset_type/edit/edit.html',
            resolve: {
                item: function(Restangular, $route){
                return Restangular.one('asset_type', $route.current.params.itemId).get({'embedded': '{"allowed_properties":1}'});
            }
        }
    });
}])

.controller('Asset_typeEditCtrl', ['$scope', '$location', 'Restangular', 'item', function($scope, $location, Restangular, item) {
        
    $scope.item = item;
    $scope.properties = [];
    $scope.types = {
        integer: 'Integer',
        string: 'String'
    };

    for (var key in item.allowed_properties) {
        $scope.properties.push({
            id: item.allowed_properties[key]['_id'],
            name: item.allowed_properties[key]['name'],
            type: item.allowed_properties[key]['type']
        });
    }

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
        var add_ap = function() {
            if (allowed_properties.length === $scope.properties.length) {
                var updatetype = {
                    'allowed_properties': allowed_properties
                };
                var elem = Restangular.one('asset_type', $scope.item['_id']);
                elem.restangularEtag = $scope.item['_etag'];
                elem.patch(updatetype).then(function(dataitem) {
                    $scope.item['_etag'] = dataitem['_etag'];
                });
            }   
        }

        for (var key in $scope.properties) {
            if ('id' in $scope.properties[key]) {
                allowed_properties.push($scope.properties[key]['id']);
                add_ap();
            } else {
                Restangular.all('property').post($scope.properties[key]).then(function(data) {
                    allowed_properties.push(data['_id']);
                    add_ap();
                });
            }
        }
    };
}]);
