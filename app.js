var app = angular.module('asset', ['restangular', 'ngRoute', 'angular.filter', 'ui.bootstrap', 'ngSanitize', 'queryBuilder']);
        
app.config(function($routeProvider, RestangularProvider, $rootScope) {
    $routeProvider.
      when('/', {
        controller:homePage, 
        templateUrl:'home.html',
      }).
      when('/:item', {
        controller:ListCtrl, 
        templateUrl:'list.html',
        resolve: {
          item: function(Restangular, $route){
            var custom = '';
            if ($route.current.params.item == 'Asset') {
                custom = 'assettypes';
            }
            return Restangular.all($route.current.params.item).customGET(custom);
          }
        }
      }).
      when('/:item/edit/:itemId', {
        controller:EditCtrl, 
        templateUrl:'detail.html',
        resolve: {
          item: function(Restangular, $route){
            return Restangular.one($route.current.params.item, $route.current.params.itemId).get();
          }
        }
      }).
      when('/:item/new', {
          controller:CreateCtrl, 
          templateUrl:'detail.html',
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
        if ($scope.urlpage === undefined) {
            $scope.urlpage = 'asset?'
        }
        item = $http.post('http://10.0.20.9:5000/' + $scope.urlpage + 'embedded={"asset_type":1}', {"where": $scope.json}, {'headers': {"X-HTTP-Method-Override": "GET"}})
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
        Restangular.all('').customGET($scope.list._links.next.href)
                .then(function(data) {
                    $scope.list = data;
            });
    };

    $scope.nextPage = function() {
        $rootScope.$broadcast('urlpage', $scope.list._links.next.href);
        // $scope.loadPage();
    };

    $scope.previousPage = function() {
        if ($scope.list.meta.offset > 0) {
            $scope.list.meta.offset -= $scope.list.meta.limit;
            $scope.loadPage();
        }
    };
    
   $scope.$on('item', function(event, msg) {
      $scope.list = msg
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

function EditCtrl($scope, $location, Restangular, item) {
    var original = item;
    $scope.item = Restangular.copy(original.data); 
    $scope.meta = Restangular.copy(original.meta); 
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
}

/*
 * parse_link_header()
 *
 * Parse the Github Link HTTP header used for pageination
 * http://developer.github.com/v3/#pagination
 */
function parse_link_header(header) {
  if (header.length == 0) {
    throw new Error("input must not be of zero length");
  }
  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  _.each(parts, function(p) {
    var section = p.split(';');
    if (section.length != 2) {
      throw new Error("section could not be split on ';'");
    }
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  });
 
  return links;
}