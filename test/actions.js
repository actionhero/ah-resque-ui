const should = require('should') // eslint-disable-line
const path = require('path')
const SpecHelper = require(path.join(__dirname, '/specHelper.js')).specHelper
const specHelper = new SpecHelper()

let api

describe('ah-resque-ui', () => {
  before(async function () {
    this.timeout(1000 * 60)
    await specHelper.build()
  })

  before(async function () {
    this.timeout(1000 * 30)
    await specHelper.start()
    api = specHelper.api
  })

  before(async () => {
    api.tasks.tasks.testTask = {
      name: 'testTask',
      description: 'testTask',
      queue: 'testQueue',
      frequency: 0,
      run: async (params) => {
        if (params.fail === true) { throw new Error('broken') }
      }
    }

    api.tasks.jobs.testTask = api.tasks.jobWrapper('testTask')
  })

  before(async () => {
    await api.resque.multiWorker.start()
  })

  after(async () => {
    await api.resque.multiWorker.stop()
  })

  after(async () => {
    await api.resque.multiWorker.stop()
    delete api.tasks.tasks.testTask
    delete api.tasks.jobs.testTask
    await specHelper.stop()
  })

  it('server booted and normal actions work', async () => {
    let response = await api.specHelper.runAction('status')
    response.id.match(/test-server/)
  })

  it('resque:packageDetails', async () => {
    const pkg = require(path.join(__dirname, '/../package.json'))
    let response = await api.specHelper.runAction('resque:packageDetails')
    console.log(response)
    response.packageDetails.packageJSON.version.should.equal(pkg.version)
    response.packageDetails.packageJSON.license.should.equal('Apache-2.0')
    response.packageDetails.redis[0].port.should.equal(6379)
    response.packageDetails.redis[0].host.should.equal('127.0.0.1')
  })

  // it('resque:redisInfo', function (done) {
  //   if (process.env.FAKEREDIS === 'false' || process.env.REDIS_HOST !== undefined) {
  //     api.specHelper.runAction('resque:redisInfo', function (response) {
  //       response.redisInfo.join('\n').should.match(/redis_version/)
  //       response.redisInfo.join('\n').should.match(/used_memory/)
  //       response.redisInfo.join('\n').should.match(/used_memory_human/)
  //       done()
  //     })
  //   } else {
  //     return done()
  //   }
  // })
  //
  // it('resque:forceCleanWorker') // TODO
  //
  // describe('with locks', function () {
  //   beforeEach(function (done) { api.resque.queue.connection.redis.set(api.resque.queue.connection.key('lock:lists:queueName:jobName:[{}]'), 123, done) })
  //   beforeEach(function (done) { api.resque.queue.connection.redis.set(api.resque.queue.connection.key('workerslock:lists:queueName:jobName:[{}]'), 456, done) })
  //
  //   afterEach(function (done) { api.resque.queue.connection.redis.del(api.resque.queue.connection.key('lock:lists:queueName:jobName:[{}]'), done) })
  //   afterEach(function (done) { api.resque.queue.connection.redis.del(api.resque.queue.connection.key('workerslock:lists:queueName:jobName:[{}]'), done) })
  //
  //   it('resque:locks', function (done) {
  //     api.specHelper.runAction('resque:locks', function (response) {
  //       Object.keys(response.locks).length.should.equal(2)
  //       response.locks['lock:lists:queueName:jobName:[{}]'].should.equal('123')
  //       response.locks['workerslock:lists:queueName:jobName:[{}]'].should.equal('456')
  //       done()
  //     })
  //   })
  //
  //   it('resque:delLock', function (done) {
  //     api.specHelper.runAction('resque:delLock', {lock: 'workerslock:lists:queueName:jobName:[{}]'}, function (response) {
  //       response.count.should.equal(1)
  //       api.specHelper.runAction('resque:locks', function (response) {
  //         Object.keys(response.locks).length.should.equal(1)
  //         response.locks['lock:lists:queueName:jobName:[{}]'].should.equal('123')
  //         done()
  //       })
  //     })
  //   })
  // })
  //
  // describe('with jobs', function () {
  //   beforeEach(function (done) { api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function () { done() }) })
  //
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {a: 1}, 'testQueue', done) })
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {b: 2}, 'testQueue', done) })
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {c: 3}, 'testQueue', done) })
  //
  //   it('resque:resqueDetails', function (done) {
  //     api.specHelper.runAction('resque:resqueDetails', function (response) {
  //       response.resqueDetails.queues.testQueue.length.should.equal(3)
  //       Object.keys(response.resqueDetails.workers).length.should.equal(1)
  //       done()
  //     })
  //   })
  //
  //   it('resque:loadWorkerQueues', function (done) {
  //     api.specHelper.runAction('resque:loadWorkerQueues', function (response) {
  //       var workerNames = Object.keys(response.workerQueues)
  //       workerNames.length.should.equal(1)
  //       // This depends on load order...
  //       // response.workerQueues[workerNames[0]].should.equal('testQueue');
  //       done()
  //     })
  //   })
  //
  //   it('resque:queued (good)', function (done) {
  //     api.specHelper.runAction('resque:queued', {queue: 'testQueue'}, function (response) {
  //       response.jobs.length.should.equal(3)
  //       done()
  //     })
  //   })
  //
  //   it('resque:queued (bad)', function (done) {
  //     api.specHelper.runAction('resque:queued', {queue: 'xxx'}, function (response) {
  //       response.jobs.length.should.equal(0)
  //       done()
  //     })
  //   })
  //
  //   it('resque:delQueue', function (done) {
  //     api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function (response) {
  //       api.specHelper.runAction('resque:queued', {queue: 'testQueue'}, function (response) {
  //         response.jobs.length.should.equal(0)
  //         done()
  //       })
  //     })
  //   })
  // })
  //
  // describe('with delayed jobs', function () {
  //   before(function (done) { api.tasks.enqueueAt(1000, 'testTask', {a: 1}, 'testQueue', done) })
  //   before(function (done) { api.tasks.enqueueAt(2000, 'testTask', {b: 2}, 'testQueue', done) })
  //   before(function (done) { api.tasks.enqueueAt(3000, 'testTask', {c: 3}, 'testQueue', done) })
  //
  //   it('resque:delayedjobs (defaults)', function (done) {
  //     api.specHelper.runAction('resque:delayedjobs', function (response) {
  //       response.timestampsCount.should.equal(3)
  //       Object.keys(response.delayedjobs).length.should.equal(3)
  //       response.delayedjobs['1000'][0].args[0].a.should.equal(1)
  //       response.delayedjobs['2000'][0].args[0].b.should.equal(2)
  //       response.delayedjobs['3000'][0].args[0].c.should.equal(3)
  //       done()
  //     })
  //   })
  //
  //   it('resque:delayedjobs (pagination)', function (done) {
  //     api.specHelper.runAction('resque:delayedjobs', {start: 0, stop: 1}, function (response) {
  //       response.timestampsCount.should.equal(3)
  //       Object.keys(response.delayedjobs).length.should.equal(2)
  //       response.delayedjobs['1000'][0].args[0].a.should.equal(1)
  //       response.delayedjobs['2000'][0].args[0].b.should.equal(2)
  //       api.specHelper.runAction('resque:delayedjobs', {start: 2, stop: 999}, function (response) {
  //         response.timestampsCount.should.equal(3)
  //         Object.keys(response.delayedjobs).length.should.equal(1)
  //         response.delayedjobs['3000'][0].args[0].c.should.equal(3)
  //         done()
  //       })
  //     })
  //   })
  //
  //   it('resque:delDelayed')
  //   it('resque:runDelayed')
  // })
  //
  // describe('with failed jobs', function () {
  //   beforeEach(function (done) { api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'}, function () { done() }) })
  //   beforeEach(function (done) { api.specHelper.runAction('resque:removeAllFailed', function () { done() }) })
  //
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {a: 1, fail: true}, 'testQueue', done) })
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {b: 2, fail: true}, 'testQueue', done) })
  //   beforeEach(function (done) { api.tasks.enqueue('testTask', {c: 3, fail: true}, 'testQueue', done) })
  //
  //   beforeEach(function (done) { setTimeout(done, 1000) }) // should allow time to work the bad jobs
  //
  //   it('resque:resqueFailedCount', function (done) {
  //     api.specHelper.runAction('resque:resqueFailedCount', function (response) {
  //       response.failedCount.should.equal(3)
  //       done()
  //     })
  //   })
  //
  //   it('resque:resqueFailed (defaults)', function (done) {
  //     api.specHelper.runAction('resque:resqueFailed', function (response) {
  //       response.failed.length.should.equal(3)
  //       response.failed.forEach(function (j) {
  //         j.queue.should.equal('testQueue')
  //         j.error.should.equal('broken')
  //         j.payload.args[0].fail.should.equal(true)
  //       })
  //       done()
  //     })
  //   })
  //
  //   it('resque:resqueFailed (pagination)', function (done) {
  //     api.specHelper.runAction('resque:resqueFailed', {start: 0, stop: 1}, function (response) {
  //       response.failed.length.should.equal(2)
  //       response.failed[0].payload.args[0].a.should.equal(1)
  //       response.failed[1].payload.args[0].b.should.equal(2)
  //       api.specHelper.runAction('resque:resqueFailed', {start: 2, stop: 99}, function (response) {
  //         response.failed.length.should.equal(1)
  //         response.failed[0].payload.args[0].c.should.equal(3)
  //         done()
  //       })
  //     })
  //   })
  //
  //   it('resque:removeFailed', function (done) {
  //     api.specHelper.runAction('resque:removeFailed', {id: 1}, function (response) {
  //       api.specHelper.runAction('resque:resqueFailed', function (response) {
  //         response.failed.length.should.equal(2)
  //         response.failed[0].payload.args[0].a.should.equal(1)
  //         response.failed[1].payload.args[0].c.should.equal(3)
  //         done()
  //       })
  //     })
  //   })
  //
  //   it('resque:removeAllFailed', function (done) {
  //     api.specHelper.runAction('resque:removeAllFailed', function (response) {
  //       api.specHelper.runAction('resque:resqueFailed', function (response) {
  //         response.failed.length.should.equal(0)
  //         done()
  //       })
  //     })
  //   })
  //
  //   it('resque:retryAndRemoveFailed', function (done) {
  //     api.specHelper.runAction('resque:retryAndRemoveFailed', {id: 1}, function (response) {
  //       api.specHelper.runAction('resque:resqueFailed', function (response) {
  //         response.failed.length.should.equal(2)
  //         response.failed[0].payload.args[0].a.should.equal(1)
  //         response.failed[1].payload.args[0].c.should.equal(3)
  //         api.specHelper.runAction('resque:resqueDetails', function (response) {
  //           response.resqueDetails.queues.testQueue.length.should.equal(1)
  //           done()
  //         })
  //       })
  //     })
  //   })
  //
  //   it('resque:retryAndRemoveAllFailed', function (done) {
  //     api.specHelper.runAction('resque:retryAndRemoveAllFailed', function (response) {
  //       api.specHelper.runAction('resque:resqueFailed', function (response) {
  //         response.failed.length.should.equal(0)
  //         api.specHelper.runAction('resque:resqueDetails', function (response) {
  //           response.resqueDetails.queues.testQueue.length.should.equal(3)
  //           done()
  //         })
  //       })
  //     })
  //   })
  // })
})
