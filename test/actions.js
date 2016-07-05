var should = require('should');
var specHelper = require(__dirname + '/specHelper.js').specHelper;
var api;

describe('ah-resque-ui', function(){

  before(function(done){
    this.timeout(1000 * 60);
    specHelper.build(done);
  });

  before(function(done){
    this.timeout(1000 * 30);
    specHelper.start(function(){
      api = specHelper.api;
      done();
    });
  });

  before(function(done){
    api.tasks.tasks.testTask = {
      name: 'testTask',
      description: 'testTask',
      queue: 'testQueue',
      frequency: 0,
      run: function(api, params, next){
        if(params.fail === true){ return next(new Error('broken')); }
        return next();
      }
    };

    api.tasks.jobs.testTask  = api.tasks.jobWrapper('testTask');

    done();
  });

  before(function(done){
    api.resque.multiWorker.start(function(){
      setTimeout(done, 1000);
    });
  });

  after(function(done){
    api.resque.multiWorker.stop(done);
  });

  after(function(done){
    delete api.tasks.tasks.testTask;
    delete api.tasks.jobs.testTask;

    done();
  });

  after(function(done){
    specHelper.stop(done);
  });

  it('server booted and normal actions work', function(done){
    api.specHelper.runAction('status', function(response){
      response.serverInformation.serverName.should.equal('my_actionhero_project');
      done();
    });
  });

  it('resque:packageDetails', function(done){
    var pkg = require(__dirname + '/../package.json');
    api.specHelper.runAction('resque:packageDetails', function(response){
      response.packageDetails.packageJSON.version.should.equal(pkg.version);
      response.packageDetails.packageJSON.license.should.equal('Apache-2.0');
      if(process.env.FAKEREDIS === 'false'){
        response.packageDetails.redis[0].port.should.equal(6379);
        response.packageDetails.redis[0].host.should.equal('127.0.0.1');
      }else{
        response.packageDetails.redis[0].should.equal(6379);
        response.packageDetails.redis[1].should.equal('127.0.0.1');
      }
      done();
    });
  });

  it('resque:forceCleanWorker')

  describe('with jobs', function(){
    beforeEach(function(done){ api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function(){ done(); }); });

    beforeEach(function(done){ api.tasks.enqueue('testTask', {a: 1}, 'testQueue', done) });
    beforeEach(function(done){ api.tasks.enqueue('testTask', {b: 2}, 'testQueue', done) });
    beforeEach(function(done){ api.tasks.enqueue('testTask', {c: 3}, 'testQueue', done) });

    it('resque:resqueDetails', function(done){
      api.specHelper.runAction('resque:resqueDetails', function(response){
        response.resqueDetails.queues['testQueue'].length.should.equal(3);
        Object.keys(response.resqueDetails.workers).length.should.equal(1);
        done();
      });
    });

    it('resque:loadWorkerQueues', function(done){
      api.specHelper.runAction('resque:loadWorkerQueues', function(response){
        var workerNames = Object.keys(response.workerQueues);
        workerNames.length.should.equal(1);
        // This depends on load order...
        // response.workerQueues[workerNames[0]].should.equal('testQueue');
        done();
      });
    });

    it('resque:queued (good)', function(done){
      api.specHelper.runAction('resque:queued', {queue: 'testQueue'}, function(response){
        response.jobs.length.should.equal(3);
        done();
      });
    });

    it('resque:queued (bad)', function(done){
      api.specHelper.runAction('resque:queued', {queue: 'xxx'}, function(response){
        response.jobs.length.should.equal(0);
        done();
      });
    });

    it('resque:delQueue', function(done){
      api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function(response){
        api.specHelper.runAction('resque:queued', {queue: 'testQueue'}, function(response){
          response.jobs.length.should.equal(0);
          done();
        })
      });
    });
  });

  describe('with failed jobs', function(){
    beforeEach(function(done){ api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function(){ done(); }); });
    beforeEach(function(done){ api.specHelper.runAction('resque:removeAllFailed', function(){ done(); }); });

    beforeEach(function(done){ api.tasks.enqueue('testTask', {a: 1, fail: true}, 'testQueue', done) });
    beforeEach(function(done){ api.tasks.enqueue('testTask', {b: 2, fail: true}, 'testQueue', done) });
    beforeEach(function(done){ api.tasks.enqueue('testTask', {c: 3, fail: true}, 'testQueue', done) });

    beforeEach(function(done){ setTimeout(done, 1000); }); // should allow time to work the bad jobs

    it('resque:resqueFailedCount', function(done){
      api.specHelper.runAction('resque:resqueFailedCount', function(response){
        response.failedCount.should.equal(3);
        done();
      });
    });

    it('resque:resqueFailed (defaults)', function(done){
      api.specHelper.runAction('resque:resqueFailed', function(response){
        response.failed.length.should.equal(3);
        response.failed.forEach(function(j){
          j.queue.should.equal('testQueue');
          j.error.should.equal('broken');
          j.payload.args[0].fail.should.equal(true);
        });
        done();
      });
    });

    it('resque:resqueFailed (pagination)', function(done){
      api.specHelper.runAction('resque:resqueFailed', {start:0, stop:1}, function(response){
        response.failed.length.should.equal(2);
        response.failed[0].payload.args[0].a.should.equal(1);
        response.failed[1].payload.args[0].b.should.equal(2);
        api.specHelper.runAction('resque:resqueFailed', {start:2, stop:99}, function(response){
          response.failed.length.should.equal(1);
          response.failed[0].payload.args[0].c.should.equal(3);
          done()
        });
      });
    });

    it('resque:removeFailed', function(done){
      api.specHelper.runAction('resque:removeFailed', {id: 1}, function(response){
        api.specHelper.runAction('resque:resqueFailed', function(response){
          response.failed.length.should.equal(2);
          response.failed[0].payload.args[0].a.should.equal(1);
          response.failed[1].payload.args[0].c.should.equal(3);
          done();
        });
      });
    });

    it('resque:removeAllFailed', function(done){
      api.specHelper.runAction('resque:removeAllFailed', function(response){
        api.specHelper.runAction('resque:resqueFailed', function(response){
          response.failed.length.should.equal(0);
          done();
        });
      });
    });

    it('resque:retryAndRemoveFailed', function(done){
      api.specHelper.runAction('resque:retryAndRemoveFailed', {id: 1}, function(response){
        api.specHelper.runAction('resque:resqueFailed', function(response){
          response.failed.length.should.equal(2);
          response.failed[0].payload.args[0].a.should.equal(1);
          response.failed[1].payload.args[0].c.should.equal(3);
          api.specHelper.runAction('resque:resqueDetails', function(response){
            response.resqueDetails.queues['testQueue'].length.should.equal(1);
            done();
          });
        });
      });
    });

    it('resque:retryAndRemoveAllFailed', function(done){
      api.specHelper.runAction('resque:retryAndRemoveAllFailed', function(response){
        api.specHelper.runAction('resque:resqueFailed', function(response){
          response.failed.length.should.equal(0);
          api.specHelper.runAction('resque:resqueDetails', function(response){
            response.resqueDetails.queues['testQueue'].length.should.equal(3);
            done();
          });
        });
      });
    });

  });

});
