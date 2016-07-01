var path = require('path');
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
