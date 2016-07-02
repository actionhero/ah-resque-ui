var path = require('path');
var async = require('async');
var packageJSON = require(path.normalize(__dirname + path.sep + '..' + path.sep + 'package.json'));

exports.packageDetails = {
  name: 'ah-resque-ui:packageDetails',
  description: 'I return the ah-resque-ui package metadata',
  outputExample: {},

  run: function(api, data, next){
    data.response.packageDetails = {};
    data.response.packageDetails.packageJSON = packageJSON;
    data.response.packageDetails.redis = api.config.redis.client.args;
    next();
  }
};

exports.resqueDetails = {
  name: 'ah-resque-ui:resqueDetails',
  description: 'I return the results of api.tasks.details',
  outputExample: {},

  run: function(api, data, next){
    api.tasks.details(function(error, resqueDetails){
      data.response.resqueDetails = resqueDetails;
      next(error);
    });
  }
};

exports.resqueFailedCount = {
  name: 'ah-resque-ui:resqueFailedCount',
  description: 'I return a count of failed jobs',
  outputExample: {},

  run: function(api, data, next){
    api.tasks.failedCount(function(error, failedCount){
      data.response.failedCount = failedCount;
      next(error);
    });
  }
};

exports.resqueFailed = {
  name: 'ah-resque-ui:resqueFailed',
  description: 'I return a count of failed jobs',
  outputExample: {},

  inputs:{
    start:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 0
    },
    stop:{
      required: true,
      formatter: function(p){ return parseInt(p); },
      default: 100
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
  name: 'ah-resque-ui:removeFailed',
  description: 'I remove a failed job',
  outputExample: {},

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
  name: 'ah-resque-ui:removeAllFailed',
  description: 'I remove all failed jobs',
  outputExample: {},

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
  name: 'ah-resque-ui:retryAndRemoveFailed',
  description: 'I retry a failed job',
  outputExample: {},

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
  name: 'ah-resque-ui:retryAndRemoveAllFailed',
  description: 'I retry all failed jobs',
  outputExample: {},

  run: function(api, data, next){
    var failedJob;
    var act = function(done){
      api.tasks.failed(0, 0, function(error, failed){
        console.log("-------")
        console.log(failed)
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
