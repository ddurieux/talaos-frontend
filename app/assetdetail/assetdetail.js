'use strict';

angular.module('talaos.assetdetail', [
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
        when('/:item/edit/:itemId', {
            controller: 'AssetdetailCtrl',
            templateUrl:'app/assetdetail/assetdetail.html',
            resolve: {
                item: function(Restangular, $route){
                return Restangular.one($route.current.params.item, $route.current.params.itemId).get({'embedded': '{"asset_type":1}'});
            },
            displaydetails: function() {return 1; }
        }
    });
}])

.controller('AssetdetailCtrl', ['$scope', '$location', 'Restangular', 'item', 'displaydetails', function($scope, $location, Restangular, item, displaydetails) {
       
    var original = item;
    $scope.items = {};
    $scope.items["asset"] = {};
    $scope.items["asset"]["menu"] = "Asset";
    $scope.items["asset"]["name"] = "Asset";
    $scope.items["asset"]["item"] = "asset";
    $scope.item = Restangular.copy(original); 
    // * Get all properties
    $scope.properties = [];
    $scope.childcat = {};
    $scope.load_links = function(param) {
        Restangular.all('').get(param).then(function(data) {
            if (data._items.length > 0) {
                if ("_items" in $scope.child) {
                    $scope.child._items.push.apply($scope.child._items, data._items);
                } else {
                    $scope.child = data;
                }
                if ("next" in data._links) {
                    $scope.load_links(data._links.next.href + '&projection={"asset_right": 1}');
                } else {
                    // We have all assets_id
                    var ids = [];
                    for (var key in $scope.child._items) {
                        ids.push($scope.child._items[key]['asset_right']);
                    }
                    $scope.child_categories = {};
                    $scope.load_asset_assettype('asset?where={"id": ["' + ids.join('","') + '"]}&max_results=200');
                }
            }
        });
    }

    $scope.load_asset_assettype = function(param) {
        Restangular.all('').get(param + '&embedded={"asset_type":1}').then(function(data) {
            for (var key in data._items) {
                if (!(data._items[key]['asset_type']['name'] in $scope.child_categories)) {
                    $scope.child_categories[data._items[key]['asset_type']['name']] = [];
                }
                $scope.child_categories[data._items[key]['asset_type']['name']].push(
                        {
                            'name': data._items[key]['name'],
                            'id': data._items[key]['id']
                        });
            }
            if ("next" in data._links) {
                $scope.load_asset_assettype(data._links.next.href);
            }
        });                    
    }
    
    $scope.load_properties = function() {
        Restangular.all('asset_property').get('?where={"asset_id":' + original.id + '}&embedded={"property_name":1,"asset_type_property":1}').then(function(data) {
            $scope.properties_values = data;
            Restangular.all('asset_type_property').get('?where={"asset_type_id":' + original.asset_type_id + '}').then(function(data) {
                // mix the values with the label to have good property
                for (var key in data._items) {
                    var add = 0;
                    for (var keyv in $scope.properties_values._items) {
                        if ($scope.properties_values._items[keyv]['property_name']['asset_type_property_id'] == data._items[key]['id']) {
                            $scope.properties.push({
                                'label': data._items[key]['name'],
                                'label_id': data._items[key]['id'],
                                'value': $scope.properties_values._items[keyv]['property_name']['name']
                            });
                            add = 1;
                        }
                    }
                    if (add == 0) {
                        $scope.properties.push({
                            'label': data._items[key]['name'],
                            'label_id': data._items[key]['id'],
                            'value': ''
                        });  
                    }
                }
            });
        });

        // * Get child
        $scope.child = [];
        $scope.load_links('asset_asset?where={"asset_left":' + original.id + '}&projection={"asset_right": 1}');
    }
    if (displaydetails) {
        $scope.load_properties();
    }
    $scope.load_childcat = function(cat_name) {
        if (cat_name in $scope.childcat) {
            delete $scope.childcat[cat_name];
        } else {
            $scope.childcat[cat_name] = $scope.child_categories[cat_name];
        }
    }

    $scope.goAsset = function (asset_id) {
        $location.url('/asset/edit/'+ asset_id);
    }
}]);
