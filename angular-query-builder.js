var queryBuilder = angular.module('queryBuilder', []);
queryBuilder.directive('queryBuilder', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            group: '='
        },
        templateUrl: '/queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function (scope, element, attrs) {
                scope.operators = [
                    { name: 'Union' },
                    { name: 'Difference' },
                    { name: 'Intersection' }
                ];
                $http.get('http://10.0.20.9:5000/asset_type').
                    success(function(data) {
                        scope.assettypes = data._items;
                    });
                scope.displayButtons = true;
                scope.displayAddCondition = true;
                scope.fields = [];
                
                scope.assettypeChanged = function(asset_type_id, id, thisis, rule) {
                    $http.get('http://10.0.20.9:5000/asset_type_property?where={"asset_type_id": "' + asset_type_id + '"}').
                        success(function(data) {
                            thisis.fields = data._items;
                            thisis.fields.unshift({'name': '[This type]', 'id': 'assettype'});
                            rule.field = 0;
                        });
                }

                scope.fieldSelected = function(selectedAssettype, assettypes, rule, id, thisis) {
                    if (rule.field == 'assettype') {
                        rule.data = _.find(assettypes, function(obj) { return obj.id == selectedAssettype }).id;
                        rule.dataname = _.find(assettypes, function(obj) { return obj.id == selectedAssettype }).name;
                    } else {
                        rule.data = '';
                    }
                    
                }
                
                scope.assetchild = [
                    { value: 'nochild', name: 'No child'},
                    { value: 'firstlevel', name: 'Direct child (first level)'},
                    //{ value: 'alllevel', name: 'No level child limit'},
                ]
                
                scope.conditions = [
                    { name: '=' },
                    { name: '<>' },
                    { name: '<' },
                    { name: '<=' },
                    { name: '>' },
                    { name: '>=' },
                    { name: 'like' }
                ];

                scope.addCondition = function () {
                    scope.group.rules.push({
                        condition: '=',
                        field: '',
                        data: '',
                        assetchild: 'nochild'
                    });
                };

                scope.removeCondition = function (index) {
                    scope.group.rules.splice(index, 1);
                };

                scope.addGroup = function () {
                    scope.group.rules.push({
                        group: {
                            operator: 'Intersection',
                            rules: []
                        }
                    });
                };

                scope.removeGroup = function () {
                    "group" in scope.$parent && scope.$parent.group.rules.splice(scope.$parent.$index, 1);
                };

                directive || (directive = $compile(content));

                element.append(directive(scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);
