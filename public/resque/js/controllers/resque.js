app.controller('resque', ['$scope', '$rootScope', '$location', '$routeParams', function($scope, $rootScope, $location, $routeParams){
  $scope.counts = {
    queues: 0,
    workers: 0,
    failed: 0,
  };

  /* ----------- Pagination ----------- */

  $scope.pagination = {};
  $scope.perPage = 100;
  $scope.currentPage = $routeParams.page || 0;

  /* ----------- Overview ----------- */

  $scope.chart;

  $scope.loadDetails = function(){
    $rootScope.action($scope, {}, '/api/resque/resqueDetails', 'GET', function(data){
      $scope.queues = data.resqueDetails.queues;
      $scope.workers = data.resqueDetails.workers;
      $scope.stats = data.resqueDetails.stats;
      $scope.counts.queues = Object.keys($scope.queues).length;
      $scope.counts.workers = Object.keys($scope.workers).length;

      if($scope.chart){
        Object.keys($scope.queues).forEach(function(q){
          $scope.chart.series.forEach(function(s){
            if(s.name === q){
              s.addPoint([new Date().getTime(), $scope.queues[q].length]);
            }
          });
        });
      }

      Object.keys($scope.workers).forEach(function(workerName){
        var worker = $scope.workers[workerName];
        if(typeof worker === 'string'){
          $scope.workers[workerName] = {
            status: worker,
            statusString: worker,
          };
        }else{
          worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000);
          worker.statusString = 'working on ' + worker.queue + '#' + worker.payload['class'] + ' for ' + worker.delta + 's';
        }
      });
    });
  };

  $scope.renderOverviewChart = function(){
    if($scope.chart){ return; }
    if(!$scope.queues){ return setTimeout($scope.renderOverviewChart, 500); }

    var series = [];
    Object.keys($scope.queues).forEach(function(q){
      series.push({
        name: q,
        data: [{x: new Date(), y:0}],
      });
    });

    $('#overviewChart').highcharts({
      chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        events: {
          load: function(){ $scope.chart = this; }
        }
      },
      title: null,
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
      },
      yAxis: {
        title: {
          text: 'Queue Length'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
      },
      exporting: {enabled: false},
      series: series,
    });
  };

  /* ----------- Workers ----------- */

  $scope.loadWorkerQueues = function(){
    if(!$scope.workers){ return setTimeout($scope.loadWorkerQueues, 500); }

    $rootScope.action($scope, {}, '/api/resque/loadWorkerQueues', 'GET', function(data){
      // $scope.workerQueues = data.workerQueues;
      $scope.workerQueues = [];
      Object.keys(data.workerQueues).forEach(function(workerName){
        var parts = workerName.split(':');
        var id = parts.pop();
        var host = parts.join(':');
        var queues = data.workerQueues[workerName].split(',');

        var worker = {};
        if($scope.workers && $scope.workers[workerName]){
          worker = $scope.workers[workerName]
        }

        $scope.workerQueues.push({
          id:id, host:host, queues:queues, worker:worker, workerName:workerName
        });
      });
    });
  };

  $scope.forceCleanWorker = function(workerName){
    if(confirm('Are you sure?')){
      $rootScope.action($scope, {workerName: workerName}, '/api/resque/forceCleanWorker', 'POST', function(data){
        run();
      });
    }
  };

  /* ----------- Failures ----------- */

  $scope.loadFailedCount = function(){
    $rootScope.action($scope, {}, '/api/resque/resqueFailedCount', 'GET', function(data){
      $scope.counts.failed = data.failedCount;
      $scope.pagination = $rootScope.genratePagination($scope.currentPage, $scope.perPage, $scope.counts.failed);
    });
  };

  $scope.loadFailed = function(){
    $rootScope.action($scope, {
      start: ($scope.currentPage * $scope.perPage),
      stop: (($scope.currentPage * $scope.perPage) + ($scope.perPage - 1))
    }, '/api/resque/resqueFailed', 'GET', function(data){
      $scope.failed = data.failed;
    });
  };

  $scope.removeFailedJob = function(index){
    $rootScope.action($scope, {
      id: index
    }, '/api/resque/removeFailed', 'POST', function(data){
      run();
    });
  };

  $scope.retryFailedJob = function(index){
    $rootScope.action($scope, {
      id: index
    }, '/api/resque/retryAndRemoveFailed', 'POST', function(data){
      run();
    });
  };

  $scope.removeAllFailedJobs = function(index){
    $rootScope.action($scope, {}, '/api/resque/removeAllFailed', 'POST', function(data){
      run();
    });
  };

  $scope.retryAllFailedJobs = function(index){
    $rootScope.action($scope, {}, '/api/resque/retryAndRemoveAllFailed', 'POST', function(data){
      run();
    });
  };

  $scope.renderFailureStack = function(index){
    $scope.focusedException = $scope.failed[index];
    $scope.focusedException.renderedStack = $scope.focusedException.backtrace.join('\r\n')
    $("#failureDetailsModal").modal();
  };

  /* ----------- RUN ----------- */

  var run = function(){
    var path = $location.$$path;
    path = path.split('/')[1];

    if(['overview'].indexOf(path) >= 0){
      $scope.loadDetails();
      $scope.renderOverviewChart();
    }

    if(['overview', 'failed'].indexOf(path) >= 0){
      $scope.loadFailedCount();
    }

    if(['failed'].indexOf(path) >= 0){
      $scope.loadFailed();
    }

    if(['workers'].indexOf(path) >= 0){
      $scope.loadWorkerQueues();
      $scope.loadDetails();
    }
  };

  $scope.$on('tick', run);

  run();

}]);
