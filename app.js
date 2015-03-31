var app = angular.module('asset', ['restangular', 'ngRoute', 'angular.filter', 'ui.bootstrap', 'ngSanitize', 'queryBuilder']);
        
app.config(function($routeProvider, RestangularProvider) {
    $routeProvider.
      when('/', {
        controller:homePage, 
        templateUrl:'views/home.html',
      }).
      when('/:item', {
        controller:ListCtrl, 
        templateUrl:'views/list.html',
        resolve: {
          item: function(Restangular, $route){
            if ($route.current.params.item == 'asset') {
                return {};
            }
            return Restangular.all($route.current.params.item);
          }
        }
      }).
      when('/:item/edit/:itemId', {
        controller:EditCtrl, 
        templateUrl:'views/detail.html',
        resolve: {
          item: function(Restangular, $route){
            if ($route.current.params.item == 'asset') {
                 
            }
            return Restangular.one($route.current.params.item, $route.current.params.itemId).get({'embedded': '{"asset_type":1}'});
          },
          displaydetails: function() {return 1; }
        }
      }).
      when('/:item/new', {
          controller:CreateCtrl, 
          templateUrl:'views/detail.html',
          resolve: {
          item: function(Restangular, $route){
             return Restangular.one('item', $route.current.params.item).get();
          }
        }
      }).
      otherwise({redirectTo:'/'});
      
//      RestangularProvider.setBaseUrl('../public/index.php/v1');
      RestangularProvider.setBaseUrl('http://10.0.20.9:5000');
      
//      RestangularProvider.setDefaultRequestParams({ apiKey: '4f847ad3e4b08a2eed5f3b54' })
      
      RestangularProvider.setRequestInterceptor(function(elem, operation, what) {
          
        if (operation === 'put') {
          elem._id = undefined;
          return elem;
        }
        return elem;
      })
  });

app.controller('QueryBuilderCtrl', ['$scope', 'Restangular', '$http', '$rootScope', function ($scope, Restangular, $http, $rootScope) {
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
        item = $http.post('http://10.0.20.9:5000/asset?embedded={"asset_type":1}', {"where": $scope.jsonclean}, {'headers': {"X-HTTP-Method-Override": "GET"}})
           .then(function(data) {
               $rootScope.$broadcast('item', data.data);
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



function homePage($scope, Restangular) {
   //$scope.items = Restangular.all("item").getList().$object;
   $scope.items = {};
   $scope.items["asset"] = {};
   $scope.items["asset"]["menu"] = "Asset";
   $scope.items["asset"]["name"] = "Asset";
   $scope.items["asset"]["item"] = "asset";
   
}


function ListCtrl($scope, Restangular, item) {
   $scope.list = item;
//   $scope.list.meta.totalpage = $scope.list._meta.total / $scope.list._meta.max_results;
   //$scope.items = Restangular.all("item").getList().$object;
   $scope.items = {};
   $scope.items["asset"] = {};
   $scope.items["asset"]["menu"] = "Asset";
   $scope.items["asset"]["name"] = "Asset";
   $scope.items["asset"]["item"] = "asset";
   
    $scope.loadPage = function() {
        $scope.list = {'items_': []};
        Restangular.all($scope.urlpage + '&embedded={"asset_type":1}').post({"where": $scope.search}, {}, {'X-HTTP-Method-Override': 'GET'})
                .then(function(data) {
           $scope.list = data         
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
   
}


function CreateCtrl($scope, $location, Restangular, item) {
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
}

app.directive('dude', function($location, Restangular){
  return {
    restrict: "C"
    , controller:TestCtrl
    , scope: {
        assetId: "="
    }
    , templateUrl:'views/detail2.html'
  };
});

function TestCtrl($scope, $location, Restangular) {
    Restangular.one('asset', $scope.assetId).get({'embedded': '{"asset_type":1}'}).then(function(data) {
        EditCtrl($scope, $location, Restangular, data, 0);
    });
    $scope.close = function () {
        EditCtrl($scope, $location, Restangular, $scope.item, 0);
    }
}

function EditCtrl($scope, $location, Restangular, item, displaydetails) {
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
                    ids = [];
                    for (var key in $scope.child._items) {
                        ids.push($scope.child._items[key]['asset_right']);
                    }
                    $scope.child_categories = {};
                    $scope.load_asset_assettype('asset?where={"id": ["' + ids.join('","') + '"]}');
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
                    add = 0;
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
/*    
    $scope.foreignlist = {};

    for (var field in $scope.item) {
        for (var key2 in $scope.meta[field]) {
            if (key2 == 'relationship') {
                $scope.foreignlist[field] = Restangular.all($scope.meta[field].relationship).customGET().$object;
            }
        }
    }
    $scope.items = Restangular.all("item").getList().$object;
    $scope.item.route = item.route;
    $scope.possiblerelatedmodels = item.relatedmodels; 
    $scope.relatedmodels = new Object();
    $scope.itemtypename = item.route;
    delete $scope.item['assetschild'];
    if ($scope.item.route == 'Asset') {
        Restangular.all("AssetType").customGET().then(function(data) {
            $scope.assettypes = data.data;
        });
    }
    
    $scope.loadRelatedModel = function(itemname, id, isNew) {
        if (isNew == true) {
            Restangular.all('item').customGET(itemname).then(function(data) {
                $scope.relatedmodels[itemname] = data;  
            });
        } else {
            Restangular.one(itemname, 'id').get()
                .then(function(data) {
                    $scope.relatedmodels.itemname.data = data;
            });
        }
    };
    for (var key in item.relatedmodels) {
        if (item.relatedmodels[key].new == false) {
            $scope.loadRelatedModel(key, $scope.item.id, item.relatedmodels[key].new);
        }
    }
    
    $scope.addNewRelatedModel = function(itemname) {
        $scope.loadRelatedModel(itemname, 0, true);
    };

    // Load 
    for (var key in $scope.possiblerelatedmodels) {
        Restangular.one(key, 0).customGET('', {asset_id:item.data.id}).then(function(rel) {
            if (rel.hasOwnProperty('data') == true) {
                $scope.relatedmodels[key] = rel;
                delete $scope.possiblerelatedmodels[key];
            }
        });
    }
    
    $scope.isClean = function() {
        return angular.equals(original, $scope.item);
    }

    $scope.destroy = function() {
        $scope.item.remove().then(function() {
            $location.path('/' + $scope.item.route);
        });
    };

    $scope.save = function() {
        
        $scope.item.put();
        for (var key in $scope.relatedmodels) {
            if (typeof $scope.relatedmodels[key].data.id === 'undefined') {
                // Add
                $scope.relatedmodels[key].data.asset_id = $scope.item.id;
                Restangular.all(key).post($scope.relatedmodels[key].data);
            } else {
                // Update
                for (var k in $scope.relatedmodels[key].data) {
                    $scope.relatedmodels[key][k] = $scope.relatedmodels[key].data[k];
                }
                delete $scope.relatedmodels[key].meta;
                delete $scope.relatedmodels[key].data;
                $scope.relatedmodels[key].put();
            }
        }
        $location.path('/' + $scope.item.route);
    };
    */
}
