var os    = require('os');
var path  = require('path');
var async = require('async');
var exec  = require('child_process').exec;


var doBash = function(commands, callback){
  if(!Array.isArray(commands)){ commands = [commands]; }
  var fullCommand = '/bin/bash -c \'' + commands.join(' && ') + '\'';
  console.log('>> ' + fullCommand);
  exec(fullCommand, function(error, data){
    callback(error, data);
  });
};

exports.specHelper = {
  // testDir: '/tmp/ah-resque-ui',
  testDir: os.tmpDir() + '/ah-resque-ui',
  projectDir: path.normalize(__dirname + '/..'),

  build: function(callback){
    var jobs = [];
    var packgeJSON = path.normalize(__dirname + '/../../bin/templates/package.json');
    var commands = [
      'rm -rf ' + this.testDir,
      'mkdir -p ' + this.testDir,
      'cd ' + this.testDir + ' && npm install actionhero',
      'cd ' + this.testDir + ' && ./node_modules/.bin/actionhero generate',
      'cd ' + this.testDir + ' && npm install',
      'rm -f ' + this.testDir + '/node_modules/ah-resque-ui',
      'ln -s ' + this.projectDir + ' ' + this.testDir + '/node_modules/ah-resque-ui',
      'cd ' + this.testDir + ' && npm run actionhero -- link --name ah-resque-ui',
    ];

    if(process.env.SKIP_BUILD !== 'true'){
      commands.forEach(function(cmd){
        jobs.push(function(done){ doBash(cmd, done); })
      });
    }

    async.series(jobs, callback);
  },

  start: function(callback){
    var self = this;
    var ActionheroPrototype = require(self.testDir + '/node_modules/actionhero/actionhero.js');
    self.actionhero = new ActionheroPrototype();
    process.env.PROJECT_ROOT = self.testDir;
    self.actionhero.start(function(error, a){
      self.api = a;
      self.api.resque.multiWorker.options.minTaskProcessors = 1;
      self.api.resque.multiWorker.options.maxTaskProcessors = 1;
      callback();
    });
  },

  stop: function(callback){
    var self = this;
    self.api.resque.multiWorker.options.minTaskProcessors = 1;
    self.api.resque.multiWorker.options.maxTaskProcessors = 1;
    self.actionhero.stop(callback);
  },
};
