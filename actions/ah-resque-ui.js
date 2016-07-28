var path = require('path');
var async = require('async');
var packageJSON = require(path.normalize(__dirname + path.sep + '..' + path.sep + 'package.json'));

exports.packageDetails = {
  name: 'resque:packageDetails',
  description: 'I return the resque package metadata',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    data.response.packageDetails = {};
    data.response.packageDetails.packageJSON = packageJSON;
    // AH v12 check
    if(api.config.redis.client){
      data.response.packageDetails.redis = api.config.redis.client.args;
    } else {
      data.response.packageDetails.redis = [api.config.redis];
    }
    
    next();
  }
};

exports.resqueDetails = {
  name: 'resque:resqueDetails',
  description: 'I return the results of api.tasks.details',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    api.tasks.details(function(error, resqueDetails){
      data.response.resqueDetails = resqueDetails;
      next(error);
    });
  }
};

exports.loadWorkerQueues = {
  name: 'resque:loadWorkerQueues',
  description: 'I return the results of api.tasks.workers',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    api.tasks.workers(function(error, workerQueues){
      data.response.workerQueues = workerQueues;
      next(error);
    });
  }
};

exports.forceCleanWorker = {
  name: 'resque:forceCleanWorker',
  description: 'I remove a worker from resque',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs: {
    workerName:{ required: true}
  },

  run: function(api, data, next){
    api.resque.queue.forceCleanWorker(data.params.workerName, function(error, generatedErrorPayload){
      data.response.generatedErrorPayload = generatedErrorPayload;
      next(error);
    });
  }
};

exports.resqueFailedCount = {
  name: 'resque:resqueFailedCount',
  description: 'I return a count of failed jobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    api.tasks.failedCount(function(error, failedCount){
      data.response.failedCount = failedCount;
      next(error);
    });
  }
};

exports.queued = {
  name: 'resque:queued',
  description: 'I list enqueued jobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    queue: {
      required: true
    },
    start:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 0
    },
    stop:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 99
    }
  },

  run: function(api, data, next){
    api.tasks.queued(data.params.queue, data.params.start, data.params.stop, function(error, jobs){
      data.response.jobs = jobs;
      next(error);
    });
  }
};

exports.delQueue = {
  name: 'resque:delQueue',
  description: 'I delete a queue',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    queue: {
      required: true
    }
  },

  run: function(api, data, next){
    api.tasks.delQueue(data.params.queue, next);
  }
};

exports.resqueFailed = {
  name: 'resque:resqueFailed',
  description: 'I return failed jobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    start:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 0
    },
    stop:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 99
    }
  },

  run: function(api, data, next){
    api.tasks.failed(data.params.start, data.params.stop, function(error, failed){
      data.response.failed = failed;
      next(error);
    });
  }
};

exports.removeFailed = {
  name: 'resque:removeFailed',
  description: 'I remove a failed job',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    id:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    }
  },

  run: function(api, data, next){
    api.tasks.failed(data.params.id, data.params.id, function(error, failed){
      if(error){ return next(error); }
      if(!failed){ return next(new Error('failed job not found')); }
      api.tasks.removeFailed(failed[0], next);
    });
  }
};

exports.removeAllFailed = {
  name: 'resque:removeAllFailed',
  description: 'I remove all failed jobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    var failedJob;
    var act = function(done){
      api.tasks.failed(0, 0, function(error, failed){
        if(error){ return done(error); }
        failedJob = failed[0];
        if(!failed || failed.length === 0){ return done(); }
        api.tasks.removeFailed(failedJob, done);
      });
    }

    var check = function(){
      return !(failedJob === undefined)
    }

    async.doWhilst(act, check, next);
  }
};

exports.retryAndRemoveFailed = {
  name: 'resque:retryAndRemoveFailed',
  description: 'I retry a failed job',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    id:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    }
  },

  run: function(api, data, next){
    api.tasks.failed(data.params.id, data.params.id, function(error, failed){
      if(error){ return next(error); }
      if(!failed){ return next(new Error('failed job not found')); }
      api.tasks.retryAndRemoveFailed(failed[0], next);
    });
  }
};

exports.retryAndRemoveAllFailed = {
  name: 'resque:retryAndRemoveAllFailed',
  description: 'I retry all failed jobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    var failedJob;
    var act = function(done){
      api.tasks.failed(0, 0, function(error, failed){
        if(error){ return done(error); }
        failedJob = failed[0];
        if(!failed || failed.length === 0){ return done(); }
        api.tasks.retryAndRemoveFailed(failedJob, done);
      });
    }

    var check = function(){
      return !(failedJob === undefined)
    }

    async.doWhilst(act, check, next);
  }
};

exports.locks = {
  name: 'resque:locks',
  description: 'I return all locks',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  run: function(api, data, next){
    api.tasks.locks(function(error, locks){
      data.response.locks = locks;
      next(error);
    });
  }
};

exports.delLock = {
  name: 'resque:delLock',
  description: 'I delte a lock',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    lock: { required: true }
  },

  run: function(api, data, next){
    api.tasks.delLock(data.params.lock, function(error, count){
      data.response.count = count;
      next(error);
    });
  }
};

exports.delayedjobs = {
  name: 'resque:delayedjobs',
  description: 'I return paginated lists of delayedjobs',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    start:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 0
    },
    stop:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 99
    }
  },

  run: function(api, data, next){
    var jobs = [];
    var timestamps = [];
    var delayedjobs = {};

    api.tasks.timestamps(function(error, allTimestmps){
      if(error){ next(error); }
      if(allTimestmps.length === 0){ return next(); }

      for (var i = 0; i < allTimestmps.length; i++) {
        if(i >= data.params.start && i <= data.params.stop){ timestamps.push(allTimestmps[i]); }
      }

      timestamps.forEach(function(timestamp){
        jobs.push(function(done){
          api.tasks.delayedAt(timestamp, function(error, delayed){
            delayedjobs[timestamp] = delayed;
            done(error);
          });
        });
      });

      async.series(jobs, function(error){
        data.response.delayedjobs = delayedjobs;
        data.response.timestampsCount = allTimestmps.length;
        next(error);
      });
    });
  }
};

exports.delDelayed = {
  name: 'resque:delDelayed',
  description: 'I delete a delayed job',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    timestamp:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    },
    count:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    },
  },

  run: function(api, data, next){
    api.tasks.delayedAt(data.params.timestamp, function(error, delayed){
      if(error){ return next(error); }
      if(delayed.length === 0 || !delayed[data.params.count]){
        return next(new Error('delayed job not found'));
      }

      var job = delayed[data.params.count];
      api.tasks.delDelayed(job.queue, job.class, job.args, next);
    });
  }
};

exports.runDelayed = {
  name: 'resque:runDelayed',
  description: 'I run a delayed job now',
  middleware: ['ah-resque-ui-proxy-middleware'],
  outputExample: {},
  logLevel: 'debug',
  toDocument: false,

  inputs:{
    timestamp:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    },
    count:{
      required: true,
      formatter: function(p){ return parseInt(p); },
    },
  },

  run: function(api, data, next){
    api.tasks.delayedAt(data.params.timestamp, function(error, delayed){
      if(error){ return next(error); }
      if(delayed.length === 0 || !delayed[data.params.count]){
        return next(new Error('delayed job not found'));
      }

      var job = delayed[data.params.count];
      api.tasks.delDelayed(job.queue, job.class, job.args, function(error){
        if(error){ return next(error); }
        api.tasks.enqueue(job.class, job.args, job.queue, next);
      });
    });
  }
};
