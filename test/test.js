const should = require('should')
const path = require('path')
const util = require('util')

process.env.PROJECT_ROOT = path.join(__dirname, '..', 'node_modules', 'actionhero')

const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api

const sleep = (sleep) => {
  return util.promisify(setTimeout)(sleep)
}

describe('ah-resque-ui', () => {
  before(async () => {
    let configChanges = {
      'ah-resque-ui': { middleware: [] },
      tasks: { minTaskProcessors: 1, maxTaskProcessors: 1 },
      plugins: {'ah-resque-ui': { path: path.join(__dirname, '..') }}
    }

    api = await actionhero.start({configChanges})

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

    await api.resque.multiWorker.start()
    await sleep(100)
  })

  after(async () => {
    await api.resque.multiWorker.stop()
    delete api.tasks.tasks.testTask
    delete api.tasks.jobs.testTask
    await actionhero.stop()
  })

  it('server booted and normal actions work', async () => {
    let response = await api.specHelper.runAction('status')
    response.id.match(/test-server/)
    should.not.exist(response.error)
  })

  it('resque:packageDetails', async () => {
    const pkg = require(path.join(__dirname, '/../package.json'))
    let response = await api.specHelper.runAction('resque:packageDetails')
    response.packageDetails.packageJSON.version.should.equal(pkg.version)
    response.packageDetails.packageJSON.license.should.equal('Apache-2.0')
    response.packageDetails.redis[0].port.should.equal(6379)
    response.packageDetails.redis[0].host.should.equal('127.0.0.1')
  })

  it('resque:redisInfo', async () => {
    let response = await api.specHelper.runAction('resque:redisInfo')
    response.redisInfo.join('\n').should.match(/redis_version/)
    response.redisInfo.join('\n').should.match(/used_memory/)
    response.redisInfo.join('\n').should.match(/used_memory_human/)
  })

  it('resque:forceCleanWorker') // TODO

  describe('with locks', () => {
    beforeEach(async () => { await api.resque.queue.connection.redis.set(api.resque.queue.connection.key('lock:lists:queueName:jobName:[{}]'), 123) })
    beforeEach(async () => { await api.resque.queue.connection.redis.set(api.resque.queue.connection.key('workerslock:lists:queueName:jobName:[{}]'), 456) })

    afterEach(async () => { await api.resque.queue.connection.redis.del(api.resque.queue.connection.key('lock:lists:queueName:jobName:[{}]')) })
    afterEach(async () => { await api.resque.queue.connection.redis.del(api.resque.queue.connection.key('workerslock:lists:queueName:jobName:[{}]')) })

    it('resque:locks', async () => {
      let response = await api.specHelper.runAction('resque:locks')
      Object.keys(response.locks).length.should.equal(2)
      response.locks['lock:lists:queueName:jobName:[{}]'].should.equal('123')
      response.locks['workerslock:lists:queueName:jobName:[{}]'].should.equal('456')
    })

    it('resque:delLock', async () => {
      let response = await api.specHelper.runAction('resque:delLock', {lock: 'workerslock:lists:queueName:jobName:[{}]'})
      response.count.should.equal(1)
      response = await api.specHelper.runAction('resque:locks')
      Object.keys(response.locks).length.should.equal(1)
      response.locks['lock:lists:queueName:jobName:[{}]'].should.equal('123')
    })
  })

  describe('with jobs', () => {
    beforeEach(async () => {
      await api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'})
      await api.tasks.enqueue('testTask', {a: 1}, 'testQueue')
      await api.tasks.enqueue('testTask', {b: 2}, 'testQueue')
      await api.tasks.enqueue('testTask', {c: 3}, 'testQueue')
    })

    it('resque:resqueDetails', async () => {
      let response = await api.specHelper.runAction('resque:resqueDetails')
      response.resqueDetails.queues.testQueue.length.should.equal(3)
      Object.keys(response.resqueDetails.workers).length.should.equal(1)
    })

    it('resque:loadWorkerQueues', async () => {
      let response = await api.specHelper.runAction('resque:loadWorkerQueues')
      const workerNames = Object.keys(response.workerQueues)
      workerNames.length.should.equal(1)
      // could be `testQueue` or `*`
      // response.workerQueues[workerNames[0]].should.equal('testQueue')
    })

    it('resque:queued (good)', async () => {
      const response = await api.specHelper.runAction('resque:queued', {queue: 'testQueue'})
      response.jobs.length.should.equal(3)
    })

    it('resque:queued (bad)', async () => {
      let response = await api.specHelper.runAction('resque:queued', {queue: 'xxx'})
      response.jobs.length.should.equal(0)
    })

    it('resque:delQueue', async () => {
      await api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'})
      const response = await api.specHelper.runAction('resque:queued', {queue: 'testQueue'})
      response.jobs.length.should.equal(0)
    })
  })

  describe('with delayed jobs', () => {
    before(async () => {
      await api.tasks.enqueueAt(1000, 'testTask', {a: 1}, 'testQueue')
      await api.tasks.enqueueAt(2000, 'testTask', {b: 2}, 'testQueue')
      await api.tasks.enqueueAt(3000, 'testTask', {c: 3}, 'testQueue')
    })

    it('resque:delayedjobs (defaults)', async () => {
      const response = await api.specHelper.runAction('resque:delayedjobs')
      response.timestampsCount.should.equal(3)
      Object.keys(response.delayedjobs).length.should.equal(3)
      response.delayedjobs['1000'].tasks[0].args[0].a.should.equal(1)
      response.delayedjobs['2000'].tasks[0].args[0].b.should.equal(2)
      response.delayedjobs['3000'].tasks[0].args[0].c.should.equal(3)
    })

    it('resque:delayedjobs (pagination)', async () => {
      let response
      response = await api.specHelper.runAction('resque:delayedjobs', {start: 0, stop: 1})
      response.timestampsCount.should.equal(3)
      Object.keys(response.delayedjobs).length.should.equal(2)
      response.delayedjobs['1000'].tasks[0].args[0].a.should.equal(1)
      response.delayedjobs['2000'].tasks[0].args[0].b.should.equal(2)

      response = await api.specHelper.runAction('resque:delayedjobs', {start: 2, stop: 999})
      response.timestampsCount.should.equal(3)
      Object.keys(response.delayedjobs).length.should.equal(1)
      response.delayedjobs['3000'].tasks[0].args[0].c.should.equal(3)
    })

    it('resque:delDelayed')
    it('resque:runDelayed')
  })

  describe('with failed jobs', () => {
    beforeEach(async () => {
      await api.specHelper.runAction('resque:delQueue', {queue: 'testQueue'})
      await api.specHelper.runAction('resque:removeAllFailed')
      await api.tasks.enqueue('testTask', {a: 1, fail: true}, 'testQueue')
      await api.tasks.enqueue('testTask', {b: 2, fail: true}, 'testQueue')
      await api.tasks.enqueue('testTask', {c: 3, fail: true}, 'testQueue')

      // should allow time to work the bad jobs
      await sleep(1000)
    })

    it('resque:resqueFailedCount', async () => {
      const response = await api.specHelper.runAction('resque:resqueFailedCount')
      response.failedCount.should.equal(3)
    })

    it('resque:resqueFailed (defaults)', async () => {
      const response = await api.specHelper.runAction('resque:resqueFailed')
      response.failed.length.should.equal(3)
      response.failed.forEach((j) => {
        j.queue.should.equal('testQueue')
        j.error.should.equal('broken')
        j.payload.args[0].fail.should.equal(true)
      })
    })

    it('resque:resqueFailed (pagination)', async () => {
      let response
      response = await api.specHelper.runAction('resque:resqueFailed', {start: 0, stop: 1})
      response.failed.length.should.equal(2)
      response.failed[0].payload.args[0].a.should.equal(1)
      response.failed[1].payload.args[0].b.should.equal(2)

      response = await api.specHelper.runAction('resque:resqueFailed', {start: 2, stop: 99})
      response.failed.length.should.equal(1)
      response.failed[0].payload.args[0].c.should.equal(3)
    })

    it('resque:removeFailed', async () => {
      await api.specHelper.runAction('resque:removeFailed', {id: 1})
      const response = await api.specHelper.runAction('resque:resqueFailed')
      response.failed.length.should.equal(2)
      response.failed[0].payload.args[0].a.should.equal(1)
      response.failed[1].payload.args[0].c.should.equal(3)
    })

    it('resque:removeAllFailed', async () => {
      await api.specHelper.runAction('resque:removeAllFailed')
      const response = await api.specHelper.runAction('resque:resqueFailed')
      response.failed.length.should.equal(0)
    })

    it('resque:retryAndRemoveFailed', async () => {
      await api.specHelper.runAction('resque:retryAndRemoveFailed', {id: 1})
      const response = await api.specHelper.runAction('resque:resqueFailed')
      response.failed.length.should.equal(2)
      response.failed[0].payload.args[0].a.should.equal(1)
      response.failed[1].payload.args[0].c.should.equal(3)

      const details = await api.specHelper.runAction('resque:resqueDetails')
      details.resqueDetails.queues.testQueue.length.should.equal(1)
    })

    it('resque:retryAndRemoveAllFailed', async () => {
      await api.specHelper.runAction('resque:retryAndRemoveAllFailed')
      const response = await api.specHelper.runAction('resque:resqueFailed')
      response.failed.length.should.equal(0)

      const details = await api.specHelper.runAction('resque:resqueDetails')
      details.resqueDetails.queues.testQueue.length.should.equal(3)
    })
  })
})
