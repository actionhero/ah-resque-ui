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
  description: 'I return api.tasks.details',
  outputExample: {},

  run: function(api, data, next){
    api.tasks.details(function(error, resqueDetails){
      data.response.resqueDetails = resqueDetails;
      next(error);
    });
  }
};
