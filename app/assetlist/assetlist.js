'use strict';

angular.module('talaos.assetlist', [
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
        when('/:item', {
            controller: 'AssetlistCtrl', 
            templateUrl: 'app/assetlist/assetlist.html',
            resolve: {
                item: function(Restangular, $route){
                    if ($route.current.params.item == 'asset') {
                        return {};
                    }
                    return Restangular.all($route.current.params.item);
                }
            }
        });
}])

.controller('AssetlistCtrl', ['$scope', 'Restangular', 'item', function($scope, Restangular, item) {
       
    $scope.list = item;
    
    $scope.items = {};
    $scope.items["asset"] = {};
    $scope.items["asset"]["menu"] = "Asset";
    $scope.items["asset"]["name"] = "Asset";
    $scope.items["asset"]["item"] = "asset";

    $scope.loadPage = function() {
        $scope.list = {'items_': []};
        $scope.displayLoadingIndicator = true;
        Restangular.all($scope.urlpage + '&embedded={"asset_type":1}').post({"where": $scope.search}, {}, {'X-HTTP-Method-Override': 'GET'})
            .then(function(data) {
                $scope.list = data;
                $scope.displayLoadingIndicator = false;
            });
    };

    $scope.nextPage = function() {
        $scope.urlpage = $scope.list._links.next.href;
        $scope.loadPage();
    };

    $scope.previousPage = function() {
        $scope.urlpage = $scope.list._links.prev.href;
        $scope.loadPage();
    };
    
    $scope.$on('item', function(event, msg) {
        $scope.list = msg
    });
   
    $scope.$on('search', function(event, msg) {
        $scope.search = msg
    });

    $scope.$on('displayloading', function(event, msg) {
        $scope.displayLoadingIndicator = msg;
    });

}])


.controller('QueryBuilderCtrl', ['$scope', 'Restangular', '$http', '$rootScope', 'talaosConfig', function ($scope, Restangular, $http, $rootScope, talaosConfig) {
    var data = '{"group": {"operator": "Intersection","rules": []}}';

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
        for (var str = "(", i = 0; i < group.rules.length; i++) {
            i > 0 && (str += " <strong>" + group.operator + "</strong> ");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field + " " + htmlEntities(group.rules[i].condition) + " " + group.rules[i].data;
        }
        return str + ")";
    }
    
    $scope.sendToBackend = function() {
        $rootScope.$broadcast('item', {'items_': []});
        $rootScope.$broadcast('search', $scope.jsonclean);
        $rootScope.$broadcast('displayloading', true);
        $rootScope.searcherrormsg = '';
        $rootScope.searcherrordisplay = false;
        var item = $http.post(talaosConfig.backendUrl + '/asset?embedded={"asset_type":1}', {"where": $scope.jsonclean}, {'headers': {"X-HTTP-Method-Override": "GET"}})
            .success(function(data) {
                $rootScope.$broadcast('item', data);
                $rootScope.$broadcast('displayloading', false);
            })
            .error(function(data, status, headers, config) {
                $rootScope.$broadcast('displayloading', false);
                $rootScope.searcherrormsg = data || "Request failed";
                $rootScope.searcherrordisplay = true;
            });
    }

    $scope.$on('urlpage', function(event, msg) {
        $scope.urlpage = msg + "&"
        sendToBackend()
    });

    $scope.json = null;

    $scope.filter = JSON.parse(data);

    $scope.$watch('filter', function (newValue) {
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.jsonclean = JSON.stringify(angular.copy(newValue), null, 2);
        $scope.output = computed(newValue.group);
        $scope.output = $scope.json;
    }, true);
    
}]);

