var app = angular.module('talaos', [
    'restangular', 
    'ngRoute', 
    'angular.filter', 
    'ui.bootstrap', 
    'ngSanitize', 
    'ngMaterial',
    'talaos.config',
    'talaos.home',
    'talaos.asset_type.new',
    'talaos.asset_type.edit',
    'talaos.asset_type.list',
    'talaos.assetlist',
    'talaos.assetdetail',
    'talaos.assetnew'
]);
    
app.config(['$routeProvider', 'RestangularProvider', 'talaosConfig', function($routeProvider, RestangularProvider, talaosConfig) {
    $routeProvider.
      otherwise({redirectTo:'/'});
      
    RestangularProvider.setBaseUrl(talaosConfig.backendUrl);
//    RestangularProvider.setDefaultRequestParams({ apiKey: '4f847ad3e4b08a2eed5f3b54' })
      
    RestangularProvider.setRequestInterceptor(function(elem, operation, what) {
        if (operation === 'put') {
            elem._id = undefined;
            return elem;
        }
        return elem;
    });
}]);
