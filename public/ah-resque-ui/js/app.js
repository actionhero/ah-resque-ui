/////////////////
// APPLICATION //
/////////////////

var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider){

  ROUTES.forEach(function(collection){
    var route = collection[0];
    var page  = collection[1];
    var title = collection[2];
    $routeProvider.when(route, {
      'templateUrl': page,
      'pageTitle': title
    });
  });

  // $locationProvider.html5Mode(true);
});

app.run(['$rootScope', '$http', function($rootScope, $http){

  var loop = function(){
    clearTimeout($rootScope.pageTimer);
    var sleep = parseInt($rootScope.refreshing) * 1000;
    if(sleep > 0){
      $rootScope.pageTimer = setTimeout(function(){
        $rootScope.$broadcast('tick');
        $rootScope.now = new Date();
        loop();
      }, sleep);
    }
  }

  $rootScope.refreshing = '0';
  $rootScope.now = new Date();
  $rootScope.$watch('refreshing', loop);

  $rootScope.action = function($scope, data, path, verb, successCallback, errorCallback){
    var i;

    $('button').prop('disabled', true);

    if(typeof successCallback !== 'function'){
      successCallback = function(data){
        var successMessage = 'OK!';
        if(data.message){ successMessage = data.message; }
      };
    }

    if(typeof errorCallback !== 'function'){
      errorCallback = function(errorMessage){ alert(errorMessage); };
    }

    for(i in data){
      if(data[i] === null || data[i] === undefined){ delete data[i]; }
    }

    if(Object.keys(data).length > 0 && (verb === 'get' || verb === 'GET') && path.indexOf('?') < 0){
      path += '?';
      for(i in data){ path += i + '=' + data[i] + '&'; }
    }

    $http({
      method  : verb,
      url     : path,
      data    : $.param(data),  // pass in data as strings
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
     }).success(function(data){
       $('button').prop('disabled', false);
      successCallback(data);
    }).catch(function(data){
      var errorMessage = '';
      if(data.data && data.data.error){
        errorMessage = data.data.error;
      }else{
        errorMessage = data.statusText + ' | ' + data.status;
      }
      errorCallback(errorMessage);
      setTimeout(function(){
        $('button').prop('disabled', false);
      }, 500);
    });
  };

  $rootScope.$on('$routeChangeSuccess', function (event, current, previous){
    $rootScope.pageTitle = current.$$route.pageTitle;
  });
}]);
