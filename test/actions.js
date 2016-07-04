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

  after(function(done){
    specHelper.stop(done);
  });

  it('server booted and normal actions work', function(done){
    api.specHelper.runAction('status', function(response){
      response.serverInformation.serverName.should.equal('my_actionhero_project');
      done();
    });
  });

  it('can return resque:packageDetails', function(done){
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

});
