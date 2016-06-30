app.controller('pageController', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location){

  $rootScope.action($scope, {}, '/api/node-resque-ui:packageDetails', 'GET', function(data){
    $rootScope.packageDetails = data.packageDetails;
  });

  $scope.getNavigationHighlight = function(path){
    var parts = $location.path().split('/');
    var pathParts = path.split('/');

    parts.shift(); /// throw away the first one

    if(parts.length === 0 || parts.length === 1 && parts[0] === ''){
      window.location.href = '/node-resque-ui/#/overview';
    }

    var simplePathParts = [];
    while(pathParts.length > 0 && parts.length > 0){
      pathParts.pop();
      simplePathParts.push( parts.shift() );
    }

    if(simplePathParts.join('/') === path){
      return "active";
    }else{
      return "";
    }
  };

}]);
