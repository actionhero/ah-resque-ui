app.controller('resque', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location){
  $scope.counts = {};

  $scope.loadDetails = function(){
    $rootScope.action($scope, {}, '/api/node-resque-ui:resqueDetails', 'GET', function(data){
      $scope.queues = data.resqueDetails.queues;
      $scope.workers = data.resqueDetails.workers;
      $scope.counts.queues = Object.keys($scope.queues).length;
      $scope.counts.workers = Object.keys($scope.workers).length;

      Object.keys($scope.workers).forEach(function(wname){
        var worker = $scope.workers[wname];
        if(typeof worker === 'string'){
          $scope.workers[wname] = {status: worker};
        }else{
          worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000);
        }
      });

    });
  }

  var run = function(){
    $scope.loadDetails();
  };

  $scope.$on('tick', run);

  run();

}]);
